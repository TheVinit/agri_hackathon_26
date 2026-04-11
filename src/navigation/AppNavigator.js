// src/navigation/AppNavigator.js
// Production-grade navigation — Bottom Tabs with custom tab bar + floating AI FAB
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Platform,
  StyleSheet, Animated, Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../theme';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';

import Dashboard           from '../screens/Dashboard';
import Advisory            from '../screens/Advisory';
import NPKTest             from '../screens/NPKTest';
import FarmMap             from '../screens/FarmMap';
import AdminScreen         from '../screens/AdminScreen';
import LoginScreen         from '../screens/LoginScreen';
import OnboardingScreen    from '../screens/OnboardingScreen';
import AIAssistant         from '../screens/AIAssistant';
import NodeSetupScreen     from '../screens/NodeSetupScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const { width: W } = Dimensions.get('window');

// ── Custom bottom tab bar ─────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const { unreadCount } = useNotifications();
  const { t } = useLang();

  const TABS = [
    { name: 'HomeTab',     icon: 'home',             iconActive: 'home',            label: t('होम','Home','होम') },
    { name: 'AdvisoryTab', icon: 'book-open-outline', iconActive: 'book-open-variant', label: t('सलाह','Advice','सल्ला') },
    { name: 'AITab',       icon: null,               iconActive: null,              label: t('AI','AI','AI') }, // center FAB
    { name: 'MapTab',      icon: 'map-marker-outline', iconActive: 'map-marker',    label: t('नक्शा','Map','नकाशा') },
    { name: 'MoreTab',     icon: 'flask-round-bottom-outline', iconActive: 'flask-round-bottom', label: t('जाँच','Test','परीक्षण') },
  ];

  return (
    <View style={tb.wrapper}>
      <View style={tb.bar}>
        {state.routes.map((route, index) => {
          const isFocused   = state.index === index;
          const tabDef      = TABS[index];
          const isCenter    = route.name === 'AITab';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (isCenter) {
            // Floating AI button
            return (
              <View key={route.key} style={tb.centerWrap}>
                <TouchableOpacity style={tb.fab} onPress={onPress} activeOpacity={0.85}>
                  <LinearGradient
                    colors={isFocused ? ['#059669', '#34D399'] : ['#059669', '#10B981']}
                    style={tb.fabGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="robot-happy" size={28} color="#fff" />
                  </LinearGradient>
                  {isFocused && <View style={tb.fabActiveDot} />}
                </TouchableOpacity>
                <Text style={[tb.fabLabel, isFocused && tb.labelActive]}>AI</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity key={route.key} style={tb.tab} onPress={onPress} activeOpacity={0.7}>
              <View style={[tb.tabIconWrap, isFocused && tb.tabIconActive]}>
                <MaterialCommunityIcons
                  name={isFocused ? tabDef.iconActive : tabDef.icon}
                  size={22}
                  color={isFocused ? COLORS.primary : COLORS.textMuted}
                />
                {/* Notification badge on Home */}
                {route.name === 'HomeTab' && unreadCount > 0 && (
                  <View style={tb.badge}>
                    <Text style={tb.badgeTxt}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[tb.label, isFocused && tb.labelActive]}>
                {tabDef.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 4,
    ...SHADOWS.premium,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 3 },
  tabIconWrap: { width: 40, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 10, position: 'relative' },
  tabIconActive: { backgroundColor: COLORS.primaryPale },
  label: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center' },
  labelActive: { color: COLORS.primary, fontWeight: '800' },
  badge: {
    position: 'absolute', top: -2, right: -2,
    minWidth: 16, height: 16,
    backgroundColor: COLORS.danger,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: COLORS.surface,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', color: '#fff' },
  // Center FAB
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 },
  fab: { marginTop: -28, position: 'relative' },
  fabGrad: { width: 58, height: 58, borderRadius: 20, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glass },
  fabActiveDot: { position: 'absolute', bottom: -8, left: '50%', marginLeft: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  fabLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, marginTop: 6 },
});

// ── Main Tab Stack ────────────────────────────────────────────────────────────
function MainTabs({ farmer, onLogout, virtualNodes }) {
  const { t } = useLang();
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab">
        {(props) => <DashboardWithHeader {...props} farmer={farmer} onLogout={onLogout} virtualNodes={virtualNodes} />}
      </Tab.Screen>
      <Tab.Screen name="AdvisoryTab"  component={Advisory} />
      <Tab.Screen name="AITab"        component={AIAssistant} />
      <Tab.Screen name="MapTab"       component={FarmMap} />
      <Tab.Screen name="MoreTab"      component={NPKTest} />
    </Tab.Navigator>
  );
}

// ── Dashboard wrapped with app header (notifications, profile) ────────────────
function DashboardWithHeader({ navigation, farmer, onLogout, virtualNodes }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader navigation={navigation} farmer={farmer} onLogout={onLogout} />
      <Dashboard navigation={navigation} virtualNodes={virtualNodes} />
    </View>
  );
}

// ── App Header — shown on Dashboard ──────────────────────────────────────────
function AppHeader({ navigation, farmer, onLogout }) {
  const { lang, t, toggleLang } = useLang();
  const { unreadCount } = useNotifications();
  const [showMenu, setShowMenu] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toVal = showMenu ? 0 : 1;
    setShowMenu(!showMenu);
    Animated.spring(menuAnim, { toValue: toVal, tension: 100, friction: 8, useNativeDriver: true }).start();
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12
    ? t('सुप्रभात', 'Good Morning', 'सुप्रभात')
    : hour < 17
      ? t('नमस्ते', 'Good Afternoon', 'नमस्कार')
      : t('शुभ संध्या', 'Good Evening', 'शुभ संध्या');

  const LANG_FLAGS = { hi: '🇮🇳 हिं', en: '🌐 EN', mr: '🟧 मर' };

  return (
    <View style={ah.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={ah.headerGrad}>
        {/* Left: greeting + name */}
        <View style={ah.left}>
          <Text style={ah.greeting}>{greeting} 👋</Text>
          <Text style={ah.name}>{farmer?.name || t('किसान', 'Farmer', 'शेतकरी')}</Text>
        </View>

        {/* Right: actions */}
        <View style={ah.actions}>
          {/* Lang toggle */}
          <TouchableOpacity style={ah.actionBtn} onPress={toggleLang}>
            <Text style={ah.langTxt}>{LANG_FLAGS[lang]}</Text>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={ah.actionBtn}
            onPress={() => navigation?.navigate && navigation.navigate('Notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.textSecondary} />
            {unreadCount > 0 && (
              <View style={ah.notifBadge}>
                <Text style={ah.notifBadgeTxt}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile / logout */}
          <TouchableOpacity style={ah.avatarBtn} onPress={toggleMenu}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={ah.avatarGrad}>
              <Text style={ah.avatarTxt}>{(farmer?.name || 'F')[0].toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Dropdown menu */}
      {showMenu && (
        <Animated.View style={[ah.menu, { opacity: menuAnim, transform: [{ scale: menuAnim }] }]}>
          <TouchableOpacity style={ah.menuItem} onPress={toggleMenu}>
            <MaterialCommunityIcons name="account-circle" size={18} color={COLORS.primary} />
            <Text style={ah.menuItemTxt}>{farmer?.name || 'Farmer'}</Text>
          </TouchableOpacity>
          <View style={ah.menuDivider} />
          <TouchableOpacity style={ah.menuItem} onPress={() => { toggleMenu(); onLogout(); }}>
            <MaterialCommunityIcons name="logout" size={18} color={COLORS.danger} />
            <Text style={[ah.menuItemTxt, { color: COLORS.danger }]}>{t('लॉगआउट', 'Logout', 'बाहेर जा')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const ah = StyleSheet.create({
  container: { zIndex: 10 },
  headerGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  left: { flex: 1 },
  greeting: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.divider, position: 'relative' },
  langTxt: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary },
  notifBadge: { position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.danger, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
  notifBadgeTxt: { fontSize: 8, fontWeight: '900', color: '#fff' },
  avatarBtn: { marginLeft: 4 },
  avatarGrad: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 16, fontWeight: '900', color: '#fff' },
  menu: {
    position: 'absolute', top: Platform.OS === 'ios' ? 108 : 72, right: 16,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 8,
    borderWidth: 1, borderColor: COLORS.divider, minWidth: 180,
    ...SHADOWS.premium, zIndex: 999,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  menuItemTxt: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  menuDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 4 },
});

// ── Root Navigator with Stack (for Notifications modal push) ──────────────────
function RootStack({ farmer, onLogout, virtualNodes }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="Main">
        {(props) => <MainTabs {...props} farmer={farmer} onLogout={onLogout} virtualNodes={virtualNodes} />}
      </Stack.Screen>
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ presentation: 'card', gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
}

// ── App Navigator (root gate) ─────────────────────────────────────────────────
export default function AppNavigator() {
  const [isAdminMode,  setIsAdminMode]  = useState(false);
  const [authFarmer,   setAuthFarmer]   = useState(null);
  const [isNewFarmer,  setIsNewFarmer]  = useState(false);
  const [isNodeSetup,  setIsNodeSetup]  = useState(false);
  const [virtualNodes, setVirtualNodes] = useState([]);
  const { t, setLanguage } = useLang();

  const handleLogout = () => {
    setAuthFarmer(null); setIsNewFarmer(false);
    setIsNodeSetup(false); setVirtualNodes([]);
  };

  const handleLogin = (farmer) => {
    setAuthFarmer(farmer);
    setIsNewFarmer(!farmer.hasProfile);
  };

  const handleOnboardingComplete = (data, lang) => {
    setAuthFarmer(f => ({ ...f, ...data, hasProfile: true }));
    if (setLanguage) setLanguage(lang);
    setIsNewFarmer(false);
    setIsNodeSetup(true);
  };

  const handleNodeSetupComplete = (nodes) => {
    setVirtualNodes(nodes);
    setIsNodeSetup(false);
  };

  if (isAdminMode) return <AdminScreen onExitAdmin={() => setIsAdminMode(false)} />;
  if (!authFarmer) return <LoginScreen onLogin={handleLogin} onOpenAdmin={() => setIsAdminMode(true)} />;
  if (isNewFarmer) return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  if (isNodeSetup) return <NodeSetupScreen onComplete={handleNodeSetupComplete} farmerData={authFarmer} />;

  return (
    <NavigationContainer>
      <RootStack farmer={authFarmer} onLogout={handleLogout} virtualNodes={virtualNodes} />
    </NavigationContainer>
  );
}
