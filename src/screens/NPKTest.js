import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, GAPS } from '../theme';
import { sensorNodes, npkValues } from '../mockData';
import { postNPKReading } from '../services/api';
import { speakHindi, stopSpeaking } from '../services/tts';
import { useNavigation } from '@react-navigation/native';

const FARM_ID = 'farm_001';

const ZONES = [
  { icon: '⬆️', direction: 'उत्तर', directionEn: 'North', color: '#1565C0', bg: '#E3F2FD' },
  { icon: '⬇️', direction: 'दक्षिण', directionEn: 'South', color: '#2E7D32', bg: '#E8F5E9' },
  { icon: '➡️', direction: 'पूर्व',  directionEn: 'East',  color: '#E65100', bg: '#FFF3E0' },
  { icon: '⬅️', direction: 'पश्चिम', directionEn: 'West',  color: '#6A1B9A', bg: '#F3E5F5' },
];

export default function NPKTest() {
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
    const text = `जाँच पूरी हुई। नाइट्रोजन ${npkValues.N}, फॉस्फोरस ${npkValues.P}, पोटाश ${npkValues.K}। pH ${npkValues.pH} है।`;
    setSpeakingCard(true);
    await speakHindi(text, { onDone: () => setSpeakingCard(false), onError: () => setSpeakingCard(false) });
  };

  const handleNext = async () => {
    if (isLast) {
      setIsSubmitting(true);
      const payload = {
        nitrogen: npkValues.N,
        phosphorus: npkValues.P,
        potassium: npkValues.K,
        pH: npkValues.pH,
      };
      const { error } = await postNPKReading(FARM_ID, payload);
      setIsSubmitting(false);
      if (error) {
        Alert.alert('⚠️  Error', 'Data could not be saved. Check connection.');
      } else {
        setStep('done');
        await speakHindi('सभी क्षेत्रों की जाँच पूरी हो गई। आज की सलाह देखने के लिए धन्यवाद।');
      }
    } else {
      setCurrentNode(prev => prev + 1);
      setStep('start');
      fadeAnim.setValue(0);
    }
  };

  // ── DONE SCREEN  ────────────────────────────────────────────
  if (step === 'done') {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <LinearGradient colors={[COLORS.primary, '#0D4A28']} style={styles.doneGrad}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>जाँच पूरी हुई!</Text>
          <Text style={styles.doneSub}>Soil test completed successfully</Text>
          <Text style={styles.doneSub2}>
            {getSummaryText()}
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('सलाह')}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>📋  आज की सलाह देखें →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn2}
            onPress={() => { setCurrentNode(0); setStep('start'); }}
          >
            <Text style={styles.doneBtn2Text}>↩  फिर से जाँचें</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ── START SCREEN ────────────────────────────────────────────
  if (step === 'start') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <LinearGradient colors={[COLORS.primary, '#0D4A28']} style={styles.header}>
          <Text style={styles.headerTitle}>🌱  मिट्टी जाँच</Text>
          <Text style={styles.headerSub}>Soil NPK Testing</Text>
          <ProgressDots total={sensorNodes.length} current={currentNode} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.startContent}>
          <View style={[styles.zoneCard, { backgroundColor: zone.bg, borderColor: zone.color + '40' }]}>
            <Text style={styles.zoneEmoji}>{zone.icon}</Text>
            <Text style={[styles.zoneDir, { color: zone.color }]}>{zone.direction} ({zone.directionEn})</Text>
            <Text style={styles.zoneSpot}>क्षेत्र {currentNode + 1} / {sensorNodes.length}</Text>
          </View>

          <View style={styles.instructCard}>
            <MaterialCommunityIcons name="flask-outline" size={36} color={COLORS.primary} />
            <Text style={styles.instructTitle}>जाँच कैसे करें?</Text>
            <Text style={styles.instructText}>
              1️⃣  NPK जाँच की छड़ मिट्टी में गाड़ें{'\n'}
              2️⃣  "जाँच शुरू करें" बटन दबाएं{'\n'}
              3️⃣  3 सेकंड शांत रहें, जाँच होगी{'\n'}
              4️⃣  नतीजा देखें और सलाह सुनें
            </Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={startScan} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.startBtnGrad}>
              <MaterialCommunityIcons name="play-circle" size={26} color="#fff" />
              <Text style={styles.startBtnText}>जाँच शुरू करें</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.startHint}>Start NPK Reading</Text>
        </ScrollView>
      </View>
    );
  }

  // ── SCANNING SCREEN ─────────────────────────────────────────
  if (step === 'scanning') {
    return (
      <LinearGradient colors={[COLORS.primary, '#0D4A28']} style={styles.scanContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Text style={styles.scanTitle}>जाँच हो रही है...</Text>
        <Text style={styles.scanSub}>{zone.direction} क्षेत्र ({zone.directionEn})</Text>

        <Animated.View style={[styles.scanCircle, { transform: [{ scale: scaleAnim }] }]}>
          <MaterialCommunityIcons name="flask-outline" size={60} color={COLORS.accent} />
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.scanBarWrap}>
          <Animated.View
            style={[styles.scanBar, {
              width: scanProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]}
          />
        </View>
        <Text style={styles.scanHint}>कृपया प्रतीक्षा करें... Please wait...</Text>
        <ProgressDots total={sensorNodes.length} current={currentNode} />
      </LinearGradient>
    );
  }

  // ── RESULT SCREEN ───────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient colors={[COLORS.primary, '#0D4A28']} style={styles.header}>
        <Text style={styles.headerTitle}>✅  जाँच पूरी</Text>
        <Text style={styles.headerSub}>{zone.direction} क्षेत्र का नतीजा</Text>
        <ProgressDots total={sensorNodes.length} current={currentNode} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.resultContent}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{getSummaryText()}</Text>
          <TouchableOpacity
            style={[styles.speakBtn, speakingCard && styles.speakBtnActive]}
            onPress={speakingCard ? stopSpeaking : speakResult}
          >
            <MaterialCommunityIcons name={speakingCard ? 'stop-circle' : 'volume-high'} size={22} color={speakingCard ? '#fff' : COLORS.primary} />
            <Text style={[styles.speakBtnText, speakingCard && { color: '#fff' }]}>
              {speakingCard ? 'रोकें' : 'नतीजा सुनें (Hindi)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* NPK Cards Grid */}
        <View style={styles.npkGrid}>
          <NPKCard nutrient="N" nameHindi="नाइट्रोजन" value={npkValues.N} unit="mg/kg" min={50} />
          <NPKCard nutrient="P" nameHindi="फॉस्फोरस" value={npkValues.P} unit="mg/kg" min={25} />
          <NPKCard nutrient="K" nameHindi="पोटाश" value={npkValues.K} unit="mg/kg" min={50} />
          <NPKCard nutrient="pH" nameHindi="pH स्तर" value={npkValues.pH} unit="" min={6.0} max={7.5} />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={isLast ? ['#1565C0', '#0D47A1'] : [COLORS.primary, COLORS.primaryLight]}
            style={styles.nextBtnGrad}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {isLast ? '✅  जाँच पूरी करें' : `➡️  अगला क्षेत्र: ${ZONES[currentNode + 1]?.direction}`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {isLast && (
          <Text style={styles.submitHint}>Submit test to get advisory</Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ── NPK Card ─────────────────────────────────────────────────────────────────
function NPKCard({ nutrient, nameHindi, value, unit, min, max }) {
  const numVal = parseFloat(value);
  let isOk = max ? (numVal >= min && numVal <= max) : (numVal >= min);
  const color = isOk ? COLORS.success : COLORS.danger;
  const pct = max
    ? Math.min(100, Math.max(4, ((numVal - min) / (max - min)) * 100))
    : Math.min(100, Math.max(4, (numVal / (min * 1.6)) * 100));

  return (
    <View style={npkStyles.card}>
      <View style={npkStyles.top}>
        <Text style={npkStyles.nutrient}>{nutrient}</Text>
        <View style={[npkStyles.badge, { backgroundColor: isOk ? '#E8F5EC' : '#FEECEB' }]}>
          <Text style={[npkStyles.badgeText, { color }]}>{isOk ? '✓ ठीक' : '⚠ कम'}</Text>
        </View>
      </View>
      <Text style={npkStyles.name}>{nameHindi}</Text>
      <Text style={[npkStyles.value, { color }]}>{value}<Text style={npkStyles.unit}> {unit}</Text></Text>
      <View style={npkStyles.bar}>
        <View style={[npkStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={npkStyles.minText}>कम से कम {min} {unit}</Text>
    </View>
  );
}
const npkStyles = StyleSheet.create({
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, ...SHADOWS.soft },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nutrient: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  name: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6 },
  value: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  unit: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  bar: { height: 6, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  fill: { height: '100%', borderRadius: 6 },
  minText: { fontSize: 10, color: COLORS.textLight },
});

// ── Progress Dots ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <View style={pdStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[pdStyles.dot,
            i < current && pdStyles.done,
            i === current && pdStyles.active,
          ]}
        />
      ))}
    </View>
  );
}
const pdStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  active: { backgroundColor: '#fff', width: 24 },
  done: { backgroundColor: COLORS.accent },
});

function getSummaryText() {
  const { N, P, K, pH, thresholds } = npkValues;
  const ok = [
    N >= thresholds.N.min,
    P >= thresholds.P.min,
    K >= thresholds.K.min,
    pH >= thresholds.pH.min && pH <= thresholds.pH.max,
  ].filter(Boolean).length;
  if (ok === 4) return '✅ सभी पोषक तत्व ठीक हैं!';
  if (ok >= 2) return `⚠️ ${4 - ok} पोषक तत्वों पर ध्यान दें`;
  return `🚨 ${4 - ok} पोषक तत्व बहुत कम हैं`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, backgroundColor: COLORS.primary },
  // Header
  header: { paddingTop: 55, paddingHorizontal: 22, paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  // Zone card
  startContent: { padding: 20 },
  zoneCard: { borderRadius: 22, borderWidth: 2, padding: 28, alignItems: 'center', marginBottom: 20 },
  zoneEmoji: { fontSize: 50, marginBottom: 10 },
  zoneDir: { fontSize: 26, fontWeight: '900', marginBottom: 6 },
  zoneSpot: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  // Instruct
  instructCard: { backgroundColor: '#fff', borderRadius: 20, padding: 22, marginBottom: 24, alignItems: 'center', ...SHADOWS.soft },
  instructTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginVertical: 10 },
  instructText: { fontSize: 16, lineHeight: 30, color: COLORS.text },
  // Start btn
  startBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOWS.premium },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  startBtnText: { fontSize: 20, fontWeight: '900', color: '#fff' },
  startHint: { textAlign: 'center', marginTop: 10, color: COLORS.textLight, fontSize: 12 },
  // Scanning
  scanContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  scanTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6 },
  scanSub: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 40 },
  scanCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 50, borderWidth: 3, borderColor: COLORS.accent },
  scanBarWrap: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  scanBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 8 },
  scanHint: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 30 },
  // Result
  resultContent: { padding: 16, paddingBottom: 40 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 16, ...SHADOWS.soft, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.text, marginRight: 10 },
  speakBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryPale, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  speakBtnActive: { backgroundColor: COLORS.danger },
  speakBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  npkGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  nextBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOWS.premium },
  nextBtnGrad: { paddingVertical: 20, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  submitHint: { textAlign: 'center', marginTop: 10, color: COLORS.textLight, fontSize: 12 },
  // Done
  doneGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  doneEmoji: { fontSize: 80, marginBottom: 20 },
  doneTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8 },
  doneSub: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  doneSub2: { fontSize: 17, fontWeight: '700', color: COLORS.accent, marginTop: 16, marginBottom: 32, textAlign: 'center' },
  doneBtn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 30, marginBottom: 14, width: '100%', alignItems: 'center', ...SHADOWS.medium },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  doneBtn2: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 30, width: '100%', alignItems: 'center' },
  doneBtn2Text: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
});
