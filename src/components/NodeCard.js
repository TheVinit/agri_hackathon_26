import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GAPS, FONTS } from '../theme';

export default function NodeCard({ node }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return COLORS.accent;
      case 'amber': return COLORS.warning;
      case 'red': return COLORS.error;
      default: return COLORS.ledOff;
    }
  };

  const statusColor = getStatusColor(node.status);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.nodeName}>{node.label || node.labelLine1 || 'Unknown Node'}</Text>
            <View style={styles.idBadge}>
              <Text style={styles.nodeId}>ID-{node.id?.slice(-3).toUpperCase() || 'NODE'}</Text>
            </View>
          </View>
          <View style={[styles.ledRing, { borderColor: statusColor + '30' }]}>
            <View style={[styles.ledDot, { backgroundColor: statusColor }]} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.grid}>
          <View style={styles.dataBlock}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="water-percent" size={14} color={COLORS.secondary} />
              <Text style={styles.metricLabel}>MOISTURE</Text>
            </View>
            <Text style={styles.metricValue}>{node.moisture}%</Text>
          </View>

          <View style={[styles.dataBlock, styles.borderLeft]}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color={COLORS.warning} />
              <Text style={styles.metricLabel}>SOIL EC</Text>
            </View>
            <Text style={styles.metricValue}>{node.ec}</Text>
          </View>
        </View>

        <View style={[styles.grid, styles.borderTop]}>
          <View style={styles.dataBlock}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="thermometer" size={14} color={COLORS.error} />
              <Text style={styles.metricLabel}>TEMP(°C)</Text>
            </View>
            <Text style={styles.metricValue}>{node.temperature}°</Text>
          </View>

          <View style={[styles.dataBlock, styles.borderLeft]}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="broadcast" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metricLabel}>STATUS</Text>
            </View>
            <Text style={[styles.metricValue, { color: statusColor, fontSize: 13, textTransform: 'uppercase' }]}>
              {node.status === 'green' ? 'STABLE' : node.status === 'amber' ? 'WARNING' : 'ALERT'}
            </Text>
          </View>
        </View>
      </Card.Content>
      <View style={[styles.bottomBar, { backgroundColor: statusColor }]} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: GAPS.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7E5',
    overflow: 'hidden',
    ...SHADOWS.technical,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerTitleGroup: {
    flex: 1,
  },
  nodeName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  idBadge: {
    backgroundColor: '#F0F4F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  nodeId: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  ledRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F3',
    marginVertical: 12,
  },
  grid: {
    flexDirection: 'row',
  },
  dataBlock: {
    flex: 1,
    paddingVertical: 10,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderColor: '#F0F4F3',
    paddingLeft: 10,
  },
  borderTop: {
    borderTopWidth: 1,
    borderColor: '#F0F4F3',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: FONTS.mono,
    fontWeight: '700',
    color: COLORS.text,
  },
  bottomBar: {
    height: 3,
    width: '100%',
    opacity: 0.8,
  },
});
