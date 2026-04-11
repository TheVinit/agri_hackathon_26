import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/context/LanguageContext';
import { NotificationProvider } from './src/context/NotificationContext';

export default function App() {
  return (
    <PaperProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </LanguageProvider>
    </PaperProvider>
  );
}
