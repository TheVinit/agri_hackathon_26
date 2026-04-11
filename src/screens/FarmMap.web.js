// src/screens/FarmMap.web.js
// Advanced Google Maps integration for Web — Using your new API Key
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';

const GOOGLE_MAPS_KEY = 'AIzaSyA3GeBaYJV8ylKwUc5eaCFH4imUsKAhM1g';

const DEMO_NODES = [
  { id: 1, lat: 18.5204, lng: 73.8567, moisture: 68, status: 'ok',       label: 'North Field' },
  { id: 2, lat: 18.5220, lng: 73.8580, moisture: 72, status: 'ok',       label: 'East Field' },
  { id: 3, lat: 18.5195, lng: 73.8550, moisture: 38, status: 'warning',  label: 'South Field' },
  { id: 4, lat: 18.5210, lng: 73.8560, moisture: null, status: 'offline', label: 'West Field' },
];

const CENTER_LAT = 18.5210;
const CENTER_LNG = 73.8567;

export default function FarmMap() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMap = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Load Google Maps Script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      delete window.initMap;
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !googleMap.current) {
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: CENTER_LAT, lng: CENTER_LNG },
        zoom: 17,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        styles: [{ featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] }]
      });

      // Add Markers
      DEMO_NODES.forEach(node => {
        new window.google.maps.Marker({
          position: { lat: node.lat, lng: node.lng },
          map: googleMap.current,
          title: node.label,
          label: { text: `N${node.id}`, color: 'white', fontWeight: 'bold' }
        });
      });
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (googleMap.current && selectedNode) {
      googleMap.current.panTo({ lat: selectedNode.lat, lng: selectedNode.lng });
      googleMap.current.setZoom(19);
    }
  }, [selectedNode]);

  const statusColor = (s) => s === 'ok' ? COLORS.success : s === 'warning' ? COLORS.warning : s === 'offline' ? COLORS.textMuted : COLORS.danger;
  
  return (
    <ScrollView style={styles.root} stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="map-marker-radius" size={24} color={COLORS.primary} />
          <View>
            <Text style={styles.headerTitle}>Premium Farm Map</Text>
            <Text style={styles.headerSub}>Google Satellite View Enabled</Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.statusPillTxt}>HD Live</Text>
        </View>
      </View>

      {/* Map */}
      <View style={[styles.mapContainer, { height: 500 }]}> 
        {Platform.OS === 'web' ? (
          <View 
            ref={mapRef} 
            style={{ width: '100%', height: '100%', backgroundColor: COLORS.surfaceDark }} 
          />
        ) : (
          <View style={styles.mapLoading}>
             <MaterialCommunityIcons name="map-marker-check" size={50} color={COLORS.primary} />
             <Text style={styles.mapLoadingTxt}>Google Map available on mobile</Text>
          </View>
        )}

        {/* Node overlay badges on web */}
        {Platform.OS === 'web' && mapLoaded && (
          <View style={styles.nodeLegend}>
            {DEMO_NODES.map(n => (
              <TouchableOpacity
                key={n.id}
                style={[styles.legendItem, selectedNode?.id === n.id && styles.legendItemActive]}
                onPress={() => setSelectedNode(selectedNode?.id === n.id ? null : n)}
              >
                <View style={[styles.legendDot, { backgroundColor: statusColor(n.status) }]} />
                <Text style={styles.legendTxt}>N{n.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Node Info Panel */}
      {selectedNode && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <Text style={styles.infoPanelTitle}>{selectedNode.label}</Text>
            <TouchableOpacity onPress={() => setSelectedNode(null)}>
               <MaterialCommunityIcons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoPanelMetrics}>
            <MetricTile icon="water-percent" label="Moisture" value={selectedNode.moisture != null ? `${selectedNode.moisture}%` : '--'} color={selectedNode.status === 'offline' ? COLORS.textMuted : COLORS.primary} />
            <MetricTile icon="crosshairs-gps" label="Location" value={`${selectedNode.lat.toFixed(4)}, ${selectedNode.lng.toFixed(4)}`} color={COLORS.textSecondary} />
          </View>
        </View>
      )}

      {/* Node Cards */}
      <View style={styles.nodeScrollWrap}>
        <Text style={styles.nodeScrollHeader}>Field Sensors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nodeScroll} contentContainerStyle={styles.nodeScrollContent}>
          {DEMO_NODES.map(n => (
            <TouchableOpacity
              key={n.id}
              style={[styles.nodeCard, selectedNode?.id === n.id && styles.nodeCardActive, n.status === 'offline' && styles.nodeCardOffline]}
              onPress={() => setSelectedNode(selectedNode?.id === n.id ? null : n)}
              activeOpacity={0.8}
            >
              <View style={styles.nodeCardTop}>
                <Text style={styles.nodeCardTitle}>{n.label}</Text>
                <View style={[styles.nodeBadge, { backgroundColor: statusColor(n.status) + '20' }]}>
                  <View style={[styles.dot, { backgroundColor: statusColor(n.status) }]} />
                </View>
              </View>
              <Text style={styles.nodeCardMoisture}>
                {n.moisture != null ? `${n.moisture}%` : '—'}
              </Text>
              <Text style={styles.nodeCardLabel}>
                {n.status === 'offline' ? 'Offline' : 'Moisture'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* OSM Attribution */}
      <View style={styles.attribution}>
        <MaterialCommunityIcons name="map" size={12} color={COLORS.textMuted} />
        <Text style={styles.attributionTxt}>Map data © OpenStreetMap contributors</Text>
      </View>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function MetricTile({ icon, label, value, color }) {
  return (
    <View style={styles.metricTile}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={[styles.metricVal, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingTop: Platform.OS === 'ios' ? 54 : 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginTop: 1 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryPale, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusPillTxt: { fontSize: 12, fontWeight: '800', color: COLORS.primary },

  mapContainer: { flex: 1, backgroundColor: COLORS.surfaceLight, position: 'relative', minHeight: 300 },
  mapLoading: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 12 },
  mapLoadingTxt: { color: COLORS.textMuted, fontWeight: '600', fontSize: 15 },

  nodeLegend: { position: 'absolute', top: 12, right: 12, flexDirection: 'column', gap: 6, zIndex: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: COLORS.divider },
  legendItemActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 12, fontWeight: '800', color: COLORS.text },

  infoPanel: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, ...SHADOWS.premium, borderWidth: 1, borderColor: COLORS.divider },
  infoPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  infoPanelTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeTxt: { fontSize: 12, fontWeight: '800' },
  infoPanelMetrics: { flexDirection: 'row', gap: 12 },
  metricTile: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: COLORS.surfaceLight, borderRadius: 14, paddingVertical: 14 },
  metricVal: { fontSize: 16, fontWeight: '900' },
  metricLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  nodeScrollWrap: { marginTop: 10 },
  nodeScrollHeader: { fontSize: 13, fontWeight: '800', color: COLORS.textMuted, marginLeft: 20, marginBottom: 8, textTransform: 'uppercase' },
  nodeScroll: { maxHeight: 130 },
  nodeScrollContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  nodeCard: { width: 120, backgroundColor: COLORS.surface, borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: COLORS.divider, ...SHADOWS.soft },
  nodeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  nodeCardOffline: { opacity: 0.7 },
  nodeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nodeCardTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  nodeBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  nodeCardMoisture: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  nodeCardLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },

  dot: { width: 8, height: 8, borderRadius: 4 },
  attribution: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.divider },
  attributionTxt: { fontSize: 10, color: COLORS.textMuted },
});
