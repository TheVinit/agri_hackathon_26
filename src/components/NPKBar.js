import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, GAPS, FONTS } from '../theme';

const DEFAULT_THRESHOLDS = {
  N: { min: 50 },
  P: { min: 25 },
  K: { min: 50 },
  pH: { min: 6.0, max: 7.5 },
};

export default function NPKBar({ npkValues }) {
  const getThreshold = (nutrient) => {
    return npkValues.thresholds?.[nutrient] || DEFAULT_THRESHOLDS[nutrient];
  };

  const npkStatusColor = (val, thresholdMin, thresholdMax) => {
    if (thresholdMax) {
      return (val >= thresholdMin && val <= thresholdMax) ? COLORS.accent : COLORS.error;
    }
    return val >= thresholdMin ? COLORS.accent : COLORS.error;
  };

  const renderItem = (label, value, nutrient) => {
    const thresh = getThreshold(nutrient);
    const min = thresh.min;
    const max = thresh.max;
    const statusColor = npkStatusColor(value, min, max);
    
    // Percentage for progress bar (clamped 0-100)
    const percentage = Math.min(Math.max((value / (min * 1.5)) * 100, 10), 100);

    return (
      <View style={styles.npkItem}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.npkLabel}>{label}</Text>
          <Text style={[styles.npkValue, { color: statusColor }]}>{value || 0}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.rulerTicks}>
             {[...Array(5)].map((_, i) => (
               <View key={i} style={styles.tick} />
             ))}
          </View>
          <LinearGradient
            colors={[statusColor, statusColor + 'AA']}
            style={[styles.progressBar, { height: `${percentage}%` }]}
          />
        </View>
      </View>
    );
  };

  return (
    <Surface style={styles.npkCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Live Nutrient Analysis</Text>
        <View style={styles.idBadge}>
          <Text style={styles.idBadgeText}>CALIBRATED</Text>
        </View>
      </View>
      <View style={styles.npkRow}>
        {renderItem('N', npkValues.N, 'N')}
        {renderItem('P', npkValues.P, 'P')}
        {renderItem('K', npkValues.K, 'K')}
        {renderItem('pH', npkValues.pH, 'pH')}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  npkCard: {
    marginTop: GAPS.lg,
    marginBottom: GAPS.xl,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7E5',
    backgroundColor: COLORS.white,
    ...SHADOWS.technical,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  idBadge: {
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idBadgeText: {
    fontSize: 8,
    fontFamily: FONTS.mono,
    color: COLORS.accent,
    fontWeight: '900',
  },
  npkRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  npkItem: {
    alignItems: 'center',
    width: '20%',
  },
  progressLabelRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  npkLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  npkValue: {
    fontSize: 14,
    fontFamily: FONTS.mono,
    fontWeight: '900',
  },
  progressContainer: {
    width: 20,
    height: 100,
    backgroundColor: '#F5F8F7',
    borderRadius: 0, // Shaper look
    borderWidth: 1,
    borderColor: '#E0E7E5',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  rulerTicks: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    justifyContent: 'space-between',
    zIndex: 1,
    paddingVertical: 10,
  },
  tick: {
    height: 1,
    width: '100%',
    backgroundColor: '#CFD8DC',
  },
  progressBar: {
    width: '100%',
  },
});
