import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { useLang } from '../context/LanguageContext';

export default function LoginScreen({ onLogin, onOpenAdmin }) {
  const { t, lang, setLanguage } = useLang();
  const [farmerId, setFarmerId] = useState('farm_001');
  const [password, setPassword] = useState('agri123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    
    setTimeout(() => {
      if (isQuickAdmin) {
        // Handle quick admin if needed, but for now just farmer
        onLogin({ id: 'farm_001', name: 'रामराव शिंदे' });
      } else if (farmerId === 'farm_001' && password === 'agri123') {
        onLogin({ id: 'farm_001', name: 'रामराव शिंदे' });
      } else {
        setError(t('गलत आईडी या पासवर्ड', 'Invalid ID or Password', 'चुकीचा आयडी किंवा पासवर्ड'));
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
              <Text style={styles.brandName}>AgriPulse</Text>
              <Text style={styles.brandTag}>Smart Farming Assistant</Text>
            </View>

            {/* Premium 3-Tab Language Selector */}
            <View style={styles.tabBar}>
              <LangTab code="hi" label="हिंदी" icon="translate" />
              <LangTab code="en" label="English" icon="alphabetical" />
              <LangTab code="mr" label="मराठी" icon="script-text" />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcomeText}>{t('लॉगिन करें', 'Welcome Back', 'लॉगिन करा')}</Text>
            
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>{t('किसान आईडी', 'Farmer ID', 'शेतकरी आयडी')}</Text>
              <View style={styles.inputField}>
                <MaterialCommunityIcons name="account" size={20} color={COLORS.textMuted} />
                <TextInput 
                  style={styles.textInput}
                  value={farmerId}
                  onChangeText={setFarmerId}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>{t('पासवर्ड', 'Password', 'पासवर्ड')}</Text>
              <View style={styles.inputField}>
                <MaterialCommunityIcons name="lock" size={20} color={COLORS.textMuted} />
                <TextInput 
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {error ? <Text style={styles.errTxt}>{error}</Text> : null}

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
                  <Text style={styles.btnTxt}>{t('प्रवेश करें', 'Sign In', 'प्रवेश करा')}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.easyBtn} 
              onPress={() => handleLogin(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.easyBtnTitle}>{t('डेमो के लिए क्लिक करें', 'Quick Demo Access', 'डेमोसाठी येथे टिचकी मारा')}</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.version}>Project AgriPulse v1.2</Text>
            <Text style={styles.footerHelp}>{t('मदद चाहिए? 1800-AGRI-SAFE', 'Need help? 1800-AGRI-SAFE', 'मदत हवी आहे? १८००-AGRI-SAFE')}</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 24, paddingBottom: 60, flexGrow: 1, justifyContent: 'center' },
  
  header: { alignItems: 'center', marginBottom: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { 
    width: 90, height: 90, borderRadius: 30, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, ...SHADOWS.premium,
    borderWidth: 1, borderColor: COLORS.divider
  },
  brandName: { fontSize: 34, fontWeight: '900', color: COLORS.text, letterSpacing: -1 },
  brandTag: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },

  tabBar: { 
    flexDirection: 'row', backgroundColor: COLORS.surface, 
    borderRadius: 20, padding: 4, width: '100%',
    borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.soft
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  tabActive: { backgroundColor: COLORS.primaryPale },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary },
  tabIndicator: { 
    position: 'absolute', bottom: 6, width: 20, height: 3, 
    backgroundColor: COLORS.primary, borderRadius: 2 
  },

  card: { 
    backgroundColor: COLORS.surface, borderRadius: 36, padding: 32, 
    ...SHADOWS.premium, borderWidth: 1, borderColor: COLORS.divider
  },
  welcomeText: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 28 },
  
  inputBox: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  inputField: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight,
    borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1.5, borderColor: COLORS.divider
  },
  textInput: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.text, fontWeight: '600' },
  
  errTxt: { color: COLORS.danger, fontSize: 14, fontWeight: '700', marginBottom: 15, textAlign: 'center' },

  mainBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 10, ...SHADOWS.glass },
  btnGradient: { paddingVertical: 20, alignItems: 'center' },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

  easyBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    marginTop: 25, gap: 8, paddingVertical: 10
  },
  easyBtnTitle: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },

  footer: { marginTop: 40, alignItems: 'center' },
  version: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', marginBottom: 6 },
  footerHelp: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' }
});
