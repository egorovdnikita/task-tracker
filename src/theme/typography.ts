import { Platform, type TextStyle } from 'react-native';

/**
 * SF Pro — системный шрифт iOS, и берётся он по имени, а не файлом.
 *
 * Важное следствие: начертание задаётся весом, а не отдельным семейством.
 * Пара «семейство + вес» обязана ехать вместе, иначе iOS рисует синтетический
 * жир вместо настоящего SF Pro Semibold.
 *
 * Оптические размеры (Text до 20pt, Display выше) система подставляет сама
 * по кеглю — руками их выбирать не нужно и нельзя.
 */
export const fontFamily = Platform.select({
  ios: 'System',
  default:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
}) as string;

/**
 * Стили текста iOS: кегль, интерлиньяж и трекинг при системном размере Large
 * (это положение движка Dynamic Type по умолчанию).
 *
 * Отрицательный трекинг у 15–17pt и положительный у крупных — не вкусовщина,
 * а поведение самого SF: система поджимает межбуквенное на заголовках и
 * разгоняет на мелком. Без этих значений собственный текст стоит рядом с
 * системным и выглядит чуть-чуть чужим, а причину найти трудно.
 */
export const textStyles = {
  largeTitle: { fontSize: 34, lineHeight: 41, letterSpacing: 0.37, fontWeight: '400' },
  title1: { fontSize: 28, lineHeight: 34, letterSpacing: 0.36, fontWeight: '400' },
  title2: { fontSize: 22, lineHeight: 28, letterSpacing: 0.35, fontWeight: '400' },
  title3: { fontSize: 20, lineHeight: 25, letterSpacing: 0.38, fontWeight: '400' },
  /** Подписывает то, что под ней: заголовок строки, шапка секции. */
  headline: { fontSize: 17, lineHeight: 22, letterSpacing: -0.41, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, letterSpacing: -0.41, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, letterSpacing: -0.32, fontWeight: '400' },
  subheadline: { fontSize: 15, lineHeight: 20, letterSpacing: -0.24, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, letterSpacing: -0.08, fontWeight: '400' },
  caption1: { fontSize: 12, lineHeight: 16, letterSpacing: 0, fontWeight: '400' },
  caption2: { fontSize: 11, lineHeight: 13, letterSpacing: 0.07, fontWeight: '400' },
} as const satisfies Record<string, Pick<TextStyle, 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontWeight'>>;

export type TextStyleName = keyof typeof textStyles;

export const textStyleNames = Object.keys(textStyles) as TextStyleName[];

/** Веса SF, которые встречаются в системных элементах. */
export const weights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export type WeightName = keyof typeof weights;

/**
 * Готовый стиль под имя.
 *
 * `lineHeight` намеренно не фиксируется вместе с масштабированием шрифта:
 * при увеличенном системном кегле RN масштабирует `fontSize`, а `lineHeight`
 * оставляет как есть, и строки начинают наезжать друг на друга. Поэтому
 * интерлиньяж отдаётся множителем от кегля — так он растёт вместе с текстом.
 */
export const textStyle = (name: TextStyleName, weight?: WeightName): TextStyle => {
  const base = textStyles[name];
  return {
    fontFamily,
    fontSize: base.fontSize,
    lineHeight: base.lineHeight,
    letterSpacing: base.letterSpacing,
    fontWeight: weight ? weights[weight] : base.fontWeight,
  };
};

/**
 * Стиль для шапки навигации.
 *
 * Отдельно от `textStyle`, потому что `headerTitleStyle` у нативного стека
 * принимает не весь `TextStyle`, а три поля: нативная шапка рисуется
 * `UINavigationBar`, и всё, кроме шрифта, она решает сама. Возвращать сюда
 * полный стиль значит обещать интерлиньяж и трекинг, которые будут молча
 * отброшены.
 */
export const headerTextStyle = (
  name: TextStyleName,
  weight?: WeightName,
  // Вес именно строковым литералом: `headerTitleStyle` ждёт вес из типа RN,
  // а `headerLargeTitleStyle` — просто `string`. Литерал подходит обоим,
  // а общий `TextStyle['fontWeight']` допускает число и не подходит второму.
): { fontFamily: string; fontSize: number; fontWeight: (typeof weights)[WeightName] } => ({
  fontFamily,
  fontSize: textStyles[name].fontSize,
  fontWeight: weight ? weights[weight] : textStyles[name].fontWeight,
});

/**
 * Соотношение интерлиньяжа к кеглю — для мест, где текст обязан расти вместе
 * с системным размером (карточки, строки списка).
 */
export const lineHeightRatio = (name: TextStyleName): number =>
  textStyles[name].lineHeight / textStyles[name].fontSize;
