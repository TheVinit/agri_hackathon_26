import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, RefreshControl, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { getDashboard } from '../services/api';
import { speak, stopSpeaking } from '../services/tts';
import { useLang } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import Skeleton from '../components/Skeleton';

const FARM_ID = 'farm_001';

const ZONE_LABELS = [
  { icon: 'compass', dir: 'उत्तर',   dirEn: 'North', dirMr: 'उत्तर', color: '#1565C0', bg: '#E3F2FD' },
  { icon: 'compass-outline', dir: 'दक्षिण',  dirEn: 'South', dirMr: 'दक्षिण', color: '#2E7D32', bg: '#E8F5E9' },
  { icon: 'compass-rose', dir: 'पूर्व',   dirEn: 'East',  dirMr: 'पूर्व', color: '#E65100', bg: '#FFF3E0' },
  { icon: 'crosshairs-gps', dir: 'पश्चिम', dirEn: 'West',  dirMr: 'पश्चिम', color: '#6A1B9A', bg: '#F3E5F5' },
];

export default function FarmMap() {
  const { t, lang } = useLang();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); // 30s Poll
    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
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
    const problems = nodes.filter(n => n.status === 'critical' || n.status === 'warning');
    
    let text = t('आपके खेत का नक्शा। ', 'Your farm map analysis. ', 'तुमच्या शेताचा नकाशा. ');
    
    if (problems.length === 0) {
      text += t('सभी क्षेत्र ठीक हैं। खेत स्वस्थ है।', 'All zones are healthy.', 'सर्व क्षेत्रे ठीक आहेत. शेत निरोगी आहे.');
    } else {
      text += t(`${problems.length} क्षेत्रों में ध्यान देने की आवश्यकता है। `, `There are issues in ${problems.length} zones. `, `${problems.length} क्षेत्रांमध्ये लक्ष देण्याची गरज आहे. `);
    }

    const sarvamLangMap = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN' };
    setSpeaking(true);
    await speak(text, sarvamLangMap[lang], { onDone: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  const nodes = data?.nodes || [];

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor={COLORS.primary} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.headerTitle}>{t('खेत का नक्शा', 'Farm Map', 'शेताचा नकाशा')}</Text>
              <View style={[styles.sourceBadge, { backgroundColor: data?.dataSource === 'Live' ? '#E8F5E9' : '#FFF3E0' }]}>
                <Text style={[styles.sourceText, { color: data?.dataSource === 'Live' ? COLORS.primary : '#E65100' }]}>
                  {data?.dataSource || 'Demo'}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>{t('खेत के विभिन्न हिस्सों की स्थिति', 'Real-time zone status', 'क्षेत्र निहाय स्थिती')}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.voiceBtn, speaking && styles.voiceBtnActive]} 
            onPress={speakSummary}
          >
            <MaterialCommunityIcons name={speaking ? "stop" : "volume-high"} size={24} color={speaking ? "#fff" : COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={{ opacity: fadeAnim, padding: 24, paddingTop: 0 }}>
        <View style={styles.farmGrid}>
          {ZONE_LABELS.slice(0, 4).map((zone, i) => {
            const node = nodes[i];
            const statusColor = node ? getStatusColor(node.status) : COLORS.divider;
            const isOk = node?.status === 'green';
            const nodeTitle = lang === 'hi' ? zone.dir : (lang === 'mr' ? zone.dirMr : zone.dirEn);
            
            return (
              <TouchableOpacity 
                key={`zone-grid-${i}`} 
                style={[styles.gridCell, { backgroundColor: zone.bg, borderColor: zone.color + '15' }]}
                onPress={() => navigation.navigate('ZoneDetail', { zoneId: node?.id || i, zoneTitle: zone.dirEn })}
              >
                <View style={styles.gridEmojiWrap}>
                  <MaterialCommunityIcons name={zone.icon} size={28} color={zone.color} />
                </View>
                <Text style={[styles.gridTitle, { color: zone.color }]}>{nodeTitle}</Text>
                
                <View style={styles.gridDetails}>
                  {node ? (
                    <>
                      <MaterialCommunityIcons name="water-percent" size={14} color={COLORS.primary} />
                      <Text style={styles.gridMetric}>{node.moisture}%</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusBadgeText}>{isOk ? 'OK' : '!!'}</Text>
                      </View>
                    </>
                  ) : <Skeleton width={50} height={15} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legendBlock}>
          <Text style={styles.legendHeader}>{t('संकेत', 'Legend', 'संकेत')}</Text>
          <View style={styles.legendRows}>
            <LegendRow key="ok" color={COLORS.success} text={t('ठीक (Healthy)', 'Good (Healthy)', 'उत्तम (चांगले)')} />
            <LegendRow key="warn" color={COLORS.warning} text={t('ध्यान दें (Warning)', 'Warning', 'लक्ष द्या (इशारा)')} />
            <LegendRow key="crit" color={COLORS.danger} text={t('खतरा (Danger)', 'Critical', 'धोका (गंभीर)')} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('क्षेत्र विवरण', 'Zone Details', 'क्षेत्राचा तपशील')}</Text>
        {nodes.map((node, i) => {
          const zone = ZONE_LABELS[i] || {};
          return (
            <TouchableOpacity 
              key={node.id} 
              style={styles.nodeCard}
              onPress={() => navigation.navigate('ZoneDetail', { zoneId: node.id, zoneTitle: zone.dirEn })}
            >
              <View style={[styles.nodeIconWrap, { backgroundColor: zone.bg }]}>
                <MaterialCommunityIcons name={zone.icon} size={24} color={zone.color} />
              </View>
              <View style={styles.nodeContent}>
                <Text style={styles.nodeName}>{lang === 'hi' ? zone.dir : (lang === 'mr' ? zone.dirMr : zone.dirEn)}</Text>
                <View style={styles.metricsRow}>
                  <MetricItem icon="water-percent" value={`${node.moisture}%`} label={t('नमी', 'Moisture', 'ओलावा')} />
                  <MetricItem icon="thermometer" value={`${node.temperature}°`} label={t('तापमान', 'Temp', 'तापमान')} />
                  <MetricItem icon="lightning-bolt" value={`${node.ec}`} label="EC" />
                </View>
              </View>
              <View style={[styles.nodeStatusDot, { backgroundColor: getStatusColor(node.status) }]} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.footerInfo}>
          <Text style={styles.lastSyncText}>{t('अंतिम अपडेट: ', 'Last Sync: ', 'शेवटचे अद्यतन: ')}{data?.lastSync ? new Date(data.lastSync).toLocaleTimeString() : '--'}</Text>
        </View>
      </Animated.View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function LegendRow({ color, text }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendRowText}>{text}</Text>
    </View>
  );
}

function MetricItem({ icon, value, label }) {
  return (
    <View style={styles.metricItem}>
      <MaterialCommunityIcons name={icon} size={14} color={COLORS.textSecondary} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={180} height={28} style={{ marginBottom: 10 }} />
        <Skeleton width={140} height={18} />
      </View>
      <View style={{ padding: 24 }}>
        <View style={styles.farmGrid}>
          {[1,2,3,4].map(i => <Skeleton key={i} width="48%" height={120} borderRadius={24} style={{ marginBottom: 15 }} />)}
        </View>
        <Skeleton width="100%" height={80} borderRadius={16} style={{ marginBottom: 20 }} />
        <Skeleton width="100%" height={100} borderRadius={20} />
      </View>
    </View>
  );
}

function getStatusColor(status) {
  if (status === 'live' || status === 'ok')  return COLORS.success;
  if (status === 'warning')  return COLORS.warning;
  if (status === 'critical') return COLORS.danger;
  return COLORS.divider;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sourceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' },
  sourceText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  
  voiceBtn: { 
    width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primaryPale,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft
  },
  voiceBtnActive: { backgroundColor: COLORS.danger },

  farmGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCell: { 
    width: '48%', borderRadius: 32, padding: 20, marginBottom: 16, 
    borderWidth: 1, ...SHADOWS.soft, alignItems: 'center' 
  },
  gridEmojiWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  gridDetails: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gridMetric: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },

  legendBlock: { 
    backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.soft 
  },
  legendHeader: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 15 },
  legendRows: { flexDirection: 'row', justifyContent: 'space-between' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendRowText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 15 },
  nodeCard: { 
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, 
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.soft
  },
  nodeIconWrap: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  nodeEmoji: { fontSize: 24 },
  nodeContent: { flex: 1 },
  nodeName: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  metricsRow: { flexDirection: 'row', gap: 20 },
  metricItem: { alignItems: 'flex-start' },
  metricValue: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  metricLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  nodeStatusDot: { width: 12, height: 12, borderRadius: 6 },

  footerInfo: { alignItems: 'center', marginTop: 20 },
  lastSyncText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
});
