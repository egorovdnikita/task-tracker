import React from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, palette, type AppearancePreference } from '../src/theme';

/** 390×844 — логический размер iPhone 15, канвас вайрфреймов. */
const PHONE = { width: 390, height: 844 };

/**
 * Метрики safe area того же iPhone. В браузере системных отступов нет,
 * а компоненты их спрашивают — плавающая кнопка садится на самый низ,
 * панель выделения наезжает на индикатор «домой».
 */
const PHONE_METRICS = {
  frame: { x: 0, y: 0, width: PHONE.width, height: PHONE.height },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

const FLAT_METRICS = {
  frame: { x: 0, y: 0, width: PHONE.width, height: PHONE.height },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Фон задаёт тема, а не Storybook: у системы фон — такой же токен, как
    // и всё остальное, и подменять его настройкой витрины значит показывать
    // компонент на подложке, которой в приложении не бывает.
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Введение', 'Основы', 'Компоненты', 'Только на устройстве'],
      },
    },
    a11y: { test: 'todo' },
  },

  /** Переключатель схемы в тулбаре — обе темы проверяются на одном экране. */
  globalTypes: {
    scheme: {
      description: 'Цветовая схема',
      toolbar: {
        title: 'Схема',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Светлая' },
          { value: 'dark', title: 'Тёмная' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: { scheme: 'light' },

  decorators: [
    (Story, context) => {
      const scheme = (context.globals.scheme ?? 'light') as AppearancePreference;
      // `device: true` оборачивает историю в рамку телефона — для экранов.
      const device = context.parameters.device === true;
      const grouped = context.parameters.grouped === true;

      const background = grouped
        ? palette.systemGroupedBackground[scheme === 'dark' ? 'dark' : 'light']
        : palette.systemBackground[scheme === 'dark' ? 'dark' : 'light'];

      return (
        <SafeAreaProvider initialMetrics={device ? PHONE_METRICS : FLAT_METRICS}>
          <ThemeProvider preference={scheme}>
            <View
              style={{
                backgroundColor: background,
                borderRadius: device ? 32 : 16,
                borderWidth: 1,
                borderColor: palette.separator[scheme === 'dark' ? 'dark' : 'light'],
                overflow: 'hidden',
                padding: device ? 0 : 20,
                width: device ? PHONE.width : undefined,
                height: device ? PHONE.height : undefined,
                minWidth: device ? undefined : 320,
              }}
            >
              <Story />
            </View>
          </ThemeProvider>
        </SafeAreaProvider>
      );
    },
  ],
};

export default preview;
