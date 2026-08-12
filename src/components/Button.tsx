import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme, type PaletteName } from '../theme';
import { Glass } from './Glass';
import { Symbol } from './Symbol';
import { Text } from './Text';

/**
 * Стили кнопок iOS.
 *
 * - `filled` — залитая акцентом. Главное действие экрана, и оно одно.
 * - `tinted` — акцентная подпись на бледной акцентной заливке.
 * - `gray` — нейтральная заливка: равноправное действие рядом с другим таким же.
 * - `plain` — только подпись. Отмена, «Ещё», ссылки внутри текста.
 * - `glass` / `glassProminent` — жидкое стекло. Только для кнопок, которые
 *   плавают над содержимым: на плоском фоне стекло не от чего преломлять.
 */
export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'glass' | 'glassProminent';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: ButtonVariant;
  size?: 'regular' | 'large';
  /** Разрушающее действие — красная подпись или красная заливка. */
  destructive?: boolean;
  icon?: SFSymbol;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  /** Акцент кнопки. По умолчанию — акцент приложения. */
  tint?: PaletteName;
};

export const Button = ({
  title,
  variant = 'filled',
  size = 'regular',
  destructive = false,
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  tint = 'accent',
  ...rest
}: ButtonProps) => {
  const theme = useTheme();
  const accent: PaletteName = destructive ? 'systemRed' : tint;
  const inactive = disabled || loading;

  const height = size === 'large' ? theme.controlHeight.button : theme.controlHeight.buttonCompact;
  const paddingHorizontal = size === 'large' ? theme.spacing.xl : theme.spacing.lg;
  // Капсула на крупной кнопке — форма кнопок iOS 26; на компактной радиус
  // тоже полный, поэтому одна ветка на оба размера.
  const borderRadius = theme.radius.pill;

  const label = variant === 'filled' || variant === 'glassProminent' ? '#FFFFFF' : theme.hex[accent];

  const fill: Record<ButtonVariant, ViewStyle> = {
    filled: { backgroundColor: theme.colors[accent] },
    tinted: { backgroundColor: withAlpha(theme.hex[accent], 0.15) },
    gray: { backgroundColor: theme.colors.tertiarySystemFill },
    plain: { backgroundColor: 'transparent' },
    glass: {},
    glassProminent: {},
  };

  const body = (
    <View style={[styles.body, { gap: theme.spacing.sm, paddingHorizontal }]}>
      {/*
        Во время загрузки подпись не убирается, а прячется: убери её — и кнопка
        схлопнется до ширины спиннера, а соседние кнопки прыгнут на её место.
        Индикатор ложится поверх, ширина остаётся прежней.
      */}
      <View style={[styles.body, { gap: theme.spacing.sm, opacity: loading ? 0 : 1 }]}>
        {icon ? <Symbol name={icon} size={17} color={label} weight="semibold" /> : null}
        <Text
          variant={size === 'large' ? 'headline' : 'subheadline'}
          weight="semibold"
          style={{ color: label }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {loading ? <ActivityIndicator color={label} style={StyleSheet.absoluteFill} /> : null}
    </View>
  );

  const frame: ViewStyle = {
    height,
    borderRadius,
    borderCurve: 'continuous',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: inactive ? 0.35 : 1,
  };

  const glassy = variant === 'glass' || variant === 'glassProminent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(inactive), busy: loading }}
      disabled={inactive}
      // Нажатие гасит кнопку, а не сжимает её: система именно так и делает,
      // и пружина здесь выглядела бы как элемент из другого приложения.
      style={({ pressed }) => [frame, { opacity: pressed && !inactive ? 0.6 : frame.opacity }, style]}
      {...rest}
    >
      {glassy ? (
        <Glass
          radius={borderRadius}
          variant="regular"
          interactive
          tintColor={variant === 'glassProminent' ? theme.hex[accent] : undefined}
          style={styles.fill}
        >
          {body}
        </Glass>
      ) : (
        <View style={[styles.fill, { borderRadius, borderCurve: 'continuous' }, fill[variant]]}>
          {body}
        </View>
      )}
    </Pressable>
  );
};

/**
 * Кнопка-символ без подписи: шапка, панель редактора, действие в строке.
 * Область касания добирается до 44pt независимо от размера символа.
 */
export type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  name: SFSymbol;
  accessibilityLabel: string;
  size?: number;
  color?: PaletteName;
  style?: ViewStyle;
};

export const IconButton = ({
  name,
  accessibilityLabel,
  size = 22,
  color = 'accent',
  disabled,
  style,
  ...rest
}: IconButtonProps) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={Math.max(0, (theme.metrics.hitSlop - size) / 2)}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: disabled ? 0.35 : pressed ? 0.4 : 1 },
        style,
      ]}
      {...rest}
    >
      <Symbol name={name} size={size} color={theme.colors[color]} />
    </Pressable>
  );
};

/** Подмешать альфу к hex или rgb-строке — для бледных акцентных заливок. */
export const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('rgba')) return color.replace(/[\d.]+\)$/, `${alpha})`);
  if (color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);

  const hex = color.replace('#', '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  const value = parseInt(full.slice(0, 6), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  body: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconButton: { alignItems: 'center', justifyContent: 'center' },
});
