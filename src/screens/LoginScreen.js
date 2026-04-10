import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { useLang } from '../context/LanguageContext';

export default function LoginScreen({ onLogin }) {
  const { t, lang, setLanguage } = useLang();
  const [farmerId, setFarmerId] = useState('farm_001');
  const [password, setPassword] = useState('agri123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (farmerId === 'farm_001' && password === 'agri123') {
        onLogin({ id: 'farm_001', name: 'रामराव शिंदे' });
      } else {
        setError(t('गलत आईडी या पासवर्ड', 'Invalid ID or Password', 'चुकीचा आयडी किंवा पासवर्ड'));
      }
      setLoading(false);
    }, 1500);
  };

  const LangButton = ({ code, label }) => (
    <TouchableOpacity 
      style={[styles.langBtn, lang === code && styles.langBtnActive]}
      onPress={() => setLanguage(code)}
    >
      <Text style={[styles.langBtnText, lang === code && styles.langBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <MaterialCommunityIcons name="leaf" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>AgriPulse</Text>
            <Text style={styles.subtitle}>Digital Farmer Assistant</Text>
          </View>

          <View style={styles.langSelector}>
            <LangButton code="hi" label="हिंदी" />
            <LangButton code="en" label="English" />
            <LangButton code="mr" label="मराठी" />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.loginTitle}>{t('लॉगिन करें', 'Welcome Back', 'लॉगिन करा')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('किसान आईडी', 'Farmer ID', 'शेतकरी आयडी')}</Text>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.textSecondary} />
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. farm_001"
                  value={farmerId}
                  onChangeText={setFarmerId}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('पासवर्ड', 'Password', 'पासवर्ड')}</Text>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textSecondary} />
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>{t('प्रवेश करें', 'Login Now', 'प्रवेश करा')}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('मदद चाहिए? अपने ग्राम केंद्र से संपर्क करें', 'Need help? Contact local center', 'मदत हवी आहे? स्थानिक केंद्राशी संपर्क साधा')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 24, paddingBottom: 40, justifyContent: 'center', minHeight: '100%' },
  
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  logoWrap: { 
    width: 80, height: 80, borderRadius: 24, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, ...SHADOWS.soft
  },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },

  langSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 10 },
  langBtn: { 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.divider
  },
  langBtnActive: { backgroundColor: COLORS.primaryPale, borderColor: COLORS.primary },
  langBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  langBtnTextActive: { color: COLORS.primary },

  formCard: { 
    backgroundColor: COLORS.surface, borderRadius: 32, padding: 30, 
    ...SHADOWS.premium, borderWidth: 1, borderColor: COLORS.divider
  },
  loginTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 24 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4 },
  inputWrap: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.divider
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.text },
  
  errorText: { color: COLORS.danger, fontSize: 14, fontWeight: '600', marginBottom: 15, textAlign: 'center' },

  loginBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10, ...SHADOWS.glass },
  loginGradient: { paddingVertical: 18, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 }
});
