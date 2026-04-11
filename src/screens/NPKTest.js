import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, ActivityIndicator, Alert, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING } from '../theme';
import { sensorNodes, npkValues } from '../mockData';
import { postNPKReading } from '../services/api';
import { speak, stopSpeaking } from '../services/tts';
import { useNavigation } from '@react-navigation/native';
import { useLang } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

const FARM_ID = 'farm_001';

const ZONES = [
  { icon: 'compass', direction: 'उत्तर', directionEn: 'North', directionMr: 'उत्तर', color: '#1565C0', bg: '#E3F2FD' },
  { icon: 'compass-outline', direction: 'दक्षिण', directionEn: 'South', directionMr: 'दक्षिण', color: '#2E7D32', bg: '#E8F5E9' },
  { icon: 'compass-rose', direction: 'पूर्व',  directionEn: 'East',  directionMr: 'पूर्व', color: '#E65100', bg: '#FFF3E0' },
  { icon: 'crosshairs-gps', direction: 'पश्चिम', directionEn: 'West',  directionMr: 'पश्चिम', color: '#6A1B9A', bg: '#F3E5F5' },
];

export default function NPKTest() {
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [step, setStep] = useState('start');     // 'start' | 'scanning' | 'result' | 'done'
  const [currentNode, setCurrentNode] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speakingCard, setSpeakingCard] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scanProgress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => () => stopSpeaking(), []);

  const node = sensorNodes[currentNode];
  const zone = ZONES[currentNode] || ZONES[0];
  const isLast = currentNode === sensorNodes.length - 1;

  function startScan() {
    setStep('scanning');
    scanProgress.setValue(0);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.5, friction: 2, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.1, friction: 4, useNativeDriver: true }),
    ]).start();
    Animated.timing(scanProgress, { toValue: 1, duration: 3000, useNativeDriver: false }).start(() => {
      setStep('result');
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      speakResult();
    });
  }

  const speakResult = async () => {
    const text = t(
      `जाँच पूरी हुई। नाइट्रोजन ${npkValues.N}, फॉस्फोरस ${npkValues.P}, पोटाश ${npkValues.K}। pH ${npkValues.pH} है।`,
      `Testing complete. Nitrogen ${npkValues.N}, Phosphorus ${npkValues.P}, Potassium ${npkValues.K}. pH is ${npkValues.pH}.`,
      `चाचणी पूर्ण झाली. नत्र ${npkValues.N}, स्फुरद ${npkValues.P}, पालाश ${npkValues.K}. pH ${npkValues.pH} आहे.`
    );
    const sarvamLangMap = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN' };
    setSpeakingCard(true);
    await speak(text, sarvamLangMap[lang], { onDone: () => setSpeakingCard(false), onError: () => setSpeakingCard(false) });
  };

  const handleNext = async () => {
    if (isLast) {
      setIsSubmitting(true);
      const payload = { nitrogen: npkValues.N, phosphorus: npkValues.P, potassium: npkValues.K, pH: npkValues.pH };
      const { error } = await postNPKReading(FARM_ID, payload);
      setIsSubmitting(false);
      if (error) {
        showToast(t('डाटा सेव नहीं हो सका', 'Data could not be saved', 'माहिती जतन होऊ शकली नाही'), 'error');
      } else {
        showToast(t('डेटा सुरक्षित रूप से सहेजा गया!', 'Sensor data saved securely!', 'डेटा सुरक्षितपणे जतन केला!'), 'success');
        setStep('done');
        await speak(t('सभी क्षेत्रों की जाँच पूरी हो गई। आज की सलाह देखने के लिए धन्यवाद।', 'All zones tested. Thank you for viewing today\'s advisory.', 'सर्व क्षेत्रांची चाचणी पूर्ण झाली. आजचा सल्ला पाहिल्याबद्दल धन्यवाद.'), lang === 'hi' ? 'hi-IN' : (lang === 'mr' ? 'mr-IN' : 'en-IN'));
      }
    } else {
      setCurrentNode(prev => prev + 1);
      setStep('start');
      fadeAnim.setValue(0);
    }
  };

  if (step === 'done') {
    return (
      <View style={styles.doneContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.doneContent}>
          <MaterialCommunityIcons name="check-decagram" size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
          <Text style={styles.doneTitle}>{t('जाँच पूरी हुई!', 'Test Completed!', 'चाचणी पूर्ण झाली!')}</Text>
          <Text style={styles.doneSub}>{t('मिट्टी का परीक्षण सफलतापूर्वक किया गया', 'Soil test completed successfully', 'माती परीक्षण यशस्वीरित्या पूर्ण झाले')}</Text>
          <Text style={styles.doneSummary}>{getSummaryText(t)}</Text>
          
          <TouchableOpacity
            style={[styles.advisoryUpdatedCard, { ...SHADOWS.soft }]} 
            onPress={() => navigation.navigate('Advisory', { triggeredByNPK: true })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.advisoryUpdatedTitle}>🤖 {t('सलाह अपडेट की गई', 'Advisory updated based on this test', 'या चाचणीवर आधारित सल्ला अद्यतनित')}</Text>
              <Text style={styles.advisoryUpdatedSub}>{t('सुझाव देखने के लिए टैप करें', 'Tap to see your crop recommendations', 'तुमच्या पीक शिफारसी पाहण्यासाठी टॅप करा')}</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setCurrentNode(0); setStep('start'); }}>
            <Text style={styles.secondaryBtnText}>{t('फिर से जाँचें', 'Test Again', 'पुन्हा चाचणी करा')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'start') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('मिट्टी जाँच', 'Soil Test', 'माती परीक्षण')}</Text>
          <Text style={styles.headerSubtitle}>{t('एनपीके (NPK) स्तर का विश्लेषण', 'NPK Level Analysis', 'NPK पातळी विश्लेषण')}</Text>
          <ProgressDots total={sensorNodes.length} current={currentNode} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient 
            colors={[zone.bg, '#FFFFFF']} 
            style={[styles.zoneCard, { borderColor: zone.color + '30' }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={[styles.emojiWrap, { backgroundColor: zone.color + '15' }]}>
              <MaterialCommunityIcons name={zone.icon} size={36} color={zone.color} />
            </View>
            <Text style={[styles.zoneDir, { color: zone.color }]}>
              {lang === 'hi' ? zone.direction : (lang === 'mr' ? zone.directionMr : zone.directionEn)}
            </Text>
            <View style={styles.zonePill}>
              <Text style={[styles.zoneStep, { color: zone.color }]}>
                {t(`क्षेत्र ${currentNode + 1} / ${sensorNodes.length}`, `Zone ${currentNode + 1} / ${sensorNodes.length}`, `क्षेत्र ${currentNode + 1} / ${sensorNodes.length}`)}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.instructCard}>
            <View style={styles.instructHeader}>
              <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
              <Text style={styles.instructTitle}>{t('निर्देश', 'Instructions', 'सूचना')}</Text>
            </View>
            
            <View style={styles.instructList}>
              <View style={styles.instructItem}>
                <View style={styles.instructDot} />
                <Text style={styles.instructText}>{t('NPK छड़ को मिट्टी में डालें', 'Insert NPK probe into soil', 'NPK प्रोब मातीत घाला')}</Text>
              </View>
              <View style={styles.instructItem}>
                <View style={styles.instructDot} />
                <Text style={styles.instructText}>{t('नीचे दिए गए बटन को दबाएं', 'Press the button below', 'खालील बटण दाबा')}</Text>
              </View>
              <View style={styles.instructItem}>
                <View style={styles.instructDot} />
                <Text style={styles.instructText}>{t('कुछ पल प्रतीक्षा करें', 'Wait for a moment', 'काही क्षण प्रतीक्षा करा')}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={startScan}
            activeOpacity={0.8}
          >
            <LinearGradient 
              colors={[COLORS.primary, COLORS.primaryLight]} 
              style={styles.primaryBtnGrad} 
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="scan-helper" size={24} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={styles.primaryBtnText}>{t('जाँच शुरू करें', 'Start Scanning', 'चाचणी सुरू करा')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 'scanning') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.scanContainer}>
          <Text style={styles.scanTitle}>{t('जाँच हो रही है...', 'Scanning Soil...', 'चाचणी सुरू आहे...')}</Text>
          <Text style={styles.scanSubtitle}>
            {lang === 'hi' ? zone.direction : (lang === 'mr' ? zone.directionMr : zone.directionEn)} {t('क्षेत्र', 'Zone', 'क्षेत्र')}
          </Text>

          <Animated.View style={[styles.scanCircle, { transform: [{ scale: scaleAnim }] }]}>
            <MaterialCommunityIcons name="flask-outline" size={60} color={COLORS.primary} />
          </Animated.View>

          <View style={styles.progressBarWrap}>
            <Animated.View style={[styles.progressBar, { width: scanProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
          <Text style={styles.scanHint}>{t('कृपया प्रतीक्षा करें', 'Please wait...', 'कृपया प्रतीक्षा करा')}</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('जाँच का नतीजा', 'Test Result', 'चाचणी निकाल')}</Text>
        <Text style={styles.headerSubtitle}>{t('एनपीके (NPK) और पीएच का विवरण', 'NPK & pH Details', 'NPK आणि pH तपशील')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>{t('स्थिति', 'Status', 'स्थिती')}</Text>
            <Text style={styles.summaryValue}>{getSummaryText(t)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.voiceBtn, speakingCard && styles.voiceBtnActive]} 
            onPress={speakingCard ? stopSpeaking : speakResult}
          >
            <MaterialCommunityIcons name={speakingCard ? "stop" : "volume-high"} size={24} color={speakingCard ? "#fff" : COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.npkGrid}>
          <NPKCard nutrient="N" label={t('नाइट्रोजन', 'Nitrogen', 'नत्र')} value={npkValues.N} unit="mg/kg" min={50} t={t} />
          <NPKCard nutrient="P" label={t('फॉस्फोरस', 'Phosphorus', 'स्फुरद')} value={npkValues.P} unit="mg/kg" min={25} t={t} />
          <NPKCard nutrient="K" label={t('पोटाश', 'Potassium', 'पालाश')} value={npkValues.K} unit="mg/kg" min={50} t={t} />
          <NPKCard nutrient="pH" label={t('pH स्तर', 'pH Level', 'pH पातळी')} value={npkValues.pH} unit="" min={6.0} max={7.5} t={t} />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} disabled={isSubmitting}>
          <LinearGradient colors={isLast ? [COLORS.secondary, '#5856D6'] : [COLORS.primary, COLORS.primaryLight]} style={styles.primaryBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.primaryBtnText}>
                {isLast ? t('चाचणी पूर्ण करा', 'Finish Testing', 'चाचणी पूर्ण करा') : t('अगला क्षेत्र', 'Next Zone', 'पुढील क्षेत्र')}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

function NPKCard({ nutrient, label, value, unit, min, max, t }) {
  const numVal = parseFloat(value);
  let isOk = max ? (numVal >= min && numVal <= max) : (numVal >= min);
  const color = isOk ? COLORS.success : COLORS.danger;
  
  return (
    <View style={styles.nutrientCard}>
      <View style={styles.nutrientHeader}>
        <Text style={styles.nutrientSymbol}>{nutrient}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isOk ? COLORS.primaryPale : '#FEECEB' }]}>
          <Text style={[styles.statusText, { color }]}>{isOk ? t('ठीक', 'OK', 'ठीक') : t('कम', 'Low', 'कमी')}</Text>
        </View>
      </View>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={[styles.nutrientValue, { color }]}>{value} <Text style={styles.nutrientUnit}>{unit}</Text></Text>
    </View>
  );
}

function ProgressDots({ total, current }) {
  return (
    <View style={styles.progressDots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.dotActive, i < current && styles.dotDone]} />
      ))}
    </View>
  );
}

function getSummaryText(t) {
  const { N, P, K, pH, thresholds } = npkValues;
  const ok = [N >= thresholds.N.min, P >= thresholds.P.min, K >= thresholds.K.min, pH >= thresholds.pH.min && pH <= thresholds.pH.max].filter(Boolean).length;
  if (ok === 4) return t('सब ठीक है!', 'Everything is perfect!', 'सर्व काही ठीक आहे!');
  if (ok >= 2) return t('संतुलित स्तर', 'Balanced levels', 'संतुलित पातळी');
  return t('सुधार की आवश्यकता', 'Needs improvement', 'सुधारणा आवश्यक आहे');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.xl, paddingTop: 0 },
  header: { padding: SPACING.xl, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },

  progressDots: { flexDirection: 'row', gap: 6, marginTop: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { width: 20, backgroundColor: COLORS.primary },
  dotDone: { backgroundColor: COLORS.primaryLight },

  zoneCard: { borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, ...SHADOWS.premium },
  emojiWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  zoneEmoji: { fontSize: 40 },
  zoneDir: { fontSize: 28, fontWeight: '900', marginBottom: 12, letterSpacing: -0.5 },
  zonePill: { backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  zoneStep: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  instructCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, marginBottom: 30, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.soft },
  instructHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  instructTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  instructList: { gap: 12 },
  instructItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  instructDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primaryLight, marginTop: 8 },
  instructText: { flex: 1, fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, fontWeight: '500' },

  primaryBtn: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.glass },
  primaryBtnGrad: { paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  scanContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  scanTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginBottom: 10 },
  scanSubtitle: { fontSize: 18, color: COLORS.primary, fontWeight: '600', marginBottom: 40 },
  scanCircle: { 
    width: 160, height: 160, borderRadius: 80, backgroundColor: COLORS.surface, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 50,
    borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.premium
  },
  progressBarWrap: { width: '100%', height: 10, backgroundColor: COLORS.divider, borderRadius: 5, overflow: 'hidden', marginBottom: 15 },
  progressBar: { height: '100%', backgroundColor: COLORS.primary },
  scanHint: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },

  summaryCard: { 
    backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, 
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.soft 
  },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '700', marginBottom: 5, textTransform: 'uppercase' },
  summaryValue: { fontSize: 18, color: COLORS.text, fontWeight: '800' },
  voiceBtn: { 
    width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primaryPale,
    justifyContent: 'center', alignItems: 'center'
  },
  voiceBtnActive: { backgroundColor: COLORS.danger },

  npkGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  nutrientCard: { 
    width: '48%', backgroundColor: COLORS.surface, borderRadius: 20, 
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.divider,
    ...SHADOWS.soft
  },
  nutrientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nutrientSymbol: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  nutrientLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 5 },
  nutrientValue: { fontSize: 20, fontWeight: '900' },
  nutrientUnit: { fontSize: 12, color: COLORS.textMuted },

  doneContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' },
  doneContent: { padding: 40, alignItems: 'center' },
  doneEmoji: { fontSize: 80, marginBottom: 20 },
  doneTitle: { fontSize: 32, fontWeight: '900', color: COLORS.text, marginBottom: 10 },
  doneSub: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 30, textAlign: 'center' },
  doneSummary: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 40 },
  
  advisoryUpdatedCard: {
    backgroundColor: COLORS.primaryPale,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  advisoryUpdatedTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 4, lineHeight: 22 },
  advisoryUpdatedSub: { fontSize: 13, color: COLORS.primary, opacity: 0.8, fontWeight: '600' },
  
  secondaryBtn: { marginTop: 10, paddingVertical: 10 },
  secondaryBtnText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700' }
});
