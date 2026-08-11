module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Плагин worklets обязан идти последним: он переписывает функции,
    // помеченные 'worklet', и Reanimated 4 без него молча не анимирует.
    plugins: ['react-native-worklets/plugin'],
  };
};
