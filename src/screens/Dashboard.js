import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, StatusBar } from 'react-native';
import { Text, Avatar, useTheme, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { getDashboard } from '../services/api';
import NodeCard from '../components/NodeCard';
import NPKBar from '../components/NPKBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GAPS, THEME, FONTS } from '../theme';

export default function Dashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: dashboardData, error: apiError } = await getDashboard('farm_001');
    if (apiError) {
      setError(apiError);
    } else {
      setData(dashboardData);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>SENS_INIT: Booting Systems...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="wifi-strength-off-outline" size={64} color={COLORS.border} />
        <Text style={styles.errorText}>SYS_FAIL: Connection Terminated</Text>
        <Button mode="contained" onPress={fetchDashboardData} style={styles.retryBtn}>
          REBOOT SESSION
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primary, '#00251A']}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <View>
            <View style={styles.statusPill}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>SYS_STATUS: NOMINAL (Live)</Text>
            </View>
            <Text style={styles.farmName}>{data.farmerName?.toUpperCase() || 'OPERATOR'}</Text>
            <Text style={styles.coordinates}>LAT: 18.293 | LON: 73.284 | ALT: 540m</Text>
          </View>
          <Surface style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </Surface>
        </View>

        <TouchableOpacity 
          style={styles.voiceWrapper}
          onPress={() => navigation.navigate('Advisory')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(0, 230, 118, 0.2)', 'rgba(0, 230, 118, 0.1)']}
            style={styles.voiceCard}
          >
            <View style={styles.micCircle}>
              <MaterialCommunityIcons name="headset" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceTitle}>INTEL_ADVISORY</Text>
              <Text style={styles.voiceSub}>AI Decision Support System (Active)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.accent} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        {/* Subtle Grid Pattern Overlay would go here in CSS, using dividers for layout */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.titleLead} />
            <Text style={styles.sectionTitle}>Distributed Sensor Nodes</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Farm Map')}
            style={styles.mapLink}
          >
            <MaterialCommunityIcons name="map-marker-path" size={14} color={COLORS.secondary} />
            <Text style={styles.viewMap}>GEOFENCE_MAP</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.gridContainer}>
          {data.nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.titleLead} />
            <Text style={styles.sectionTitle}>Physical Nutrient Profile</Text>
          </View>
          <View style={styles.technicalBadge}>
             <Text style={styles.badgeText}>CALIBRATED_REF_01</Text>
          </View>
        </View>
        
        <NPKBar npkValues={{
          N: data.lastNPK.N,
          P: data.lastNPK.P,
          K: data.lastNPK.K,
          pH: data.lastNPK.pH
        }} />
        
        {data.alerts && data.alerts.length > 0 && (
          <Surface style={styles.alertBox}>
            <View style={styles.alertHeader}>
              <MaterialCommunityIcons name="alert-decagram-outline" size={20} color={COLORS.error} />
              <Text style={styles.alertTitle}>CRITICAL_SYSTEM_ALERT</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertText}>{data.alerts[0].message.toUpperCase()}</Text>
            </View>
          </Surface>
        )}
        <View style={{ height: 60 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 15,
    fontFamily: FONTS.mono,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryBtn: {
    borderRadius: 4,
  },
  headerGradient: {
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 0, // Shaper technical look
    borderBottomRightRadius: 60,
    ...SHADOWS.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    fontWeight: '900',
    color: COLORS.accent,
  },
  farmName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  coordinates: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
  },
  logo: {
    width: 44,
    height: 44,
  },
  voiceWrapper: {
    marginTop: 10,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  micCircle: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceInfo: {
    flex: 1,
    marginLeft: 20,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 2,
  },
  voiceSub: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0, 230, 118, 0.6)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLead: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E7E5',
  },
  viewMap: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    marginLeft: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  technicalBadge: {
    backgroundColor: '#F0F4F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
    fontWeight: '900',
  },
  alertBox: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.error,
    backgroundColor: '#FFF1F1',
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  alertHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
    marginLeft: 10,
    letterSpacing: 1,
  },
  alertBody: {
    padding: 18,
  },
  alertText: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: FONTS.mono,
    fontWeight: '900',
    lineHeight: 18,
  },
});
