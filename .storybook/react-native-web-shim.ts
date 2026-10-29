/**
 * `react-native` для витрины: react-native-web плюс два имени, которых в нём нет.
 *
 * С SDK 58 `expo-symbols` и `react-native-svg` импортируют из `react-native`
 * `PlatformColor` и `TurboModuleRegistry` именованно. В вебе ни того, ни
 * другого не бывает, а сборщик витрины на отсутствующий именованный экспорт
 * падает целиком. Заглушки возвращают «нет значения» — ровно то, что эти
 * модули и так получают в браузере, где системного цвета и нативных модулей
 * не существует.
 */
export * from 'react-native-web';

export const PlatformColor = (..._names: string[]): undefined => undefined;

export const TurboModuleRegistry = {
  get: (_name: string): null => null,
  getEnforcing: (_name: string): null => null,
};
