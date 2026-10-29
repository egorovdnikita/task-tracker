import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MenuHost } from '../src/components';
import { ThemeProvider, useTheme } from '../src/theme';
import { NotificationHost } from '../src/features/notify';

/**
 * Корень приложения.
 *
 * `(tabs)` — вкладки, редактор и модалки лежат рядом и уезжают поверх них.
 * Всё, что связано с первым запуском, аккаунтом и синхронизацией, здесь
 * отсутствует намеренно: приложение работает локально и без входа, так что
 * маршрутов онбординга и авторизации у него нет.
 */
export default function RootLayout() {
  return (
    // Корень жестов нужен свайпам по карточке: без него распознаватели
    // `react-native-gesture-handler` не получают касания.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          {/* Система dark-only, поэтому статус-бар всегда светлый. */}
          <StatusBar style="light" />
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
        // Шапка монохромная: фирменный цвет остаётся главным действиям экрана.
        headerTintColor: theme.hex.label,
        // Заголовок белый, а не акцентный: без явного цвета нативная шапка
        // красит его в `headerTintColor`, и название экрана спорило с кнопками.
        headerTitleStyle: { ...theme.headerText('headline', 'semibold'), color: theme.hex.label },
        /*
          Шапка прозрачная и без размытия.

          Свет в системе Opal идёт из-за верхней кромки экрана: подсветка фона
          лежит под шапкой и статус-баром. Плотная шапка срезала бы его ровно
          там, где он ярче всего, и оставила чёрную полосу поперёк экрана.
          Размытие тоже не нужно — заголовок встроенный, под ним не едет
          контент, а системный материал подмешивал бы свой серый к чёрному.
        */
        headerTransparent: true,
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
          /*
            Создание — не `formSheet`, а прозрачный модальный экран со своей
            панелью у нижнего края.

            Системный лист держится за детент, а не за клавиатуру: на 0.55
            клавиатура закрывала его нижнюю половину вместе с чипами и кнопкой
            отправки, а сверху оставалась пустая полоса над полем ввода.
            Панель здесь сидит ровно на кромке клавиатуры и высотой равна
            содержимому — пустоты над ней нет, а за ней виден список.

            Шапки нет: шит приехал по нажатию на плюс, в нём мигает курсор,
            и заголовок «Новая заметка» повторял бы очевидное.
          */
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
          // Фон экрана из общих настроек стека — сплошной чёрный, и за ним
          // прозрачный модальный экран ничего не показывал: оверлей с блюром
          // лежал на чёрном, а не на списке. Здесь фон снят.
          contentStyle: { backgroundColor: 'transparent' },
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
      <Stack.Screen
        name="capture/voice"
        options={{ presentation: 'modal', headerTransparent: false, headerStyle: { backgroundColor: '#000000' } }}
      />
      <Stack.Screen
        name="capture/scan"
        options={{ presentation: 'fullScreenModal', headerTransparent: false, headerStyle: { backgroundColor: '#000000' } }}
      />
      <Stack.Screen
        name="capture/sketch"
        options={{ presentation: 'modal', headerTransparent: false, headerStyle: { backgroundColor: '#000000' } }}
      />

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
