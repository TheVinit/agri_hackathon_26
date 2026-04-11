import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TEXT_STYLES } from '../theme';

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, [scaleAnim, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <MaterialCommunityIcons name="leaf" size={80} color="#FFF" style={styles.icon} />
        <Text style={[TEXT_STYLES.h1, styles.title]}>AgriPulse</Text>
        <Text style={[TEXT_STYLES.body, styles.tagline]}>Smart Farming for Bharat</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 42,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    color: '#FFF',
    opacity: 0.85,
    fontSize: 16,
  },
});
