import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, GAPS, RADIUS, TEXT_STYLES, SPACING } from '../theme';

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
    <Surface style={[styles.card, { backgroundColor: bgColour || COLORS.surface }]}>
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
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
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
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
  },
  headerTitleEn: {
    ...TEXT_STYLES.tiny,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  body: {
    padding: SPACING.xl,
  },
  bodyHindi: {
    ...TEXT_STYLES.bodySemi,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
  },
  englishWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  bodyEnglish: {
    flex: 1,
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
});
