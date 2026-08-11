import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';
import type { Plugin as EsbuildPlugin } from 'esbuild';

/**
 * Пакеты Expo и React Native публикуются как `.js` с JSX внутри.
 * Vite такие файлы не парсит, поэтому прогоняем их через esbuild с loader: 'jsx'.
 */
const RN_JSX_PACKAGES =
  /node_modules\/(expo-linear-gradient|expo-blur|@expo\/vector-icons|react-native-svg|@react-native|react-native-safe-area-context)\//;

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
 * Reanimated не «анимирует функции» — он их воркле́тизирует на этапе сборки.
 * В приложении это делает babel.config.js через Metro, а Vite про babel не
 * знает, и на вебе колбэк `useDerivedValue` падает с «Failed to create a
 * worklet». Прогоняем свой код через тот же плагин.
 *
 * `enforce: 'post'` — чтобы прийти уже после esbuild/JSX-трансформа и парсить
 * обычный JS, без настройки парсеров TS и JSX.
 */
const WORKLET_HOOKS = /useDerivedValue|useAnimatedStyle|useFrameCallback|useAnimatedReaction|'worklet'|"worklet"/;

/** Наш код плюс библиотеки, которые сами полагаются на плагин у потребителя. */
const NEEDS_WORKLETS =
  /\/src\/|node_modules\/(@shopify\/react-native-skia|react-native-reanimated|react-native-worklets)\//;

const workletize = async (code: string, filename: string) => {
  const babel = await import('@babel/core');
  const result = await babel.transformAsync(code, {
    filename,
    babelrc: false,
    configFile: false,
    plugins: ['react-native-worklets/plugin'],
    sourceMaps: true,
  });
  return result?.code ? { code: result.code, map: result.map } : null;
};

const reanimatedWorklets = (): Plugin => ({
  name: 'reanimated-worklets',
  enforce: 'post',
  async transform(code, id) {
    if (!NEEDS_WORKLETS.test(id) || !WORKLET_HOOKS.test(code)) return null;
    // Плагин воркле́тов читает исходник с диска по `filename`, а Vite вешает
    // на id строку запроса (?v=…) — с ней путь не открывается.
    return workletize(code, id.split('?')[0]);
  },
});

/**
 * То же самое, но для пре-бандла зависимостей: он идёт esbuild'ом мимо
 * плагинов Vite. Исключить эти пакеты из пре-бандла нельзя — они тянут
 * CommonJS, который в дев-режиме браузеру не отдать.
 */
const workletsInDeps = (): EsbuildPlugin => ({
  name: 'reanimated-worklets-deps',
  setup(build) {
    build.onLoad(
      {
        filter:
          /node_modules\/(@shopify\/react-native-skia|react-native-reanimated|react-native-worklets)\/.*\.(js|mjs)$/,
      },
      async (args) => {
        const { readFile } = await import('node:fs/promises');
        const code = await readFile(args.path, 'utf8');
        if (!WORKLET_HOOKS.test(code)) return null;
        const out = await workletize(code, args.path);
        return out ? { contents: out.code, loader: 'jsx' as const } : null;
      },
    );
  },
});

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },

  staticDirs: [
    // Те же .ttf, что грузит приложение, — витрина отдаёт их по /fonts/…
    { from: '../node_modules/@expo-google-fonts/rubik', to: '/fonts' },
    // На устройстве Skia нативная, в браузере — CanvasKit (WASM, ~7.6 МБ).
    // Кладём рядом с витриной, чтобы не тянуть с чужого CDN. Только сборка
    // `full` — её импортирует загрузчик Skia; остальные две лишние 16 МБ.
    { from: '../node_modules/canvaskit-wasm/bin/full', to: '/canvaskit' },
  ],

  async viteFinal(config) {
    const { mergeConfig } = await import('vite');

    const merged = mergeConfig(config, {
      plugins: [reactNativeJsx(), reanimatedWorklets()],
      // Примитивы React Native рендерятся через react-native-web, поэтому один
      // и тот же исходник питает и приложение, и витрину.
      resolve: {
        // Массив, а не объект: порядок важен — частный алиас должен сработать
        // раньше общего префикса `react-native`.
        alias: [
          // Skia на вебе тянет внутренний путь RN. В react-native-web 0.21
          // такой раскладки нет, но нужный `getAssetByID` лежит здесь.
          {
            find: 'react-native/Libraries/Image/AssetRegistry',
            replacement: 'react-native-web/dist/modules/AssetRegistry',
          },
          { find: /^react-native$/, replacement: 'react-native-web' },
          { find: /^react-native\//, replacement: 'react-native-web/' },
        ],
      },
      define: {
        global: 'window',
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
        // Reanimated и worklets проверяют `process.env.JEST`, а в браузере
        // `process` не существует. Единственное их обращение к `process` —
        // это, поэтому подменяем точечно, а не шимим весь объект.
        'process.env.JEST': 'undefined',
      },
      optimizeDeps: {
        include: [
          'react-native-web',
          // CommonJS-зависимости Skia: без пре-бандла именованный и дефолтный
          // импорт из них браузеру не отдать.
          'canvaskit-wasm/bin/full/canvaskit',
          'react-reconciler',
          'react-reconciler/constants',
        ],
        esbuildOptions: {
          loader: { '.js': 'jsx' },
          resolveExtensions: ['.web.js', '.js', '.ts', '.tsx'],
          // `define` из основного конфига на пре-бандл не распространяется.
          define: { 'process.env.JEST': 'undefined' },
          plugins: [workletsInDeps()],
        },
      },
      // Шрифты иконок @expo/vector-icons — бинарные ассеты, не модули.
      assetsInclude: ['**/*.ttf'],
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
