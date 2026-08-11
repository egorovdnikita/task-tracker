import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Rubik_300Light, Rubik_400Regular, useFonts } from '@expo-google-fonts/rubik';

import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  // Ровно два начертания — столько же, сколько знает src/theme/fonts.ts.
  const [fontsLoaded] = useFonts({ Rubik_300Light, Rubik_400Regular });

  // Держим чёрный экран до загрузки Rubik: подмена системным шрифтом
  // на первом кадре заметна как скачок метрик.
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* Система dark-only, поэтому статус-бар всегда светлый. */}
        <StatusBar style="light" />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
