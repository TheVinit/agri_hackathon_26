import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { COLORS, SHADOWS, GAPS, FONTS } from '../theme';

export default function NPKResultBox({ nutrient, value, threshold, unit }) {
  const isLow = value < threshold.min;
  const isHigh = threshold.max !== undefined && value > threshold.max;
  const isAlert = isLow || isHigh;

  const bgColor = isAlert ? '#FFF5F5' : '#F1F8E9';
  const textColor = isAlert ? COLORS.error : COLORS.primary;
  const borderColor = isAlert ? '#FFCDD2' : '#C8E6C9';
  const badgeColor = isAlert ? COLORS.error : COLORS.accent;
  const badgeLabel = isLow ? 'LOW' : isHigh ? 'HIGH' : 'OK';

  return (
    <Surface style={[styles.box, { backgroundColor: bgColor, borderColor }]}>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badgeLabel}</Text>
      </View>

      <View style={styles.header}>
        <Text style={[styles.nutrientLetter, { color: textColor }]}>
          {nutrient}
        </Text>
        <View style={styles.idBadge}>
           <Text style={styles.idBadgeText}>SENSOR-0{nutrient.length}</Text>
        </View>
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: textColor, fontFamily: FONTS.mono }]}>
          {value}
        </Text>
        {unit ? (
          <Text style={[styles.unitText, { color: textColor }]}>{unit}</Text>
        ) : null}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    ...SHADOWS.technical,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: FONTS.mono,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  nutrientLetter: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
  },
  idBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  idBadgeText: {
    fontSize: 7,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
    fontWeight: '800',
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  valueText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.7,
    marginTop: -2,
    textTransform: 'uppercase',
  },
});
