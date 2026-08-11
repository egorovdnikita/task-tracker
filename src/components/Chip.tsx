import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { GlassSurface } from './GlassSurface';

export type ChipProps = {
  label: string;
  selected?: boolean;
  count?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

/** Выбранный чип в референсе — сплошная белая пилюля с тёмным текстом. */
export const Chip = ({ label, selected = false, count, onPress, disabled, style }: ChipProps) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={typeof count === 'number' ? `${label}, ${count}` : label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }, style]}
    >
      <GlassSurface
        radius={theme.radius.pill}
        tint={selected ? theme.colors.text : theme.tints.control}
        stroke={selected ? null : 'subtle'}
        // Выбранный чип — сплошная белая пилюля, системное стекло под ней
        // не видно; невыбранный получает и материал, и отклик.
        liquid={!selected}
        interactive={!selected}
        style={{
          height: theme.sizes.chip,
          paddingHorizontal: theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <AppText variant="subtle" tone={selected ? 'inverse' : 'default'}>
          {label}
        </AppText>
        {typeof count === 'number' ? (
          <AppText variant="subtle" tone={selected ? 'inverse' : 'tertiary'}>
            {count}
          </AppText>
        ) : null}
      </GlassSurface>
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
      contentContainerStyle={[
        styles.row,
        { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xl },
      ]}
      style={style}
    >
      {content}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
