import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';

export default function NPKBar({ npkValues }) {
  const npkStatusColor = (val, thresholdMin, thresholdMax) => {
    if (thresholdMax) {
      return (val >= thresholdMin && val <= thresholdMax) ? '#4CAF50' : '#E53935';
    }
    return val >= thresholdMin ? '#4CAF50' : '#E53935';
  };

  const renderItem = (label, value, min, max) => (
    <View style={styles.npkItem}>
      <View style={[styles.indicator, { backgroundColor: npkStatusColor(value, min, max) }]} />
      <Text style={styles.npkLabel}>{label}</Text>
      <Text style={[styles.npkValue, { color: npkStatusColor(value, min, max) }]}>
        {value}
      </Text>
    </View>
  );

  return (
    <Surface style={styles.npkCard}>
      <View style={styles.npkRow}>
        {renderItem('Nitrogen', npkValues.N, npkValues.thresholds.N.min)}
        {renderItem('Phos.', npkValues.P, npkValues.thresholds.P.min)}
        {renderItem('Potas.', npkValues.K, npkValues.thresholds.K.min)}
        {renderItem('pH', npkValues.pH, npkValues.thresholds.pH.min, npkValues.thresholds.pH.max)}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  npkCard: {
    marginTop: 10,
    marginBottom: 40,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  npkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  npkItem: {
    alignItems: 'center',
    width: '23%',
  },
  indicator: {
    width: 30,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  npkLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#90A4AE',
    textTransform: 'uppercase',
  },
  npkValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
