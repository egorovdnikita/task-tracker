import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { useNotesStore } from './src/store/useNotesStore';

export default function App() {
  const scheme = useNotesStore((s) => s.settings.scheme);

  return (
    <SafeAreaProvider>
      <ThemeProvider scheme={scheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
