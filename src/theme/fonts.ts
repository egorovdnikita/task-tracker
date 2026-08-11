/**
 * Rubik, только Light и Regular: у эталона нет жирных начертаний, крупный
 * кегль там держится размером и воздухом, а не весом. Light идёт на заголовки,
 * Regular — на всё остальное.
 *
 * В React Native начертание задаётся не `fontWeight`, а отдельным
 * семейством — иначе система рисует синтетический жир. Поэтому токены
 * типографики несут `fontFamily`, а не вес.
 *
 * Те же .ttf подключаются в Storybook через `@font-face` в preview-head.html,
 * поэтому витрина и приложение рендерят один и тот же шрифт.
 */
export const fonts = {
  light: 'Rubik_300Light',
  regular: 'Rubik_400Regular',
} as const;

export type FontFamily = (typeof fonts)[keyof typeof fonts];
