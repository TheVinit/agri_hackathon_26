import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { supabase } from '../services/api';

const ADMIN_PASSWORD = 'agri2026';

export default function AdminScreen({ onExitAdmin }) {
  const [loginMode, setLoginMode] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [farmers, setFarmers] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', village: '', phone: '', crop: '', area: '',
  });

  useEffect(() => {
    if (!loginMode) fetchFarmers();
  }, [loginMode]);

  const fetchFarmers = async () => {
    setLoading(true);
    const { data: farmsData, error: farmsError } = await supabase.from('farms').select('*');
    const { data: dbFarmers, error: farmersError } = await supabase.from('farmers').select('*, farms(*)');
    
    if (dbFarmers) {
      const formatted = dbFarmers.map(f => ({
        id: f.id,
        farm_id: f.farm_id,
        name: f.farms?.farmer_name || 'N/A',
        village: f.village || 'N/A',
        crop: f.farms?.current_crop || 'N/A',
        phone: f.phone || 'N/A',
        area: 'Unknown',
        status: f.status || 'active',
        lastSync: f.last_sync || 'Never',
      }));
      setFarmers(formatted);
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setLoginMode(false);
      setLoginError('');
    } else {
      setLoginError('Wrong password. Try again.');
    }
  };

  const handleAddFarmer = async () => {
    if (!form.name || !form.phone) {
      Alert.alert('Error', 'Name and phone are required');
      return;
    }
    
    // 1. Create Farm record first
    const newFarmId = `farm_${Date.now()}`;
    const { error: farmError } = await supabase.from('farms').insert({
      id: newFarmId,
      farmer_name: form.name,
      farm_name: `${form.name}'s Farm`,
      current_crop: form.crop || 'Unknown'
    });

    if (farmError) { Alert.alert('Error', farmError.message); return; }

    // 2. Create Farmer record
    const { error: farmerError } = await supabase.from('farmers').insert({
      farm_id: newFarmId,
      phone: form.phone,
      village: form.village,
      status: 'active'
    });

    if (farmerError) { Alert.alert('Error', farmerError.message); return; }

    Alert.alert('✅ Done!', `${form.name} has been onboarded successfully.`);
    setForm({ name: '', village: '', phone: '', crop: '', area: '' });
    setAddModalVisible(false);
    fetchFarmers();
  };

  const handleDeleteFarmer = async (id) => {
    Alert.alert('Remove Farmer', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await supabase.from('farmers').delete().eq('id', id);
          fetchFarmers();
        },
      },
    ]);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await supabase.from('farmers').update({ status: newStatus }).eq('id', id);
    fetchFarmers();
  };

  if (loginMode) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.loginContent}>
          <View style={styles.shieldWrap}>
            <MaterialCommunityIcons name="shield-lock" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.loginTitle}>Admin Portal</Text>
          <Text style={styles.loginSub}>AgriPulse Management System</Text>

          <View style={styles.loginCard}>
            <Text style={styles.loginLabel}>Admin Security Check</Text>
            <View style={styles.inputShadowWrap}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.loginInput}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
            </View>
            {loginError ? <Text style={styles.loginError}>{loginError}</Text> : null}
            
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.loginBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.loginBtnText}>Access Admin Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onExitAdmin} style={styles.exitLink}>
              <Text style={styles.exitLinkText}>← Back to Farmer App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSub}>{farmers.length} active registrations</Text>
          </View>
          <TouchableOpacity onPress={onExitAdmin} style={styles.exitBtn}>
            <Text style={styles.exitBtnText}>Exit Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatPill
            icon="account-group"
            label="Farmers"
            value={farmers.length}
            color={COLORS.primary}
          />
          <StatPill
            icon="check-circle"
            label="Active"
            value={farmers.filter(f => f.status === 'active').length}
            color={COLORS.success}
          />
          <StatPill
            icon="alert-circle"
            label="Alerts"
            value={farmers.filter(f => f.status === 'inactive').length}
            color={COLORS.danger}
          />
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Add Farmer Button */}
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)} activeOpacity={0.85}>
          <LinearGradient colors={[COLORS.accent, '#E5981F']} style={styles.addBtnGrad}>
            <MaterialCommunityIcons name="account-plus" size={22} color="#fff" />
            <Text style={styles.addBtnText}>Onboard New Farmer</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Registered Farmers</Text>

        {farmers.map((farmer) => (
          <FarmerCard
            key={farmer.id}
            farmer={farmer}
            onDelete={() => handleDeleteFarmer(farmer.id)}
            onToggleStatus={() => toggleStatus(farmer.id)}
            onView={() => setSelectedFarmer(farmer)}
          />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Farmer Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Onboard New Farmer</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <FormInput label="Farmer Name *" icon="account" value={form.name}
                onChangeText={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Ramesh Patel" />
              <FormInput label="Phone Number *" icon="phone" value={form.phone}
                onChangeText={v => setForm(p => ({ ...p, phone: v }))} placeholder="10-digit number"
                keyboardType="phone-pad" />
              <FormInput label="Village / District" icon="map-marker" value={form.village}
                onChangeText={v => setForm(p => ({ ...p, village: v }))} placeholder="e.g. Nashik, Maharashtra" />
              <FormInput label="Current Crop" icon="sprout" value={form.crop}
                onChangeText={v => setForm(p => ({ ...p, crop: v }))} placeholder="e.g. Wheat" />
              <FormInput label="Farm Area" icon="terrain" value={form.area}
                onChangeText={v => setForm(p => ({ ...p, area: v }))} placeholder="e.g. 3.5 acres" />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddFarmer} activeOpacity={0.85}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.submitBtnGrad}>
                  <Text style={styles.submitBtnText}>✅  Add Farmer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Farmer Modal */}
      {selectedFarmer && (
        <Modal visible={!!selectedFarmer} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Farmer Details</Text>
                <TouchableOpacity onPress={() => setSelectedFarmer(null)}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Name</Text><Text style={styles.detailValue}>{selectedFarmer.name}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Farm ID</Text><Text style={styles.detailValue}>{selectedFarmer.id}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Village</Text><Text style={styles.detailValue}>{selectedFarmer.village}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Crop</Text><Text style={styles.detailValue}>{selectedFarmer.crop}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Area</Text><Text style={styles.detailValue}>{selectedFarmer.area}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone</Text><Text style={styles.detailValue}>{selectedFarmer.phone}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusChip, { backgroundColor: selectedFarmer.status === 'active' ? '#E8F5EC' : '#FFF3DC' }]}>
                  <Text style={{ color: selectedFarmer.status === 'active' ? COLORS.success : COLORS.warning, fontWeight: '700', fontSize: 13 }}>
                    {selectedFarmer.status === 'active' ? '🟢 Active' : '🟡 Inactive'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedFarmer(null)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function StatPill({ icon, label, value, color }) {
  return (
    <View style={statStyles.pill}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  pill: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingVertical: 10, marginHorizontal: 4 },
  value: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 4 },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
});

function FarmerCard({ farmer, onDelete, onToggleStatus, onView }) {
  const isActive = farmer.status === 'active';
  return (
    <View style={fcStyles.card}>
      <View style={fcStyles.row}>
        <View style={[fcStyles.avatar, { backgroundColor: isActive ? COLORS.primaryPale : '#FFF3DC' }]}>
          <Text style={fcStyles.avatarText}>{farmer.name.charAt(0)}</Text>
        </View>
        <View style={fcStyles.info}>
          <Text style={fcStyles.name}>{farmer.name}</Text>
          <Text style={fcStyles.meta}>📍 {farmer.village || 'N/A'}</Text>
          <Text style={fcStyles.meta}>🌾 {farmer.crop} • {farmer.area}</Text>
          <Text style={fcStyles.meta}>📱 {farmer.phone}</Text>
        </View>
        <View style={fcStyles.actions}>
          <View style={[fcStyles.badge, { backgroundColor: isActive ? '#E8F5EC' : '#F9ECDF' }]}>
            <Text style={[fcStyles.badgeText, { color: isActive ? COLORS.success : COLORS.warning }]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
      <View style={fcStyles.footer}>
        <TouchableOpacity style={fcStyles.actionBtn} onPress={onView}>
          <MaterialCommunityIcons name="eye-outline" size={16} color={COLORS.primary} />
          <Text style={[fcStyles.actionText, { color: COLORS.primary }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={fcStyles.actionBtn} onPress={onToggleStatus}>
          <MaterialCommunityIcons name={isActive ? 'pause-circle-outline' : 'play-circle-outline'} size={16} color={COLORS.warning} />
          <Text style={[fcStyles.actionText, { color: COLORS.warning }]}>{isActive ? 'Deactivate' : 'Activate'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={fcStyles.actionBtn} onPress={onDelete}>
          <MaterialCommunityIcons name="delete-outline" size={16} color={COLORS.danger} />
          <Text style={[fcStyles.actionText, { color: COLORS.danger }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const fcStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 14, padding: 16, ...SHADOWS.card },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  actions: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  footer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: 10, justifyContent: 'space-around' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { fontSize: 12, fontWeight: '700' },
});

function FormInput({ label, icon, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={fiStyles.wrapper}>
      <Text style={fiStyles.label}>{label}</Text>
      <View style={fiStyles.inputRow}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={fiStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );
}
const fiStyles = StyleSheet.create({
  wrapper: { marginBottom: 14, paddingHorizontal: 4 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: COLORS.background },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loginContainer: { flex: 1, backgroundColor: COLORS.background },
  loginContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  shieldWrap: { 
    width: 100, height: 100, borderRadius: 32, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24, ...SHADOWS.soft 
  },
  loginTitle: { fontSize: 32, fontWeight: '900', color: COLORS.text, marginTop: 16 },
  loginSub: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4, marginBottom: 40 },
  loginCard: { width: '100%', backgroundColor: COLORS.surface, borderRadius: 32, padding: 30, ...SHADOWS.premium, borderWidth: 1, borderColor: COLORS.divider },
  loginLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 15, textAlign: 'center', textTransform: 'uppercase' },
  inputShadowWrap: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight, 
    borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.divider, marginBottom: 15
  },
  inputIcon: { marginRight: 10 },
  loginInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: COLORS.text },
  loginError: { color: COLORS.danger, fontSize: 13, fontWeight: '600', marginBottom: 15, textAlign: 'center' },
  loginBtn: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.glass },
  loginBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  exitLink: { marginTop: 20, alignItems: 'center' },
  exitLinkText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  headerSub: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500', marginTop: 4 },
  exitBtn: { backgroundColor: COLORS.primaryPale, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  exitBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10 },
  body: { flex: 1 },
  addBtn: { marginHorizontal: 24, marginBottom: 20, borderRadius: 16, overflow: 'hidden', ...SHADOWS.glass },
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textMuted, marginHorizontal: 24, marginBottom: 15, textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  submitBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 20, marginBottom: 20 },
  submitBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  detailValue: { fontSize: 15, color: COLORS.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  closeModalBtn: { marginTop: 24, backgroundColor: COLORS.primaryPale, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  closeModalText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
});

