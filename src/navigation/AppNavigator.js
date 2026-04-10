import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useLang } from '../context/LanguageContext';

import Dashboard   from '../screens/Dashboard';
import Advisory    from '../screens/Advisory';
import NPKTest     from '../screens/NPKTest';
import FarmMap     from '../screens/FarmMap';
import AdminScreen from '../screens/AdminScreen';
import LoginScreen from '../screens/LoginScreen';

const Drawer = createDrawerNavigator();

let adminTapCount = 0;
let adminTapTimer = null;

export default function AppNavigator() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [authFarmer, setAuthFarmer] = useState(null);
  const { t } = useLang();

  const handleLogout = () => {
    setAuthFarmer(null);
  };

  if (isAdminMode) {
    return <AdminScreen onExitAdmin={() => setIsAdminMode(false)} />;
  }

  if (!authFarmer) {
    return <LoginScreen onLogin={setAuthFarmer} onOpenAdmin={() => setIsAdminMode(true)} />;
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          drawerPosition: 'right', // "safe open drawer nav bar on the right side"
          drawerType: 'front',
          drawerStyle: {
            backgroundColor: COLORS.surface,
            width: 250,
          },
          drawerActiveTintColor: COLORS.primary,
          drawerInactiveTintColor: COLORS.textMuted,
          drawerIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home')     iconName = focused ? 'home'                     : 'home-outline';
            if (route.name === 'Advisory') iconName = focused ? 'book-open-variant'         : 'book-open-page-variant-outline';
            if (route.name === 'NPKTest')  iconName = focused ? 'flask-round-bottom'        : 'flask-round-bottom-outline';
            if (route.name === 'Map')      iconName = focused ? 'map-marker-radius'         : 'map-marker-radius-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Drawer.Screen
          name="Home"
          options={{ title: t('होम', 'Home', 'मुख्यपृष्ठ') }}
        >
          {(props) => (
            <DashboardWrapper
              {...props}
              onLogout={handleLogout}
              onAdmin={() => setIsAdminMode(true)}
              onToggleDrawer={() => props.navigation.toggleDrawer()}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Advisory" component={Advisory} options={{ title: t('सलाह', 'Advisory', 'सल्ला') }} />
        <Drawer.Screen name="NPKTest"  component={NPKTest}  options={{ title: t('मिट्टी जाँच', 'Soil Test', 'माती परीक्षण') }} />
        <Drawer.Screen name="Map"      component={FarmMap}  options={{ title: t('नक्शा', 'Map', 'नकाशा') }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// ─── Wrapper: intercepts __LOGOUT__, __ADMIN__, and __TOGGLE_DRAWER__ from Dashboard ──
function DashboardWrapper({ navigation, route, onLogout, onAdmin, onToggleDrawer }) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {});

    const origNavigate = navigation.navigate.bind(navigation);
    navigation.navigate = (name, params) => {
      if (name === '__LOGOUT__') {
        onLogout();
        return;
      }
      if (name === '__ADMIN__') {
        onAdmin();
        return;
      }
      if (name === '__TOGGLE_DRAWER__') {
        onToggleDrawer();
        return;
      }
      origNavigate(name, params);
    };

    return () => {
      navigation.navigate = origNavigate;
      unsubscribe();
    };
  }, [navigation, onLogout, onAdmin, onToggleDrawer]);

  return <Dashboard navigation={navigation} route={route} />;
}
