import React from 'react';
import { StyleSheet, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { GlassSurface } from './GlassSurface';

export type TextFieldProps = {
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  /** Без поверхности — для крупного заголовка заметки. */
  variant?: 'glass' | 'plain';
  size?: 'title' | 'body';
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
};

/**
 * Поля референса — без рамки: стеклянная подложка и мягкая обводка.
 * Однострочное поле — пилюля, многострочное — радиус 28.
 */
export const TextField = ({
  value,
  onChangeText,
  placeholder,
  label,
  multiline = false,
  autoFocus = false,
  variant = 'glass',
  size = 'body',
  error,
  style,
  inputStyle,
  testID,
}: TextFieldProps) => {
  const theme = useTheme();

  const input = (
    <TextInput
      testID={testID}
      accessibilityLabel={label ?? placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textTertiary}
      multiline={multiline}
      autoFocus={autoFocus}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[
        // Кегль тот же, что у остальных контролов: заголовок заметки набирался
        // на `title` (20pt) и висел на полторы ступени выше всего, что рядом.
        size === 'title' ? theme.typography.inputTitle : theme.typography.input,
        { color: theme.colors.text },
        multiline && styles.grow,
        inputStyle,
      ]}
    />
  );

  return (
    <View style={[{ gap: theme.spacing.sm }, style]}>
      {label ? (
        <AppText variant="overline" tone="tertiary">
          {label.toUpperCase()}
        </AppText>
      ) : null}

      {variant === 'plain' ? (
        input
      ) : (
        <GlassSurface
          radius={multiline ? theme.radius.lg : theme.radius.pill}
          tint={theme.tints.control}
          // Обводка только на ошибке. В обычном состоянии поле держится
          // подложкой — светлый контур вокруг каждого поля собирает экран
          // в сетку рамок, которой в эталоне нет.
          stroke={error ? { from: theme.colors.danger, to: theme.colors.danger } : null}
          style={{
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: multiline ? theme.spacing.lg : theme.spacing.md,
            minHeight: multiline ? 160 : theme.sizes.buttonLarge,
            justifyContent: 'center',
          }}
        >
          {input}
        </GlassSurface>
      )}

      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  grow: { flex: 1 },
});
