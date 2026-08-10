import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { TypographyVariant } from '../theme/tokens';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: 'default' | 'muted' | 'inverse' | 'danger';
};

export const AppText = ({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: AppTextProps) => {
  const theme = useTheme();
  const color = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    danger: theme.colors.danger,
  }[tone];

  return (
    <Text
      {...rest}
      style={StyleSheet.flatten([theme.typography[variant] as TextStyle, { color }, style])}
    />
  );
};
