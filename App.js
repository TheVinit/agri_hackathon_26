import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/context/LanguageContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ToastProvider } from './src/context/ToastContext';
import { useAppFonts } from './src/utils/useFonts';
import OfflineBanner from './src/components/OfflineBanner';
import VoicePlaybackOverlay from './src/components/VoicePlaybackOverlay';

export default function App() {
  const { fontsLoaded } = useAppFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <LanguageProvider>
          <NotificationProvider>
            <ToastProvider>
              <OfflineBanner />
              <AppNavigator />
              <VoicePlaybackOverlay />
            </ToastProvider>
          </NotificationProvider>
        </LanguageProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
