import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, TEXT_STYLES } from '../theme';
import { stopSpeaking, setOnSpeakingStatusChange } from '../services/tts';
import { useLang } from '../context/LanguageContext';

export default function VoicePlaybackOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLang();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setOnSpeakingStatusChange((speaking) => {
      if (speaking) {
        setIsVisible(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      } else {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setIsVisible(false);
        });
      }
    });
  }, []);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.waveWrap}>
            <MaterialCommunityIcons name="waveform" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{t('आवाज़ चल रही है...', 'Audio Playing...', 'आवाज चालू आहे...')}</Text>
            <Text style={styles.sub}>{t('रिपोर्ट सुनाई जा रही है', 'Farm report is being read', 'शेत अहवाल वाचला जात आहे')}</Text>
          </View>
          <TouchableOpacity style={styles.stopBtn} onPress={stopSpeaking} activeOpacity={0.8}>
            <MaterialCommunityIcons name="stop" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.premium,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waveWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.bodySemi,
    color: COLORS.text,
    fontSize: 14,
  },
  sub: {
    ...TEXT_STYLES.tiny,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'none',
  },
  stopBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
});
