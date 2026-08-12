import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '../src/theme';
import { NotificationHost } from '../src/features/notify';
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
    // Корень жестов нужен свайпам по карточке: без него распознаватели
    // `react-native-gesture-handler` не получают касания.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider preference={appearance}>
          {/* `auto` — статус-бар следует схеме: тёмные буквы на светлой, светлые
              на тёмной. Фиксировать его значит получить невидимые часы в одной
              из двух тем. */}
          <StatusBar style="auto" />
          <RootStack />
          {/* Сообщения и отмена — поверх всего и на одном месте на всех
              экранах: искать их глазами не нужно. */}
          <NotificationHost />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const RootStack = () => {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.hex.accent,
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
        Шиты, а не экраны: создание, перенос, теги и напоминание — выбор внутри
        контекста, и контекст должен остаться виден за ними. `formSheet` даёт
        настоящий системный лист с ручкой, инерцией и закрытием свайпом.

        Детенты подобраны под реальную высоту содержимого, а не назначены
        одинаковыми: заниженный детент обрезал шит по нижнему краю — у тегов
        за кромкой оставались и подсказки, и назначенные чипы.
      */}
      <Stack.Screen
        name="create"
        options={{
          presentation: 'formSheet',
          // Клавиатура поднята сразу, поэтому нижний детент — половина экрана:
          // выше него шит уезжает под клавиатуру, ниже — прячет поле описания.
          sheetAllowedDetents: [0.55, 0.95],
          sheetGrabberVisible: true,
          sheetCornerRadius: theme.radius.xxl,
          title: 'Новая заметка',
        }}
      />
      <Stack.Screen
        name="move"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.6, 0.95],
          sheetGrabberVisible: true,
          sheetCornerRadius: theme.radius.xxl,
          title: 'Переместить',
        }}
      />
      <Stack.Screen
        name="tags"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.75, 0.95],
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
          // Готовые сроки, точное время и предупреждение о выключенных
          // уведомлениях в половину экрана не помещались: первая строка
          // уезжала под заголовок шита.
          sheetAllowedDetents: [0.8, 0.95],
          sheetGrabberVisible: true,
          sheetCornerRadius: theme.radius.xxl,
          title: 'Напоминание',
        }}
      />
    </Stack>
  );
};
