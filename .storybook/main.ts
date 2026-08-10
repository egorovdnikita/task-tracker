import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },

  async viteFinal(config) {
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      // React Native primitives are rendered through react-native-web so the
      // exact same component source powers the app and the docs site.
      resolve: {
        alias: { 'react-native': 'react-native-web' },
        extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
      },
      define: {
        global: 'window',
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      },
      optimizeDeps: {
        include: ['react-native-web'],
        esbuildOptions: { loader: { '.js': 'jsx' }, resolveExtensions: ['.web.js', '.js', '.ts', '.tsx'] },
      },
    });
  },
};

export default config;
