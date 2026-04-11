import React, { useState, useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { TEXT_STYLES } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const slideAnim = useRef(new Animated.Value(-50)).current; // Start hidden above
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // In a real app, you might add a slight delay to avoid flickering
      const connected = state.isConnected !== false;
      
      if (!connected && isConnected) {
        setIsConnected(false);
        Animated.timing(slideAnim, {
          toValue: statusBarHeight,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (connected && !isConnected) {
        // Slide up and then hide
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setIsConnected(true));
      }
    });

    return () => unsubscribe();
  }, [isConnected, slideAnim, statusBarHeight]);

  if (isConnected) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={[TEXT_STYLES.small, styles.text]}>⚠ No internet — data from last sync</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it's above everything
    elevation: 10,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
  },
});
