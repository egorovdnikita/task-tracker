import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';

/**
 * Пакеты Expo и React Native публикуются как `.js` с JSX внутри.
 * Vite такие файлы не парсит, поэтому прогоняем их через esbuild с loader: 'jsx'.
 */
const RN_JSX_PACKAGES =
  /node_modules\/(expo-blur|expo-glass-effect|expo-symbols|@react-native|react-native-safe-area-context)\//;

const reactNativeJsx = (): Plugin => ({
  name: 'jsx-in-react-native-packages',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.endsWith('.js') || !RN_JSX_PACKAGES.test(id)) return null;
    const { transformWithEsbuild } = await import('vite');
    return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
  },
});

/**
 * Витрина.
 *
 * Показывает то, что react-native-web умеет отрисовать честно: цвета,
 * типографику, метрики и компоненты, собранные из примитивов RN. Всё, что
 * рисует сама система — жидкое стекло, SF Symbols, панель вкладок, тумблер,
 * меню действий, — в браузере не существует, и подделывать его здесь нельзя:
 * витрина, которая врёт про системный компонент, хуже, чем её отсутствие.
 * Такие вещи описаны страницами в разделе «Только на устройстве».
 *
 * Skia и её CanvasKit отсюда ушли вместе с декорациями, которые на них
 * держались: в системе, собранной из системных элементов, своему рисованию
 * шейдерами места нет.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  // MDX здесь разбирается базовым Markdown, без remark-gfm: таблицы в
  // страницах документации не используются — они вываливались бы в текст
  // строкой с пайпами. Списки читаются везде одинаково.
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },

  async viteFinal(config) {
    const { mergeConfig } = await import('vite');

    const merged = mergeConfig(config, {
      plugins: [reactNativeJsx()],
      // Примитивы React Native рендерятся через react-native-web, поэтому один
      // и тот же исходник питает и приложение, и витрину.
      resolve: {
        alias: [
          { find: /^react-native$/, replacement: 'react-native-web' },
          { find: /^react-native\//, replacement: 'react-native-web/' },
        ],
      },
      define: {
        global: 'window',
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      },
      optimizeDeps: {
        include: ['react-native-web'],
        esbuildOptions: {
          loader: { '.js': 'jsx' },
          resolveExtensions: ['.web.js', '.js', '.ts', '.tsx'],
        },
      },
    });

    // Присваиваем, а не мержим: mergeConfig склеивает массивы, и дефолтные
    // расширения Storybook встают перед нашими — тогда пакеты Expo резолвятся
    // в нативную реализацию (`BlurView.js`) вместо веб-версии (`BlurView.web.js`).
    merged.resolve = {
      ...merged.resolve,
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
    };

    return merged;
  },
};

export default config;
