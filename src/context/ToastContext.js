import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TEXT_STYLES, RADIUS, SPACING, SHADOWS } from '../theme';

const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState(null);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((message, variant = 'success') => {
    setToastConfig({ message, variant });

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setToastConfig(null);
      });
    }, 2500);
  }, [opacity, translateY]);

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'success':
        return { backgroundColor: COLORS.success, icon: 'check-circle' };
      case 'warning':
        return { backgroundColor: COLORS.warning, icon: 'alert-circle' };
      case 'error':
        return { backgroundColor: COLORS.danger, icon: 'close-circle' };
      default:
        return { backgroundColor: COLORS.text, icon: 'information' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastConfig && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY }],
              opacity,
            }
          ]}
        >
          <View style={[styles.toastWrapper, { backgroundColor: getVariantStyles(toastConfig.variant).backgroundColor }]}>
            <MaterialCommunityIcons 
              name={getVariantStyles(toastConfig.variant).icon} 
              size={24} 
              color={COLORS.surface} 
              style={styles.icon}
            />
            <Text style={[TEXT_STYLES.h4, styles.message]}>{toastConfig.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: SPACING.xl,
    right: SPACING.xl,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    ...SHADOWS.lg,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    color: COLORS.surface,
  },
});
