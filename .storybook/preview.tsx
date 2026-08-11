import React from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react-vite';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../src/theme/ThemeProvider';
import { theme } from '../src/theme/tokens';

/**
 * В приложении Skia — нативный модуль, в вебе её роль играет CanvasKit.
 *
 * Ждём именно здесь и именно `await` на верхнем уровне: веб-сборка Skia
 * делает `Skia = JsiSkApi(global.CanvasKit)` прямо в теле модуля, то есть
 * CanvasKit обязан существовать до того, как что-либо импортирует Skia.
 * Истории Storybook подгружает динамическими `import()` уже после того, как
 * этот модуль выполнился, — так что порядок соблюдается.
 *
 * `staticDirs` в main.ts отдаёт по /canvaskit/ ровно ту сборку CanvasKit
 * (`full`), которую импортирует загрузчик Skia, — чтобы не ходить на чужой CDN.
 *
 * Путь берётся от базы документа, а не от корня домена. На GitHub Pages
 * витрина лежит в подпапке `/task-tracker/`, и абсолютный `/canvaskit/…`
 * уходил в 404: `await` на верхнем уровне не разрешался никогда, и вся
 * витрина навсегда оставалась на экране загрузки.
 *
 * По той же причине здесь `catch`: если CanvasKit не поднялся, лучше отдать
 * витрину без Skia — сломаются отдельные истории, а не всё разом.
 */
const canvasKitBase = new URL('.', document.baseURI).href;

try {
  await LoadSkiaWeb({ locateFile: (file) => `${canvasKitBase}canvaskit/${file}` });
} catch (error) {
  console.error('[storybook] CanvasKit не загрузился, истории на Skia работать не будут', error);
}

/** 390×844 — iPhone 15 logical size, канвас wireframe и референса. */
const PHONE = { width: 390, height: 844 };

/**
 * Метрики safe area того же iPhone 15. В браузере системных отступов нет,
 * а компоненты их спрашивают — панель вкладок садится над индикатором
 * «домой», подсветка фона уходит под часы. Подставляем реальные значения,
 * иначе витрина показывала бы раскладку, которой на устройстве не бывает.
 */
const PHONE_METRICS = {
  frame: { x: 0, y: 0, width: PHONE.width, height: PHONE.height },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

/** Для историй отдельных компонентов рамки телефона нет — отступов тоже. */
const FLAT_METRICS = {
  frame: { x: 0, y: 0, width: PHONE.width, height: PHONE.height },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Система dark-only — витрина всегда на чёрном, как и приложение.
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Введение', 'Основы', 'Компоненты', 'Экраны'],
      },
    },
    a11y: { test: 'todo' },
  },

  decorators: [
    (Story, context) => {
      // `device: true` оборачивает историю в рамку телефона — для экранов.
      const device = context.parameters.device === true;

      return (
        <SafeAreaProvider initialMetrics={device ? PHONE_METRICS : FLAT_METRICS}>
          <ThemeProvider>
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: device ? 32 : theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
                padding: device ? 0 : theme.spacing.xl,
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
