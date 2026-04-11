import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS, RADIUS, SPACING, TEXT_STYLES } from '../theme';
import { useLang } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function LoginScreen({ navigation, onOpenAdmin }) {
  const { t, lang, setLanguage } = useLang();
  const { showToast } = useToast();
  const [farmerId, setFarmerId] = useState('farm_001');
  const [password, setPassword] = useState('agri123');
  const [loading, setLoading] = useState(false);

  const adminTapCount = useRef(0);
  const adminTapTimer = useRef(null);

  const handleLogoTap = () => {
    adminTapCount.current += 1;
    clearTimeout(adminTapTimer.current);
    adminTapTimer.current = setTimeout(() => { adminTapCount.current = 0; }, 2000);
    if (adminTapCount.current >= 5) {
      adminTapCount.current = 0;
      if (onOpenAdmin) onOpenAdmin();
    }
  };

  const handleLogin = (isQuickAdmin = false) => {
    setLoading(true);
    
    setTimeout(async () => {
      let user = null;
      if (isQuickAdmin) {
        // Quick demo → show onboarding flow (hasProfile: false)
        onLogin({ id: 'farm_001', name: 'New Farmer', hasProfile: false });
      } else if (farmerId === 'farm_001' && password === 'agri123') {
        // Returning farmer → skip onboarding (hasProfile: true)
        onLogin({ id: 'farm_001', name: 'रामराव शिंदे', hasProfile: true });
      } else {
        showToast(t('गलत आईडी या पासवर्ड', 'Invalid ID or Password', 'चुकीचा आयडी किंवा पासवर्ड'), 'error');
      }
      setLoading(false);
    }, 1200);
  };

  const LangTab = ({ code, label, icon }) => (
    <TouchableOpacity 
      style={[styles.tab, lang === code && styles.tabActive]}
      onPress={() => setLanguage(code)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={18} 
        color={lang === code ? COLORS.primary : COLORS.textMuted} 
        style={{ marginBottom: 4 }}
      />
      <Text style={[styles.tabText, lang === code && styles.tabTextActive]}>{label}</Text>
      {lang === code && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <TouchableOpacity activeOpacity={0.8} onPress={handleLogoTap}>
                <View style={styles.logoCircle}>
                  <MaterialCommunityIcons name="leaf" size={42} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
              <Text style={[TEXT_STYLES.h1, styles.brandName]}>AgriPulse</Text>
              <Text style={[TEXT_STYLES.body, styles.brandTag]}>Smart Farming Assistant</Text>
            </View>

            {/* Premium 3-Tab Language Selector */}
            <View style={styles.tabBar}>
              <LangTab code="hi" label="हिंदी" icon="translate" />
              <LangTab code="en" label="English" icon="alphabetical" />
              <LangTab code="mr" label="मराठी" icon="script-text" />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[TEXT_STYLES.h2, styles.welcomeText]}>{t('लॉगिन करें', 'Welcome Back', 'लॉगिन करा')}</Text>
            
            <View style={styles.inputBox}>
              <Text style={[TEXT_STYLES.h4, styles.inputLabel]}>{t('किसान आईडी', 'Farmer ID', 'शेतकरी आयडी')}</Text>
              <View style={styles.inputField}>
                <MaterialCommunityIcons name="account" size={20} color={COLORS.textMuted} />
                <TextInput 
                  style={[TEXT_STYLES.body, styles.textInput]}
                  value={farmerId}
                  onChangeText={setFarmerId}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={[TEXT_STYLES.h4, styles.inputLabel]}>{t('पासवर्ड', 'Password', 'पासवर्ड')}</Text>
              <View style={styles.inputField}>
                <MaterialCommunityIcons name="lock" size={20} color={COLORS.textMuted} />
                <TextInput 
                  style={[TEXT_STYLES.body, styles.textInput]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.mainBtn}
              onPress={() => handleLogin(false)}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={[TEXT_STYLES.h3, styles.btnTxt]}>{t('प्रवेश करें', 'Sign In', 'प्रवेश करा')}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.easyBtn} 
              onPress={() => handleLogin(true)}
              activeOpacity={0.7}
            >
              <Text style={[TEXT_STYLES.h4, styles.easyBtnTitle]}>{t('नए किसान? यहाँ से शुरू करें', 'New Farmer? Start Here', 'नवीन शेतकरी? येथून सुरू करा')}</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[TEXT_STYLES.small, styles.version]}>Project AgriPulse v1.2</Text>
            <Text style={[TEXT_STYLES.body, styles.footerHelp]}>{t('मदद चाहिए? 1800-AGRI-SAFE', 'Need help? 1800-AGRI-SAFE', 'मदत हवी आहे? १८००-AGRI-SAFE')}</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.xl, paddingBottom: 60, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { 
    width: 90, height: 90, borderRadius: 30, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, ...SHADOWS.md,
  },
  brandName: { color: COLORS.text, letterSpacing: -1 },
  brandTag: { color: COLORS.textSecondary, marginTop: 2 },
  tabBar: { 
    flexDirection: 'row', backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.xl, padding: 4, width: '100%',
    ...SHADOWS.sm,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.lg },
  tabActive: { backgroundColor: COLORS.primaryPale },
  tabText: { ...TEXT_STYLES.data, color: COLORS.textMuted }, 
  tabTextActive: { color: COLORS.primary },
  tabIndicator: { 
    position: 'absolute', bottom: 6, width: 20, height: 3, 
    backgroundColor: COLORS.primary, borderRadius: RADIUS.sm 
  },
  card: { 
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xxl, 
    ...SHADOWS.lg,
  },
  welcomeText: { color: COLORS.text, marginBottom: 28 },
  inputBox: { marginBottom: 20 },
  inputLabel: { color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  inputField: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg, paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.divider
  },
  textInput: { flex: 1, marginLeft: 12, color: COLORS.text },
  errTxt: { color: COLORS.danger, ...TEXT_STYLES.body, fontWeight: '700', marginBottom: 15, textAlign: 'center' },
  mainBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: 10, ...SHADOWS.md },
  btnGradient: { paddingVertical: 20, alignItems: 'center' },
  btnTxt: { color: '#fff', letterSpacing: 0.5 },
  easyBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    marginTop: 25, gap: 8, paddingVertical: 10
  },
  easyBtnTitle: { color: COLORS.primary },
  footer: { marginTop: 40, alignItems: 'center' },
  version: { color: COLORS.textMuted, marginBottom: 6 },
  footerHelp: { color: COLORS.textMuted }
});
