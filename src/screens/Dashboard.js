import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, Avatar, useTheme, Button } from 'react-native-paper';
import { getDashboard } from '../services/api';
import NodeCard from '../components/NodeCard';
import NPKBar from '../components/NPKBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Dashboard({ navigation }) {
  const theme = useTheme();
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>लोड हो रहा है (Loading data...)</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>सर्वर से कनेक्ट नहीं हो सका (Connection Error)</Text>
        <Button mode="contained" onPress={fetchDashboardData} style={{ marginTop: 20 }}>
          दोबारा प्रयास करें (Retry)
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>नमस्कार, (Welcome back)</Text>
            <Text style={styles.farmName}>{data.farmerName || 'Farmer'}</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>सभी सेंसर चालू हैं (All systems active)</Text>
            </View>
          </View>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.voiceWrapper}
          onPress={() => navigation.navigate('Advisory')}
        >
          <View style={styles.voiceCard}>
            <MaterialCommunityIcons name="microphone-outline" size={32} color="#FFF" />
            <Text style={styles.voiceText}>VOICE ADVISORY</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sensor Nodes</Text>
          <Text style={styles.viewMap} onPress={() => navigation.navigate('Farm Map')}>View Map</Text>
        </View>
        <View style={styles.gridContainer}>
          {data.nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>NPK Summary (Soil Profile)</Text>
        <NPKBar npkValues={{
          N: data.lastNPK.N,
          P: data.lastNPK.P,
          K: data.lastNPK.K,
          pH: data.lastNPK.pH
        }} />
        
        {data.alerts && data.alerts.length > 0 && (
          <View style={styles.alertBox}>
            <MaterialCommunityIcons name="alert-decagram" size={24} color="#C62828" />
            <Text style={styles.alertText}>{data.alerts[0].message}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 10,
  },
  headerGradient: {
    padding: 24,
    paddingTop: 30, 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    backgroundColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E8F5E9',
    opacity: 0.9,
  },
  farmName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#81C784',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F1F8E9',
    textTransform: 'uppercase',
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 4,
    borderRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 50,
    height: 50,
  },
  voiceWrapper: {
    marginTop: 10,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  voiceText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
  },
  viewMap: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  alertText: {
    flex: 1,
    marginLeft: 10,
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
});

