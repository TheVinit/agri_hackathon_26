import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { npkValues } from '../mockData';

export default function NPKTest() {
  const [stage, setStage] = useState('idle'); // idle, testing, finished
  const [countdown, setCountdown] = useState(3);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const theme = useTheme();

  useEffect(() => {
    let timer;
    if (stage === 'testing') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setStage('finished');
      }
    }
    return () => clearTimeout(timer);
  }, [stage, countdown]);

  const runTest = () => {
    setCountdown(3);
    setStage('testing');
  };

  const getHealthColor = (val, min, max) => {
    if (max) return (val >= min && val <= max) ? '#43A047' : '#E53935';
    return val >= min ? '#43A047' : '#E53935';
  };

  if (stage === 'idle') {
    return (
      <View style={styles.container}>
        <Surface style={styles.mainCard}>
          <MaterialCommunityIcons name="flask-outline" size={80} color="#2E7D32" />
          <Text style={styles.mainTitle}>Soil NPK Analysis</Text>
          <Text style={styles.mainSub}>Place the sensor probe into the soil and press start to begin the chemical analysis.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={runTest}>
            <Text style={styles.btnText}>START ANALYSIS</Text>
          </TouchableOpacity>
        </Surface>
      </View>
    );
  }

  if (stage === 'testing') {
    return (
      <View style={[styles.container, { backgroundColor: '#2E7D32' }]}>
        <Text style={styles.countingText}>{countdown}</Text>
        <Text style={styles.loaderText}>Analyzing Soil Composition...</Text>
        <View style={styles.progressPlaceholder} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { padding: 20 }]}>
      <Surface style={styles.resultHeader}>
        <MaterialCommunityIcons name="check-decagram" size={40} color="#43A047" />
        <Text style={styles.resultTitle}>Analysis Complete</Text>
      </Surface>

      <View style={styles.resultGrid}>
        <ResultItem label="Nitrogen (N)" value={npkValues.N} color={getHealthColor(npkValues.N, npkValues.thresholds.N.min)} icon="molecule" />
        <ResultItem label="Phosphorus (P)" value={npkValues.P} color={getHealthColor(npkValues.P, npkValues.thresholds.P.min)} icon="opacity" />
        <ResultItem label="Potassium (K)" value={npkValues.K} color={getHealthColor(npkValues.K, npkValues.thresholds.K.min)} icon="shimmer" />
        <ResultItem label="Soil pH" value={npkValues.pH} color={getHealthColor(npkValues.pH, npkValues.thresholds.pH.min, npkValues.thresholds.pH.max)} icon="ph" />
      </View>

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={() => setStage('idle')}>
        <Text style={styles.btnText}>NEW MEASUREMENT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const ResultItem = ({ label, value, color, icon }) => (
  <Surface style={[styles.resultCard, { borderLeftColor: color }]}>
    <View style={styles.resRow}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={styles.resLabel}>{label}</Text>
    </View>
    <Text style={[styles.resValue, { color }]}>{value}</Text>
  </Surface>
);

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    justifyContent: 'center',
    flexGrow: 1,
  },
  mainCard: {
    margin: 30,
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 8,
    backgroundColor: '#FFF',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#263238',
    marginTop: 20,
    textAlign: 'center',
  },
  mainSub: {
    fontSize: 16,
    color: '#78909C',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  countingText: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
  },
  loaderText: {
    fontSize: 18,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  resultHeader: {
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 10,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 15,
    marginBottom: 16,
    borderLeftWidth: 5,
    elevation: 3,
  },
  resRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78909C',
    marginLeft: 6,
  },
  resValue: {
    fontSize: 26,
    fontWeight: '800',
    marginLeft: 4,
  },
});
