import { Platform } from 'react-native';

export const COLORS = {
  // Ultra-premium, professional slate/emerald theme
  background:   '#F1F5F9',     // Slate 100 - more depth than F8FAFC
  surface:      '#FFFFFF',     // Pure white for cards to pop
  surfaceLight: '#E2E8F0',     // Slate 200 for subtle contrast
  primary:      '#059669',     // Emerald 600 - rich, trusted green
  primaryDark:  '#065F46',     // Emerald 800 - deeper green
  primaryLight: '#34D399',     // Emerald 400 - vibrant accent
  primaryPale:  '#ECFDF5',     // Emerald 50 - extremely subtle wash
  secondary:    '#0F172A',     // Slate 900 - very sharp premium indigo/black
  accent:       '#6366F1',     // Indigo 500 - for secondary actions/tech feel
  
  // Typography
  text:         '#0F172A',     // Slate 900 for high-contrast
  textSecondary:'#334155',     // Slate 700 for supporting text
  textMuted:    '#64748B',     // Slate 500 for disabled/hints
  
  // States
  success:      '#10B981',     // Emerald 500
  warning:      '#F59E0B',     // Amber 500
  danger:       '#E11D48',     // Rose 600
  info:         '#0EA5E9',     // Sky 500
  
  // UI Elements
  divider:      '#CBD5E1',     // Slate 300 - more visible divider
  border:       '#94A3B8',     // Slate 400 - for interactive elements
  glass:        'rgba(255, 255, 255, 0.7)',
  glassBorder:  'rgba(255, 255, 255, 0.3)',

  // Gradients (Hex pairs for LinearGradient)
  gradients: {
    primary:   ['#059669', '#065F46'],
    secondary: ['#1E293B', '#0F172A'],
    accent:    ['#6366F1', '#4F46E5'],
    surface:   ['#FFFFFF', '#F8FAFC'],
    emerald:   ['#10B981', '#059669'],
    amber:     ['#F59E0B', '#D97706'],
    rose:      ['#F43F5E', '#E11D48'],
    sky:       ['#0EA5E9', '#0284C7'],
  },

  // Legacy fallback aliases
  error:        '#E11D48',
  ledOff:       '#E2E8F0',
};

export const RADIUS = {
  xs: 4,
  sm: 8,      
  md: 12,     
  lg: 16,     
  xl: 24,     
  xxl: 32,
  pill: 999,  
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
  screen: 20,
};

export const TEXT_STYLES = {
  h1: { fontFamily: 'Outfit-Bold',      fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontFamily: 'Outfit-Bold',      fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  h3: { fontFamily: 'Outfit-SemiBold',  fontSize: 20, lineHeight: 28 },
  h4: { fontFamily: 'Outfit-SemiBold',  fontSize: 16, lineHeight: 24 },
  body: { fontFamily: 'Inter-Regular',  fontSize: 15, lineHeight: 24 },
  bodySemi: { fontFamily: 'Inter-SemiBold', fontSize: 15, lineHeight: 24 },
  small:{ fontFamily: 'Inter-Medium',   fontSize: 13, lineHeight: 20 },
  tiny: { fontFamily: 'Inter-Bold',     fontSize: 11, lineHeight: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  data: { fontFamily: 'JetBrainsMono-Regular', fontSize: 14, lineHeight: 20 },
};

export const SHADOWS = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  soft: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  premium: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6 },
  glass: { shadowColor: '#059669', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 10 },
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor:'#000', shadowOffset:{width:0,height:12}, shadowOpacity:0.15, shadowRadius:24, elevation:12 },
};

export const CARD = {
  backgroundColor: '#FFFFFF',
  borderRadius: RADIUS.xl,
  padding: SPACING.xl,
  ...SHADOWS.card,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.5)', // Subtle inner glow effect
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
