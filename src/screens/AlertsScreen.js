import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TEXT_STYLES, CARD, RADIUS, SPACING, SHADOWS } from '../theme';
import EmptyState from '../components/EmptyState';

const MOCK_ALERTS = [
  {
    id: '1',
    severity: 'critical',
    title: '🚨 Zone South — Moisture critically low (18%)',
    message: 'Irrigate immediately',
    time: '1h ago',
    action: { label: 'Open Advisory', route: 'Advisory' }
  },
  {
    id: '2',
    severity: 'warning',
    title: '⚠ Temperature spike — Zone North (38°C)',
    message: 'Monitor closely',
    time: '3h ago',
    action: { label: 'View Map', route: 'Map' }
  },
  {
    id: '3',
    severity: 'info',
    title: '✅ NPK levels normal across all zones',
    message: 'No action needed',
    time: '1d ago',
    action: null
  },
  {
    id: '4',
    severity: 'info',
    title: '📡 Sensor Node 3 back online',
    message: 'All 4 nodes active',
    time: '2d ago',
    action: null
  }
];

export default function AlertsScreen({ navigation }) {
  const [filter, setFilter] = useState('All');

  const filteredAlerts = MOCK_ALERTS.filter(alert => {
    if (filter === 'All') return true;
    if (filter === 'Critical' && alert.severity === 'critical') return true;
    if (filter === 'Warnings' && alert.severity === 'warning') return true;
    if (filter === 'Info' && alert.severity === 'info') return true;
    return false;
  });

  const getBorderColor = (severity) => {
    switch (severity) {
      case 'critical': return '#E53935'; // Red
      case 'warning': return '#FF6B35'; // Orange
      case 'info': return COLORS.primary; // Green
      default: return COLORS.divider;
    }
  };

  const FilterPill = ({ label }) => (
    <TouchableOpacity 
      style={[styles.filterPill, filter === label && styles.filterPillActive]}
      onPress={() => setFilter(label)}
    >
      <Text style={[TEXT_STYLES.small, styles.filterText, filter === label && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAlert = ({ item }) => (
    <View style={[styles.alertCard, { borderLeftColor: getBorderColor(item.severity) }]}>
      <Text style={[TEXT_STYLES.h4, styles.alertTitle]}>{item.title}</Text>
      <Text style={[TEXT_STYLES.body, styles.alertMessage]}>{item.message}</Text>
      
      <View style={styles.alertFooter}>
        <Text style={[TEXT_STYLES.small, styles.timeText]}>{item.time}</Text>
        
        {item.action && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => {
              // Navigate to the tab and possibly trigger an action inside
              navigation.navigate(item.action.route);
            }}
          >
            <Text style={[TEXT_STYLES.h4, styles.actionBtnText]}>{item.action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={TEXT_STYLES.h2}>Alerts</Text>
        <View style={styles.bellContainer}>
          <MaterialCommunityIcons name="bell-outline" size={28} color={COLORS.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterPill label="All" />
          <FilterPill label="Critical" />
          <FilterPill label="Warnings" />
          <FilterPill label="Info" />
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={item => item.id}
        renderItem={renderAlert}
        contentContainerStyle={[styles.listContent, filteredAlerts.length === 0 && { flex: 1, justifyContent: 'center' }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState 
            emoji="📭" 
            title="कोई अलर्ट नहीं" 
            subtitle="आपके पास कोई नया अलर्ट नहीं है।" 
          />
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterRow: {
    marginBottom: SPACING.md,
  },
  filterScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  filterPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.surfaceCard || '#FFF',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 100, // accommodate bottom tab nav
  },
  alertCard: {
    ...CARD,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    paddingLeft: SPACING.xl - 4, // Adjust padding for border width
  },
  alertTitle: {
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  alertMessage: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: COLORS.textMuted,
  },
  actionBtn: {
    backgroundColor: COLORS.primaryPale,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  actionBtnText: {
    color: COLORS.primary,
  },
});
