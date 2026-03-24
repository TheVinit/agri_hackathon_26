// src/screens/Advisory.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

import AdvisoryCard from '../components/AdvisoryCard';
import { getTodayAdvisory } from '../services/api';
import { playAdvisory, AUDIO_URLS } from '../services/tts';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Advisory() {
  const theme = useTheme();
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>सलाह लोड हो रही है (Loading advisory...)</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>सर्वर से सलाह नहीं मिल पाई (Error fetching advisory)</Text>
        <Button mode="contained" onPress={fetchAdvisory} style={{ marginTop: 20 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Screen title */}
      <View style={styles.titleWrapper}>
        <Text style={styles.screenTitleHi}>आज की सलाह</Text>
        <Text style={styles.screenTitleEn}>Today's Advisory</Text>
      </View>

      {/* Card 1 — Irrigation */}
      <AdvisoryCard
        title="सिंचाई (Irrigation)"
        titleEn="Irrigation"
        text={data.irrigation.textHindi}
        textEn={data.irrigation.decision === 'irrigate_now' ? "Irrigate now for 45 mins." : "Irrigation not needed today."}
        bgColour="#E3F2FD"
        headerColour="#1565C0"
        onAudioPress={() => playAdvisory(AUDIO_URLS.mainAdvisory)}
      />

      {/* Card 2 — Nutrients */}
      <AdvisoryCard
        title="पोषक तत्व (Nutrients)"
        titleEn="Nutrients"
        text={data.nutrients.textHindi}
        textEn={`Status: ${data.nutrients.status}. Apply DAP/Urea as recommended.`}
        bgColour="#FFF3E0"
        headerColour="#E65100"
        onAudioPress={() => playAdvisory(AUDIO_URLS.critical)}
      />

      {/* Card 3 — Next Crop */}
      <AdvisoryCard
        title="अगली फसल (Next Crop)"
        titleEn="Next Crop"
        text={data.nextCrop.textHindi}
        textEn={`Recommended: ${data.nextCrop.crop}. Soil pH is ideal.`}
        bgColour="#E8F5E9"
        headerColour="#2E7D32"
        onAudioPress={() => playAdvisory(AUDIO_URLS.allGood)}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 10,
  },
  titleWrapper: {
    marginBottom: 24,
    alignItems: 'center',
  },
  screenTitleHi: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1B5E20',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  screenTitleEn: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78909C',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});

