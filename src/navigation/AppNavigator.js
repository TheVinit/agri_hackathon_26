import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useLang } from '../context/LanguageContext';

import Dashboard   from '../screens/Dashboard';
import Advisory    from '../screens/Advisory';
import NPKTest     from '../screens/NPKTest';
import FarmMap     from '../screens/FarmMap';
import AdminScreen from '../screens/AdminScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();

let adminTapCount = 0;
let adminTapTimer = null;

export default function AppNavigator() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [authFarmer, setAuthFarmer] = useState(null);
  const { t } = useLang();

  if (isAdminMode) {
    return <AdminScreen onExitAdmin={() => setIsAdminMode(false)} />;
  }

  if (!authFarmer) {
    return <LoginScreen onLogin={setAuthFarmer} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            if (route.name === 'Advisory') iconName = focused ? 'book-open-variant' : 'book-open-page-variant-outline';
            if (route.name === 'NPKTest') iconName = focused ? 'flask-round-bottom' : 'flask-round-bottom-outline';
            if (route.name === 'Map') iconName = focused ? 'map-marker-radius' : 'map-marker-radius-outline';
            return <MaterialCommunityIcons name={iconName} size={focused ? 28 : 24} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        })}
      >
        <Tab.Screen
          name="Home"
          component={Dashboard}
          options={{ title: t('होम', 'Home', 'मुख्यपृष्ठ') }}
          listeners={{
            tabLongPress: () => {
              adminTapCount++;
              clearTimeout(adminTapTimer);
              adminTapTimer = setTimeout(() => { adminTapCount = 0; }, 2000);
              if (adminTapCount >= 3) {
                adminTapCount = 0;
                setIsAdminMode(true);
              }
            },
          }}
        />
        <Tab.Screen name="Advisory" component={Advisory} options={{ title: t('सलाह', 'Advisory', 'सल्ला') }} />
        <Tab.Screen name="NPKTest" component={NPKTest} options={{ title: t('मिट्टी जाँच', 'Soil Test', 'माती परीक्षण') }} />
        <Tab.Screen name="Map" component={FarmMap} options={{ title: t('नक्शा', 'Map', 'नकाशा') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 90 : 75,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
    paddingTop: 10,
    position: 'absolute',
    elevation: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  tabItem: {
    paddingTop: 4,
  },
});
