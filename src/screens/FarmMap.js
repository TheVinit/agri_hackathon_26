import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { getDashboard } from '../services/api';
import { speakHindi, stopSpeaking } from '../services/tts';

const FARM_ID = 'farm_001';

// Mapping for 4 zones
const ZONE_LABELS = [
  { emoji: '⬆️', dir: 'उत्तर',   dirEn: 'North', color: '#1565C0', bg: '#E3F2FD' },
  { emoji: '⬇️', dir: 'दक्षिण',  dirEn: 'South', color: '#2E7D32', bg: '#E8F5E9' },
  { emoji: '➡️', dir: 'पूर्व',   dirEn: 'East',  color: '#E65100', bg: '#FFF3E0' },
  { emoji: '⬅️', dir: 'पश्चिम', dirEn: 'West',  color: '#6A1B9A', bg: '#F3E5F5' },
];

export default function FarmMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    return () => stopSpeaking();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const { data: d } = await getDashboard(FARM_ID);
    if (d) {
      setData(d);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
    setLoading(false);
    setRefreshing(false);
  };

  const speakSummary = async () => {
    if (speaking) { await stopSpeaking(); setSpeaking(false); return; }
    if (!data) return;
    const nodes = data.nodes || [];
    const problem = nodes.filter(n => n.status === 'red' || n.status === 'amber');
    let text = 'आपके खेत का नक्शा। ';
    if (problem.length === 0) {
      text += 'सभी चार क्षेत्र ठीक हैं। खेत स्वस्थ है।';
    } else {
      text += `${problem.length} क्षेत्रों में समस्या है। `;
      problem.forEach((n, i) => {
        const z = ZONE_LABELS[i] || {};
        text += `${z.dir || 'क्षेत्र'} में नमी ${n.moisture}% है। `;
      });
    }
    setSpeaking(true);
    await speakHindi(text, { onDone: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  const nodes = data?.nodes || [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="map-clock" size={48} color={COLORS.primary} />
        <Text style={styles.loadingText}>नक्शा लोड हो रहा है...</Text>
        <Text style={styles.loadingTextEn}>Loading farm map...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor={COLORS.primary} />}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, '#0D4A28']} style={styles.header}>
        <Text style={styles.headerTitle}>🗺  खेत का नक्शा</Text>
        <Text style={styles.headerSub}>Farm Field Map</Text>
        <TouchableOpacity
          style={[styles.speakBtn, speaking && styles.speakBtnActive]}
          onPress={speakSummary}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name={speaking ? 'stop-circle' : 'volume-high'} size={22} color={speaking ? '#fff' : COLORS.primary} />
          <Text style={[styles.speakBtnText, speaking && { color: '#fff' }]}>
            {speaking ? 'रोकें' : 'खेत की स्थिति सुनें'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim, padding: 16 }}>
        {/* Visual Farm Grid */}
        <View style={styles.farmGrid}>
          {ZONE_LABELS.slice(0, 4).map((zone, i) => {
            const node = nodes[i];
            const statusColor = node ? getStatusColor(node.status) : COLORS.textLight;
            const isOk = node?.status === 'green';
            return (
              <View key={i} style={[styles.gridCell, { backgroundColor: zone.bg, borderColor: zone.color + '40' }]}>
                <Text style={styles.gridEmoji}>{zone.emoji}</Text>
                <Text style={[styles.gridDir, { color: zone.color }]}>{zone.dir}</Text>
                <Text style={styles.gridDirEn}>{zone.dirEn}</Text>
                <View style={styles.gridDivider} />
                {node ? (
                  <>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={styles.gridMoisture}>💧 {node.moisture}%</Text>
                    <Text style={styles.gridTemp}>🌡 {node.temperature}°C</Text>
                    <Text style={styles.gridStatus}>{isOk ? '✅ ठीक' : node.status === 'amber' ? '⚠️ ध्यान दें' : '🚨 जरूरी'}</Text>
                  </>
                ) : (
                  <Text style={styles.noData}>No data</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>📊  रंग का मतलब</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>हरा = खेत ठीक है (Good)</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendText}>पीला = ध्यान दें (Warning)</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.legendText}>लाल = तुरंत काम करें (Alert)</Text>
          </View>
        </View>

        {/* Node Details */}
        <Text style={styles.sectionTitle}>📍  क्षेत्र विवरण</Text>
        {nodes.map((node, i) => {
          const zone = ZONE_LABELS[i] || {};
          return (
            <View key={node.id} style={styles.nodeRow}>
              <View style={[styles.nodeIconBox, { backgroundColor: zone.bg }]}>
                <Text style={styles.nodeEmoji}>{zone.emoji}</Text>
              </View>
              <View style={styles.nodeInfo}>
                <Text style={styles.nodeDir}>{zone.dir} ({zone.dirEn})</Text>
                <View style={styles.nodeMetrics}>
                  <MetricBadge icon="water-percent" value={`${node.moisture}%`} label="नमी" color="#1565C0" />
                  <MetricBadge icon="thermometer" value={`${node.temperature}°`} label="तापमान" color={COLORS.danger} />
                  <MetricBadge icon="lightning-bolt" value={`${node.ec}`} label="EC" color={COLORS.warning} />
                  <MetricBadge icon="battery" value={`${node.battery}%`} label="बैटरी" color={COLORS.success} />
                </View>
              </View>
            </View>
          );
        })}

        {/* Data source indicator */}
        {data?.dataSource && (
          <View style={styles.dataSourceBadge}>
            <View style={[styles.dot, { backgroundColor: data.dataSource === 'hardware' ? COLORS.success : COLORS.warning }]} />
            <Text style={styles.dataSourceText}>
              {data.dataSource === 'hardware' ? '🟢 हार्डवेयर से लाइव डेटा' : '🟡 Demo डेटा (Hardware not connected)'}
            </Text>
          </View>
        )}

        <View style={{ height: 50 }} />
      </Animated.View>
    </ScrollView>
  );
}

function MetricBadge({ icon, value, label, color }) {
  return (
    <View style={mbStyles.badge}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[mbStyles.value, { color }]}>{value}</Text>
      <Text style={mbStyles.label}>{label}</Text>
    </View>
  );
}
const mbStyles = StyleSheet.create({
  badge: { alignItems: 'center', minWidth: 50 },
  value: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  label: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' },
});

function getStatusColor(status) {
  if (status === 'green')  return COLORS.success;
  if (status === 'amber')  return COLORS.warning;
  if (status === 'red')    return COLORS.danger;
  return COLORS.textLight;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 30 },
  loadingText: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginTop: 16 },
  loadingTextEn: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  header: { paddingTop: 55, paddingHorizontal: 22, paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 18 },
  speakBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 20, gap: 8, justifyContent: 'center', ...SHADOWS.medium },
  speakBtnActive: { backgroundColor: COLORS.danger },
  speakBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  // Farm Grid
  farmGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  gridCell: { width: '48%', borderRadius: 18, borderWidth: 2, padding: 16, marginBottom: 12, alignItems: 'center' },
  gridEmoji: { fontSize: 28, marginBottom: 4 },
  gridDir: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  gridDirEn: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 },
  gridDivider: { width: '100%', height: 1, backgroundColor: COLORS.divider, marginBottom: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  gridMoisture: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  gridTemp: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  gridStatus: { fontSize: 13, fontWeight: '800' },
  noData: { fontSize: 12, color: COLORS.textLight },
  // Legend
  legendCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, ...SHADOWS.soft },
  legendTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  // Node rows
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  nodeRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, ...SHADOWS.soft },
  nodeIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  nodeEmoji: { fontSize: 22 },
  nodeInfo: { flex: 1 },
  nodeDir: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  nodeMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  // Data source
  dataSourceBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dataSourceText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
});
