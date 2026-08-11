import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../src/theme/ThemeProvider';
import { colors } from '../src/theme/tokens';

/**
 * Корень приложения на файловых роутах.
 *
 * `(tabs)` — группа с нативной панелью вкладок, `editor` лежит рядом и
 * поэтому уезжает поверх неё обычным push: панель на редакторе не нужна.
 */
export default function RootLayout() {
  // Шрифт больше не грузится: SF Pro системный, ждать нечего — и заодно
  // ушёл чёрный кадр, который держался до загрузки Rubik.
  return (
    // Чёрный на самом корне: слой под навигатором — последнее, что просвечивает
    // сквозь прозрачные поверхности, и по умолчанию он белый.
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <ThemeProvider>
        {/* Система dark-only, поэтому статус-бар всегда светлый. */}
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="editor" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
