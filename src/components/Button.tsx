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
import { GlassSurface } from './GlassSurface';
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

  /*
    Варианты — поверхности Opal:

    - `filled` — главная кнопка эталона: стеклянная пилюля с мешем, свет снизу,
      оливковый слева → бирюзовый справа. Подпись белая: меш светлеет только у
      нижней кромки, буквы стоят на тёмном. Разрушающая — тот же профиль по
      красной оси: если «Удалить» выглядит ссылкой, а «Отмена» — кнопкой, глаз
      выбирает отмену не потому, что решил, а потому, что она заметнее.
    - `tinted` и `gray` — стеклянная пилюля без меша; у первой подпись акцентом.
    - `plain` — только подпись.
  */
  const label =
    variant === 'filled' || variant === 'gray' || variant === 'glass'
      ? theme.hex.label
      : variant === 'glassProminent'
        ? theme.hex.onAccent
        : theme.hex[accent];

  const surface: Record<ButtonVariant, React.ComponentProps<typeof GlassSurface> | null> = {
    filled: destructive
      ? { mesh: 'danger', stroke: 'danger', tint: 'rgba(255,87,122,0.16)', liquid: false }
      : { mesh: 'cta', stroke: 'cta', tint: theme.tints.cta, liquid: false },
    tinted: { stroke: 'subtle', tint: theme.tints.control, interactive: true },
    gray: { stroke: 'subtle', tint: theme.tints.control, interactive: true },
    plain: null,
    glass: { stroke: 'glass', tint: theme.tints.glass, interactive: true },
    glassProminent: { mesh: 'fab', tint: theme.hex.accent, liquid: false },
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
          weight="medium"
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

  const spec = surface[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(inactive), busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [frame, { opacity: pressed && !inactive ? 0.82 : frame.opacity }, style]}
      {...rest}
    >
      <View style={[styles.fill, { borderRadius, borderCurve: 'continuous' }]}>
        {spec ? (
          <GlassSurface
            {...spec}
            radius={borderRadius}
            pointerEventsNone
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {body}
      </View>
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
  // Рамка кнопки квадратная и на треть шире символа.
  //
  // Без неё кнопка равнялась глифу, а глифы SF разной ширины: `pin` узкий и
  // высокий, `folder.badge.plus` широкий и низкий, `ellipsis.circle` круглый.
  // Поставленные рядом, они вставали каждый по своему центру, и ряд выглядел
  // расшатанным — а широкие ещё и обрезались краем шапки. Общая рамка даёт им
  // одну коробку, внутри которой символ центрируется сам.
  const frame = Math.max(theme.controlHeight.buttonCompact, Math.round(size * 1.5));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={Math.max(0, (theme.metrics.hitSlop - frame) / 2)}
      style={({ pressed }) => [
        styles.iconButton,
        { width: frame, height: frame },
        { opacity: disabled ? 0.35 : pressed ? 0.4 : 1 },
        style,
      ]}
      {...rest}
    >
      <Symbol name={name} size={size} color={theme.colors[color]} />
    </Pressable>
  );
};

/**
 * Группа кнопок в шапке.
 *
 * Обычный ряд без своего фона — и это принципиально. Стеклянную капсулу под
 * кнопками шапки iOS 26 рисует сама: на референсе переключатель вида и меню
 * стоят внутри общей пилюли, и та пилюля системная, а не нарисованная. Своё
 * стекло здесь дало бы стекло внутри стекла — двойную кромку и лишний вес.
 *
 * Роль компонента — только расстановка: одинаковый зазор между кнопками во
 * всех шапках приложения.
 */
export const HeaderCapsule = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  const theme = useTheme();

  return <View style={[styles.capsule, { gap: theme.spacing.xs }, style]}>{children}</View>;
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
  capsule: { flexDirection: 'row', alignItems: 'center' },
});
