// src/theme.js
import { MD3LightTheme } from 'react-native-paper';
import { Platform } from 'react-native';

export const COLORS = {
  primary: '#004D40',       // Deep Slate Green (Technical)
  secondary: '#00796B',     // Teal
  accent: '#00E676',        // Digital Neon Green (LED Success)
  background: '#F4F7F6',    // Ultra-clean Lab Gray
  surface: '#FFFFFF',       // Pure White
  error: '#D32F2F',         // Standard Alert Red
  warning: '#FF9100',       // Alert Orange
  text: '#1A211E',          // High-contrast Charcoal
  textSecondary: '#546E7A', // Muted Blue Gray
  border: '#ECEFF1',        // Thinner Border Gray
  white: '#FFFFFF',
  ledOff: '#CFD8DC',
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  technical: {
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
};

export const FONTS = {
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
};

export const GAPS = {
  xs: 8,
  sm: 12,
  md: 24,
  lg: 40,
  xl: 60,
};

export const THEME = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    error: COLORS.error,
    surface: COLORS.surface,
    background: COLORS.background,
    outline: COLORS.border,
  },
  roundness: 8, // Precision Rounding
};
