import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export type Segment<T extends string> = { value: T; label: string };
export type SegmentedControlProps<T extends string> = { segments: Segment<T>[]; selected: T; onChange: (value: T) => void; accessibilityLabel?: string; style?: ViewStyle };
/** Одиночный выбор в отдельных капсулах Finch; прежний API сохранён. */
export const SegmentedControl = <T extends string>({ segments, selected, onChange, accessibilityLabel, style }: SegmentedControlProps<T>) => {
  const theme = useTheme();
  return <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, style]}>
    {segments.map(segment => {
      const active = selected === segment.value;
      return <Pressable key={segment.value} accessibilityRole="radio" accessibilityState={{ selected: active }} accessibilityLabel={segment.label} hitSlop={{ top: 6, bottom: 6 }} onPress={() => { if (!active) onChange(segment.value); }} style={({ pressed }) => ({ minHeight: 32, paddingHorizontal: active ? 16 : 14, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: active ? theme.hex.secondarySystemBackground : 'rgba(255,255,255,0.22)', borderWidth: active ? 0 : 1, borderColor: 'rgba(255,255,255,0.35)', opacity: pressed ? 0.65 : 1 })}>
        <Text variant="footnote" weight={active ? 'medium' : 'regular'} color={active ? 'label' : 'onBackdrop'}>{segment.label}</Text>
      </Pressable>;
    })}
  </View>;
};
