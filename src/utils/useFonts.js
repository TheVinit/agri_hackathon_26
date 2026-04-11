import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    'Outfit-Bold': {
      uri: Platform.OS === 'web' 
        ? 'https://fonts.gstatic.com/s/outfit/v11/Q8bcSve67nw3dqK9fK97V6A.woff2' 
        : require('@expo-google-fonts/outfit/Outfit_700Bold.ttf'),
    },
    'Outfit-SemiBold': {
      uri: Platform.OS === 'web' 
        ? 'https://fonts.gstatic.com/s/outfit/v11/Q8bcSve67nw3dqK9fK97V6A.woff2'
        : require('@expo-google-fonts/outfit/Outfit_600SemiBold.ttf'),
    },
    'Inter-Regular': {
      uri: Platform.OS === 'web' 
        ? 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-EkA.woff2' 
        : require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    },
    'Inter-Medium': {
      uri: Platform.OS === 'web' 
        ? 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5Z-kJ.woff2' 
        : require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    },
    'JetBrainsMono-Regular': {
      uri: Platform.OS === 'web' 
        ? 'https://fonts.gstatic.com/s/jetbrainsmono/v18/t6fq21_ID81Lcl5_MhWvC8W8.woff2' 
        : require('@expo-google-fonts/jetbrains-mono/JetBrainsMono_400Regular.ttf'),
    },
  });

  return { fontsLoaded };
};
