// src/screens/OnboardingScreen.js
// FULLY VOICE-DRIVEN farmer onboarding
// Farmer speaks → Groq AI extracts → form fills automatically
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Platform, Image, Animated,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { extractFarmerProfile, extractFarmHistory, getOnboardingPrompt } from '../services/groq';
import { startListening, stopListening, getRecognitionLang, isVoiceSupported } from '../services/voiceCommand';
import { speak, stopSpeaking } from '../services/tts';

const STEPS = ['welcome', 'language', 'profile', 'location', 'history'];

const CROPS = [
  { id: 'wheat',     label: 'Wheat',     labelHi: 'गेहूं',   labelMr: 'गहू',      icon: 'barley' },
  { id: 'rice',      label: 'Rice',      labelHi: 'धान',     labelMr: 'भात',      icon: 'rice' },
  { id: 'cotton',    label: 'Cotton',    labelHi: 'कपास',    labelMr: 'कापूस',    icon: 'leaf-circle' },
  { id: 'soybean',   label: 'Soybean',   labelHi: 'सोयाबीन', labelMr: 'सोयाबीन',  icon: 'sprout' },
  { id: 'sugarcane', label: 'Sugarcane', labelHi: 'गन्ना',   labelMr: 'ऊस',       icon: 'grass' },
  { id: 'maize',     label: 'Maize',     labelHi: 'मक्का',   labelMr: 'मका',      icon: 'corn' },
  { id: 'tomato',    label: 'Tomato',    labelHi: 'टमाटर',  labelMr: 'टोमॅटो',   icon: 'fruit-cherries' },
  { id: 'onion',     label: 'Onion',     labelHi: 'प्याज',   labelMr: 'कांदा',    icon: 'food-variant' },
];
const LAND_SIZES = ['< 1 Acre', '1–2 Acres', '2–5 Acres', '5–10 Acres', '10+ Acres'];
const SEASONS    = ['Kharif (Jun–Oct)', 'Rabi (Oct–Mar)', 'Zaid (Mar–Jun)', 'Year-Round'];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [lang, setLang]       = useState('hi');
  const fadeAnim              = useRef(new Animated.Value(1)).current;
  const [farmerData, setFarmerData] = useState({
    name: '', phone: '', village: '', district: '', state: 'Maharashtra', primaryCrop: '',
    lat: null, lng: null, locationName: '',
    landSize: '', season: '', cropHistory: [], soilType: '',
  });
  const set = (k, v) => setFarmerData(d => ({ ...d, [k]: v }));

  const t = (hi, en, mr) => lang === 'hi' ? hi : lang === 'mr' ? mr : en;

  const fadeTransition = (cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const goNext = () => {
    if (step >= STEPS.length - 1) { onComplete(farmerData, lang); return; }
    fadeTransition(() => setStep(s => s + 1));
  };
  const goBack = () => {
    if (step === 0) return;
    fadeTransition(() => setStep(s => s - 1));
  };

  const canProceed = () => STEPS[step] === 'profile' ? farmerData.name.trim().length > 1 : true;

  const renderStep = () => {
    switch (STEPS[step]) {
      case 'welcome':  return <WelcomeStep t={t} />;
      case 'language': return <LanguageStep t={t} lang={lang} setLang={setLang} />;
      case 'profile':  return <ProfileStep t={t} lang={lang} data={farmerData} set={set} crops={CROPS} />;
      case 'location': return <LocationStep t={t} lang={lang} data={farmerData} set={set} />;
      case 'history':  return <HistoryStep t={t} lang={lang} data={farmerData} set={set} sizes={LAND_SIZES} seasons={SEASONS} />;
      default: return null;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {/* Progress */}
      <View style={styles.progressWrap}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.progSeg, i < step && styles.progDone, i === step && styles.progCurrent]} />
        ))}
      </View>

      <Animated.View style={[styles.stepWrap, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>
      </Animated.View>

      {/* Nav buttons */}
      <View style={styles.navBar}>
        {step > 0
          ? <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textMuted} />
              <Text style={styles.backTxt}>{t('वापस', 'Back', 'मागे')}</Text>
            </TouchableOpacity>
          : <View style={{ flex: 1 }} />}
        <TouchableOpacity style={[styles.nextBtn, !canProceed() && styles.nextDisabled]} onPress={goNext} disabled={!canProceed()}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.nextGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextTxt}>{step === STEPS.length - 1 ? t('शुरू करें 🚀', 'Get Started 🚀', 'सुरू करा 🚀') : t('आगे →', 'Continue →', 'पुढे →')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Reusable Voice Mic Button ─────────────────────────────────────────────────
function VoiceFillButton({ lang, onTranscript, processing, label }) {
  const [listening, setListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loop = useRef(null);

  const startListen = () => {
    if (!isVoiceSupported()) {
      alert('Voice input not supported. Please type manually.');
      return;
    }
    setListening(true);
    loop.current = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]));
    loop.current.start();
    startListening({
      lang: getRecognitionLang(lang),
      onResult: ({ transcript }) => {
        setListening(false);
        loop.current?.stop(); pulseAnim.setValue(1);
        onTranscript(transcript);
      },
      onError: () => { setListening(false); loop.current?.stop(); pulseAnim.setValue(1); },
      onEnd: () => { setListening(false); loop.current?.stop(); pulseAnim.setValue(1); },
    });
  };

  const stopListen = () => {
    stopListening();
    setListening(false);
    loop.current?.stop(); pulseAnim.setValue(1);
  };

  if (processing) {
    return (
      <View style={vb.processingBox}>
        <ActivityIndicator color={COLORS.primary} size="small" />
        <Text style={vb.processingTxt}>
          {lang === 'hi' ? 'AI समझ रहा है...' : lang === 'mr' ? 'AI समजत आहे...' : 'AI is understanding...'}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={listening ? stopListen : startListen} activeOpacity={0.85}>
      <Animated.View style={[vb.wrap, listening && { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={listening ? ['#EF4444', '#DC2626'] : [COLORS.primary, COLORS.primaryLight]}
          style={vb.btn}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name={listening ? 'microphone' : 'microphone-outline'} size={26} color="#fff" />
        </LinearGradient>
        <Text style={[vb.label, listening && { color: '#EF4444' }]}>
          {listening
            ? (lang === 'hi' ? 'बोल रहे हैं... (रोकने के लिए टैप करें)' : lang === 'mr' ? 'बोलत आहात...' : 'Listening... (tap to stop)')
            : label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const vb = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  btn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glass },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textAlign: 'center', maxWidth: 240, lineHeight: 18 },
  processingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primaryPale, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14 },
  processingTxt: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});

// ── Step 1: Welcome ────────────────────────────────────────────────────────────
function WelcomeStep({ t }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={ws.container}>
      <View style={ws.heroWrap}>
        <Image source={require('../../assets/onboard_hero.png')} style={ws.heroImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', COLORS.background]} style={ws.heroFade} />
      </View>
      <Animated.View style={[ws.logoRow, { transform: [{ scale: pulseAnim }] }]}>
        <View style={ws.logoCircle}><MaterialCommunityIcons name="leaf" size={38} color={COLORS.primary} /></View>
        <Text style={ws.brand}>AgriPulse</Text>
      </Animated.View>
      <Text style={ws.title}>{t('भारत का सबसे स्मार्ट खेती सहायक', "India's Smartest Farming AI", 'भारतातील सर्वात स्मार्ट शेती AI')}</Text>
      <Text style={ws.sub}>{t('बस बोलें — आपकी भाषा में — और AI सब समझेगा', 'Just speak — in your language — and AI understands everything', 'फक्त बोला — तुमच्या भाषेत — AI सर्व समजेल')}</Text>
      <View style={ws.pillRow}>
        {['🎤 बोलकर जानकारी दें', '🗺️ Live खेत नक्शा', '🤖 AI सलाह', '📊 डेटा रिपोर्ट'].map((p, i) => (
          <View key={i} style={ws.pill}><Text style={ws.pillTxt}>{p}</Text></View>
        ))}
      </View>
      <Text style={ws.tagline}>🇮🇳 {t('लिखना नहीं जानते? कोई बात नहीं — बस बोलें!', "Can't type? No problem — just speak!", 'टायपिंग येत नाही? काळजी नाही — फक्त बोला!')}</Text>
    </View>
  );
}
const ws = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 0 },
  heroWrap: { width: '100%', height: 240, marginBottom: -20, overflow: 'hidden', borderRadius: 24 },
  heroImg: { width: '100%', height: '100%' },
  heroFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 20 },
  logoCircle: { width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.primaryPale, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '30' },
  brand: { fontSize: 34, fontWeight: '900', color: COLORS.text, letterSpacing: -1 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 10, lineHeight: 28 },
  sub: { fontSize: 14, color: COLORS.primary, fontWeight: '700', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 },
  pill: { backgroundColor: COLORS.primaryPale, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary + '25' },
  pillTxt: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  tagline: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
});

// ── Step 2: Language ──────────────────────────────────────────────────────────
function LanguageStep({ t, lang, setLang }) {
  const LANGS = [
    { code: 'hi', name: 'हिंदी', sub: 'Hindi', flag: '🇮🇳', desc: 'उत्तर भारत' },
    { code: 'en', name: 'English', sub: 'अंग्रेजी', flag: '🌐', desc: 'All India' },
    { code: 'mr', name: 'मराठी', sub: 'Marathi', flag: '🟧', desc: 'महाराष्ट्र' },
  ];
  return (
    <View style={ls.container}>
      <MaterialCommunityIcons name="translate" size={48} color={COLORS.primary} style={{ marginBottom: 12, alignSelf: 'center' }} />
      <Text style={ls.title}>{t('आपकी भाषा', 'Your Language', 'तुमची भाषा')}</Text>
      <Text style={ls.sub}>{t('AgriPulse इसी भाषा में बात करेगा', 'AgriPulse will talk in this language', 'AgriPulse याच भाषेत बोलेल')}</Text>
      {LANGS.map(l => (
        <TouchableOpacity key={l.code} style={[ls.card, lang === l.code && ls.cardActive]} onPress={() => setLang(l.code)} activeOpacity={0.8}>
          <Text style={ls.flag}>{l.flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[ls.langName, lang === l.code && ls.langNameActive]}>{l.name}</Text>
            <Text style={ls.langSub}>{l.sub} · {l.desc}</Text>
          </View>
          {lang === l.code && <View style={ls.check}><MaterialCommunityIcons name="check" size={16} color="#fff" /></View>}
        </TouchableOpacity>
      ))}
    </View>
  );
}
const ls = StyleSheet.create({
  container: { paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 28 },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: COLORS.divider, ...SHADOWS.soft, flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  flag: { fontSize: 32 },
  langName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  langNameActive: { color: COLORS.primary },
  langSub: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', marginTop: 2 },
  check: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

// ── Step 3: Farmer Profile — VOICE DRIVEN ────────────────────────────────────
function ProfileStep({ t, lang, data, set, crops }) {
  const [processing, setProcessing] = useState(false);
  const [voiceResult, setVoiceResult]  = useState('');
  const [filled, setFilled] = useState(false);

  const getCropLabel = (c) => lang === 'hi' ? c.labelHi : lang === 'mr' ? c.labelMr : c.label;

  // Speak the prompt when step loads
  useEffect(() => {
    const prompt = getOnboardingPrompt('profile', lang);
    setTimeout(() => speak(prompt, lang), 600);
    return () => stopSpeaking();
  }, [lang]);

  const handleTranscript = async (transcript) => {
    setVoiceResult(transcript);
    setProcessing(true);
    try {
      const extracted = await extractFarmerProfile(transcript, lang);
      if (extracted.name)        set('name', extracted.name);
      if (extracted.phone)       set('phone', extracted.phone);
      if (extracted.village)     set('village', extracted.village);
      if (extracted.district)    set('district', extracted.district);
      if (extracted.primaryCrop) set('primaryCrop', extracted.primaryCrop);
      setFilled(true);
    } catch (e) {
      console.warn('[Groq] Profile extraction failed:', e.message);
    }
    setProcessing(false);
  };

  const voiceLabel = lang === 'hi'
    ? 'माइक दबाएं और बोलें:\n"मेरा नाम राम है, पुणे से हूँ, गेहूं उगाता हूँ"'
    : lang === 'mr'
    ? 'माईक दाबा आणि बोला:\n"माझे नाव राम आहे, पुण्याचा आहे, गहू पिकवतो"'
    : 'Press mic and say:\n"My name is Ram, I am from Pune, I grow wheat"';

  return (
    <View style={ps.container}>
      <MaterialCommunityIcons name="account-voice" size={48} color={COLORS.primary} style={{ marginBottom: 12, alignSelf: 'center' }} />
      <Text style={ps.title}>{t('आपकी जानकारी', 'Your Profile', 'तुमची माहिती')}</Text>
      <Text style={ps.sub}>{t('बोलें या नीचे टाइप करें', 'Speak or type below', 'बोला किंवा खाली टाइप करा')}</Text>

      {/* VOICE BUTTON — big and prominent */}
      <View style={ps.voiceBox}>
        <VoiceFillButton lang={lang} onTranscript={handleTranscript} processing={processing} label={voiceLabel} />
      </View>

      {voiceResult ? (
        <View style={ps.transcriptBox}>
          <MaterialCommunityIcons name="format-quote-open" size={16} color={COLORS.primary} />
          <Text style={ps.transcriptTxt}>{voiceResult}</Text>
          {filled && <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.success} />}
        </View>
      ) : null}

      <View style={ps.divider}><View style={ps.divLine} /><Text style={ps.divTxt}>{t('या टाइप करें', 'or type', 'किंवा टाइप करा')}</Text><View style={ps.divLine} /></View>

      {/* Manual fields */}
      <Field icon="account" label={t('नाम *', 'Full Name *', 'नाव *')} placeholder={t('रामराव शिंदे', 'Ramrao Shinde', 'रामराव शिंदे')} value={data.name} onChange={v => set('name', v)} />
      <Field icon="phone" label={t('मोबाइल', 'Mobile', 'मोबाईल')} placeholder="9876543210" value={data.phone} onChange={v => set('phone', v)} keyboardType="phone-pad" />
      <Field icon="home-city" label={t('गाँव', 'Village', 'गाव')} placeholder={t('औरंगाबाद', 'Aurangabad', 'औरंगाबाद')} value={data.village} onChange={v => set('village', v)} />
      <Field icon="map-marker" label={t('जिला', 'District', 'जिल्हा')} placeholder={t('पुणे', 'Pune', 'पुणे')} value={data.district} onChange={v => set('district', v)} />

      <Text style={ps.cropLabel}>{t('मुख्य फसल', 'Main Crop', 'मुख्य पीक')}</Text>
      <View style={ps.cropGrid}>
        {crops.map(c => (
          <TouchableOpacity key={c.id} style={[ps.cropCard, data.primaryCrop === c.id && ps.cropCardActive]} onPress={() => set('primaryCrop', c.id)} activeOpacity={0.8}>
            <MaterialCommunityIcons name={c.icon} size={20} color={data.primaryCrop === c.id ? COLORS.primary : COLORS.textMuted} />
            <Text style={[ps.cropTxt, data.primaryCrop === c.id && ps.cropTxtActive]}>{getCropLabel(c)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function Field({ icon, label, placeholder, value, onChange, keyboardType }) {
  return (
    <View style={ps.fieldWrap}>
      <Text style={ps.fieldLabel}>{label}</Text>
      <View style={ps.fieldRow}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.textMuted} />
        <TextInput style={ps.fieldInput} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} value={value} onChangeText={onChange} keyboardType={keyboardType || 'default'} autoCorrect={false} />
      </View>
    </View>
  );
}

const ps = StyleSheet.create({
  container: { paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 22 },
  voiceBox: { alignItems: 'center', backgroundColor: COLORS.primaryPale, borderRadius: 24, paddingVertical: 28, paddingHorizontal: 20, marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.primary + '30', ...SHADOWS.soft },
  transcriptBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.divider },
  transcriptTxt: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  divTxt: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: COLORS.divider },
  fieldInput: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  cropLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6 },
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  cropCard: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.divider, backgroundColor: COLORS.surface },
  cropCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  cropTxt: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  cropTxtActive: { color: COLORS.primary },
});

// ── Step 4: Location ──────────────────────────────────────────────────────────
function LocationStep({ t, lang, data, set }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    const prompt = getOnboardingPrompt('location', lang);
    setTimeout(() => speak(prompt, lang), 600);
    return () => stopSpeaking();
  }, [lang]);

  const getLocation = () => {
    setLoading(true); setError('');
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          set('lat', pos.coords.latitude);
          set('lng', pos.coords.longitude);
          reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setLoading(false);
        },
        () => { setError(t('अनुमति नहीं मिली', 'Permission denied', 'परवानगी नाकारली')); setLoading(false); },
        { timeout: 10000 }
      );
    } else {
      setError(t('GPS उपलब्ध नहीं', 'GPS not available', 'GPS उपलब्ध नाही'));
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const json = await res.json();
      const addr = json.address;
      set('locationName', [addr.village || addr.town || addr.city, addr.county || addr.district, addr.state].filter(Boolean).join(', '));
    } catch { set('locationName', `${lat.toFixed(4)}, ${lng.toFixed(4)}`); }
  };

  const bbox = data.lat ? `${data.lng - 0.015},${data.lat - 0.015},${data.lng + 0.015},${data.lat + 0.015}` : null;
  const osmUrl = bbox ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${data.lat},${data.lng}` : null;

  return (
    <View style={locs.container}>
      <MaterialCommunityIcons name="map-marker-radius" size={48} color={COLORS.primary} style={{ marginBottom: 12, alignSelf: 'center' }} />
      <Text style={locs.title}>{t('खेत की लोकेशन', 'Farm Location', 'शेताचे स्थान')}</Text>
      <Text style={locs.sub}>{t('सटीक सलाह के लिए GPS लोकेशन जरूरी है', 'GPS location needed for accurate advice', 'अचूक सल्ल्यासाठी GPS आवश्यक आहे')}</Text>

      {/* Map */}
      <View style={locs.mapBox}>
        {osmUrl && Platform.OS === 'web'
          ? <iframe title="loc" src={osmUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }} />
          : <View style={locs.mapEmpty}>
              <MaterialCommunityIcons name={data.lat ? 'map-marker-check' : 'map-search-outline'} size={48} color={data.lat ? COLORS.success : COLORS.textMuted} />
              {data.lat && <Text style={{ color: COLORS.success, fontWeight: '700', marginTop: 8 }}>{data.lat.toFixed(4)}, {data.lng.toFixed(4)}</Text>}
            </View>
        }
      </View>

      {data.locationName ? (
        <View style={locs.locRow}>
          <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
          <Text style={locs.locName}>{data.locationName}</Text>
        </View>
      ) : null}

      {error ? <Text style={locs.err}>{error}</Text> : null}

      <TouchableOpacity style={locs.btn} onPress={getLocation} disabled={loading} activeOpacity={0.85}>
        <LinearGradient colors={data.lat ? [COLORS.success, '#34D399'] : [COLORS.primary, COLORS.primaryLight]} style={locs.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <>
            <MaterialCommunityIcons name={data.lat ? 'check' : 'crosshairs-gps'} size={22} color="#fff" />
            <Text style={locs.btnTxt}>{data.lat ? t('लोकेशन मिल गई ✓', 'Location Found ✓', 'स्थान सापडले ✓') : t('लाइव लोकेशन लें', 'Get Live Location', 'थेट स्थान मिळवा')}</Text>
          </>}
        </LinearGradient>
      </TouchableOpacity>
      <Text style={locs.skip}>{t('⬇️ या नीचे जाएं कर छोड़ें', '⬇️ Or continue to skip', '⬇️ किंवा वगळण्यासाठी पुढे जा')}</Text>
    </View>
  );
}
const locs = StyleSheet.create({
  container: { paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  mapBox: { width: '100%', height: 220, borderRadius: 20, overflow: 'hidden', backgroundColor: COLORS.surfaceLight, marginBottom: 16, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.premium, justifyContent: 'center', alignItems: 'center' },
  mapEmpty: { justifyContent: 'center', alignItems: 'center', gap: 6 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryPale, borderRadius: 14, padding: 14, marginBottom: 16 },
  locName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.primary },
  err: { color: COLORS.danger, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  btn: { borderRadius: 18, overflow: 'hidden', marginBottom: 14, ...SHADOWS.glass },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  skip: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});

// ── Step 5: Farm History — VOICE DRIVEN ──────────────────────────────────────
function HistoryStep({ t, lang, data, set, sizes, seasons }) {
  const [processing, setProcessing] = useState(false);
  const [voiceResult, setVoiceResult]  = useState('');
  const SOILS = ['Black (Kali Mitti)', 'Red', 'Sandy Loam', 'Clay', 'Alluvial'];
  const PREV_CROPS = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Maize', 'Sugarcane'];

  useEffect(() => {
    const prompt = getOnboardingPrompt('history', lang);
    setTimeout(() => speak(prompt, lang), 600);
    return () => stopSpeaking();
  }, [lang]);

  const handleTranscript = async (transcript) => {
    setVoiceResult(transcript);
    setProcessing(true);
    try {
      const extracted = await extractFarmHistory(transcript, lang);
      if (extracted.landSize)               set('landSize', extracted.landSize);
      if (extracted.season)                 set('season', extracted.season);
      if (extracted.soilType)              set('soilType', extracted.soilType);
      if (extracted.cropHistory?.length)   set('cropHistory', extracted.cropHistory);
    } catch (e) { console.warn('[Groq] History extraction failed:', e.message); }
    setProcessing(false);
  };

  const toggleHistory = (crop) => {
    const cur = data.cropHistory || [];
    set('cropHistory', cur.includes(crop) ? cur.filter(c => c !== crop) : [...cur, crop]);
  };

  const voiceLabel = lang === 'hi'
    ? 'बोलें: "मेरी 3 एकड़ जमीन है, काली मिट्टी है, पिछले साल गेहूं और सोयाबीन उगाया"'
    : lang === 'mr'
    ? 'बोला: "माझी 3 एकर जमीन आहे, काळी माती आहे, गेल्या वर्षी गहू व सोयाबीन घेतले"'
    : 'Say: "I have 3 acres, black soil, last year I grew wheat and soybean"';

  return (
    <View style={hs.container}>
      <MaterialCommunityIcons name="history" size={48} color={COLORS.primary} style={{ marginBottom: 12, alignSelf: 'center' }} />
      <Text style={hs.title}>{t('खेत का इतिहास', 'Farm History', 'शेताचा इतिहास')}</Text>
      <Text style={hs.sub}>{t('AI बेहतर सलाह देगा', 'Better AI advice with your history', 'इतिहासामुळे AI चांगला सल्ला देईल')}</Text>

      <View style={hs.voiceBox}>
        <VoiceFillButton lang={lang} onTranscript={handleTranscript} processing={processing} label={voiceLabel} />
      </View>

      {voiceResult ? (
        <View style={hs.transcriptBox}>
          <MaterialCommunityIcons name="format-quote-open" size={16} color={COLORS.primary} />
          <Text style={hs.transcriptTxt}>{voiceResult}</Text>
        </View>
      ) : null}

      <View style={hs.divider}><View style={hs.divLine} /><Text style={hs.divTxt}>{t('या टैप करके चुनें', 'or tap to select', 'किंवा टॅप करा')}</Text><View style={hs.divLine} /></View>

      <Text style={hs.sectionLabel}>{t('जमीन', 'Land Size', 'जमीन')}</Text>
      <View style={hs.chipRow}>
        {sizes.map(s => <TouchableOpacity key={s} style={[hs.chip, data.landSize === s && hs.chipActive]} onPress={() => set('landSize', s)}><Text style={[hs.chipTxt, data.landSize === s && hs.chipTxtActive]}>{s}</Text></TouchableOpacity>)}
      </View>

      <Text style={hs.sectionLabel}>{t('मौसम', 'Season', 'हंगाम')}</Text>
      <View style={hs.chipRow}>
        {seasons.map(s => <TouchableOpacity key={s} style={[hs.chip, data.season === s && hs.chipActive]} onPress={() => set('season', s)}><Text style={[hs.chipTxt, data.season === s && hs.chipTxtActive]}>{s}</Text></TouchableOpacity>)}
      </View>

      <Text style={hs.sectionLabel}>{t('मिट्टी', 'Soil Type', 'माती')}</Text>
      <View style={hs.chipRow}>
        {SOILS.map(s => <TouchableOpacity key={s} style={[hs.chip, data.soilType === s && hs.chipActive]} onPress={() => set('soilType', s)}><Text style={[hs.chipTxt, data.soilType === s && hs.chipTxtActive]}>{s}</Text></TouchableOpacity>)}
      </View>

      <Text style={hs.sectionLabel}>{t('पिछली फसलें', 'Previous Crops', 'मागील पिके')}</Text>
      <View style={hs.chipRow}>
        {PREV_CROPS.map(c => {
          const sel = (data.cropHistory || []).includes(c);
          return <TouchableOpacity key={c} style={[hs.chip, sel && hs.chipActive]} onPress={() => toggleHistory(c)}>
            {sel && <MaterialCommunityIcons name="check" size={12} color={COLORS.primary} />}
            <Text style={[hs.chipTxt, sel && hs.chipTxtActive]}>{c}</Text>
          </TouchableOpacity>;
        })}
      </View>

      {(data.landSize || data.season || data.soilType) &&
        <View style={hs.summaryCard}>
          <Text style={hs.summaryTitle}>✅ {t('आपकी खेत प्रोफ़ाइल', 'Your Farm Profile', 'तुमचा शेत प्रोफाइल')}</Text>
          {data.landSize  && <SRow icon="ruler" label={t('जमीन','Land','जमीन')} val={data.landSize} />}
          {data.season    && <SRow icon="leaf" label={t('मौसम','Season','हंगाम')} val={data.season} />}
          {data.soilType  && <SRow icon="terrain" label={t('मिट्टी','Soil','माती')} val={data.soilType} />}
          {data.cropHistory?.length > 0 && <SRow icon="history" label={t('फसलें','Crops','पिके')} val={data.cropHistory.join(', ')} />}
        </View>}
    </View>
  );
}
function SRow({ icon, label, val }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
      <MaterialCommunityIcons name={icon} size={15} color={COLORS.primary} />
      <Text style={{ width: 70, fontSize: 12, color: COLORS.textMuted, fontWeight: '700' }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '700' }}>{val}</Text>
    </View>
  );
}
const hs = StyleSheet.create({
  container: { paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  voiceBox: { alignItems: 'center', backgroundColor: COLORS.primaryPale, borderRadius: 24, paddingVertical: 24, paddingHorizontal: 20, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.primary + '30', ...SHADOWS.soft },
  transcriptBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.divider },
  transcriptTxt: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  divTxt: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.divider, backgroundColor: COLORS.surface },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  chipTxt: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  chipTxtActive: { color: COLORS.primary },
  summaryCard: { backgroundColor: COLORS.primaryPale, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.primary + '30', marginTop: 4, marginBottom: 12 },
  summaryTitle: { fontSize: 13, fontWeight: '900', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
});

// ── Root styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  progressWrap: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 12 },
  progSeg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.divider },
  progDone: { backgroundColor: COLORS.primary + '60' },
  progCurrent: { backgroundColor: COLORS.primary },
  stepWrap: { flex: 1 },
  stepScroll: { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 30 : 14, borderTopWidth: 1, borderTopColor: COLORS.divider, backgroundColor: COLORS.surface, gap: 14 },
  backBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backTxt: { fontSize: 15, fontWeight: '700', color: COLORS.textMuted },
  nextBtn: { flex: 2, borderRadius: 16, overflow: 'hidden', ...SHADOWS.glass },
  nextDisabled: { opacity: 0.45 },
  nextGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17 },
  nextTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
