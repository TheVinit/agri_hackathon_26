import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, GAPS } from '../theme';

export default function AdvisoryCard({
  title,
  titleEn,
  text,
  textEn,
  bgColour,
  headerColour,
  onAudioPress,
}) {
  const getIcon = (type) => {
    switch (String(type).toUpperCase()) {
      case 'HYDRATION_MATRIX':
      case 'IRRIGATION':
        return 'water-pump';
      case 'NUTRIENT_OPTIMIZATION':
      case 'NUTRIENTS':
        return 'flask-outline';
      case 'CROP_ROTATION_INTEL':
      case 'NEXT CROP':
        return 'leaf';
      default:
        return 'information-outline';
    }
  };

  return (
    <Surface style={[styles.card, { backgroundColor: bgColour || COLORS.white }]}>
      <LinearGradient
        colors={[headerColour, headerColour + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <MaterialCommunityIcons name={getIcon(titleEn)} size={30} color="#FFF" style={styles.headerIcon} />
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitleHi}>{title}</Text>
          <Text style={styles.headerTitleEn}>{titleEn}</Text>
        </View>
        <TouchableOpacity
          style={styles.audioBtn}
          onPress={onAudioPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="volume-high" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.bodyHindi}>{text}</Text>
        <View style={styles.englishWrapper}>
          <View style={{ marginTop: 2 }}>
            <MaterialCommunityIcons name="translate" size={18} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.bodyEnglish}>{textEn}</Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32, // Increased from 24
    marginBottom: 24, // Increased from 20
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginRight: 14,
  },
  headerTitles: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  headerTitleHi: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerTitleEn: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  body: {
    padding: 20,
  },
  bodyHindi: {
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 16,
  },
  englishWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.04)',
    padding: 14,
    borderRadius: 12,
  },
  bodyEnglish: {
    flex: 1,
    fontSize: 13,
    lineHeight: 22,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
});
