import React from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react-vite';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

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
 */
await LoadSkiaWeb({ locateFile: (file) => `/canvaskit/${file}` });

/** 390×844 — iPhone 15 logical size, канвас wireframe и референса. */
const PHONE = { width: 390, height: 844 };

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
      );
    },
  ],
};

export default preview;
