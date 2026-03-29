import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, THEME } from '../theme';

import Dashboard from '../screens/Dashboard';
import NPKTest from '../screens/NPKTest';
import Advisory from '../screens/Advisory';
import FarmMap from '../screens/FarmMap';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer theme={THEME}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === 'Dashboard') iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            else if (route.name === 'NPK Test') iconName = focused ? 'flask-round-bottom' : 'flask-round-bottom-outline';
            else if (route.name === 'Advisory') iconName = focused ? 'book-open-variant' : 'book-open-page-variant-outline';
            else if (route.name === 'Farm Map') iconName = focused ? 'map-marker-radius' : 'map-marker-radius-outline';
            
            return (
              <View style={focused ? styles.activeTabIcon : null}>
                <MaterialCommunityIcons name={iconName} size={focused ? 24 : 22} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          headerShown: false, // We use custom headers in screens now
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: { paddingVertical: 8 },
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="NPK Test" component={NPKTest} />
        <Tab.Screen name="Advisory" component={Advisory} />
        <Tab.Screen name="Farm Map" component={FarmMap} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 10,
    paddingTop: 5,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: -2,
  },
  activeTabIcon: {
    backgroundColor: 'rgba(27, 94, 32, 0.08)',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 15,
  },
});
