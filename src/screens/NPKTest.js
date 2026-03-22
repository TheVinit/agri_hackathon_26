// src/screens/NPKTest.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import NPKResultBox from '../components/NPKResultBox';
import { sensorNodes, npkValues } from '../mockData';

// Helper: determine overall soil status badge text
function getSummaryLabel() {
  const { N, P, K, pH, thresholds } = npkValues;
  const nOk = N >= thresholds.N.min;
  const pOk = P >= thresholds.P.min;
  const kOk = K >= thresholds.K.min;
  const hOk = pH >= thresholds.pH.min && pH <= thresholds.pH.max;
  const total = [nOk, pOk, kOk, hOk].filter(Boolean).length;
  if (total === 4) return '✅ All nutrients within range';
  if (total >= 2) return `⚠️  ${4 - total} nutrient(s) need attention`;
  return `🚨 ${4 - total} nutrient(s) critically low`;
}

export default function NPKTest() {
  const navigation = useNavigation();

  // step: 1 = start screen, 2 = countdown, 3 = results
  const [step, setStep] = useState(1);
  const [currentNode, setCurrentNode] = useState(1); // 1-based index
  const [countdown, setCountdown] = useState(3);

  // Animated value for spring on countdown number
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const node = sensorNodes[currentNode - 1];
  const isLastNode = currentNode === sensorNodes.length;

  // ── Countdown logic ─────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;

    // Trigger spring animation every tick change
    Animated.spring(scaleAnim, {
      toValue: 1.4,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
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

  // ── Start test for current spot ──────────────────────────────
  function startTest() {
    setCountdown(3);
    setStep(2);
  }

  // ── Advance to next spot or finish ───────────────────────────
  function handleNext() {
    if (isLastNode) {
      // Navigate to Advisory tab after finishing all nodes
      navigation.navigate('Advisory');
    } else {
      setCurrentNode((prev) => prev + 1);
      setStep(1);
    }
  }

  // ── Progress dots ─────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────
  // STEP 1 — Start screen
  // ────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.centerContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Heading */}
          <Text style={styles.spotHeading}>
            Spot {currentNode} of {sensorNodes.length}
          </Text>
          <Text style={styles.spotLabel}>
            {node.labelLine1}
            {'\n'}
            {node.labelLine2}
          </Text>

          {/* Progress indicator */}
          <ProgressDots />

          {/* Instruction */}
          <Surface style={styles.instructCard}>
            <Text style={styles.instructText}>
              Insert the NPK probe firmly into the soil at this spot, then press{' '}
              <Text style={{ fontWeight: '800', color: '#2E7D32' }}>
                START TEST
              </Text>{' '}
              to begin reading.
            </Text>
          </Surface>

          {/* Large green START TEST button */}
          <TouchableOpacity
            style={styles.startBtn}
            onPress={startTest}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>START TEST</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────────
  // STEP 2 — Countdown
  // ────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <View style={[styles.container, styles.countdownBg]}>
        <Text style={styles.countdownSpotText}>
          Spot {currentNode} of {sensorNodes.length} — {node.labelLine1}
        </Text>

        <Animated.Text
          style={[styles.countdownNumber, { transform: [{ scale: scaleAnim }] }]}
        >
          {countdown > 0 ? countdown : ''}
        </Animated.Text>

        <Text style={styles.countdownSubText}>Reading soil sample...</Text>

        <ProgressDots />
      </View>
    );
  }

  // ────────────────────────────────────────────────────────────
  // STEP 3 — Results
  // ────────────────────────────────────────────────────────────
  const { thresholds } = npkValues;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.resultsContent}
    >
      {/* Header */}
      <Text style={styles.resultsHeading}>
        Results — {node.labelLine1}
      </Text>
      <Text style={styles.resultsSubHeading}>{node.labelLine2}</Text>

      {/* Progress dots */}
      <ProgressDots />

      {/* 2×2 Grid of NPKResultBox */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <NPKResultBox
            nutrient="N"
            value={npkValues.N}
            threshold={{ min: thresholds.N.min }}
            unit={thresholds.N.unit}
          />
          <NPKResultBox
            nutrient="P"
            value={npkValues.P}
            threshold={{ min: thresholds.P.min }}
            unit={thresholds.P.unit}
          />
        </View>
        <View style={styles.gridRow}>
          <NPKResultBox
            nutrient="K"
            value={npkValues.K}
            threshold={{ min: thresholds.K.min }}
            unit={thresholds.K.unit}
          />
          <NPKResultBox
            nutrient="pH"
            value={npkValues.pH}
            threshold={{ min: thresholds.pH.min, max: thresholds.pH.max }}
            unit={thresholds.pH.unit}
          />
        </View>
      </View>

      {/* Summary badge */}
      <View style={styles.summaryBadge}>
        <Text style={styles.summaryText}>{getSummaryLabel()}</Text>
      </View>

      {/* NEXT SPOT / DONE button */}
      <TouchableOpacity
        style={[styles.nextBtn, isLastNode && styles.doneBtn]}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.nextBtnText}>
          {isLastNode ? 'DONE — View Advisory' : `NEXT SPOT ›`}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Summary screen (after all 4 nodes) is handled by navigating
// to Advisory tab in handleNext when isLastNode is true.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // ── Step 1 ──
  centerContent: {
    flexGrow: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
  },
  spotLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C8E6C9',
  },
  dotActive: {
    backgroundColor: '#2E7D32',
    width: 28,
    borderRadius: 6,
  },
  dotDone: {
    backgroundColor: '#66BB6A',
  },
  instructCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    elevation: 3,
  },
  instructText: {
    fontSize: 16,
    color: '#455A64',
    lineHeight: 24,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 50,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // ── Step 2 countdown ──
  countdownBg: {
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownSpotText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C8E6C9',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  countdownNumber: {
    fontSize: 140,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 160,
    minHeight: 160,
  },
  countdownSubText: {
    fontSize: 20,
    color: '#A5D6A7',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // ── Step 3 results ──
  resultsContent: {
    padding: 20,
    paddingTop: 24,
  },
  resultsHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultsSubHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#66BB6A',
    textAlign: 'center',
    marginBottom: 4,
  },
  grid: {
    marginTop: 8,
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
  },
  nextBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  doneBtn: {
    backgroundColor: '#1565C0',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
