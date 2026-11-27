import React, { createContext, useContext, useEffect } from 'react';
import { Appearance, type ColorValue } from 'react-native';

import {
  accentColor,
  buildPalette,
  resolvePalette,
  type AccentName,
  type ColorScheme,
  type PaletteName,
  type ResolvedPalette,
} from './colors';
import { controlHeight, metrics, radius, spacing } from './metrics';
import { backdrops, meshes, strokes, surfaces, tints } from './opal';
import { headerTextStyle, textStyle, type TextStyleName, type WeightName } from './typography';

/** Что выбрано в настройках приложения. `system` — следовать за системой. */
export type AppearancePreference = 'system' | 'light' | 'dark';

export type Theme = {
  scheme: ColorScheme;
  /** Цвета для стилей: на iOS — системные, на остальных платформах — значения схемы. */
  colors: Record<PaletteName, ColorValue>;
  /** Те же цвета строками. Нужны там, где значение читается в JS. */
  hex: ResolvedPalette;
  accent: (name: AccentName) => string;
  text: (name: TextStyleName, weight?: WeightName) => ReturnType<typeof textStyle>;
  /** Стиль для `headerTitleStyle` нативного стека — там принимаются не все поля. */
  headerText: (name: TextStyleName, weight?: WeightName) => ReturnType<typeof headerTextStyle>;
  spacing: typeof spacing;
  radius: typeof radius;
  metrics: typeof metrics;
  controlHeight: typeof controlHeight;
  meshes: typeof meshes;
  strokes: typeof strokes;
  tints: typeof tints;
  surfaces: typeof surfaces;
  backdrops: typeof backdrops;
};

const makeTheme = (scheme: ColorScheme): Theme => ({
  scheme,
  colors: buildPalette(scheme),
  hex: resolvePalette(scheme),
  accent: (name) => accentColor(name, scheme),
  text: textStyle,
  headerText: headerTextStyle,
  spacing,
  radius,
  metrics,
  controlHeight,
  meshes,
  strokes,
  tints,
  surfaces,
  backdrops,
});

const ThemeContext = createContext<Theme>(makeTheme('light'));

export type ThemeProviderProps = { children: React.ReactNode; preference?: AppearancePreference };
const FINCH = makeTheme('light');
/** Finch имеет одну схему; клавиатура, алерты и системные листы светлые. */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  useEffect(() => { Appearance.setColorScheme?.('light'); }, []);
  return <ThemeContext.Provider value={FINCH}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => useContext(ThemeContext);

/** Схема отдельно — когда компоненту нужен не цвет, а ветка light/dark. */
export const useColorSchemeName = (): ColorScheme => useTheme().scheme;
