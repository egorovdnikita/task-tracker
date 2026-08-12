import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MenuHost } from '../src/components';
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
          {/* Меню смонтировано в корне, а не в экране: оно всплывает поверх
              шапки и панели вкладок, и вложенное в экран было бы обрезано
              его границами. Из какой точки расти, ему сообщает кнопка. */}
          <MenuHost />
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
        /*
          Шапка того же цвета, что страница под ней, и без размытия.

          Раньше она была прозрачной с `systemChromeMaterial`. Материал —
          системный и правильный, но он рассчитан на системную же подложку:
          поверх нашей тёплой он подмешивал свой холодный почти-белый, и на
          каждом экране сверху лежала светлая полоса шириной в шапку. Видно
          это было именно на модалках, где полоса упиралась в тёплый лист.

          Размытие имеет смысл, когда под шапкой едет контент. Здесь заголовок
          встроенный, содержимое начинается под ним, и размывать нечего —
          поэтому плоская заливка ровно того же цвета, что и страница.
        */
        headerTransparent: false,
        headerStyle: { backgroundColor: theme.hex.systemGroupedBackground },
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
          /*
            Шапки у шита создания нет.

            Заголовок «Новая заметка» повторял то, что и так очевидно: шит
            приехал по нажатию на плюс, в нём мигает курсор в пустом поле.
            Взамен строка шапки отдана содержимому — в референсе на её месте
            сразу стоит текст заметки, и первое, что видит человек, это его
            собственный ввод, а не подпись к нему.
          */
          headerShown: false,
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
      {/*
        Шита тегов больше нет. Он открывался пустым: своих тегов у заметки не
        было, поле «Название тега» не нажималось, и единственным содержимым
        оказывалась подсказка набрать `#тег` в другом месте. Теги стали тремя
        заданными и ставятся чипами прямо в заметке и в шите создания — целый
        экран под три касания не нужен.
      */}
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
