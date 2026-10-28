import React from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react-vite';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, palette } from '../src/theme';

/**
 * В приложении Skia — нативный модуль, в браузере её роль играет CanvasKit.
 *
 * Ждём на верхнем уровне модуля: веб-сборка Skia делает
 * `Skia = JsiSkApi(global.CanvasKit)` прямо при импорте, то есть CanvasKit
 * обязан существовать раньше, чем что-либо импортирует Skia. Истории
 * Storybook подгружаются динамически уже после этого модуля.
 *
 * Путь — от базы документа, а не от корня домена: на GitHub Pages витрина
 * лежит в подпапке, и абсолютный `/canvaskit/…` уходил в 404. `catch` —
 * чтобы без CanvasKit сломался только орб, а не вся витрина.
 */
const canvasKitBase = new URL('.', document.baseURI).href;

try {
  await LoadSkiaWeb({ locateFile: (file) => `${canvasKitBase}canvaskit/${file}` });
} catch (error) {
  console.error('[storybook] CanvasKit не загрузился, орб работать не будет', error);
}

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

  decorators: [
    (Story, context) => {
      // `device: true` оборачивает историю в рамку телефона — для экранов.
      const device = context.parameters.device === true;
      const grouped = context.parameters.grouped === true;

      const background = grouped
        ? palette.systemGroupedBackground.dark
        : palette.systemBackground.dark;

      return (
        <SafeAreaProvider initialMetrics={device ? PHONE_METRICS : FLAT_METRICS}>
          <ThemeProvider>
            <View
              style={{
                backgroundColor: background,
                borderRadius: device ? 32 : 16,
                borderWidth: 1,
                borderColor: palette.separator.dark,
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
