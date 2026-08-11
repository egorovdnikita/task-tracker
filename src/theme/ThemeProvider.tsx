import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Appearance, useColorScheme, type ColorValue } from 'react-native';

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
});

const ThemeContext = createContext<Theme>(makeTheme('light'));

export type ThemeProviderProps = {
  children: React.ReactNode;
  /**
   * Схема приложения. `system` отдаёт решение системе.
   *
   * Переопределение уезжает в `Appearance.setColorScheme`, а не остаётся
   * внутри React: на iOS этот вызов ставит `overrideUserInterfaceStyle` на
   * корневом окне, и вместе с нашими компонентами схему меняют системные —
   * панель вкладок, клавиатура, алерты, стекло. Держи мы схему только в
   * контексте, эти элементы остались бы в системной, и половина экрана
   * оказалась бы из другой темы.
   */
  preference?: AppearancePreference;
};

export const ThemeProvider = ({ children, preference = 'system' }: ThemeProviderProps) => {
  useEffect(() => {
    // Метода нет в react-native-web: там окна приложения не существует, и
    // переопределять нечего. Обе схемы витрина всё равно показывает — она
    // берёт их из `preference` ниже, а не из системы.
    Appearance.setColorScheme?.(preference === 'system' ? null : preference);
  }, [preference]);

  const system = useColorScheme();

  // Своя схема считается из предпочтения напрямую, а не вычитывается обратно
  // из `useColorScheme`. Иначе она зависела бы от того, доехал ли вызов выше
  // до платформы: на вебе `setColorScheme` не делает ничего, и переключатель
  // в настройках переставал бы работать в витрине.
  const scheme: ColorScheme =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const theme = useMemo(() => makeTheme(scheme), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => useContext(ThemeContext);

/** Схема отдельно — когда компоненту нужен не цвет, а ветка light/dark. */
export const useColorSchemeName = (): ColorScheme => useTheme().scheme;
