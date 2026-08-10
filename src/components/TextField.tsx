import React from 'react';
import { StyleSheet, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

export type TextFieldProps = {
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  variant?: 'boxed' | 'plain';
  size?: 'title' | 'body';
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
};

export const TextField = ({
  value,
  onChangeText,
  placeholder,
  label,
  multiline = false,
  autoFocus = false,
  variant = 'boxed',
  size = 'body',
  error,
  style,
  inputStyle,
  testID,
}: TextFieldProps) => {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.spacing.xs }, style]}>
      {label ? (
        <AppText variant="label" tone="muted">
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          variant === 'boxed' && {
            backgroundColor: theme.colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
          multiline && styles.grow,
        ]}
      >
        <TextInput
          testID={testID}
          accessibilityLabel={label ?? placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          multiline={multiline}
          autoFocus={autoFocus}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            size === 'title' ? theme.typography.title : theme.typography.body,
            { color: theme.colors.text },
            multiline && styles.grow,
            inputStyle,
          ]}
        />
      </View>
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
