import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) => {
  const theme = useTheme();

  const background = {
    primary: theme.colors.accent,
    secondary: theme.colors.surfaceAlt,
    ghost: 'transparent',
    danger: theme.colors.danger,
  }[variant];

  const tone = variant === 'primary' || variant === 'danger' ? 'inverse' : 'default';
  const height = size === 'lg' ? 52 : 44;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          backgroundColor: background,
          borderRadius: theme.radius.md,
          borderColor: variant === 'ghost' ? 'transparent' : theme.colors.border,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          paddingHorizontal: theme.spacing.lg,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone === 'inverse' ? theme.colors.accentText : theme.colors.text} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={16} tone={tone === 'inverse' ? 'inverse' : 'default'} /> : null}
          <AppText variant="label" tone={variant === 'danger' ? 'inverse' : tone}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
