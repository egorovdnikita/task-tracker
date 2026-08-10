import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

export type ChipProps = {
  label: string;
  selected?: boolean;
  count?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export const Chip = ({ label, selected = false, count, onPress, disabled, style }: ChipProps) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={typeof count === 'number' ? `${label}, ${count}` : label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
          borderColor: selected ? theme.colors.accent : theme.colors.border,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.md,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <AppText variant="label" tone={selected ? 'inverse' : 'default'}>
        {label}
      </AppText>
      {typeof count === 'number' ? (
        <AppText variant="caption" tone={selected ? 'inverse' : 'muted'}>
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
};

export type ChipGroupProps = {
  items: { key: string; label: string; count?: number }[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
  scrollable?: boolean;
  style?: ViewStyle;
};

/** Horizontal tag filter row — the "(Все)(Работа)(Идеи)" strip on S1. */
export const ChipGroup = ({
  items,
  selectedKey = null,
  onSelect,
  scrollable = true,
  style,
}: ChipGroupProps) => {
  const theme = useTheme();

  const content = items.map((item) => (
    <Chip
      key={item.key}
      label={item.label}
      count={item.count}
      selected={item.key === selectedKey}
      onPress={() => onSelect?.(item.key)}
    />
  ));

  if (!scrollable) {
    return <View style={[styles.row, { gap: theme.spacing.sm }, style]}>{content}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }]}
      style={style}
    >
      {content}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
