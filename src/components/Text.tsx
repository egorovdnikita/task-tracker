import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme';
import type { PaletteName } from '../theme';
import type { TextStyleName, WeightName } from '../theme';

export type TextProps = RNTextProps & {
  /** Стиль текста iOS. По умолчанию `body`. */
  variant?: TextStyleName;
  /** Вес поверх стандартного для стиля — например `headline` весом `bold`. */
  weight?: WeightName;
  /** Цвет из палитры. По умолчанию `label`. */
  color?: PaletteName;
};

/**
 * Текст приложения.
 *
 * `allowFontScaling` не выключается ни здесь, ни в местах вызова: Dynamic Type
 * — не украшение, а способ прочитать экран для тех, кто иначе его не прочтёт.
 * Раскладка обязана переживать увеличенный кегль, а не запрещать его.
 */
export const Text = ({ variant = 'body', weight, color = 'label', style, ...rest }: TextProps) => {
  const theme = useTheme();

  return (
    <RNText
      {...rest}
      style={[theme.text(variant, weight), { color: theme.colors[color] }, style]}
    />
  );
};
