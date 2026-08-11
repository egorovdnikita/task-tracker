import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '../src/theme';
import { useNotesStore } from '../src/store/useNotesStore';

/**
 * Корень приложения.
 *
 * `(tabs)` — вкладки, редактор и модалки лежат рядом и уезжают поверх них.
 * Всё, что связано с первым запуском, аккаунтом и синхронизацией, здесь
 * отсутствует намеренно: приложение работает локально и без входа, так что
 * маршрутов онбординга и авторизации у него нет.
 */
export default function RootLayout() {
  const appearance = useNotesStore((s) => s.settings.appearance);

  return (
    <SafeAreaProvider>
      <ThemeProvider preference={appearance}>
        {/* `auto` — статус-бар следует схеме: тёмные буквы на светлой, светлые
            на тёмной. Фиксировать его значит получить невидимые часы в одной
            из двух тем. */}
        <StatusBar style="auto" />
        <RootStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const RootStack = () => {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.hex.systemBlue,
        headerTitleStyle: theme.headerText('headline', 'semibold'),
        // Шапка прозрачная и размытая — системное поведение: под ней едет
        // контент, а не белый прямоугольник.
        headerTransparent: true,
        headerBlurEffect: theme.scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.hex.systemGroupedBackground },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="note/[id]"
        options={{ headerBackButtonDisplayMode: 'minimal', title: '' }}
      />

      {/*
        Шиты, а не экраны: перенос, теги и напоминание — выбор внутри контекста,
        и контекст должен остаться виден за ними. `formSheet` даёт настоящий
        системный лист с ручкой, инерцией и закрытием свайпом.
      */}
      <Stack.Screen
        name="move"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5, 0.9],
          sheetGrabberVisible: true,
          sheetCornerRadius: theme.radius.xxl,
          title: 'Переместить',
        }}
      />
      <Stack.Screen
        name="tags"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.6, 0.95],
          sheetGrabberVisible: true,
          sheetCornerRadius: theme.radius.xxl,
          title: 'Теги',
        }}
      />
      {/*
        Захват (плита 04) — полноэкранные модалки, а не листы: камера и запись
        занимают весь экран по своей природе, и оставлять под ними полоску
        заметки незачем.
      */}
      <Stack.Screen name="capture/voice" options={{ presentation: 'modal' }} />
      <Stack.Screen name="capture/scan" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="capture/sketch" options={{ presentation: 'modal' }} />

      <Stack.Screen
        name="reminder"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.55],
          sheetGrabberVisible: true,
          sheetCornerRadius: theme.radius.xxl,
          title: 'Напоминание',
        }}
      />
    </Stack>
  );
};
