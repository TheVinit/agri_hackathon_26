import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    // Native only loading
    ...(Platform.OS !== 'web' ? {
      'Outfit-Bold': require('@expo-google-fonts/outfit/Outfit_700Bold.ttf'),
      'Outfit-SemiBold': require('@expo-google-fonts/outfit/Outfit_600SemiBold.ttf'),
      'Inter-Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
      'Inter-Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
      'JetBrainsMono-Regular': require('@expo-google-fonts/jetbrains-mono/JetBrainsMono_400Regular.ttf'),
    } : {}),
  });

  return { fontsLoaded: Platform.OS === 'web' ? true : fontsLoaded };
};
