// Advisory.js — Voice-First, Premium Advisory Screen
// The farmer taps a card to hear the advisory. No raw data visible.
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { getTodayAdvisory } from '../services/api';
import { speakHindi, stopSpeaking } from '../services/tts';

const FARM_ID = 'farm_001';

// ── Advisory card definitions (visually driven) ───────────────
const CARD_CONFIG = {
  irrigation: {
    emoji:      '💧',
    title:      'पानी की सलाह',
    titleEn:    'Water Advisory',
    gradient:   ['#1565C0', '#0D47A1'],
    icon:       'water-pump',
    getDecision: (d) =>
      d?.decision === 'irrigate_now'
        ? { label: '🚨 आज सिंचाई करें', good: false }
        : { label: '✅ पानी ठीक है', good: true },
  },
  nutrients: {
    emoji:      '🌿',
    title:      'खाद की सलाह',
    titleEn:    'Fertilizer Advisory',
    gradient:   ['#2E7D32', '#1B5E20'],
    icon:       'flask-outline',
    getDecision: (d) =>
      d?.status === 'low' || d?.status === 'LOW'
        ? { label: '⚠️ खाद डालना जरूरी है', good: false }
        : { label: '✅ खाद ठीक है', good: true },
  },
  nextCrop: {
    emoji:      '🌾',
    title:      'अगली फसल',
    titleEn:    'Next Crop Advisory',
    gradient:   ['#795548', '#5D4037'],
    icon:       'sprout',
    getDecision: (d) =>
      ({ label: `✅ सुझाव: ${d?.crop || 'सोयाबीन'}`, good: true }),
  },
};

export default function Advisory() {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [playing,  setPlaying]  = useState(null); // null | 'all' | 'irrigation' | 'nutrients' | 'nextCrop'

  const waveAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const waveLoop  = useRef(null);

  useEffect(() => {
    fetchData();
    return () => { stopSpeaking(); waveLoop.current?.stop(); };
  }, []);

  useEffect(() => {
    if (playing) {
      waveLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1.04, duration: 500, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      );
      waveLoop.current.start();
    } else {
      waveLoop.current?.stop();
      waveAnim.setValue(1);
    }
  }, [playing]);

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

  const speak = async (key) => {
    if (playing === key) {
      await stopSpeaking();
      setPlaying(null);
      return;
    }
    await stopSpeaking();
    if (!data) return;
    setPlaying(key);

    const textMap = {
      irrigation: data.irrigation?.textHindi,
      nutrients:  data.nutrients?.textHindi,
      nextCrop:   data.nextCrop?.textHindi,
    };

    await speakHindi(textMap[key] || '', {
      onDone:  () => setPlaying(null),
      onError: () => setPlaying(null),
    });
  };

  const speakAll = async () => {
    if (playing === 'all') {
      await stopSpeaking();
      setPlaying(null);
      return;
    }
    await stopSpeaking();
    if (!data) return;
    setPlaying('all');

    const full = [
      'आज की खेती सलाह।',
      data.irrigation?.textHindi,
      data.nutrients?.textHindi,
      data.nextCrop?.textHindi,
    ].filter(Boolean).join(' ');

    await speakHindi(full, {
      onDone:  () => setPlaying(null),
      onError: () => setPlaying(null),
    });
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>आज की सलाह आ रही है...</Text>
        <Text style={styles.loadingTextEn}>Fetching today's advisory...</Text>
      </LinearGradient>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error || !data) {
    return (
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.loadingScreen}>
        <MaterialCommunityIcons name="wifi-off" size={60} color="rgba(255,255,255,0.6)" />
        <Text style={styles.loadingText}>सलाह नहीं मिली</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>🔄  फिर कोशिश करें</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Header ────────────────────────────────────────── */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text style={styles.headerTitle}>📋  आज की सलाह</Text>

        {/* ── Speak All Button ────────────────────────────── */}
        <TouchableOpacity
          style={[styles.speakAllBtn, playing === 'all' && styles.speakAllBtnActive]}
          onPress={speakAll}
          activeOpacity={0.88}
        >
          <MaterialCommunityIcons
            name={playing === 'all' ? 'stop-circle' : 'volume-high'}
            size={26}
            color={playing === 'all' ? '#fff' : COLORS.primary}
          />
          <View style={styles.speakAllTextWrap}>
            <Text style={[styles.speakAllText, playing === 'all' && { color: '#fff' }]}>
              {playing === 'all' ? 'रोकें' : 'पूरी सलाह सुनें'}
            </Text>
            <Text style={[styles.speakAllTextEn, playing === 'all' && { color: 'rgba(255,255,255,0.7)' }]}>
              {playing === 'all' ? 'Tap to stop' : 'Hear all in Hindi'}
            </Text>
          </View>
          {playing === 'all' && (
            <Animated.View style={[styles.waveDot, { transform: [{ scale: waveAnim }] }]} />
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Advisory Cards ────────────────────────────────── */}
      <Animated.View style={[styles.cardsWrap, { opacity: fadeAnim }]}>
        {/* Playing indicator */}
        {playing && (
          <Animated.View style={[styles.listeningBanner, { transform: [{ scale: waveAnim }] }]}>
            <MaterialCommunityIcons name="waveform" size={20} color={COLORS.primary} />
            <Text style={styles.listeningText}>  🎙  सुन रहे हैं...</Text>
          </Animated.View>
        )}

        <VoiceCard
          config={CARD_CONFIG.irrigation}
          data={data.irrigation}
          isPlaying={playing === 'irrigation'}
          onPress={() => speak('irrigation')}
        />
        <VoiceCard
          config={CARD_CONFIG.nutrients}
          data={data.nutrients}
          isPlaying={playing === 'nutrients'}
          onPress={() => speak('nutrients')}
        />
        <VoiceCard
          config={CARD_CONFIG.nextCrop}
          data={data.nextCrop}
          isPlaying={playing === 'nextCrop'}
          onPress={() => speak('nextCrop')}
        />

        {/* Bottom tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡  हर सलाह के 🔊 बटन को दबाकर हिंदी में सुनें{'\n'}
            <Text style={styles.tipEn}>Tap any card's play button to hear in Hindi</Text>
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </Animated.View>
    </ScrollView>
  );
}

// ── VoiceCard Component ────────────────────────────────────────
function VoiceCard({ config, data, isPlaying, onPress }) {
  const dec  = config.getDecision(data);
  const text = data?.textHindi || 'सलाह लोड हो रही है...';

  return (
    <TouchableOpacity
      style={[styles.card, isPlaying && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Card Header */}
      <LinearGradient colors={config.gradient} style={styles.cardHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={styles.cardEmoji}>{config.emoji}</Text>
        <View style={styles.cardTitles}>
          <Text style={styles.cardTitle}>{config.title}</Text>
          <Text style={styles.cardTitleEn}>{config.titleEn}</Text>
        </View>
        {/* Big Play/Stop button */}
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={onPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name={isPlaying ? 'stop' : 'play'}
            size={26}
            color={isPlaying ? '#fff' : 'rgba(255,255,255,0.9)'}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Card Body */}
      <View style={styles.cardBody}>
        {/* Decision badge */}
        <View style={[styles.decBadge, { backgroundColor: dec.good ? '#E8F5EC' : '#FEF0F0' }]}>
          <Text style={[styles.decText, { color: dec.good ? '#2E7D32' : '#C62828' }]}>{dec.label}</Text>
        </View>

        {/* Advisory text in Hindi */}
        <Text style={styles.advisoryText}>{text}</Text>

        {/* Tap hint */}
        <TouchableOpacity style={[styles.tapHint, isPlaying && styles.tapHintActive]} onPress={onPress}>
          <MaterialCommunityIcons
            name={isPlaying ? 'stop-circle-outline' : 'volume-high'}
            size={18}
            color={isPlaying ? '#C62828' : COLORS.primary}
          />
          <Text style={[styles.tapHintText, isPlaying && { color: '#C62828' }]}>
            {isPlaying ? '  रोकने के लिए दबाएं' : '  🔊  हिंदी में सुनें'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Loading/Error
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 700, padding: 30 },
  loadingText: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 20, marginBottom: 8 },
  loadingTextEn: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  retryBtn: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30 },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Header
  header: { paddingTop: 55, paddingBottom: 28, paddingHorizontal: 24, alignItems: 'center', borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerDate: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: '500' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 24 },

  // Speak All
  speakAllBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 28, paddingVertical: 16, paddingHorizontal: 24, gap: 12,
    width: '100%', ...SHADOWS.medium,
  },
  speakAllBtnActive: { backgroundColor: '#C62828' },
  speakAllTextWrap: { flex: 1 },
  speakAllText: { fontSize: 17, fontWeight: '900', color: COLORS.primary },
  speakAllTextEn: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  waveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },

  // Cards wrapper
  cardsWrap: { padding: 18 },

  // Listening banner
  listeningBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5EC',
    borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#C8E6D1', justifyContent: 'center',
  },
  listeningText: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 24, marginBottom: 20,
    overflow: 'hidden', ...SHADOWS.card,
    borderWidth: 2, borderColor: 'transparent',
  },
  cardActive: { borderColor: COLORS.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  cardEmoji: { fontSize: 34, marginRight: 14 },
  cardTitles: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  cardTitleEn: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3, fontWeight: '600' },
  playBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  playBtnActive: { backgroundColor: 'rgba(198,40,40,0.85)', borderColor: 'rgba(255,255,255,0.3)' },

  // Card body
  cardBody: { padding: 20 },
  decBadge: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', marginBottom: 14 },
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
