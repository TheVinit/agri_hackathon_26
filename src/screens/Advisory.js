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

const CARD_CONFIG = {
  irrigation: {
    emoji:      '💧',
    title:      'पानी की सलाह',
    titleEn:    'Water Advisory',
    titleMr:    'पाणी सल्ला',
    gradient:   [COLORS.primary, COLORS.primaryLight],
    icon:       'water-pump',
    getDecision: (d, t) =>
      d?.decision === 'irrigate_now'
        ? { label: t('🚨 आज सिंचाई करें', '🚨 Irrigate Today', '🚨 आज पाणी द्या'), good: false }
        : { label: t('✅ पानी ठीक है', '✅ Water OK', '✅ पाणी पुरेशा आहे'), good: true },
  },
  nutrients: {
    emoji:      '🌿',
    title:      'खाद की सलाह',
    titleEn:    'Fertilizer Advisory',
    titleMr:    'खत सल्ला',
    gradient:   ['#2E7D32', '#43A047'],
    icon:       'flask-outline',
    getDecision: (d, t) =>
      d?.status === 'low'
        ? { label: t('⚠️ खाद डालना जरूरी', '⚠️ Needs Fertilizer', '⚠️ खत टाकणे आवश्यक'), good: false }
        : { label: t('✅ खाद ठीक है', '✅ Nutrients OK', '✅ खत पुरेसे आहे'), good: true },
  },
  nextCrop: {
    emoji:      '🌾',
    title:      'अगली फसल',
    titleEn:    'Next Crop',
    titleMr:    'पुढील पीक',
    gradient:   ['#795548', '#8D6E63'],
    icon:       'sprout',
    getDecision: (d, t) =>
      ({ label: t(`✅ सुझाव: ${d?.crop || 'सोयाबीन'}`, `✅ Suggestion: ${d?.crop || 'Soybean'}`, `✅ सल्ला: ${d?.crop || 'सोयाबीन'}`), good: true }),
  },
};

export default function Advisory() {
  const { t, lang } = useLang();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [playing,  setPlaying]  = useState(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;

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
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }
    setLoading(false);
  };

  const handleSpeak = async (key) => {
    if (playing === key) {
      await stopSpeaking();
      setPlaying(null);
      return;
    }
    await stopSpeaking();
    if (!data) return;
    setPlaying(key);

    const sarvamLangMap = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN' };
    
    let text = '';
    if (lang === 'hi') text = data[key]?.textHindi;
    else if (lang === 'mr') text = data[key]?.textMr || data[key]?.textHindi;
    else text = data[key]?.textEn;

    await speak(text || '', sarvamLangMap[lang], {
      onDone:  () => setPlaying(null),
      onError: () => setPlaying(null),
    });
  };

  if (loading) return <LoadingScreen />;

  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color={COLORS.danger} />
        <Text style={styles.errorText}>{t('सलाह लोड करने में विफल', 'Failed to load advisory', 'सल्ला लोड करण्यात त्रुटी')}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>{t('पुनः प्रयास करें', 'Retry', 'पुन्हा प्रयत्न करा')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('कृषि सलाह', 'Farming Advisory', 'कृषी सल्ला')}</Text>
        <Text style={styles.headerSubtitle}>{t('आज के लिए आपकी योजना', "Your plan for today", "तुमची आजची योजना")}</Text>
      </View>

      <Animated.View style={[styles.cardsWrap, { opacity: fadeAnim }]}>
        <VoiceCard
          config={CARD_CONFIG.irrigation}
          data={data.irrigation}
          isPlaying={playing === 'irrigation'}
          onPress={() => handleSpeak('irrigation')}
          t={t}
          lang={lang}
        />
        <VoiceCard
          config={CARD_CONFIG.nutrients}
          data={data.nutrients}
          isPlaying={playing === 'nutrients'}
          onPress={() => handleSpeak('nutrients')}
          t={t}
          lang={lang}
        />
        <VoiceCard
          config={CARD_CONFIG.nextCrop}
          data={data.nextCrop}
          isPlaying={playing === 'nextCrop'}
          onPress={() => handleSpeak('nextCrop')}
          t={t}
          lang={lang}
        />
      </Animated.View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function VoiceCard({ config, data, isPlaying, onPress, t, lang }) {
  const dec = config.getDecision(data, t);
  const title = lang === 'hi' ? config.title : (lang === 'mr' ? config.titleMr : config.titleEn);
  const text = lang === 'hi' ? data?.textHindi : (lang === 'mr' ? (data?.textMr || data?.textHindi) : data?.textEn);

  return (
    <TouchableOpacity
      style={[styles.card, isPlaying && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient colors={config.gradient} style={styles.cardHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={styles.cardEmoji}>{config.emoji}</Text>
        <View style={styles.cardTitles}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardStatus}>{dec.label}</Text>
        </View>
        <MaterialCommunityIcons 
          name={isPlaying ? "stop-circle" : "play-circle"} 
          size={40} 
          color="#fff" 
        />
      </LinearGradient>

      <View style={styles.cardBody}>
        <Text style={styles.advisoryText}>{text}</Text>
        <View style={styles.actionRow}>
          <MaterialCommunityIcons name="volume-high" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>{isPlaying ? t('सुनना बंद करें', 'Stop Listening', 'ऐकणे थांबवा') : t('सल्ला ऐका', 'Listen to Advisory', 'सल्ला ऐका')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={200} height={30} style={{ marginBottom: 10 }} />
        <Skeleton width={150} height={20} />
      </View>
      <View style={{ padding: 20 }}>
        <Skeleton width="100%" height={180} borderRadius={24} style={{ marginBottom: 20 }} />
        <Skeleton width="100%" height={180} borderRadius={24} style={{ marginBottom: 20 }} />
        <Skeleton width="100%" height={180} borderRadius={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  
  cardsWrap: { padding: 20, paddingTop: 0 },
  card: { 
    backgroundColor: COLORS.surface, borderRadius: 24, marginBottom: 20, 
    overflow: 'hidden', ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.divider
  },
  cardActive: { borderColor: COLORS.primary, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  cardEmoji: { fontSize: 32, marginRight: 15 },
  cardTitles: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cardStatus: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  
  cardBody: { padding: 20 },
  decText: { fontSize: 14, fontWeight: '800' },
  advisoryText: { fontSize: 18, lineHeight: 30, color: '#1A2E25', fontWeight: '500', marginBottom: 18 },
  tapHint: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5EC',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14,
  },
  tapHintActive: { backgroundColor: '#FEF0F0' },
  tapHintText: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  // Tip
  tipBox: { backgroundColor: '#FFF8E8', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE0A0', marginTop: 4 },
  tipText: { fontSize: 14, color: '#5E4A1A', fontWeight: '600', lineHeight: 22, textAlign: 'center' },
  tipEn: { fontSize: 12, color: '#8E7A4A', fontWeight: '500' },
});
