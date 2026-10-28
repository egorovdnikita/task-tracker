import { Platform, type ColorValue } from 'react-native';
// Именованный импорт `PlatformColor` здесь недопустим: на вебе примитивы даёт
// react-native-web, а он такого экспорта не имеет — сборка витрины упала бы на
// импорте. Пространство имён резолвится всегда, а дальше проверяем поле.
import * as ReactNative from 'react-native';

export type ColorScheme = 'light' | 'dark';

/**
 * Пара значений одного семантического цвета.
 *
 * Хранить обе половины обязательно, даже когда на устройстве цвет отдаёт
 * система: витрина в браузере и Android живут без UIKit, а показывать там
 * другую палитру — значит иметь две разные системы вместо одной.
 */
export type ColorPair = { light: string; dark: string };

const pair = (light: string, dark: string): ColorPair => ({ light, dark });

/**
 * Палитра iOS. Значения — из System Colors и Dynamic System Colors в HIG,
 * в sRGB. Числа не подбирались на глаз и не должны подкручиваться «под макет»:
 * это те же цвета, которыми система красит свои элементы, и расхождение с ними
 * читается на экране мгновенно — чужая кнопка рядом с системной.
 */
const systemPalette = {
  // ── Акценты ───────────────────────────────────────────────────────────────
  systemRed: pair('#FF3B30', '#FF453A'),
  systemOrange: pair('#FF9500', '#FF9F0A'),
  systemYellow: pair('#FFCC00', '#FFD60A'),
  systemGreen: pair('#34C759', '#30D158'),
  systemMint: pair('#00C7BE', '#63E6E2'),
  systemTeal: pair('#30B0C7', '#40C8E0'),
  systemCyan: pair('#32ADE6', '#64D2FF'),
  systemBlue: pair('#007AFF', '#0A84FF'),
  systemIndigo: pair('#5856D6', '#5E5CE6'),
  systemPurple: pair('#AF52DE', '#BF5AF2'),
  systemPink: pair('#FF2D55', '#FF375F'),
  systemBrown: pair('#A2845E', '#AC8E68'),

  // ── Серые ─────────────────────────────────────────────────────────────────
  systemGray: pair('#8E8E93', '#8E8E93'),
  systemGray2: pair('#AEAEB2', '#636366'),
  systemGray3: pair('#C7C7CC', '#48484A'),
  systemGray4: pair('#D1D1D6', '#3A3A3C'),
  systemGray5: pair('#E5E5EA', '#2C2C2E'),
  systemGray6: pair('#F2F2F7', '#1C1C1E'),

  // ── Фоны ──────────────────────────────────────────────────────────────────
  /** Экран без группировки: списки заметок, редактор. */
  systemBackground: pair('#FFFFFF', '#000000'),
  secondarySystemBackground: pair('#F2F2F7', '#1C1C1E'),
  tertiarySystemBackground: pair('#FFFFFF', '#2C2C2E'),

  /**
   * Экран с инсет-группами: настройки, папки. В тёмной схеме фон группового
   * экрана чёрный, а карточки групп — светлее; в светлой наоборот. Поэтому
   * два набора, а не один с оттенками.
   */
  systemGroupedBackground: pair('#F2F2F7', '#000000'),
  secondarySystemGroupedBackground: pair('#FFFFFF', '#1C1C1E'),
  tertiarySystemGroupedBackground: pair('#F2F2F7', '#2C2C2E'),

  // ── Текст ─────────────────────────────────────────────────────────────────
  /**
   * Вторичный и ниже — намеренно с альфой, а не плотный серый: под ними бывает
   * стекло и фотография, и только полупрозрачный текст держит контраст с любой
   * подложкой. Это же правило у самой системы.
   */
  label: pair('#000000', '#FFFFFF'),
  secondaryLabel: pair('rgba(60,60,67,0.6)', 'rgba(235,235,245,0.6)'),
  tertiaryLabel: pair('rgba(60,60,67,0.3)', 'rgba(235,235,245,0.3)'),
  quaternaryLabel: pair('rgba(60,60,67,0.18)', 'rgba(235,235,245,0.16)'),
  placeholderText: pair('rgba(60,60,67,0.3)', 'rgba(235,235,245,0.3)'),

  // ── Разделители ───────────────────────────────────────────────────────────
  /** Полупрозрачный: сквозь него виден контент. Для линий внутри списка. */
  separator: pair('rgba(60,60,67,0.29)', 'rgba(84,84,88,0.65)'),
  /** Плотный: когда линия должна разделять два слоя, а не украшать один. */
  opaqueSeparator: pair('#C6C6C8', '#38383A'),

  // ── Заливки ───────────────────────────────────────────────────────────────
  /** Крупные фигуры поверх фона: трек сегмент-контрола, подложка поля. */
  systemFill: pair('rgba(120,120,128,0.2)', 'rgba(120,120,128,0.36)'),
  secondarySystemFill: pair('rgba(120,120,128,0.16)', 'rgba(120,120,128,0.32)'),
  tertiarySystemFill: pair('rgba(118,118,128,0.12)', 'rgba(118,118,128,0.24)'),
  quaternarySystemFill: pair('rgba(116,116,128,0.08)', 'rgba(118,118,128,0.18)'),

  // ── Прочее ────────────────────────────────────────────────────────────────
  link: pair('#007AFF', '#0A84FF'),
} as const;

/**
 * Слой Opal поверх системного — тёмная система по эталону Opal.
 *
 * Схема одна, тёмная, поэтому значение светлой половины пары повторяет тёмное:
 * светлой схемы у продукта нет, и пара остаётся парой только ради общего
 * типа с системной палитрой.
 *
 * Поверхности — прозрачное белое, а не серые заливки. Глухой серый гасит
 * подсветку фона: карточка становится плоским пятном ровно там, где под ней
 * свет. Прозрачность пропускает свет и меняет тон вместе с фоном. По той же
 * причине текст — белый с альфой: серый `#A0A0A0` держится только на чистом
 * чёрном, а поверх стекла и градиента уходит в грязь.
 *
 * Акцент — ось лайм → мята → аква. Глиф на акцентной заливке чёрный
 * (`onAccent`): пастельный лайм под белым плюсом не читается.
 */
const dark = (value: string): ColorPair => pair(value, value);

const opalPalette = {
  systemBackground: dark('#000000'),
  secondarySystemBackground: dark('rgba(255,255,255,0.04)'),
  tertiarySystemBackground: dark('rgba(255,255,255,0.08)'),

  systemGroupedBackground: dark('#000000'),
  secondarySystemGroupedBackground: dark('rgba(255,255,255,0.045)'),
  tertiarySystemGroupedBackground: dark('rgba(255,255,255,0.08)'),

  label: dark('#FFFFFF'),
  secondaryLabel: dark('rgba(255,255,255,0.66)'),
  tertiaryLabel: dark('rgba(255,255,255,0.42)'),
  quaternaryLabel: dark('rgba(255,255,255,0.22)'),
  placeholderText: dark('rgba(255,255,255,0.42)'),

  separator: dark('rgba(255,255,255,0.10)'),
  opaqueSeparator: dark('rgba(255,255,255,0.18)'),

  systemFill: dark('rgba(255,255,255,0.14)'),
  secondarySystemFill: dark('rgba(255,255,255,0.10)'),
  tertiarySystemFill: dark('rgba(255,255,255,0.07)'),
  quaternarySystemFill: dark('rgba(255,255,255,0.04)'),

  /** Главный акцент — лайм. Тратится скупо: создание, активная вкладка, ссылки. */
  accent: dark('#DCFEAA'),
  accentMint: dark('#D7FEC0'),
  accentAqua: dark('#BBFBE7'),
  /** Глиф и подпись поверх акцентной заливки. */
  onAccent: dark('#000000'),
  link: dark('#BBFBE7'),

  /**
   * Плотная приподнятая поверхность — для того, что всплывает поверх
   * содержимого без блюра (тосты): прозрачная подложка над списком дала бы
   * текст поверх текста.
   */
  elevated: dark('#141416'),

  /** Семантика эталона: разрушающее и «готово». */
  systemRed: dark('#FF577A'),
  systemGreen: dark('#05D6B4'),
} as const;

export const palette = { ...systemPalette, ...opalPalette } as const;

export type PaletteName = keyof typeof palette;

/**
 * Имена в UIKit для тех токенов, где они отличаются от наших ключей.
 * Пустая запись означает «имя совпадает».
 */
const UIKIT_ALIASES: Partial<Record<PaletteName, string>> = {
  systemFill: 'systemFillColor',
  secondarySystemFill: 'secondarySystemFillColor',
  tertiarySystemFill: 'tertiarySystemFillColor',
  quaternarySystemFill: 'quaternarySystemFillColor',
};

/**
 * Цвета, которые на iOS берём у системы через `PlatformColor`.
 *
 * Сейчас — ни одного. Все контрастные токены переопределены значениями Opal:
 * системный `secondaryLabel` холоднее и плотнее эталонного белого с альфой, и
 * поверх подсветки фона он читается чужим. Механизм оставлен: если какой-то
 * токен понадобится вернуть системе, его достаточно перечислить здесь.
 */
const NATIVE_ON_IOS: PaletteName[] = [];

const platformColor = (ReactNative as { PlatformColor?: (...names: string[]) => ColorValue })
  .PlatformColor;

/** Доступен ли системный резолвер цвета. На вебе и в тестах — нет. */
export const hasPlatformColors = Platform.OS === 'ios' && typeof platformColor === 'function';

/** Значения палитры одной схемы — строками. Нужны там, где цвет читается в JS. */
export type ResolvedPalette = Record<PaletteName, string>;

export const resolvePalette = (scheme: ColorScheme): ResolvedPalette =>
  Object.fromEntries(
    (Object.keys(palette) as PaletteName[]).map((name) => [name, palette[name][scheme]]),
  ) as ResolvedPalette;

/**
 * Палитра для стилей: на iOS — системные цвета, иначе — значения схемы.
 *
 * Возвращаемый тип шире `string`: `PlatformColor` отдаёт непрозрачный объект,
 * который умеет читать только нативная сторона. Всё, что нужно разобрать в JS,
 * берётся из `resolvePalette`.
 */
export const buildPalette = (scheme: ColorScheme): Record<PaletteName, ColorValue> => {
  const resolved = resolvePalette(scheme);
  if (!hasPlatformColors || !platformColor) return resolved;

  const native = { ...resolved } as Record<PaletteName, ColorValue>;
  for (const name of NATIVE_ON_IOS) {
    native[name] = platformColor(UIKIT_ALIASES[name] ?? name);
  }
  return native;
};

/**
 * Цвет метки заметки или папки.
 *
 * Это те же системные акценты, а не своя палитра: цвет здесь — признак, и
 * набор признаков должен совпадать с тем, к которому человек привык в системе.
 */
export const accents = {
  red: 'systemRed',
  orange: 'systemOrange',
  yellow: 'systemYellow',
  green: 'systemGreen',
  mint: 'systemMint',
  blue: 'systemBlue',
  indigo: 'systemIndigo',
  purple: 'systemPurple',
  pink: 'systemPink',
  gray: 'systemGray',
} as const satisfies Record<string, PaletteName>;

export type AccentName = keyof typeof accents;

export const accentNames = Object.keys(accents) as AccentName[];

export const accentLabels: Record<AccentName, string> = {
  red: 'Красный',
  orange: 'Оранжевый',
  yellow: 'Жёлтый',
  green: 'Зелёный',
  mint: 'Мятный',
  blue: 'Синий',
  indigo: 'Индиго',
  purple: 'Фиолетовый',
  pink: 'Розовый',
  gray: 'Серый',
};

/** Значение акцента строкой — им красятся символы и точки-метки. */
export const accentColor = (name: AccentName, scheme: ColorScheme): string =>
  palette[accents[name]][scheme];
