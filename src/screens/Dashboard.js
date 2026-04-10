import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Animated, ScrollView, RefreshControl, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { getDashboard } from '../services/api';
import { speakHindi, stopSpeaking } from '../services/tts';
import { useLang } from '../context/LanguageContext';

const FARM_ID = 'farm_001';

export default function Dashboard({ navigation }) {
  const { t, lang, toggleLang } = useLang();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Animations Array for staggered entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Pulse animation for the listening state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchData();
    return () => stopSpeaking();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const { data: d } = await getDashboard(FARM_ID);
    if (d) {
      setData(d);
      // Staggered entrance
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleSpeak = async () => {
    if (speaking) {
      await stopSpeaking();
      setSpeaking(false);
      return;
    }
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    setSpeaking(true);
    
    // Construct message based on conditions
    let speechText = '';
    const moistureOk = data?.nodes?.every(n => n.moisture > 30);
    const alerts = data?.alerts?.length || 0;
    
    if (lang === 'hi') {
      speechText = `नमस्ते ${data.farmerName || 'किसान'} जी! `;
      if (alerts > 0) speechText += `आपके खेत में ${alerts} क्षेत्र में पानी की कमी है। `;
      else speechText += `खेत में नमी का स्तर बहुत अच्छा है। `;
      speechText += `आज का तापमान ${data?.nodes?.[0]?.temperature || 24} डिग्री है।`;
    } else {
      speechText = `Hello ${data.farmerName || 'Farmer'}! `;
      if (alerts > 0) speechText += `There are ${alerts} areas needing water. `;
      else speechText += `Moisture levels are optimal across all zones. `;
      speechText += `Current temperature is ${data?.nodes?.[0]?.temperature || 24} degrees.`;
    }

    await speakHindi(speechText, {
      onDone: () => {
        setSpeaking(false);
        pulseAnim.setValue(1);
      },
      onError: () => {
        setSpeaking(false);
        pulseAnim.setValue(1);
      }
    });
  };

  if (loading) return <LoadingScreen />;

  const alertsCount = data?.alerts?.length || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor={COLORS.primary} />
        }
      >
        {/* Dynamic Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <View style={styles.headerTopUser}>
            <View>
              <Text style={styles.greetingText}>{t('नमस्ते', 'Welcome Back')},</Text>
              <Text style={styles.userName}>{data?.farmerName || t('किसान', 'Farmer')}</Text>
            </View>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
              <Text style={styles.langToggleText}>{lang === 'hi' ? 'EN' : 'HI'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusPillBadge}>
            <View style={[styles.statusDot, { backgroundColor: alertsCount > 0 ? COLORS.danger : COLORS.success }]} />
            <Text style={styles.statusPillText}>
              {alertsCount > 0 
                ? t('कुछ क्षेत्रों में पानी की कमी', 'Attention Needed in Zones') 
                : t('खेत की स्थिति उत्तम है', 'System Operating Optimally')}
            </Text>
          </View>
        </Animated.View>

        {/* The Voice Orb Interface (Premium Design) */}
        <Animated.View style={[styles.orbSection, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <LinearGradient
            colors={[COLORS.surface, '#1A2436']}
            style={styles.orbCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.orbInner}>
              {speaking && (
                <Animated.View style={[styles.orbPulse, { transform: [{ scale: pulseAnim }] }]} />
              )}
              <TouchableOpacity 
                style={[styles.orbButton, speaking && styles.orbButtonActive]} 
                onPress={handleSpeak}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={speaking ? [COLORS.danger, '#B71C1C'] : [COLORS.primary, COLORS.primaryDark]}
                  style={styles.orbGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons 
                    name={speaking ? "stop" : "microphone"} 
                    size={48} 
                    color="#000" 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.orbTitle}>
              {speaking 
                ? t('सुन रहे हैं...', 'Audio Playing...') 
                : t('स्थिति जानने के लिए दबाएं', 'Tap for Status Report')}
            </Text>
            <Text style={styles.orbSubtitle}>
              {t('सरल हिंदी में पूरी रिपोर्ट', 'AI Voice Assistant & Advisory')}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Action Premium Cards */}
        <Animated.View style={[styles.actionGrid, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('सलाह')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
              <MaterialCommunityIcons name="leaf" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>{t('कृषि सलाह', 'Actionable Advisory')}</Text>
            <Text style={styles.actionDesc}>{t('खाद और सिंचाई की जानकारी', 'Irrigation & Fertilizer')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('मिट्टी जाँच')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(179, 136, 255, 0.1)' }]}>
              <MaterialCommunityIcons name="flask" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionTitle}>{t('मिट्टी जाँच', 'Soil Test')}</Text>
            <Text style={styles.actionDesc}>{t('अपना NPK स्कैन करें', 'Analyze NPK profile')}</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

import { ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // Dynamic Header
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 20 },
  headerTopUser: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500', letterSpacing: 0.5 },
  userName: { fontSize: 28, color: COLORS.text, fontWeight: '800', marginTop: 4, letterSpacing: -0.5 },
  
  langToggle: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  langToggleText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

  statusPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  statusPillText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

  // Voice Orb Interface
  orbSection: { paddingHorizontal: 24, marginTop: 10 },
  orbCard: {
    borderRadius: 32,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.premium,
  },
  orbInner: {
    width: 160, height: 160,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  orbPulse: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  orbButton: {
    width: 120, height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.glass,
  },
  orbButtonActive: {
    shadowColor: COLORS.danger,
  },
  orbGradient: {
    width: 100, height: 100,
    borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  orbTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8, letterSpacing: -0.3 },
  orbSubtitle: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },

  // Quick Action Grid
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.soft,
  },
  actionIconWrap: {
    width: 48, height: 48,
    borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  actionDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});
