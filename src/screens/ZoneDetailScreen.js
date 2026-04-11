import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Pressable, Image, ScrollView, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TEXT_STYLES, CARD, RADIUS, SPACING, SHADOWS } from '../theme';
import { useLang } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function ZoneDetailScreen({ route, navigation }) {
  const { zoneId, zoneTitle } = route.params || { zoneId: 'Zone A', zoneTitle: 'Zone North' };
  const { t, lang } = useLang();
  const { showToast } = useToast();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={TEXT_STYLES.h2}>{t(`${zoneTitle} विवरण`, `${zoneTitle} Details`, `${zoneTitle} तपशील`)}</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>{t('लाइव डेटा और नियंत्रण', 'Live data and controls', 'थेट डेटा आणि नियंत्रणे')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Mock Camera Feed */}
        <View style={styles.cameraContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1592982537447-6f23f7d1b10a?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.cameraFeed}
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.timestampOverlay}>{new Date().toLocaleString()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>{t('त्वरित कार्रवाई', 'Quick Actions', 'त्वरित क्रिया')}</Text>
        <View style={styles.actionGrid}>
          <Pressable 
            style={({pressed}) => [styles.actionBtn, pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 }]} 
            onPress={() => showToast(t('सिंचाई शुरू कर दी गई है!', 'Irrigation triggered in ' + zoneTitle + '!', 'सिंचन सुरू केले आहे!'), 'success')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="water-pump" size={28} color="#1E88E5" />
            </View>
            <Text style={styles.actionBtnText}>{t('सिंचाई करें', 'Irrigate Zone', 'सिंचन करा')}</Text>
          </Pressable>

          <Pressable 
            style={({pressed}) => [styles.actionBtn, pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 }]} 
            onPress={() => showToast(t('खाद का शेड्यूल बन गया', 'Fertilizer scheduled', 'खताचे वेळापत्रक तयार'), 'success')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#F3E5F5' }]}>
              <MaterialCommunityIcons name="sprout" size={28} color="#8E24AA" />
            </View>
            <Text style={styles.actionBtnText}>{t('खाद डालें', 'Apply Fertilizer', 'खत घाला')}</Text>
          </Pressable>
        </View>

        {/* Sensor List */}
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>{t('सेंसर डेटा', 'Sensor Data', 'सेन्सर डेटा')}</Text>
        
        <View style={styles.sensorRow}>
          <View style={styles.sensorCard}>
            <MaterialCommunityIcons name="water-percent" size={24} color="#1E88E5" />
            <Text style={styles.sensorVal}>68%</Text>
            <Text style={styles.sensorLabel}>{t('नमी', 'Moisture', 'आर्द्रता')}</Text>
          </View>
          <View style={styles.sensorCard}>
            <MaterialCommunityIcons name="thermometer" size={24} color="#F4511E" />
            <Text style={styles.sensorVal}>29°C</Text>
            <Text style={styles.sensorLabel}>{t('तापमान', 'Temp', 'तापमान')}</Text>
          </View>
          <View style={styles.sensorCard}>
            <MaterialCommunityIcons name="flask-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sensorVal}>Normal</Text>
            <Text style={styles.sensorLabel}>{t('एनपीके', 'NPK', 'NPK')}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  headerTitles: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
  },
  cameraContainer: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  cameraFeed: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestampOverlay: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    ...CARD,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionBtnText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  sensorRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  sensorCard: {
    flex: 1,
    ...CARD,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: 4,
  },
  sensorVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 4,
  },
  sensorLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
