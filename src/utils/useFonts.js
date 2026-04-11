import { useFonts } from 'expo-font';
import { Outfit_700Bold, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
  });

  return { fontsLoaded };
};
