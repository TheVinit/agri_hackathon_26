import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, TEXT_STYLES, RADIUS, SPACING } from '../theme';
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

export default function Advisory({ route }) {
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
    const text =
      lang === 'hi' ? data[key]?.textHindi :
      lang === 'mr' ? (data[key]?.textMr || data[key]?.textHindi) :
      data[key]?.textEn;

    await speak(text || '', lang, {
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

      {/* Recalibrated Banner */}
      {route?.params?.triggeredByNPK && (
        <Animated.View style={[styles.recalibratedBanner, { opacity: fadeAnim }]}>
          <MaterialCommunityIcons name="refresh-circle" size={24} color={COLORS.primary} />
          <Text style={styles.recalibratedText}>
            {t('नए NPK डेटा के आधार पर सलाह अपडेट की गई', 'Advisory recalibrated using your new NPK data', 'तुमच्या नवीन NPK डेटाचा वापर करून सल्ला अद्यतनित केला')}
          </Text>
        </Animated.View>
      )}

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
        {(data?.dataContextEn || data?.dataContextHi || data?.dataContextMr || data?.dataContext) && (
          <View style={styles.dataCtx}>
            <MaterialCommunityIcons name="access-point" size={12} color={COLORS.primary} />
            <Text style={styles.dataCtxText}>
              {lang === 'hi' ? data.dataContextHi : lang === 'mr' ? (data.dataContextMr || data.dataContextHi) : (data.dataContextEn || data.dataContext)}
            </Text>
          </View>
        )}

        {/* Advisory text */}
        <Text style={styles.advisoryText}>{text}</Text>

        {/* Action Items */}
        {(data?.actionItemsEn || data?.actionItemsHi || data?.actionItemsMr || data?.actionItems)?.length > 0 && (
          <View style={styles.actionsWrap}>
            <Text style={styles.actionsLabel}>{t('करने योग्य काम', 'Action Steps', 'करण्याची कामे')}</Text>
            {(lang === 'hi' ? data.actionItemsHi : lang === 'mr' ? (data.actionItemsMr || data.actionItemsHi) : (data.actionItemsEn || data.actionItems)).map((item, i) => (
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOWS.soft,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  headerSub: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS.lg,
    marginTop: 20,
    borderWidth: 1,
    gap: 12,
  },
  summaryText: {
    flex: 1,
    ...TEXT_STYLES.small,
    fontWeight: '700',
  },
  timeStamp: {
    ...TEXT_STYLES.tiny,
    color: COLORS.textMuted,
  },
  cardsWrap: {
    padding: 24,
    gap: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...SHADOWS.premium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    color: '#FFFFFF',
  },
  sevRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sevPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  sevText: {
    ...TEXT_STYLES.tiny,
    color: '#FFFFFF',
  },
  playBtn: {
    marginLeft: 12,
  },
  cardBody: {
    padding: 20,
  },
  dataCtx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: COLORS.primaryPale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  dataCtxText: {
    ...TEXT_STYLES.tiny,
    color: COLORS.primary,
  },
  advisoryText: {
    ...TEXT_STYLES.bodySemi,
    color: COLORS.text,
    lineHeight: 26,
  },
  translationWrap: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  translationText: {
    flex: 1,
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  footerText: {
    ...TEXT_STYLES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  recalibratedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryPale,
    margin: 24,
    marginBottom: 0,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    gap: 12,
  },
  recalibratedText: {
    flex: 1,
    ...TEXT_STYLES.small,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  cardEmoji: { fontSize: 30 },
  actionsWrap: { backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.divider },
  actionsLabel: { ...TEXT_STYLES.tiny, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  actionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  actionBullet: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  actionNum: { fontSize: 11, fontWeight: '900', color: '#fff' },
  actionText: { flex: 1, ...TEXT_STYLES.small, color: COLORS.text, lineHeight: 20 },
  listenRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryPale, paddingVertical: 11, paddingHorizontal: 16, borderRadius: RADIUS.md },
  listenRowActive: { backgroundColor: COLORS.primary },
  listenText: { ...TEXT_STYLES.small, fontWeight: '700', color: COLORS.primary },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { ...TEXT_STYLES.h3, color: COLORS.text, marginTop: 16, marginBottom: 24, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primaryPale, paddingHorizontal: 24, paddingVertical: 14, borderRadius: RADIUS.md },
  retryTxt: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});
