import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { getTodayAdvisory } from '../services/api';
import { speak, stopSpeaking } from '../services/tts';
import { useLang } from '../context/LanguageContext';
import Skeleton from '../components/Skeleton';

const FARM_ID = 'farm_001';

// ── Severity config ────────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: { colors: ['#E11D48', '#BE123C'], labelHi: 'तत्काल', labelEn: 'Critical', labelMr: 'तातडीचे' },
  warning:  { colors: ['#F59E0B', '#D97706'], labelHi: 'सतर्क',  labelEn: 'Warning',  labelMr: 'सावधान' },
  good:     { colors: ['#10B981', '#059669'], labelHi: 'उत्तम',  labelEn: 'Optimal',  labelMr: 'चांगले' },
  info:     { colors: ['#3B82F6', '#2563EB'], labelHi: 'सलाह',  labelEn: 'Advisory',  labelMr: 'शिफारस' },
};

const CARD_DEFS = [
  {
    key: 'irrigation',
    icon: 'water-pump',
    titleHi: 'सिंचाई सलाह',
    titleEn: 'Irrigation Advisory',
    titleMr: 'सिंचन सल्ला',
  },
  {
    key: 'temperature',
    icon: 'thermometer',
    titleHi: 'तापमान सलाह',
    titleEn: 'Temperature Advisory',
    titleMr: 'तापमान सल्ला',
  },
  {
    key: 'nutrients',
    icon: 'flask-outline',
    titleHi: 'पोषक तत्व सलाह',
    titleEn: 'Nutrient Advisory',
    titleMr: 'पोषण सल्ला',
  },
  {
    key: 'nextCrop',
    icon: 'sprout',
    titleHi: 'अगली फसल',
    titleEn: 'Next Crop Recommendation',
    titleMr: 'पुढील पीक',
  },
];

export default function Advisory() {
  const { t, lang } = useLang();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [playing, setPlaying] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    return () => stopSpeaking();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: d, error: e } = await getTodayAdvisory(FARM_ID);
    if (e) setError(e);
    else {
      setData(d);
      setLastUpdated(new Date());
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }
    setLoading(false);
  };

  const handleSpeak = async (key) => {
    if (playing === key) {
      await stopSpeaking(); setPlaying(null); return;
    }
    await stopSpeaking();
    if (!data) return;
    setPlaying(key);
    const langMap = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN' };
    const text =
      lang === 'hi' ? data[key]?.textHindi :
      lang === 'mr' ? (data[key]?.textMr || data[key]?.textHindi) :
      data[key]?.textEn;

    await speak(text || '', langMap[lang], {
      onDone:  () => setPlaying(null),
      onError: () => setPlaying(null),
    });
  };

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen onRetry={fetchData} t={t} />;

  const allGood = CARD_DEFS.every(c => (data[c.key]?.severity === 'good' || data[c.key]?.severity === 'info'));
  const timeStr = lastUpdated
    ? `${lastUpdated.getHours()}:${String(lastUpdated.getMinutes()).padStart(2, '0')}`
    : '--';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('कृषि सलाह', 'Farming Advisory', 'कृषी सल्ला')}</Text>
        <Text style={styles.headerSub}>{t('आज के लिए आपकी योजना', "Today's smart plan", "तुमची आजची स्मार्ट योजना")}</Text>

        {/* Summary bar */}
        <View style={[styles.summaryBar, { backgroundColor: allGood ? '#E8F5E9' : '#FFF8E8', borderColor: allGood ? '#A5D6A7' : '#FFE082' }]}>
          <MaterialCommunityIcons name={allGood ? 'check-circle' : 'alert-circle'} size={18} color={allGood ? COLORS.success : COLORS.warning} />
          <Text style={[styles.summaryText, { color: allGood ? '#1B5E20' : '#7B5800' }]}>
            {allGood
              ? t('आज खेत की स्थिति उत्तम है', 'Farm is in great shape today', 'आज शेताची स्थिती उत्तम आहे')
              : t('कुछ जरूरी काम बाकी हैं', 'Some tasks need attention today', 'काही तातडीची कामे बाकी आहेत')}
          </Text>
          <Text style={styles.timeStamp}>{t('अपडेट:', 'Updated:', 'अपडेट:')} {timeStr}</Text>
        </View>
      </View>

      <Animated.View style={[styles.cardsWrap, { opacity: fadeAnim }]}>
        {CARD_DEFS.map(def => (
          <SmartAdvisoryCard
            key={def.key}
            def={def}
            data={data[def.key]}
            isPlaying={playing === def.key}
            onPress={() => handleSpeak(def.key)}
            t={t}
            lang={lang}
          />
        ))}
      </Animated.View>

      {/* Footer tip */}
      <View style={styles.footerTip}>
        <MaterialCommunityIcons name="information-outline" size={16} color={COLORS.textMuted} />
        <Text style={styles.footerText}>
          {t('यह सलाह आपके सेंसर डेटा पर आधारित है', 'This advisory is based on your live sensor data', 'हा सल्ला तुमच्या सेंसर डेटावर आधारित आहे')}
        </Text>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ── Smart Advisory Card ────────────────────────────────────────
function SmartAdvisoryCard({ def, data, isPlaying, onPress, t, lang }) {
  const sev    = SEVERITY_CONFIG[data?.severity] || SEVERITY_CONFIG.good;
  const title  = lang === 'hi' ? def.titleHi : lang === 'mr' ? def.titleMr : def.titleEn;
  const text   = lang === 'hi' ? data?.textHindi : lang === 'mr' ? (data?.textMr || data?.textHindi) : data?.textEn;
  const sevLbl = lang === 'hi' ? sev.labelHi : lang === 'mr' ? sev.labelMr : sev.labelEn;

  return (
    <View style={[styles.card, isPlaying && styles.cardActive]}>
      {/* Gradient header */}
      <LinearGradient colors={sev.colors} style={styles.cardHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <MaterialCommunityIcons name={def.icon} size={28} color="#fff" style={{ marginRight: 4 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.sevRow}>
            <View style={styles.sevPill}>
              <Text style={styles.sevText}>{sevLbl}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.playBtn} onPress={onPress} activeOpacity={0.85}>
          <MaterialCommunityIcons name={isPlaying ? 'stop-circle' : 'play-circle'} size={40} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Context source */}
        {data?.dataContext && (
          <View style={styles.dataCtx}>
            <MaterialCommunityIcons name="access-point" size={12} color={COLORS.primary} />
            <Text style={styles.dataCtxText}>{data.dataContext}</Text>
          </View>
        )}

        {/* Advisory text */}
        <Text style={styles.advisoryText}>{text}</Text>

        {/* Action Items */}
        {data?.actionItems?.length > 0 && (
          <View style={styles.actionsWrap}>
            <Text style={styles.actionsLabel}>{t('करने योग्य काम', 'Action Steps', 'करण्याची कामे')}</Text>
            {data.actionItems.map((item, i) => (
              <View key={i} style={styles.actionItem}>
                <View style={styles.actionBullet}>
                  <Text style={styles.actionNum}>{i + 1}</Text>
                </View>
                <Text style={styles.actionText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Listen row */}
        <TouchableOpacity style={[styles.listenRow, isPlaying && styles.listenRowActive]} onPress={onPress} activeOpacity={0.8}>
          <MaterialCommunityIcons name={isPlaying ? 'stop' : 'volume-high'} size={18} color={isPlaying ? '#fff' : COLORS.primary} />
          <Text style={[styles.listenText, isPlaying && { color: '#fff' }]}>
            {isPlaying
              ? t('सुनना बंद करें', 'Stop Audio', 'ऐकणे थांबवा')
              : t('सलाह सुनें (Hindi/English/Marathi)', 'Listen to Advisory', 'सल्ला ऐका')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ErrorScreen({ onRetry, t }) {
  return (
    <View style={styles.errorWrap}>
      <MaterialCommunityIcons name="alert-circle-outline" size={60} color={COLORS.danger} />
      <Text style={styles.errorText}>{t('सलाह लोड नहीं हो सकी', 'Failed to load advisory', 'सल्ला लोड करता आला नाही')}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryTxt}>{t('पुनः प्रयास करें', 'Retry', 'पुन्हा प्रयत्न करा')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={200} height={30} style={{ marginBottom: 10 }} />
        <Skeleton width={150} height={18} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={52} borderRadius={16} />
      </View>
      <View style={{ padding: 20, gap: 16 }}>
        <Skeleton width="100%" height={240} borderRadius={24} />
        <Skeleton width="100%" height={240} borderRadius={24} />
        <Skeleton width="100%" height={200} borderRadius={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  header:        { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  headerTitle:   { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  headerSub:     { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 14 },
  summaryBar:    { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1 },
  summaryText:   { flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  timeStamp:     { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  cardsWrap:     { paddingHorizontal: 20, paddingTop: 4, gap: 20 },

  card:          { backgroundColor: COLORS.surface, borderRadius: 24, overflow: 'hidden', ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.divider },
  cardActive:    { borderColor: COLORS.primary, borderWidth: 2 },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
  cardEmoji:     { fontSize: 30 },
  cardTitle:     { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 6 },
  sevRow:        { flexDirection: 'row' },
  sevPill:       { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  sevText:       { fontSize: 12, color: '#fff', fontWeight: '800' },
  playBtn:       { padding: 2 },

  cardBody:      { padding: 18 },
  dataCtx:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryPale, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, marginBottom: 12 },
  dataCtxText:   { fontSize: 12, fontWeight: '700', color: COLORS.primary, flex: 1 },
  advisoryText:  { fontSize: 15, lineHeight: 26, color: COLORS.text, fontWeight: '500', marginBottom: 16 },

  actionsWrap:   { backgroundColor: COLORS.surfaceLight, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.divider },
  actionsLabel:  { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  actionItem:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  actionBullet:  { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  actionNum:     { fontSize: 11, fontWeight: '900', color: '#fff' },
  actionText:    { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '600', lineHeight: 20 },

  listenRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryPale, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 14 },
  listenRowActive:{ backgroundColor: COLORS.primary },
  listenText:    { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  footerTip:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 24, marginTop: 24, opacity: 0.6 },
  footerText:    { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', flex: 1, lineHeight: 18 },

  errorWrap:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText:     { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 24, textAlign: 'center' },
  retryBtn:      { backgroundColor: COLORS.primaryPale, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  retryTxt:      { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});
