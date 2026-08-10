import React from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react-vite';

import { ThemeProvider } from '../src/theme/ThemeProvider';
import { buildTheme, type ColorScheme } from '../src/theme/tokens';

/** 390×844 — iPhone 15 logical size, the canvas the wireframe was drawn on. */
const PHONE = { width: 390, height: 844 };

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: [
          'Введение',
          'Основы',
          ['Design tokens', 'Icon', 'AppText'],
          'Компоненты',
          'Экраны',
          ['Notes List', 'Note Editor', 'Search', 'Settings'],
        ],
      },
    },
    a11y: { test: 'todo' },
  },

  globalTypes: {
    scheme: {
      description: 'Цветовая схема',
      toolbar: {
        title: 'Тема',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Светлая', icon: 'sun' },
          { value: 'dark', title: 'Тёмная', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: { scheme: 'light' },

  decorators: [
    (Story, context) => {
      const scheme = (context.globals.scheme ?? 'light') as ColorScheme;
      const theme = buildTheme(scheme);
      // `device: true` wraps the story in a phone frame — used by screen stories.
      const device = context.parameters.device === true;

      return (
        <ThemeProvider scheme={scheme}>
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: device ? 28 : theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
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
      );
    },
  ],
};

export default preview;
