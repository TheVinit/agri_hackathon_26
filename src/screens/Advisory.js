// src/screens/Advisory.js
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

import AdvisoryCard from '../components/AdvisoryCard';
import { advisory } from '../mockData';

export default function Advisory() {
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
        title={advisory.irrigation.title}
        titleEn={advisory.irrigation.titleEn}
        text={advisory.irrigation.text}
        textEn={advisory.irrigation.textEn}
        bgColour="#E3F2FD"
        headerColour="#1565C0"
        onAudioPress={() => console.log('play audio — Person 4 wires this')}
      />

      {/* Card 2 — Nutrients */}
      <AdvisoryCard
        title={advisory.nutrients.title}
        titleEn={advisory.nutrients.titleEn}
        text={advisory.nutrients.text}
        textEn={advisory.nutrients.textEn}
        bgColour="#FFF3E0"
        headerColour="#E65100"
        onAudioPress={() => console.log('play audio — Person 4 wires this')}
      />

      {/* Card 3 — Next Crop */}
      <AdvisoryCard
        title={advisory.nextCrop.title}
        titleEn={advisory.nextCrop.titleEn}
        text={advisory.nextCrop.text}
        textEn={advisory.nextCrop.textEn}
        bgColour="#E8F5E9"
        headerColour="#2E7D32"
        onAudioPress={() => console.log('play audio — Person 4 wires this')}
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
