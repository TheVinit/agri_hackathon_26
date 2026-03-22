// src/components/AdvisoryCard.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';

/**
 * AdvisoryCard
 * Props:
 *   title        – string (Hindi)
 *   titleEn      – string (English)
 *   text         – string (Hindi body)
 *   textEn       – string (English body)
 *   bgColour     – string (card background hex)
 *   headerColour – string (header bar background hex)
 *   onAudioPress – function
 */
export default function AdvisoryCard({
  title,
  titleEn,
  text,
  textEn,
  bgColour,
  headerColour,
  onAudioPress,
}) {
  return (
    <Surface style={[styles.card, { backgroundColor: bgColour }]}>
      {/* Coloured header bar */}
      <View style={[styles.header, { backgroundColor: headerColour }]}>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitleHi}>{title}</Text>
          <Text style={styles.headerTitleEn}>{titleEn}</Text>
        </View>
        {/* Speaker button top-right */}
        <TouchableOpacity
          style={styles.audioBtn}
          onPress={onAudioPress}
          activeOpacity={0.7}
          accessibilityLabel="Play audio advisory"
        >
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Hindi text – 18px */}
        <Text style={styles.bodyHindi}>{text}</Text>
        {/* English text – 14px grey */}
        <Text style={styles.bodyEnglish}>{textEn}</Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitleHi: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerTitleEn: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  audioBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  speakerIcon: {
    fontSize: 20,
  },
  body: {
    padding: 18,
    paddingTop: 16,
  },
  bodyHindi: {
    fontSize: 18,
    lineHeight: 28,
    color: '#212121',
    fontWeight: '500',
    marginBottom: 12,
  },
  bodyEnglish: {
    fontSize: 14,
    lineHeight: 22,
    color: '#616161',
    fontWeight: '400',
  },
});
