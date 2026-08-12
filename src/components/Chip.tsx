import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme, type AccentName } from '../theme';
import { withAlpha } from './Button';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  icon?: SFSymbol;
  /** Цвет метки — тега или папки. Без него чип нейтральный. */
  accent?: AccentName;
  /** Крестик справа: чип можно снять прямо здесь. */
  onRemove?: () => void;
  onPress?: () => void;
  /**
   * Обводка вместо заливки — чип-действие, а не чип-фильтр.
   *
   * Разница смысловая: фильтр показывает состояние («выбран тег»), действие
   * открывает выбор («поставить срок»). Заливка у второго читалась бы как
   * уже сделанный выбор.
   */
  outlined?: boolean;
  style?: ViewStyle;
};

/**
 * Чип-фильтр.
 *
 * Капсула, а не прямоугольник: в системе так выглядит всё, что можно снять или
 * выбрать множественно, — в отличие от сегмент-контрола, где выбор ровно один.
 */
export const Chip = ({
  label,
  selected = false,
  icon,
  accent,
  onRemove,
  onPress,
  outlined = false,
  style,
}: ChipProps) => {
  const theme = useTheme();
  const accentHex = accent ? theme.accent(accent) : theme.hex.accent;

  const background = outlined
    ? 'transparent'
    : selected
      ? accent
        ? withAlpha(accentHex, theme.scheme === 'dark' ? 0.28 : 0.16)
        : theme.colors.systemFill
      : theme.colors.tertiarySystemFill;

  const body = (
    <>
      {icon ? (
        <Symbol
          name={icon}
          size={13}
          color={outlined ? theme.colors.secondaryLabel : accentHex}
          weight="semibold"
        />
      ) : null}

      <Text
        variant="subheadline"
        weight={selected ? 'semibold' : 'regular'}
        color={outlined ? 'label' : selected ? 'label' : 'secondaryLabel'}
        style={selected && accent && !outlined ? { color: accentHex } : undefined}
        numberOfLines={1}
      >
        {label}
      </Text>
    </>
  );

  const shape: ViewStyle = {
    height: theme.controlHeight.segmented,
    paddingLeft: theme.spacing.md,
    paddingRight: onRemove ? theme.spacing.sm : theme.spacing.md,
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: background,
    borderWidth: outlined ? theme.metrics.hairline * 2 : 0,
    borderColor: theme.colors.separator,
  };

  /*
    Крестик — соседний элемент, а не вложенный.
    Кнопка внутри кнопки — не придирка вёрстки: VoiceOver объявляет такой чип
    одной целью и до крестика не доходит, а на вебе браузер вложенный <button>
    просто выбрасывает. Поэтому нажимаемая часть и крестик стоят рядом внутри
    общей капсулы.
  */
  if (onRemove) {
    return (
      <View style={[styles.chip, shape, style]}>
        {onPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={onPress}
            style={({ pressed }) => [styles.chip, { gap: theme.spacing.xs, opacity: pressed ? 0.6 : 1 }]}
          >
            {body}
          </Pressable>
        ) : (
          <View style={[styles.chip, { gap: theme.spacing.xs }]}>{body}</View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Убрать «${label}»`}
          onPress={onRemove}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
        >
          <Symbol name="xmark.circle.fill" size={15} color={theme.colors.tertiaryLabel} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, shape, { opacity: pressed ? 0.6 : 1 }, style]}
    >
      {body}
    </Pressable>
  );
};

/**
 * Ряд чипов с горизонтальной прокруткой.
 *
 * Прокрутка, а не перенос на вторую строку: ряд фильтров должен занимать
 * фиксированную высоту, иначе список под ним прыгает при каждой смене набора.
 */
export const ChipRow = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}
      style={style}
    >
      {children}
    </ScrollView>
  );
};

/** Те же чипы, но с переносом — когда высота не важна (редактор тегов). */
export const ChipWrap = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const theme = useTheme();
  return <View style={[styles.wrap, { gap: theme.spacing.sm }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
