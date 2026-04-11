import { Platform } from 'react-native';

export const COLORS = {
  // Ultra-premium, airy light theme
  background:   '#F8FAFC',     // Very clean slate-50 background
  surface:      '#FFFFFF',     // Pure crisp white
  surfaceLight: '#F1F5F9',     // Subtle contrast for nested elements
  primary:      '#059669',     // Emerald 600 - rich, trusted agricultural green
  primaryLight: '#34D399',     // Emerald 400 - vibrant, energetic accent
  primaryPale:  '#ECFDF5',     // Emerald 50 - extremely subtle wash
  secondary:    '#0F172A',     // Slate 900 - very sharp premium indigo/black
  
  // Typography
  text:         '#0F172A',     // Slate 900 for high-contrast, premium text
  textSecondary:'#475569',     // Slate 600 for supporting text
  textMuted:    '#94A3B8',     // Slate 400 for disabled/hints
  
  // States
  success:      '#10B981',     // Emerald 500
  warning:      '#F59E0B',     // Amber 500
  danger:       '#E11D48',     // Rose 600 - more refined than basic red
  
  // UI Elements
  divider:      '#E2E8F0',     // Slate 200 light delineator
  border:       '#CBD5E1',     // Slate 300 for interactive elements
  glass:        'rgba(255, 255, 255, 0.85)',
  glassBorder:  'rgba(255, 255, 255, 0.4)',

  // Legacy fallback aliases
  accent:       '#10B981',
  error:        '#E11D48',
  ledOff:       '#E2E8F0',
};

export const RADIUS = {
  sm: 8,      // sensor chips only
  md: 12,     // inner elements
  lg: 16,     // standard cards ← default for everything
  xl: 20,     // hero cards
  pill: 100,  // badges, tags
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48
};

export const TEXT_STYLES = {
  h1: { fontFamily: 'Outfit-Bold',      fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: 'Outfit-Bold',      fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: 'Outfit-SemiBold',  fontSize: 18, lineHeight: 24 },
  h4: { fontFamily: 'Outfit-SemiBold',  fontSize: 15, lineHeight: 21 },
  body: { fontFamily: 'Inter-Regular',  fontSize: 14, lineHeight: 22 },
  small:{ fontFamily: 'Inter-Regular',  fontSize: 12, lineHeight: 18 },
  data: { fontFamily: 'JetBrainsMono-Regular', fontSize: 13, lineHeight: 18 },
};

export const SHADOWS = {
  soft: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  premium: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 },
  glass: { shadowColor: '#059669', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  technical: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  sm: { shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4,  elevation:2 },
  md: { shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.09, shadowRadius:12, elevation:5 },
  lg: { shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:20, elevation:10 },
};

export const CARD = {
  backgroundColor: '#FFFFFF',
  borderRadius: RADIUS.lg,
  padding: SPACING.xl,
  ...SHADOWS.md,
  // NO borderWidth, NO borderColor — shadows do the job

};

export const GAPS = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONTS = {
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};
