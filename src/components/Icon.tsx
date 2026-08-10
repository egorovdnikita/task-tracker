import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Glyph icon set. Deliberately dependency-free so the exact same component
 * renders in the native app and in Storybook (react-native-web).
 */
export const icons = {
  search: '⌕',
  back: '‹',
  close: '✕',
  more: '⋮',
  plus: '＋',
  settings: '⚙',
  pin: '📌',
  trash: '🗑',
  check: '✓',
  chevron: '›',
  note: '▤',
} as const;

export type IconName = keyof typeof icons;

export type IconProps = {
  name: IconName;
  size?: number;
  tone?: 'default' | 'muted' | 'inverse' | 'danger';
  style?: TextStyle;
};

export const Icon = ({ name, size = 20, tone = 'default', style }: IconProps) => {
  const theme = useTheme();
  const color = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    danger: theme.colors.danger,
  }[tone];

  return (
    <Text
      // Decorative: the pressable wrapping the icon carries the accessible name.
      accessible={false}
      importantForAccessibility="no"
      style={[{ fontSize: size, lineHeight: size * 1.2, color, textAlign: 'center' }, style]}
    >
      {icons[name]}
    </Text>
  );
};
