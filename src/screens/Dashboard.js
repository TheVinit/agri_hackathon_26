import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable, StatusBar,
  Animated, ScrollView, RefreshControl, Platform, Modal, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, RADIUS, TEXT_STYLES } from '../theme';
import { getDashboard, computeHealthScore } from '../services/api';
import { speakAdvisory, stopSpeaking, speak } from '../services/tts';
import { useLang } from '../context/LanguageContext';
import Skeleton from '../components/Skeleton';
import {
  isVoiceSupported, startListening, stopListening, getRecognitionLang,
} from '../services/voiceCommand';

const FARM_ID = 'farm_001';

// ── Color helpers ──────────────────────────────────────────────
const moistureColor = v => v >= 60 ? '#10B981' : v >= 35 ? '#F59E0B' : '#EF4444';
const tempColor     = v => v <= 25 ? '#3B82F6' : v <= 32 ? '#F59E0B' : '#EF4444';
const healthColor   = v => v >= 75 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444';

// ── Mock weather (replace with real API for live demo) ─────────
const WEATHER = {
  temp: 28, condition: 'Partly Cloudy', icon: 'weather-partly-cloudy',
  humidity: 62, wind: 14, rain: '20%',
  hi: 34, lo: 21,
};

// ── Farm Health Arc Gauge ──────────────────────────────────────
function HealthGauge({ score = 0, size = 130 }) {
  const animVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animVal, { toValue: score, duration: 1400, useNativeDriver: false }).start();
  }, [score]);

  const pct = score / 100;
  const color = healthColor(score);
  const segments = 24;
  const startAngle = 140, totalArc = 260;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: segments }).map((_, i) => {
          const segPct = (i + 0.5) / segments;
          const angle  = startAngle + segPct * totalArc;
          const active = segPct <= pct;
          const rad    = ((angle - 90) * Math.PI) / 180;
          const r      = size * 0.41;
          const cx     = size / 2 + r * Math.cos(rad) - size * 0.065;
          const cy     = size / 2 + r * Math.sin(rad) - size * 0.065;
          return (
            <View key={i} style={{
              position: 'absolute', width: size * 0.13, height: size * 0.13,
              borderRadius: size * 0.065, backgroundColor: active ? color : '#E2E8F0',
              left: cx, top: cy, opacity: active ? 1 : 0.35,
            }} />
          );
        })}
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.26, fontWeight: '900', color, letterSpacing: -1 }}>{score}</Text>
        <Text style={{ fontSize: size * 0.11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' }}>/ 100</Text>
      </View>
    </View>
  );
}

// ── Compact Sensor Strip (horizontal scroll) ───────────────────
function SensorStrip({ nodes, t }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }} contentContainerStyle={{ gap: 12 }}>
      {(nodes || []).map((node, idx) => {
        const isOffline  = node.status === 'offline';
        const isVirtual  = node.status === 'virtual';
        const isDimmed   = isOffline || isVirtual;
        const mColor = isDimmed ? COLORS.textMuted : moistureColor(node.moisture);
        const tColor = isDimmed ? COLORS.textMuted : tempColor(node.temperature);
        const stMap  = {
          ok:       { label: t('उत्तम','OK','उत्तम'),             color: COLORS.success },
          warning:  { label: t('सतर्क','Warn','सावधान'),          color: COLORS.warning },
          critical: { label: t('संकट','Crit','गंभीर'),            color: COLORS.danger  },
          offline:  { label: t('ऑफलाइन','Offline','बंद आहे'),     color: COLORS.textMuted },
          virtual:  { label: t('वर्चुअल','Virtual','व्हर्च्युअल'), color: '#6366F1' },
        };
        const st = stMap[node.status] || stMap.ok;

        if (isVirtual) {
          // Special render for virtual nodes
          return (
            <View key={node.node_id ?? idx} style={[strip.card, strip.virtualCard]}>
              <View style={strip.topRow}>
                <Text style={strip.nodeLabel}>{node.name || `Node ${node.node_id ?? idx + 1}`}</Text>
                <View style={[strip.badge, { backgroundColor: '#EEF2FF' }]}>
                  <MaterialCommunityIcons name="cloud-outline" size={10} color="#6366F1" />
                  <Text style={[strip.badgeText, { color: '#6366F1' }]}>{st.label}</Text>
                </View>
              </View>
              <View style={strip.virtualBody}>
                <MaterialCommunityIcons name="router-wireless-off" size={28} color="#A5B4FC" />
                <Text style={strip.virtualCrop}>{node.crop || '—'}</Text>
                <Text style={strip.virtualArea}>{node.area ? `${node.area} ${t('एकड़', 'acres', 'एकर')}` : ''}</Text>
              </View>
              <Text style={strip.virtualHint}>{t('सेंसर प्रतीक्षारत', 'Awaiting sensor', 'सेन्सरची प्रतीक्षा')}</Text>
              <View style={[strip.accentBar, { backgroundColor: '#6366F1' }]} />
            </View>
          );
        }

        return (
          <View key={node.node_id ?? idx} style={[strip.card, isOffline && { opacity: 0.75 }]}>
            <View style={strip.topRow}>
              <Text style={strip.nodeLabel}>{node.name || t(`नोड ${node.node_id}`, `Node ${node.node_id}`, `नोड ${node.node_id}`)}</Text>
              <View style={[strip.badge, { backgroundColor: st.color + '20' }]}>
                <View style={[strip.dot, { backgroundColor: st.color }]} />
                <Text style={[strip.badgeText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>
            <View style={strip.metricsRow}>
              <View style={strip.metric}>
                <MaterialCommunityIcons name="water-percent" size={14} color={mColor} />
                <Text style={[strip.metricVal, { color: mColor }]}>{isDimmed ? '--' : node.moisture + '%'}</Text>
                <Text style={strip.metricLbl}>{t('नमी','Moist','ओलावा')}</Text>
              </View>
              <View style={strip.divider} />
              <View style={strip.metric}>
                <MaterialCommunityIcons name="thermometer" size={14} color={tColor} />
                <Text style={[strip.metricVal, { color: tColor }]}>{isDimmed ? '--' : node.temperature + '°'}</Text>
                <Text style={strip.metricLbl}>{t('ताप','Temp','ताप')}</Text>
              </View>
              <View style={strip.divider} />
              <View style={strip.metric}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color={isDimmed ? COLORS.textMuted : COLORS.secondary} />
                <Text style={[strip.metricVal, { color: isDimmed ? COLORS.textMuted : COLORS.secondary }]}>{isDimmed ? '--' : node.ec}</Text>
                <Text style={strip.metricLbl}>EC</Text>
              </View>
            </View>
            <View style={[strip.accentBar, { backgroundColor: mColor }]} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const strip = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 14, width: 190, borderWidth: 1, borderColor: COLORS.divider, overflow: 'hidden', ...SHADOWS.soft },
  // Virtual node card — dashed indigo border
  virtualCard: { borderColor: '#6366F1', borderWidth: 1.5, borderStyle: Platform.OS === 'web' ? 'dashed' : 'solid', backgroundColor: '#F5F3FF' },
  virtualBody: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 4 },
  virtualCrop: { fontSize: 13, fontWeight: '800', color: '#6366F1' },
  virtualArea: { fontSize: 10, color: '#A5B4FC', fontWeight: '600' },
  virtualHint: { fontSize: 9, color: '#A5B4FC', fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nodeLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  metricsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  metric: { flex: 1, alignItems: 'center', gap: 2 },
  metricVal: { fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },
  metricLbl: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  divider: { width: 1, height: 36, backgroundColor: COLORS.divider },
  accentBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
});

// ── Weather Widget (Live via Open-Meteo API) ───────────────────
function WeatherWidget({ t }) {
  const [weather, setWeather] = useState({
    temp: '--', condition: 'Loading...', icon: 'weather-cloudy-clock',
    humidity: '--', wind: '--', rain: '--', hi: '--', lo: '--',
    loading: true
  });

  useEffect(() => {
    // Coordinates for Pune, MH
    const lat = 18.5204;
    const lon = 73.8567;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
    
    fetch(url).then(res => res.json()).then(data => {
      const code = data.current.weather_code;
      // Map WMO codes to MaterialCommunityIcons
      let icon = 'weather-partly-cloudy';
      let cond = 'Partly Cloudy';
      if (code === 0) { icon = 'weather-sunny'; cond = 'Clear Sky'; }
      else if (code <= 3) { icon = 'weather-partly-cloudy'; cond = 'Partly Cloudy'; }
      else if (code <= 48) { icon = 'weather-fog'; cond = 'Foggy'; }
      else if (code <= 67 || code >= 80) { icon = 'weather-pouring'; cond = 'Raining'; }
      else if (code <= 77) { icon = 'weather-snowy'; cond = 'Snowing'; }
      else if (code >= 95) { icon = 'weather-lightning'; cond = 'Thunderstorm'; }

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition: cond,
        icon: icon,
        humidity: Math.round(data.current.relative_humidity_2m),
        wind: Math.round(data.current.wind_speed_10m),
        rain: data.current.precipitation > 0 ? `${data.current.precipitation}mm` : '0%',
        hi: Math.round(data.daily.temperature_2m_max[0]),
        lo: Math.round(data.daily.temperature_2m_min[0]),
        loading: false
      });
    }).catch(err => {
      console.warn("Weather fetch failed:", err);
      // Fallback
      setWeather({
        temp: 28, condition: 'Partly Cloudy', icon: 'weather-partly-cloudy',
        humidity: 62, wind: 14, rain: '20%', hi: 34, lo: 21, loading: false
      });
    });
  }, []);

  return (
    <LinearGradient colors={['#1565C0', '#1E88E5']} style={wx.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={wx.left}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text style={wx.label}>{t('आज का मौसम', "Today's Weather", 'आजचे हवामान')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.pill, gap: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
            <Text style={{ fontSize: 9, fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>Live</Text>
          </View>
        </View>
        <View style={wx.tempRow}>
          <Text style={wx.temp}>{weather.temp}°</Text>
          <Text style={wx.cond}>{weather.condition}</Text>
        </View>
        <Text style={wx.range}>{t(`बारिश: ${weather.rain}`, `Rain: ${weather.rain}`, `पाऊस: ${weather.rain}`)} · {weather.hi}°/{weather.lo}°</Text>
      </View>
      <View style={wx.right}>
        <MaterialCommunityIcons name={weather.icon} size={52} color="rgba(255,255,255,0.9)" />
        <View style={wx.statRow}>
          <MaterialCommunityIcons name="water-percent" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={wx.stat}>{weather.humidity}%</Text>
          <MaterialCommunityIcons name="weather-windy" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={wx.stat}>{weather.wind} km/h</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
const wx = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.premium },
  left: { flex: 1 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  tempRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 4 },
  temp: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  cond: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600', paddingBottom: 8 },
  range: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stat: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
});

// ── Today's Task Checklist ─────────────────────────────────────
function TaskChecklist({ nodes, t }) {
  const [checked, setChecked] = useState({});
  const toggle = key => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const activeNodes = nodes?.filter(n => n.status !== 'offline') || [];
  const criticalNode = activeNodes.find(n => n.moisture < 25);
  const warningNode  = activeNodes.find(n => n.moisture < 40 && n.moisture >= 25);
  const hotNode      = activeNodes.find(n => n.temperature > 32);
  const lowBattery   = activeNodes.find(n => n.battery < 20);

  const tasks = [
    criticalNode && { key: 't1', icon: 'water-pump', color: COLORS.danger, urgent: true,
      text: t(`Node ${criticalNode.node_id} में सिंचाई करें (${criticalNode.moisture}% नमी)`, `Irrigate Node ${criticalNode.node_id} (${criticalNode.moisture}% moisture)`, `नोड ${criticalNode.node_id} ला पाणी द्या (${criticalNode.moisture}% ओलावा)`) },
    warningNode  && { key: 't2', icon: 'alert-circle', color: COLORS.warning, urgent: false,
      text: t(`Node ${warningNode.node_id} की निगरानी करें`, `Monitor Node ${warningNode.node_id}`, `Node ${warningNode.node_id} निरीक्षण करा`) },
    hotNode      && { key: 't3', icon: 'thermometer-high', color: COLORS.danger, urgent: false,
      text: t('शेड नेट लगाएं (ताप: '+hotNode.temperature+'°C)', 'Deploy shade net ('+hotNode.temperature+'°C)', 'शेड नेट लावा (ताप: '+hotNode.temperature+'°C)') },
    lowBattery   && { key: 't4', icon: 'battery-low', color: COLORS.warning, urgent: false,
      text: t(`Node ${lowBattery.node_id} बैटरी बदलें (${lowBattery.battery}%)`, `Replace Node ${lowBattery.node_id} battery (${lowBattery.battery}%)`, `नोड ${lowBattery.node_id} ची बॅटरी बदला (${lowBattery.battery}%)`) },
    { key: 't5', icon: 'leaf', color: COLORS.primary, urgent: false,
      text: t('फसल स्वास्थ्य जाँचें', 'Check crop health visually', 'पीक आरोग्य तपासा') },
  ].filter(Boolean);

  const done = Object.values(checked).filter(Boolean).length;

  return (
    <View style={task.wrap}>
      <View style={task.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="clipboard-check" size={20} color={COLORS.primary} />
          <Text style={task.title}>{t('आज के काम', "Today's Tasks", 'आजची कामे')}</Text>
        </View>
        <Text style={task.counter}>{done}/{tasks.length} {t('पूरे', 'done', 'पूर्ण')}</Text>
      </View>
      {tasks.map(({ key, icon, color, urgent, text }) => (
        <TouchableOpacity key={key} style={[task.item, checked[key] && task.itemDone]} onPress={() => toggle(key)} activeOpacity={0.8}>
          <View style={[task.iconWrap, { backgroundColor: checked[key] ? '#E8F5E9' : color + '15' }]}>
            <MaterialCommunityIcons name={checked[key] ? 'check' : icon} size={18} color={checked[key] ? COLORS.success : color} />
          </View>
          <Text style={[task.itemText, checked[key] && task.itemTextDone]}>{text}</Text>
          {urgent && !checked[key] && <View style={task.urgentBadge}><Text style={task.urgentText}>!</Text></View>}
        </TouchableOpacity>
      ))}
    </View>
  );
}
const task = StyleSheet.create({
  wrap: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.soft },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  counter: { fontSize: 13, fontWeight: '700', color: COLORS.primary, backgroundColor: COLORS.primaryPale, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.divider },
  itemDone: { opacity: 0.5 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  itemText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
  itemTextDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  urgentBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.danger, justifyContent: 'center', alignItems: 'center' },
  urgentText: { color: '#fff', fontWeight: '900', fontSize: 12 },
});

// ── Alert Banner Component ─────────────────────────────────────
function AlertBanner({ alerts, t }) {
  if (!alerts || alerts.length === 0) return null;
  const msg = alerts.length === 1
    ? t(`Node ${alerts[0].node_id} में पानी की कमी!`, `Node ${alerts[0].node_id} critically dry!`, `Node ${alerts[0].node_id} मध्ये पाण्याची कमतरता!`)
    : t(`${alerts.length} क्षेत्रों में तत्काल सिंचाई आवश्यक!`, `${alerts.length} zones need immediate irrigation!`, `${alerts.length} क्षेत्रांत तात्काळ सिंचन आवश्यक!`);
  return (
    <LinearGradient colors={['#FEF2F2', '#FFF']} style={ab.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <View style={ab.iconWrap}>
        <MaterialCommunityIcons name="alert" size={18} color={COLORS.danger} />
      </View>
      <Text style={ab.text}>{msg}</Text>
      <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.danger} />
    </LinearGradient>
  );
}
const ab = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FECACA', gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  text: { flex: 1, fontSize: 13, fontWeight: '700', color: '#B91C1C', lineHeight: 18 },
});

// ── Voice Command Modal ────────────────────────────────────────
function VoiceCommandModal({ visible, onClose, lang, onIntent, t }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    if (visible) startSession();
    else stopSession();
    return () => stopSession();
  }, [visible]);

  const startSession = () => {
    setTranscript('');
    setFeedback(t('सुन रहा हूँ...', 'Listening...', 'ऐकत आहे...'));
    setListening(true);
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
    startListening({
      lang: getRecognitionLang(lang),
      onResult: ({ transcript: tr, intent }) => {
        setTranscript(tr); setListening(false);
        pulseLoop.current?.stop(); pulseAnim.setValue(1);
        
        if (intent?.action && intent.action !== 'unknown') {
          setFeedback(t('समझ गया!', 'Got it!', 'समजलो!'));
          setTimeout(() => { onIntent(intent); onClose(); }, 500);
        } else if (tr && tr.trim().length > 0) {
          setFeedback(t('AI को भेज रहे हैं...', 'Sending to AI Assistant...', 'AI ला पाठवत आहे...'));
          setTimeout(() => { 
            onIntent({ action: 'forward_to_ai', transcript: tr.trim() }); 
            onClose(); 
          }, 800);
        } else {
          setFeedback(t('फिर कोशिश करें', 'Try again', 'पुन्हा प्रयत्न करा'));
          setTimeout(onClose, 1500);
        }
      },
      onError: () => { setListening(false); pulseLoop.current?.stop(); pulseAnim.setValue(1); setFeedback(t('माइक चालू करें', 'Enable mic', 'मायक्रोफोन सुरू करा')); setTimeout(onClose, 1500); },
      onEnd: () => { setListening(false); pulseLoop.current?.stop(); pulseAnim.setValue(1); },
    });
  };

  const stopSession = () => { stopListening(); setListening(false); pulseLoop.current?.stop(); pulseAnim.setValue(1); };

  const COMMANDS = [
    { icon: 'home', text: t('"होम जाओ"', '"Go Home"', '"घरी जा"') },
    { icon: 'book-open-variant', text: t('"सलाह दिखाओ"', '"Show Advisory"', '"सल्ला दाखवा"') },
    { icon: 'flask', text: t('"मिट्टी जाँच"', '"Soil Test"', '"माती तपासणी"') },
    { icon: 'microphone', text: t('"रिपोर्ट सुनाओ"', '"Read Report"', '"रिपोर्ट वाचा"') },
    { icon: 'logout', text: t('"लॉगआउट"', '"Logout"', '"बाहेर जा"') },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={vc.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={vc.sheet} activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={vc.orbWrap}>
            <Animated.View style={[vc.pulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={vc.orbBtn}>
              <LinearGradient colors={listening ? [COLORS.danger, '#B71C1C'] : [COLORS.primary, COLORS.primaryLight]} style={vc.orbGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialCommunityIcons name={listening ? 'microphone' : 'microphone-off'} size={36} color="#fff" />
              </LinearGradient>
            </View>
          </View>
          <Text style={vc.feedback}>{feedback}</Text>
          {transcript ? <Text style={vc.transcript}>"{transcript}"</Text> : null}
          <Text style={vc.cmdTitle}>{t('बोलकर कंट्रोल करें', 'Voice Commands', 'आवाजाने नियंत्रण')}</Text>
          <View style={vc.cmdList}>
            {COMMANDS.map((c, i) => (
              <View key={i} style={vc.cmdRow}>
                <MaterialCommunityIcons name={c.icon} size={15} color={COLORS.primary} />
                <Text style={vc.cmdText}>{c.text}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={vc.closeBtn} onPress={onClose}>
            <Text style={vc.closeTxt}>{t('बंद करें', 'Close', 'बंद करा')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
const vc = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 32, paddingBottom: 48, alignItems: 'center', ...SHADOWS.premium },
  orbWrap: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  pulse: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(11,138,68,0.15)' },
  orbBtn: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', ...SHADOWS.glass },
  orbGrad: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  feedback: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4, textAlign: 'center' },
  transcript: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 18, fontStyle: 'italic', textAlign: 'center' },
  cmdTitle: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  cmdList: { width: '100%', gap: 8, marginBottom: 20 },
  cmdRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primaryPale, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  cmdText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  closeBtn: { paddingVertical: 14, paddingHorizontal: 40, backgroundColor: COLORS.surfaceLight, borderRadius: 16, borderWidth: 1, borderColor: COLORS.divider },
  closeTxt: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
});

// ── MAIN DASHBOARD ─────────────────────────────────────────────
export default function Dashboard({ navigation, virtualNodes = [] }) {
  const { t, lang } = useLang();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [statusMsg, setStatusMsg] = useState(t('डेटा सिंक हो रहा है...', 'Syncing live data...', 'डेटा सिंक होत आहे...'));
  const [refreshing, setRefreshing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);
  const fallbackInput = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => { clearInterval(interval); stopSpeaking(); };
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const { data: d } = await getDashboard(FARM_ID);
    if (d) {
      setData(d);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleSpeak = async () => {
    if (speaking) {
      await stopSpeaking(); setSpeaking(false);
      pulseLoop.current?.stop(); pulseAnim.setValue(1); return;
    }
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
    setSpeaking(true);
    await speakAdvisory(data, lang, data?.farmerName, {
      onDone:  () => { setSpeaking(false); pulseAnim.setValue(1); pulseLoop.current?.stop(); },
      onError: () => { setSpeaking(false); pulseAnim.setValue(1); pulseLoop.current?.stop(); },
    });
  };

  const handleVoiceIntent = useCallback((intent) => {
    switch (intent.action) {
      case 'forward_to_ai': navigation.navigate('AITab', { initialQuestion: intent.transcript }); break;
      case 'navigate_advisory': navigation.navigate('AdvisoryTab'); break;
      case 'navigate_soil':     navigation.navigate('MoreTab');     break;
      case 'navigate_map':      navigation.navigate('MapTab');      break;
      case 'speak_report':      handleSpeak(); break;
      case 'check_moisture': {
        const avg = Math.round((data?.nodes || []).reduce((s, n) => s + n.moisture, 0) / (data?.nodes?.length || 1));
        const txt = lang === 'hi' ? `औसत नमी ${avg} प्रतिशत है।` : lang === 'mr' ? `सरासरी ओलावा ${avg} टक्के.` : `Average moisture is ${avg}%.`;
        speak(txt, lang, {});
        break;
      }
      case 'check_temperature': {
        const avg = ((data?.nodes || []).reduce((s, n) => s + n.temperature, 0) / (data?.nodes?.length || 1)).toFixed(1);
        const txt = lang === 'hi' ? `औसत तापमान ${avg} डिग्री।` : lang === 'mr' ? `सरासरी तापमान ${avg} अंश.` : `Average temperature is ${avg}°C.`;
        speak(txt, lang, {});
        break;
      }
      case 'logout': navigation.navigate('__LOGOUT__'); break;
      default: break;
    }
  }, [data, lang, navigation]);

  if (loading) return <LoadingScreen />;

  const healthScore  = computeHealthScore(data?.nodes || []);
  const alertsCount  = data?.alerts?.length || 0;
  const voiceSupported = isVoiceSupported();

  // Merge real + virtual nodes for SensorStrip
  const virtualNodesMapped = (virtualNodes || []).map((vn, i) => ({
    node_id: `V${i + 1}`, name: vn.name, crop: vn.crop, area: vn.area,
    status: 'virtual', moisture: null, temperature: null, ec: null,
  }));
  const allNodes = [...(data?.nodes || []), ...virtualNodesMapped];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── HEADER ── */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greetText}>{t('नमस्ते,', 'Hello,', 'नमस्ते,')} {data?.farmerName || 'Farmer'}</Text>
          <Text style={styles.userName}>{t('आपका खेत', 'Your Farm', 'तुमची शेती')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.text} />
            {alertsCount > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Admin')}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor={COLORS.primary} />
        }
      >

        {/* ── ALERT BANNER ── */}
        {alertsCount > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <AlertBanner alerts={data.alerts} t={t} />
          </Animated.View>
        )}

        {/* ── 1. PRIMARY FARMER ACTION: MIC ORB (VOICE FIRST) ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient 
            colors={COLORS.gradients.surface} 
            style={styles.orbCard} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.orbTitle}>
              {speaking ? t('सुन रहे हैं...', 'Audio Playing...', 'ऐकत आहे...') : t('अपनी खेत की रिपोर्ट सुनें', 'Listen to your Farm Report', 'तुमचा शेती अहवाल ऐका')}
            </Text>
            <Text style={styles.orbSub}>{t('बस बटन दबाएं', 'Just tap this button', 'फक्त हे बटण दाबा')}</Text>
            
            <View style={styles.orbInner}>
              {speaking && <Animated.View style={[styles.orbPulse, { transform: [{ scale: pulseAnim }] }]} />}
              <TouchableOpacity style={[styles.orbButton, speaking && { shadowColor: COLORS.danger }]} onPress={handleSpeak} activeOpacity={0.9}>
                <LinearGradient
                  colors={speaking ? COLORS.gradients.rose : COLORS.gradients.primary}
                  style={styles.orbGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name={speaking ? 'stop' : 'microphone'} size={56} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {voiceSupported ? (
              <TouchableOpacity style={styles.voiceCtrlBtn} onPress={() => setVoiceOpen(true)} activeOpacity={0.85}>
                <MaterialCommunityIcons name="microphone-settings" size={18} color={COLORS.primary} />
                <Text style={styles.voiceCtrlTxt}>{t('आवाज़ से पूछें', 'Ask by Voice', 'आवाजाने विचारा')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.voiceCtrlBtn} 
                onPress={() => fallbackInput.current?.focus()} 
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="keyboard-outline" size={18} color={COLORS.primary} />
                <Text style={styles.voiceCtrlTxt}>{t('मदद चाहिए?', 'Need Help?', 'मदत हवी आहे?')}</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ── QUICK ACTIONS ── */}
        <Animated.View style={[styles.section, styles.actionGrid, { opacity: fadeAnim }]}>
          {[
            { icon: 'leaf', color: COLORS.primary, bg: COLORS.primaryPale, label: t('सलाह', 'Advice', 'सल्ला'), sub: t('सिंचाई / खाद', 'Water & Food', 'पाणी/खत'), screen: 'AdvisoryTab' },
            { icon: 'flask', color: COLORS.accent, bg: 'rgba(99,102,241,0.1)', label: t('मिट्टी', 'Soil', 'माती'), sub: t('जाँच रिपोर्ट', 'Test Report', 'तपासणी'), screen: 'AnalyticsTab' },
            { icon: 'map-marker-radius', color: COLORS.warning, bg: '#FFF8EC', label: t('नक्शा', 'Map', 'नकाशा'), sub: t('खेत देखें', 'View Farm', 'शेत पहा'), screen: 'MapTab' },
            { icon: 'robot-happy', color: COLORS.success, bg: '#ECFDF5', label: t('AI सहायक', 'AI Talk', 'AI सहाय्यक'), sub: t('सवाल पूछें', 'Ask AI', 'AI विचारा'), screen: 'AITab' },
          ].map((a, i) => (
            <Pressable 
              key={i} 
              style={({pressed}) => [styles.actionCard, pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 }]} 
              onPress={() => navigation.navigate(a.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                <MaterialCommunityIcons name={a.icon} size={28} color={a.color} />
              </View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>

        {/* ── SECONDARY DATA: WEATHER ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <WeatherWidget t={t} />
        </Animated.View>

        {/* ── SECONDARY DATA: FARM HEALTH ── */}
        <Animated.View style={[styles.section, styles.healthRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Health Score Card */}
          <View style={styles.healthCard}>
            <Text style={styles.healthLabel}>{t('खेत स्वास्थ्य', 'Farm Health', 'शेत आरोग्य')}</Text>
            <HealthGauge score={healthScore} size={110} />
            <Text style={[styles.healthStatus, { color: healthColor(healthScore) }]}>
              {healthScore >= 75 ? t('उत्कृष्ट', 'Excellent', 'उत्कृष्ट') : healthScore >= 50 ? t('ठीक', 'Fair', 'ठीक') : t('देखभाल जरूरी', 'Needs Attention', 'लक्ष द्या')}
            </Text>
          </View>

          {/* Stats column */}
          <View style={styles.statsCol}>
            {[
              { icon: 'access-point', label: t('नोड', 'Nodes', 'नोड'), value: `${data?.nodes?.length || 4}`, color: COLORS.primary },
              { icon: 'alert-circle', label: t('सतर्कता', 'Alerts', 'सतर्कता'), value: `${alertsCount}`, color: alertsCount > 0 ? COLORS.danger : COLORS.success },
              { icon: 'water-percent', label: t('औसत नमी', 'Avg. Moist', 'सरासरी'), value: `${Math.round((data?.nodes || []).reduce((s, n) => s + n.moisture, 0) / (data?.nodes?.length || 1))}%`, color: COLORS.secondary },
              { icon: 'thermometer', label: t('औसत ताप', 'Avg. Temp', 'सरासरी'), value: `${((data?.nodes || []).reduce((s, n) => s + n.temperature, 0) / (data?.nodes?.length || 1)).toFixed(1)}°C`, color: COLORS.warning },
            ].map((s, i) => (
              <View key={i} style={styles.statPill}>
                <MaterialCommunityIcons name={s.icon} size={16} color={s.color} />
                <View>
                  <Text style={styles.statVal}>{s.value}</Text>
                  <Text style={styles.statLbl}>{s.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── ADVANCED DATA (SENSORS & TASKS) ── */}
        <Animated.View style={[styles.sectionHdr, { opacity: fadeAnim, marginTop: 32 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="access-point" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('विस्तृत सेंसर डेटा', 'Detailed Sensor Data', 'तपशीलवार डेटा')}</Text>
          </View>
        </Animated.View>
        <Animated.View style={[{ paddingHorizontal: 24 }, { opacity: fadeAnim }]}>
          <SensorStrip nodes={allNodes} t={t} />
        </Animated.View>

        <Animated.View style={[styles.sectionHdr, { opacity: fadeAnim, marginTop: 32 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('आज के काम', "Today's Tasks", 'आजची कामे')}</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <TaskChecklist nodes={data?.nodes} t={t} />
        </Animated.View>
      </ScrollView>

      <VoiceCommandModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} lang={lang} onIntent={handleVoiceIntent} t={t} />
      
      {/* Hidden fallback for Expo Go voice input */}
      <TextInput 
        ref={fallbackInput}
        style={{ height: 0, width: 0, opacity: 0, position: 'absolute' }}
        onSubmitEditing={(e) => {
          const txt = e.nativeEvent.text;
          if (txt) handleVoiceIntent({ action: 'forward_to_ai', transcript: txt });
        }}
      />
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Skeleton width={120} height={20} style={{ marginBottom: 10 }} />
        <Skeleton width={200} height={30} style={{ marginBottom: 20 }} />
      </View>
      <View style={styles.section}>
        <Skeleton width="100%" height={160} borderRadius={24} />
      </View>
      <View style={styles.section}>
        <Skeleton width="100%" height={100} borderRadius={24} />
      </View>
      <View style={styles.section}>
        <Skeleton width="100%" height={260} borderRadius={32} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOWS.soft,
  },
  section:     { paddingHorizontal: 24, marginTop: 16 },
  greetText:   { ...TEXT_STYLES.small, color: COLORS.textSecondary },
  userName:    { ...TEXT_STYLES.h2, color: COLORS.text, marginTop: -2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
    borderWidth: 2,
    borderColor: COLORS.background,
  },

  healthRow:   { flexDirection: 'row', gap: 14 },
  healthCard:  { 
    flex: 1, 
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.xl, 
    padding: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.divider, 
    ...SHADOWS.card 
  },
  healthLabel: { ...TEXT_STYLES.tiny, color: COLORS.textMuted, marginBottom: 8 },
  healthStatus:{ ...TEXT_STYLES.small, fontWeight: '800', marginTop: 6 },
  statsCol:    { flex: 1, gap: 10 },
  statPill:    { 
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.lg, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    borderWidth: 1, 
    borderColor: COLORS.divider, 
    ...SHADOWS.soft 
  },
  statVal:     { ...TEXT_STYLES.bodySemi, color: COLORS.text, letterSpacing: -0.3 },
  statLbl:     { ...TEXT_STYLES.tiny, color: COLORS.textMuted },

  orbCard:     { 
    borderRadius: RADIUS.xxl, 
    paddingVertical: 32, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.divider, 
    ...SHADOWS.premium 
  },
  orbInner:    { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  orbPulse:    { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(5, 150, 105, 0.1)' },
  orbButton:   { 
    width: 112, 
    height: 112, 
    borderRadius: 56, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...SHADOWS.premium 
  },
  orbGradient: { width: 92, height: 92, borderRadius: 46, justifyContent: 'center', alignItems: 'center' },
  orbTitle:    { ...TEXT_STYLES.h3, color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  orbSub:      { ...TEXT_STYLES.body, color: COLORS.textSecondary, marginBottom: 16 },
  voiceCtrlBtn:{ 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 7, 
    backgroundColor: COLORS.primaryPale, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: RADIUS.md, 
    borderWidth: 1, 
    borderColor: 'rgba(5, 150, 105, 0.2)' 
  },
  voiceCtrlTxt:{ ...TEXT_STYLES.small, color: COLORS.primary, fontWeight: '700' },

  actionGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard:  { 
    width: '47%', 
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.lg, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: COLORS.divider, 
    ...SHADOWS.card 
  },
  actionIcon:  { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { ...TEXT_STYLES.h4, color: COLORS.text, marginBottom: 3 },
  actionSub:   { ...TEXT_STYLES.small, color: COLORS.textSecondary, fontSize: 11 },

  sectionHdr:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 24, marginBottom: 12 },
  sectionTitle:{ ...TEXT_STYLES.h3, color: COLORS.text },
});
