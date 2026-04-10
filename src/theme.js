export const COLORS = {
  background: '#0B0F19', // Deep dark blue-black
  surface: '#151D2E',    // Elevated dark card
  surfaceLight: '#1C263A', // Lighter elevation
  primary: '#00E676',    // Neon green accent
  primaryDark: '#00B248',
  secondary: '#B388FF',  // Premium purple accent
  text: '#FFFFFF',
  textSecondary: '#94A3B8', // Professional slate gray
  textMuted: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  divider: '#1E293B',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  premium: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  }
};
