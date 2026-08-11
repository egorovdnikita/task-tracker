import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { GlassSurface } from './GlassSurface';
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

/**
 * `primary` — стеклянная пилюля с мешем: свет снизу, оливковый слева →
 * бирюзовый справа. Геометрия меша выведена из профиля яркости референса.
 * Остальные варианты — та же поверхность с другой подложкой и обводкой.
 */
export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) => {
  const theme = useTheme();
  const height = size === 'lg' ? theme.sizes.buttonLarge : theme.sizes.button;

  const surface = {
    primary: { mesh: 'cta' as const, stroke: 'cta' as const, tint: theme.tints.cta },
    // Разрушающее действие — такая же залитая пилюля, как основное: если
    // «Удалить» выглядит ссылкой, а «Отмена» — кнопкой, глаз выбирает отмену
    // не потому, что решил, а потому, что она заметнее.
    danger: { mesh: 'danger' as const, stroke: 'danger' as const, tint: 'rgba(255,87,122,0.16)' },
    secondary: { mesh: null, stroke: 'subtle' as const, tint: theme.tints.control },
    ghost: { mesh: null, stroke: null, tint: undefined },
  }[variant];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.4 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <GlassSurface
        mesh={surface.mesh}
        stroke={surface.stroke}
        tint={surface.tint}
        // Варианты с мешем несут собственный градиент — системное стекло
        // им не нужно. Остальным оно достаётся вместе с откликом на нажатие.
        liquid={surface.mesh === null}
        interactive={surface.mesh === null}
        radius={theme.radius.pill}
        style={{
          height,
          paddingHorizontal: theme.spacing.xxl,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <View style={styles.content}>
            {icon ? <Icon name={icon} size={18} /> : null}
            <AppText variant={size === 'lg' ? 'heading' : 'body'}>{label}</AppText>
          </View>
        )}
      </GlassSurface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
