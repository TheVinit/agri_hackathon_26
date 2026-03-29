import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { Text, Button, useTheme, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AdvisoryCard from '../components/AdvisoryCard';
import { getTodayAdvisory } from '../services/api';
import { playAdvisory, AUDIO_URLS } from '../services/tts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GAPS, FONTS } from '../theme';

export default function Advisory() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAdvisory = async () => {
    setLoading(true);
    const { data: advisoryData, error: apiError } = await getTodayAdvisory('farm_001');
    if (apiError) {
      setError(apiError);
    } else {
      setData(advisoryData);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvisory();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>FETCH_ADVISORY: Parsing Decision Matrix...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-octagon-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>INTEL_FAIL: Data Source Unreachable</Text>
        <Button mode="contained" onPress={fetchAdvisory} style={styles.retryBtn}>
          RE-SYNC DATA
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, '#00251A']} style={styles.header}>
        <MaterialCommunityIcons name="integrated-circuit-chip" size={40} color={COLORS.accent} />
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitleEn}>DECISION_SUPPORT_SYSTEM</Text>
          <Text style={styles.headerTitleHi}>आज की उन्नत सलाह</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SESSION: LATEST</Text>
          </View>
          <Text style={styles.timestamp}>STAMP: 2026-03-27T19:30</Text>
        </View>

        <AdvisoryCard
          title="सिंचाई (Irrigation)"
          titleEn="HYDRATION_MATRIX"
          text={data.irrigation.textHindi}
          textEn={data.irrigation.decision === 'irrigate_now' ? "STATUS: CRITICAL. IRRIGATE IMMEDIATELY (45M)." : "STATUS: NOMINAL. SOIL MOISTURE SATURATED."}
          bgColour="#FFFFFF"
          headerColour="#0277BD"
          onAudioPress={() => playAdvisory(AUDIO_URLS.critical)}
        />

        <AdvisoryCard
          title="पोषक तत्व (Nutrients)"
          titleEn="NUTRIENT_OPTIMIZATION"
          text={data.nutrients.textHindi}
          textEn={`DETECTED: ${data.nutrients.status.toUpperCase()}. APPLY DAP COMPOUND.`}
          bgColour="#FFFFFF"
          headerColour="#EF6C00"
          onAudioPress={() => playAdvisory(AUDIO_URLS.mainAdvisory)}
        />

        <AdvisoryCard
          title="अगली फसल (Next Crop)"
          titleEn="CROP_ROTATION_INTEL"
          text={data.nextCrop.textHindi}
          textEn={`OPTIMIZED: ${data.nextCrop.crop.toUpperCase()}. SOIL PH SUITABLE.`}
          bgColour="#FFFFFF"
          headerColour="#2E7D32"
          onAudioPress={() => playAdvisory(AUDIO_URLS.allGood)}
        />

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>END_OF_INTEL_ADVISORY</Text>
          <View style={styles.footerLine} />
        </View>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 30, paddingVertical: 40, borderBottomRightRadius: 60, flexDirection: 'row', alignItems: 'center', ...SHADOWS.medium },
  headerTitles: { marginLeft: 20 },
  headerTitleEn: { fontSize: 10, fontFamily: FONTS.mono, fontWeight: '900', color: COLORS.accent, letterSpacing: 2 },
  headerTitleHi: { fontSize: 26, fontWeight: '900', color: COLORS.white, marginTop: 4 },
  content: { padding: 24, paddingTop: 30 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  badge: { backgroundColor: '#E0E7E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 9, fontFamily: FONTS.mono, fontWeight: '900', color: COLORS.primary },
  timestamp: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textSecondary, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 15, fontFamily: FONTS.mono, color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 14, fontFamily: FONTS.mono, color: COLORS.error, textAlign: 'center', marginTop: 15, marginBottom: 20 },
  retryBtn: { borderRadius: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, opacity: 0.5 },
  footerLine: { flex: 1, height: 1, backgroundColor: COLORS.textSecondary, marginHorizontal: 15 },
  footerText: { fontSize: 10, fontFamily: FONTS.mono, fontWeight: '900', color: COLORS.textSecondary },
});
