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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation, onOpenAdmin, onLogin }) {
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

  // Google SSO Setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'dummy_web.apps.googleusercontent.com',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'dummy_android.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'dummy_ios.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${authentication.accessToken}` },
        });
        const profile = await res.json();
        
        // Push to context via onLogin
        onLogin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          hasProfile: true, // Auto-skip onboarding if fetched from google
        });

      } catch (err) {
        showToast(t('ग़लती हुई', 'Google Sign-In Failed', 'चूक झाली'), 'error');
      } finally {
        setLoading(false);
      }
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

            <View style={styles.dividerBox}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerTxt}>{t('या', 'OR', 'किंवा')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleBtn} 
              onPress={() => promptAsync()}
              disabled={!request || loading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="google" size={22} color="#DB4437" />
              <Text style={[TEXT_STYLES.h3, styles.googleBtnTxt]}>
                {t('Google से लॉग इन करें', 'Sign in with Google', 'Google ने लॉग इन करा')}
              </Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    ...SHADOWS.soft,
    paddingBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    ...SHADOWS.soft,
  },
  brandName: {
    ...TEXT_STYLES.h1,
    color: COLORS.text,
    letterSpacing: -1,
  },
  brandTag: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: 6,
    borderRadius: RADIUS.xl,
    marginTop: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
  },
  tabActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
  },
  tabText: {
    ...TEXT_STYLES.tiny,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  card: {
    margin: 24,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 24,
    ...SHADOWS.premium,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  welcomeText: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputBox: {
    marginBottom: 20,
  },
  inputLabel: {
    ...TEXT_STYLES.tiny,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    color: COLORS.text,
  },
  mainBtn: {
    marginTop: 12,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.premium,
  },
  btnGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
  },
  easyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  easyBtnTitle: {
    ...TEXT_STYLES.small,
    color: COLORS.primary,
    fontWeight: '700',
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerTxt: {
    ...TEXT_STYLES.tiny,
    color: COLORS.textMuted,
    marginHorizontal: 16,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  googleBtnTxt: {
    ...TEXT_STYLES.bodySemi,
    color: COLORS.text,
  },
});
