import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { GameProvider } from '@/context/GameContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';

// BridgeTime uses immersive stack navigation, no tabs
export const unstable_settings = {
  initialRouteName: 'index',
};

// Custom theme for BridgeTime with dark blue-green background
const BridgeTimeLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.shared.river,
    background: Colors.light.shared.background,
    card: Colors.light.shared.card,
    text: Colors.light.past.text,
    border: Colors.light.shared.border,
  },
};

const BridgeTimeDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.shared.river,
    background: Colors.dark.past.background, // Dark blue-green background
    card: Colors.dark.shared.card,
    text: Colors.dark.past.text,
    border: Colors.dark.shared.border,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? BridgeTimeDarkTheme : BridgeTimeLightTheme;

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && Platform.OS !== 'web') {
    return null;
  }

  return (
    <GameProvider>
      <ThemeProvider value={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          {/* Welcome/Home Screen */}
          <Stack.Screen name="index" />
          
          {/* Game Setup - Player Selection */}
          <Stack.Screen 
            name="setup" 
            options={{ animation: 'slide_from_bottom' }}
          />
          
          {/* Main Game View */}
          <Stack.Screen 
            name="game" 
            options={{ animation: 'fade' }}
          />
          
          {/* QR Scanner Modal */}
          <Stack.Screen 
            name="scanner" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          
          {/* Question Screen */}
          <Stack.Screen 
            name="question" 
            options={{ 
              presentation: 'modal',
              animation: 'fade_from_bottom',
            }}
          />
          
          {/* Victory Screen */}
          <Stack.Screen 
            name="victory" 
            options={{ 
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GameProvider>
  );
}
