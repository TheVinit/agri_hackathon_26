import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { sensorNodes } from '../mockData';
import { COLORS, SHADOWS, GAPS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function FarmMap({ navigation }) {
  const getPinColor = (status) => {
    switch (status) {
      case 'green': return COLORS.success;
      case 'amber': return COLORS.secondary;
      case 'red': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="satellite"
        initialRegion={{
          latitude: 18.5198,
          longitude: 73.8567,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {sensorNodes.map((node) => (
          <Marker
            key={node.id}
            coordinate={{ latitude: node.latitude, longitude: node.longitude }}
            pinColor={getPinColor(node.status)}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{node.labelLine1}</Text>
                <Text style={styles.calloutSub}>{node.labelLine2}</Text>
                <View style={styles.divider} />
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Moisture:</Text>
                  <Text style={styles.dataValue}>{node.moisture}%</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>EC:</Text>
                  <Text style={styles.dataValue}>{node.ec}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Temp:</Text>
                  <Text style={styles.dataValue}>{node.temperature}°C</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.overlayHeader}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geofence View</Text>
      </LinearGradient>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>Active</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.secondary }]} />
          <Text style={styles.legendText}>Warning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
          <Text style={styles.legendText}>Alert</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingTop: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calloutContainer: {
    width: 180,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    ...SHADOWS.medium,
  },
  calloutTitle: {
    fontWeight: '900',
    fontSize: 16,
    color: COLORS.primary,
  },
  calloutSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '800',
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    ...SHADOWS.soft,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
});
