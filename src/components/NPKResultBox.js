// src/components/NPKResultBox.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * NPKResultBox
 * Props:
 *   nutrient   – string  e.g. "N", "P", "K", "pH"
 *   value      – number
 *   threshold  – { min: number, max?: number }
 *   unit       – string  e.g. "kg/ha", ""
 */
export default function NPKResultBox({ nutrient, value, threshold, unit }) {
  const isLow = value < threshold.min;
  const isHigh = threshold.max !== undefined && value > threshold.max;
  const isAlert = isLow || isHigh;

  const bgColor = isAlert ? '#FFEBEE' : '#E8F5E9';
  const textColor = isAlert ? '#C62828' : '#1B5E20';
  const borderColor = isAlert ? '#EF9A9A' : '#A5D6A7';
  const badgeColor = isAlert ? '#C62828' : '#2E7D32';
  const badgeLabel = isLow ? 'LOW' : isHigh ? 'HIGH' : 'OK';

  return (
    <View style={[styles.box, { backgroundColor: bgColor, borderColor }]}>
      {/* Badge top-right */}
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badgeLabel}</Text>
      </View>

      {/* Big nutrient letter */}
      <Text style={[styles.nutrientLetter, { color: textColor }]}>
        {nutrient}
      </Text>

      {/* Value */}
      <Text style={[styles.valueText, { color: textColor }]}>
        {value}
      </Text>

      {/* Unit */}
      {unit ? (
        <Text style={[styles.unitText, { color: textColor }]}>{unit}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minWidth: 120,
    minHeight: 120,
    flex: 1,
    margin: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    position: 'relative',
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nutrientLetter: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.8,
  },
});
