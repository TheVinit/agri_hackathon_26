export const COLORS = {
  background: '#F4F7FC',     // Clean light-blue/gray background
  surface: '#FFFFFF',        // Pure white card surfaces
  surfaceLight: '#F8FAFC',   // Slight off-white for layer distinction
  primary: '#0B8A44',        // Deep professional green
  primaryLight: '#18B35A',   // Brighter green gradient
  primaryPale: '#E2FBE9',    // Very faint green for icon backgrounds
  secondary: '#6366F1',      // Professional Indigo
  text: '#1E293B',           // Deep slate black text
  textSecondary: '#64748B',  // Muted gray text
  textMuted: '#94A3B8',      // Very faint text
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  divider: '#E2E8F0',        // Light border lines
  border: '#CBD5E1',         // Stronger borders for inputs
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(0, 0, 0, 0.05)',
};

export const SHADOWS = {
  soft: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  premium: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glass: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  }
};
