import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import type { ViewStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme/ThemeProvider';

/**
 * Иконки как SVG-примитивы вместо иконочного шрифта.
 *
 * Почему так: `@expo/vector-icons` тянет `expo-font` → `expo-modules-core`,
 * который публикуется только как TS-исходник и не собирается Vite. Векторы
 * же рендерит `react-native-svg` одинаково в приложении и в Storybook,
 * без загрузки шрифтов и без расхождений между платформами.
 *
 * Набор нарисован под эталон: тела залиты, углы скруглены крупно, острых
 * углов нет. Линейными остались только знаки — те, у которых нет тела:
 * лупа, плюс, минус, крестик, галочка и шевроны. Заливать их нечем, а
 * попытка превратить шеврон в треугольник ломает ритм строки.
 *
 * Сетка 24×24. Заливка с `evenodd`: внутренние подконтуры пробивают дырки —
 * так сделаны строчки на листе, глазок бирки, прорези корзины и кольцо
 * шестерёнки. Без этого пришлось бы закрашивать дырку цветом фона, а фон
 * под иконкой — стекло и градиент, он не однотонный.
 */
type Primitive =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; r?: number; rotate?: number };

type Glyph = {
  /** `linear` рисуется обводкой, `solid` — заливкой. */
  kind: 'linear' | 'solid';
  parts: Primitive[];
};

/**
 * Зубец шестерёнки: скруглённая пластина, повёрнутая вокруг центра сетки.
 * Широкая и низкая — узкая и длинная торчит из кольца шипом, а набор
 * держится на том, что острых выступов в нём нет.
 */
const gearTooth = (deg: number): Primitive => ({
  t: 'rect',
  x: 10.3,
  y: 2.4,
  w: 3.4,
  h: 4.2,
  r: 1.7,
  rotate: deg,
});

const GLYPHS = {
  // ── Знаки: остаются линейными ────────────────────────────────────────────
  search: {
    kind: 'linear',
    parts: [
      { t: 'circle', cx: 10.8, cy: 10.8, r: 7.4 },
      { t: 'line', x1: 16.3, y1: 16.3, x2: 20.6, y2: 20.6 },
    ],
  },
  plus: {
    kind: 'linear',
    parts: [
      { t: 'line', x1: 12, y1: 5.2, x2: 12, y2: 18.8 },
      { t: 'line', x1: 5.2, y1: 12, x2: 18.8, y2: 12 },
    ],
  },
  minus: {
    kind: 'linear',
    parts: [{ t: 'line', x1: 5.2, y1: 12, x2: 18.8, y2: 12 }],
  },
  close: {
    kind: 'linear',
    parts: [
      { t: 'line', x1: 17.6, y1: 6.4, x2: 6.4, y2: 17.6 },
      { t: 'line', x1: 6.4, y1: 6.4, x2: 17.6, y2: 17.6 },
    ],
  },
  check: {
    kind: 'linear',
    parts: [{ t: 'path', d: 'M19.6 6.8 9.2 17.2 4.4 12.4' }],
  },
  back: {
    kind: 'linear',
    parts: [{ t: 'path', d: 'M14.6 18.4 8.2 12l6.4-6.4' }],
  },
  chevron: {
    kind: 'linear',
    parts: [{ t: 'path', d: 'M9.4 5.6 15.8 12l-6.4 6.4' }],
  },

  // ── Тела: заливка ────────────────────────────────────────────────────────
  note: {
    kind: 'solid',
    parts: [
      {
        t: 'path',
        d:
          'M8.2 2.6h4.4c.83 0 1.62.33 2.2.92l4.68 4.68c.59.58.92 1.37.92 2.2v7.6c0 2.2-1.8 4-4 4H8.2c-2.2 0-4-1.8-4-4V6.6c0-2.2 1.8-4 4-4z' +
          'M8.9 12.4h6.2a.95.95 0 0 1 0 1.9H8.9a.95.95 0 0 1 0-1.9z' +
          'M8.9 16.1h4.2a.95.95 0 0 1 0 1.9H8.9a.95.95 0 0 1 0-1.9z',
      },
    ],
  },
  pin: {
    kind: 'solid',
    parts: [
      {
        t: 'path',
        d: 'M8 2.6h8c2.1 0 3.8 1.7 3.8 3.8v13.2c0 1.55-1.73 2.47-3.02 1.61L12 18.3l-4.78 2.91C5.93 22.07 4.2 21.15 4.2 19.6V6.4C4.2 4.3 5.9 2.6 8 2.6z',
      },
    ],
  },
  tag: {
    kind: 'solid',
    parts: [
      {
        t: 'path',
        d:
          'M6.4 3.4h4.55c.85 0 1.66.34 2.26.94l6.45 6.45c1.25 1.25 1.25 3.27 0 4.52l-4.35 4.35c-1.25 1.25-3.27 1.25-4.52 0L4.34 13.2c-.6-.6-.94-1.41-.94-2.26V6.4c0-1.66 1.34-3 3-3z' +
          'M8.3 9.9a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5z',
      },
    ],
  },
  user: {
    kind: 'solid',
    parts: [
      {
        t: 'path',
        d:
          'M12 3.2a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8z' +
          'M12 13.6c4.06 0 7.35 2.35 7.35 5.25 0 1.35-1.1 2.35-2.55 2.35H7.2c-1.45 0-2.55-1-2.55-2.35 0-2.9 3.29-5.25 7.35-5.25z',
      },
    ],
  },
  grid: {
    kind: 'solid',
    parts: [
      { t: 'rect', x: 3.6, y: 3.6, w: 7, h: 7, r: 2.6 },
      { t: 'rect', x: 13.4, y: 3.6, w: 7, h: 7, r: 2.6 },
      { t: 'rect', x: 3.6, y: 13.4, w: 7, h: 7, r: 2.6 },
      { t: 'rect', x: 13.4, y: 13.4, w: 7, h: 7, r: 2.6 },
    ],
  },
  settings: {
    kind: 'solid',
    parts: [
      gearTooth(0),
      gearTooth(60),
      gearTooth(120),
      gearTooth(180),
      gearTooth(240),
      gearTooth(300),
      {
        t: 'path',
        d:
          'M12 4.9a7.1 7.1 0 1 1 0 14.2 7.1 7.1 0 0 1 0-14.2z' +
          'M12 9.05a3.05 3.05 0 1 0 0 6.1 3.05 3.05 0 0 0 0-6.1z',
      },
    ],
  },
  sliders: {
    kind: 'solid',
    parts: [
      { t: 'rect', x: 4, y: 5.4, w: 16, h: 2.7, r: 1.35 },
      { t: 'rect', x: 4, y: 10.65, w: 11, h: 2.7, r: 1.35 },
      { t: 'rect', x: 4, y: 15.9, w: 7, h: 2.7, r: 1.35 },
    ],
  },
  trash: {
    kind: 'solid',
    parts: [
      { t: 'path', d: 'M10 2.4h4c1.1 0 2 .9 2 2v1.1H8V4.4c0-1.1.9-2 2-2z' },
      { t: 'rect', x: 3.5, y: 5.6, w: 17, h: 2.6, r: 1.3 },
      {
        t: 'path',
        d:
          'M5.8 9.7h12.4l-.8 9c-.16 1.77-1.64 3.1-3.42 3.1h-3.96c-1.78 0-3.26-1.33-3.42-3.1L5.8 9.7z' +
          'M10.3 12.3a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1z' +
          'M13.7 12.3a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1z',
      },
    ],
  },
  edit: {
    kind: 'solid',
    parts: [
      { t: 'path', d: 'M20.5 3.5a3.05 3.05 0 0 0-4.31 0l-1.2 1.2 4.31 4.31 1.2-1.2a3.05 3.05 0 0 0 0-4.31z' },
      {
        t: 'path',
        d: 'M13.86 5.85 4.6 15.1c-.32.32-.55.72-.66 1.16l-.9 3.53c-.24.93.61 1.78 1.54 1.54l3.53-.9c.44-.11.84-.34 1.16-.66l9.25-9.25-4.66-4.67z',
      },
    ],
  },
  more: {
    kind: 'solid',
    parts: [
      { t: 'circle', cx: 5.2, cy: 12, r: 1.85 },
      { t: 'circle', cx: 12, cy: 12, r: 1.85 },
      { t: 'circle', cx: 18.8, cy: 12, r: 1.85 },
    ],
  },
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof GLYPHS;

/**
 * Соответствие в SF Symbols. На iPhone рисуется системный символ — он
 * попадает в оптический размер, вес и метрики платформы точнее любой нашей
 * копии, и меняется вместе с версией iOS.
 *
 * Векторы выше при этом остаются: `SymbolView` вне iOS отдаёт `fallback`,
 * то есть в вебе (витрина, GitHub Pages) и на Android рисуется тот же набор,
 * что и раньше. Заливка и линейность совпадают с `kind` — иначе иконка
 * меняла бы характер при переходе между платформами.
 */
const SF_SYMBOLS: Record<IconName, SFSymbol> = {
  search: 'magnifyingglass',
  plus: 'plus',
  minus: 'minus',
  close: 'xmark',
  check: 'checkmark',
  back: 'chevron.left',
  chevron: 'chevron.right',
  note: 'doc.text.fill',
  pin: 'bookmark.fill',
  tag: 'tag.fill',
  user: 'person.fill',
  grid: 'square.grid.2x2.fill',
  settings: 'gearshape.fill',
  sliders: 'line.3.horizontal.decrease',
  trash: 'trash.fill',
  edit: 'pencil',
  more: 'ellipsis',
};

export type IconTone = 'default' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'danger';

export type IconProps = {
  name: IconName;
  size?: number;
  tone?: IconTone;
  color?: string;
  /** Толщина обводки на сетке 24. Залитые глифы её игнорируют. */
  strokeWidth?: number;
  style?: ViewStyle;
};

export const Icon = ({ name, size = 22, tone = 'default', color, strokeWidth = 1.8, style }: IconProps) => {
  const theme = useTheme();

  const resolved =
    color ??
    {
      default: theme.colors.text,
      secondary: theme.colors.textSecondary,
      tertiary: theme.colors.textTertiary,
      inverse: theme.colors.textInverse,
      accent: theme.colors.accentLime,
      danger: theme.colors.danger,
    }[tone];

  const glyph = GLYPHS[name] as Glyph;
  const solid = glyph.kind === 'solid';

  const vector = (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={solid ? 'none' : resolved}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Статический <svg> на вебе рисуется ПОД абсолютно позиционированными
      // соседями — например, под меш-слоем GlassSurface. Позиционируем явно.
      style={[{ position: 'relative' }, style]}
      // Декоративна: доступное имя несёт обёртка (Pressable/кнопка).
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyph.parts.map((prim, i) => {
        const fill = solid ? resolved : 'none';
        switch (prim.t) {
          case 'circle':
            return <Circle key={i} cx={prim.cx} cy={prim.cy} r={prim.r} fill={fill} />;
          case 'line':
            return <Line key={i} x1={prim.x1} y1={prim.y1} x2={prim.x2} y2={prim.y2} />;
          case 'rect': {
            const rect = (
              <Rect
                x={prim.x}
                y={prim.y}
                width={prim.w}
                height={prim.h}
                rx={prim.r}
                ry={prim.r}
                fill={fill}
              />
            );
            // Поворот вокруг центра сетки — так собраны зубцы шестерёнки.
            return prim.rotate ? (
              <G key={i} origin="12, 12" rotation={prim.rotate}>
                {rect}
              </G>
            ) : (
              <G key={i}>{rect}</G>
            );
          }
          default:
            return <Path key={i} d={prim.d} fill={fill} fillRule="evenodd" />;
        }
      })}
    </Svg>
  );

  // Вне iOS `SymbolView` просто отдаёт fallback — то есть вектор выше.
  return (
    <SymbolView
      name={SF_SYMBOLS[name]}
      size={size}
      tintColor={resolved}
      // Системный символ по умолчанию тяжелее нашей сетки: `light` сажает его
      // на ту же линию, что Rubik Light рядом.
      weight={solid ? 'regular' : 'light'}
      style={style}
      fallback={vector}
    />
  );
};

/** Полный список имён — используется в каталоге сторис. */
export const iconNames = Object.keys(GLYPHS) as IconName[];
