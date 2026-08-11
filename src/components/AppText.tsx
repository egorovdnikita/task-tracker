import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { TypographyVariant } from '../theme/tokens';

export type TextTone = 'default' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'danger';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
};

export const AppText = ({
  variant = 'subtle',
  tone = 'default',
  style,
  ...rest
}: AppTextProps) => {
  const theme = useTheme();
  const color = {
    default: theme.colors.text,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    inverse: theme.colors.textInverse,
    accent: theme.colors.accentLime,
    danger: theme.colors.danger,
  }[tone];

  return (
    <Text
      {...rest}
      style={StyleSheet.flatten([theme.typography[variant] as TextStyle, { color }, style])}
    />
  );
};
