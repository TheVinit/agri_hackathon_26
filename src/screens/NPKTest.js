import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import NPKResultBox from '../components/NPKResultBox';
import { sensorNodes, npkValues } from '../mockData';
import { postNPKReading } from '../services/api';
import { COLORS, SHADOWS, GAPS } from '../theme';

function getSummaryLabel() {
  const { N, P, K, pH, thresholds } = npkValues;
  const nOk = N >= thresholds.N.min;
  const pOk = P >= thresholds.P.min;
  const kOk = K >= thresholds.K.min;
  const hOk = pH >= thresholds.pH.min && pH <= thresholds.pH.max;
  const total = [nOk, pOk, kOk, hOk].filter(Boolean).length;
  if (total === 4) return '✅ All nutrients within range';
  if (total >= 2) return `⚠️  ${4 - total} nutrients need attention`;
  return `🚨 ${4 - total} nutrients critically low`;
}

export default function NPKTest() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [currentNode, setCurrentNode] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const node = sensorNodes[currentNode - 1];
  const isLastNode = currentNode === sensorNodes.length;

  useEffect(() => {
    if (step !== 2) return;

    Animated.spring(scaleAnim, {
      toValue: 1.6,
      friction: 2,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }).start();
    });

    if (countdown === 0) {
      setStep(3);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, countdown]);

  function startTest() {
    setCountdown(3);
    setStep(2);
  }

  const handleNext = async () => {
    if (isLastNode) {
      setIsSubmitting(true);
      const payload = {
        nitrogen: npkValues.N,
        phosphorus: npkValues.P,
        potassium: npkValues.K,
        pH: npkValues.pH
      };
      
      const { error } = await postNPKReading('farm_001', payload);
      setIsSubmitting(false);

      if (error) {
        Alert.alert("Submission Failed", "Could not save NPK data to server. Please check connection.");
      } else {
        navigation.navigate('Advisory');
      }
    } else {
      setCurrentNode((prev) => prev + 1);
      setStep(1);
    }
  };

  function ProgressDots() {
    return (
      <View style={styles.dotsRow}>
        {sensorNodes.map((_, i) => {
          const done = i + 1 < currentNode;
          const active = i + 1 === currentNode;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                done && styles.dotDone,
                active && styles.dotActive,
              ]}
            />
          );
        })}
      </View>
    );
  }

  if (step === 1) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.header}>
          <Text style={styles.headerTitle}>Soil Analysis Step</Text>
          <ProgressDots />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.stepContent}>
          <Text style={styles.spotHeading}>Spot {currentNode} of {sensorNodes.length}</Text>
          <Text style={styles.spotLabel}>{node.labelLine1}{'\n'}{node.labelLine2}</Text>

          <Surface style={styles.instructCard}>
            <MaterialCommunityIcons name="information" size={32} color={COLORS.primary} />
            <Text style={styles.instructText}>
              Insert the NPK probe firmly into the soil at this marked spot.
            </Text>
          </Surface>

          <TouchableOpacity style={styles.startBtn} onPress={startTest} activeOpacity={0.9}>
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.btnGradient}>
              <Text style={styles.startBtnText}>START READING</Text>
              <MaterialCommunityIcons name="play-circle" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 2) {
    return (
      <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.countdownContainer}>
        <View style={styles.countdownHeader}>
          <Text style={styles.countdownSpotText}>Analyzing Soil Sample</Text>
          <Text style={styles.countdownSubSpot}>{node.labelLine1}</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.countdownNumber}>{countdown > 0 ? countdown : '...'}</Text>
        </Animated.View>

        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={COLORS.white} size="large" />
          <Text style={styles.loadingLabel}>Processing Sensor Data...</Text>
        </View>

        <ProgressDots />
      </LinearGradient>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.resultsContent}>
      <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.headerSmall}>
        <Text style={styles.headerTitleSmall}>Spot {currentNode} Results</Text>
        <ProgressDots />
      </LinearGradient>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <NPKResultBox nutrient="N" value={npkValues.N} threshold={{ min: npkValues.thresholds.N.min }} unit="mg/kg" />
          <NPKResultBox nutrient="P" value={npkValues.P} threshold={{ min: npkValues.thresholds.P.min }} unit="mg/kg" />
        </View>
        <View style={styles.gridRow}>
          <NPKResultBox nutrient="K" value={npkValues.K} threshold={{ min: npkValues.thresholds.K.min }} unit="mg/kg" />
          <NPKResultBox nutrient="pH" value={npkValues.pH} threshold={{ min: npkValues.thresholds.pH.min, max: npkValues.thresholds.pH.max }} unit="pH" />
        </View>
      </View>

      <Surface style={styles.summaryBadge}>
        <Text style={styles.summaryText}>{getSummaryLabel()}</Text>
      </Surface>

      <TouchableOpacity
        style={[styles.nextBtn, isLastNode && styles.doneBtn]}
        onPress={handleNext}
        activeOpacity={0.85}
        disabled={isSubmitting}
      >
        <LinearGradient
          colors={isLastNode ? ['#1565C0', '#0D47A1'] : [COLORS.primary, COLORS.accent]}
          style={styles.nextBtnGradient}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextBtnText}>
              {isLastNode ? 'COMPLETE ANALYSIS' : 'NEXT SPOT ›'}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 40, paddingTop: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', ...SHADOWS.medium },
  headerSmall: { padding: 24, paddingTop: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginBottom: 12 },
  headerTitleSmall: { fontSize: 18, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  stepContent: { padding: 30, alignItems: 'center' },
  spotHeading: { fontSize: 16, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 10 },
  spotLabel: { fontSize: 28, fontWeight: '900', color: COLORS.primary, textAlign: 'center', marginBottom: 30 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: COLORS.white, width: 20 },
  dotDone: { backgroundColor: '#A5D6A7' },
  instructCard: { padding: 24, borderRadius: 24, backgroundColor: COLORS.white, marginBottom: 40, width: '100%', alignItems: 'center', ...SHADOWS.soft },
  instructText: { fontSize: 18, color: COLORS.text, fontWeight: '600', textAlign: 'center', lineHeight: 28, marginTop: 12 },
  startBtn: { width: '100%', ...SHADOWS.premium },
  btnGradient: { borderRadius: 20, paddingVertical: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  startBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  countdownContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  countdownHeader: { position: 'absolute', top: 60, alignItems: 'center' },
  countdownSpotText: { fontSize: 22, fontWeight: '900', color: COLORS.white },
  countdownSubSpot: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 4 },
  countdownNumber: { fontSize: 160, fontWeight: '900', color: COLORS.white },
  loadingWrapper: { marginBottom: 40, alignItems: 'center' },
  loadingLabel: { color: COLORS.white, fontSize: 16, fontWeight: '600', marginTop: 15 },
  resultsContent: { paddingBottom: 40 },
  grid: { padding: 15 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryBadge: { marginHorizontal: 20, paddingVertical: 15, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', marginBottom: 20, ...SHADOWS.soft },
  summaryText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  nextBtn: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', ...SHADOWS.medium },
  nextBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  nextBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  doneBtn: {},
});
