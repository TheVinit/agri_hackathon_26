import React, { useState } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '../theme';
import { useLang } from '../context/LanguageContext';

import Dashboard   from '../screens/Dashboard';
import Advisory    from '../screens/Advisory';
import NPKTest     from '../screens/NPKTest';
import FarmMap     from '../screens/FarmMap';
import AdminScreen from '../screens/AdminScreen';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ZoneDetailScreen from '../screens/ZoneDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

let adminTapCount = 0;
let adminTapTimer = null;

function BottomTabNav({ handleLogout, handleAdmin }) {
  const { t } = useLang();
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Home')     iconName = focused ? 'home'                     : 'home-outline';
            if (route.name === 'Advisory') iconName = focused ? 'book-open-variant'         : 'book-open-page-variant-outline';
            if (route.name === 'Analytics') iconName = focused ? 'chart-box'               : 'chart-box-outline';
            if (route.name === 'NPKTest')  iconName = focused ? 'flask-round-bottom'        : 'flask-round-bottom-outline';
            if (route.name === 'Map')      iconName = focused ? 'map-marker-radius'         : 'map-marker-radius-outline';
            if (route.name === 'Alerts')   iconName = focused ? 'bell'                      : 'bell-outline';
            
            // Add custom badge specifically for Alerts
            if (route.name === 'Alerts') {
              return (
                <View style={{ width: 24, height: 24, margin: 5 }}>
                  <MaterialCommunityIcons name={iconName} size={focused ? 28 : 24} color={color} />
                  <View style={{ position: 'absolute', right: -6, top: -3, backgroundColor: '#E53935', borderRadius: 6, width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }} />
                </View>
              );
            }
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
          options={{ title: t('होम', 'Home', 'मुख्यपृष्ठ') }}
          listeners={{
            tabLongPress: () => {
              adminTapCount++;
              clearTimeout(adminTapTimer);
              adminTapTimer = setTimeout(() => { adminTapCount = 0; }, 2000);
              if (adminTapCount >= 3) {
                adminTapCount = 0;
                handleAdmin();
              }
            },
          }}
        >
          {(props) => (
            <DashboardWrapper
              {...props}
              onLogout={handleLogout}
              onAdmin={handleAdmin}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Advisory" component={Advisory} options={{ title: t('सलाह', 'Advisory', 'सल्ला') }} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: t('विश्लेषण', 'Analytics', 'विश्लेषण') }} />
        <Tab.Screen name="NPKTest"  component={NPKTest}  options={{ title: t('मिट्टी जाँच', 'Soil Test', 'माती परीक्षण') }} />
        <Tab.Screen name="Map"      component={FarmMap}  options={{ title: t('नक्शा', 'Map', 'नकाशा') }} />
        <Tab.Screen name="Alerts"   component={AlertsScreen} options={{ title: t('अलर्ट', 'Alerts', 'अलर्ट') }} />
      </Tab.Navigator>
  );
}

// ─── Wrapper: intercepts __LOGOUT__ and __ADMIN__ navigation from Dashboard ──
function DashboardWrapper({ navigation, route, onLogout, onAdmin }) {
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
      origNavigate(name, params);
    };
    return () => {
      navigation.navigate = origNavigate;
      unsubscribe();
    };
  }, [navigation, onLogout, onAdmin]);

  return <Dashboard navigation={navigation} route={route} />;
}

export default function AppNavigator() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  if (isAdminMode) {
    return <AdminScreen onExitAdmin={() => setIsAdminMode(false)} />;
  }

  return (
    <NavigationContainer>
       <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onOpenAdmin={() => setIsAdminMode(true)} />}
           </Stack.Screen>
          <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} />
          <Stack.Screen name="App">
            {(props) => (
              <BottomTabNav 
                {...props} 
                handleAdmin={() => setIsAdminMode(true)} 
                handleLogout={async () => {
                  try {
                    await AsyncStorage.removeItem('authFarmer');
                    props.navigation.replace('Login');
                  } catch (e) {
                    console.error('Failed to log out', e);
                  }
                }} 
              />
            )}
          </Stack.Screen>
       </Stack.Navigator>
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
