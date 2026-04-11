import { useFonts } from 'expo-font';
import { Platform } from 'react-native';
import { 
  Outfit_400Regular,
  Outfit_600SemiBold, 
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';
import { 
  Inter_400Regular, 
  Inter_500Medium 
} from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
  });

  // On web, fonts are typically handled by CSS/CDN or browser defaults if not strictly bundled
  return { fontsLoaded: Platform.OS === 'web' ? true : fontsLoaded };
};
