import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Animated, ScrollView, RefreshControl, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { getDashboard } from '../services/api';
import { speakAdvisory, stopSpeaking } from '../services/tts';
import { useLang } from '../context/LanguageContext';
import Skeleton from '../components/Skeleton';

const FARM_ID = 'farm_001';

export default function Dashboard({ navigation }) {
  const { t, lang, toggleLang } = useLang();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); // 30s Poll
    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const { data: d } = await getDashboard(FARM_ID);
    if (d) {
      setData(d);
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
    
    await speakAdvisory(data, lang, data?.farmerName, {
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor={COLORS.primary} />
        }
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <View style={styles.headerTopUser}>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.greetingText}>{t('नमस्ते', 'Welcome Back', 'नमस्कार')},</Text>
                <View style={[styles.sourceBadge, { backgroundColor: data?.dataSource === 'Live' ? '#E8F5E9' : '#FFF3E0' }]}>
                  <Text style={[styles.sourceText, { color: data?.dataSource === 'Live' ? COLORS.primary : '#E65100' }]}>
                    {data?.dataSource || 'Demo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.userName}>{data?.farmerName || t('किसान', 'Farmer', 'शेतकरी')}</Text>
            </View>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
              <Text style={styles.langToggleText}>{lang.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusPillBadge}>
            <View style={[styles.statusDot, { backgroundColor: alertsCount > 0 ? COLORS.danger : COLORS.success }]} />
            <Text style={styles.statusPillText}>
              {alertsCount > 0 
                ? t('कुछ क्षेत्रों में पानी की कमी', 'Attention Needed in Zones', 'काही ठिकाणी पाण्याची गरज') 
                : t('खेत की स्थिति उत्तम है', 'System Operating Optimally', 'शेताची स्थिती उत्तम आहे')}
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.orbSection, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceLight]}
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
                  colors={speaking ? [COLORS.danger, '#B71C1C'] : [COLORS.primary, COLORS.primaryLight]}
                  style={styles.orbGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons 
                    name={speaking ? "stop" : "microphone"} 
                    size={48} 
                    color="#FFFFFF" 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.orbTitle}>
              {speaking 
                ? t('सुन रहे हैं...', 'Audio Playing...', 'ऐकत आहे...') 
                : t('रिपोर्ट सुनने के लिए दबाएं', 'Tap for Status Report', 'रिपोर्ट मिळवण्यासाठी दाबा')}
            </Text>
            <Text style={styles.orbSubtitle}>
              {t('AI असिस्टेंट से सलाह लें', 'AI Voice Assistant & Advisory', 'AI असिस्टंटकडून सल्ला मिळवा')}
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.actionGrid, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Advisory')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: COLORS.primaryPale }]}>
              <MaterialCommunityIcons name="leaf" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>{t('कृषि सलाह', 'Actionable Advisory', 'कृषी सल्ला')}</Text>
            <Text style={styles.actionDesc}>{t('सिंचाई और खाद', 'Irrigation & Fertilizer', 'सिंचन आणि खते')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NPKTest')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <MaterialCommunityIcons name="flask" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionTitle}>{t('मिट्टी जाँच', 'Soil Test', 'माती परीक्षण')}</Text>
            <Text style={styles.actionDesc}>{t('NPK विश्लेषण', 'Analyze NPK profile', 'NPK विश्लेषण')}</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={120} height={20} style={{ marginBottom: 10 }} />
        <Skeleton width={200} height={35} style={{ marginBottom: 20 }} />
        <Skeleton width={250} height={45} borderRadius={16} />
      </View>
      <View style={styles.orbSection}>
        <Skeleton width="100%" height={280} borderRadius={32} />
      </View>
      <View style={styles.actionGrid}>
        <Skeleton width="48%" height={160} borderRadius={24} />
        <Skeleton width="48%" height={160} borderRadius={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 20 },
  headerTopUser: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500', letterSpacing: 0.5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' },
  sourceText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  userName: { fontSize: 28, color: COLORS.text, fontWeight: '800', marginTop: 4, letterSpacing: -0.5 },
  
  langToggle: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.soft
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
    borderColor: COLORS.divider,
    alignSelf: 'flex-start',
    ...SHADOWS.soft
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  statusPillText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

  orbSection: { paddingHorizontal: 24, marginTop: 10 },
  orbCard: {
    borderRadius: 32,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
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
    backgroundColor: 'rgba(11, 138, 68, 0.1)',
  },
  orbButton: {
    width: 120, height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.premium,
  },
  orbButtonActive: {
    shadowColor: COLORS.danger,
  },
  orbGradient: {
    width: 100, height: 100,
    borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  orbTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8, letterSpacing: -0.3, textAlign: 'center' },
  orbSubtitle: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },

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
    borderColor: COLORS.divider,
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

