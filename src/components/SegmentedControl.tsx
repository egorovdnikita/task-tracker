import React from 'react';
import { Platform, type ViewStyle } from 'react-native';
import NativeSegmentedControl from '@react-native-segmented-control/segmented-control';

import { useTheme } from '../theme';

export type Segment<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  selected: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

/**
 * Сегмент-контрол — настоящий `UISegmentedControl`.
 *
 * Раньше здесь была своя реализация: трек, едущая пружиной плашка, свои
 * подписи. Она выглядела похоже и была неправильной. Системный контрол сам
 * знает про Dynamic Type, «Уменьшение движения», отдачу при переключении,
 * длинное нажатие с перетаскиванием плашки и озвучку «вкладка 2 из 3» в
 * VoiceOver — в копии всего этого не было и не могло появиться, не переписав
 * половину UIKit.
 *
 * Тонкая обёртка нужна ровно для двух вещей: работать со значениями, а не с
 * индексами, и подставить акцент из темы.
 */
export const SegmentedControl = <T extends string>({
  segments,
  selected,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedControlProps<T>) => {
  const theme = useTheme();
  const index = Math.max(0, segments.findIndex((s) => s.value === selected));

  return (
    <NativeSegmentedControl
      accessibilityLabel={accessibilityLabel}
      values={segments.map((s) => s.label)}
      selectedIndex={index}
      onChange={(event) => {
        const next = segments[event.nativeEvent.selectedSegmentIndex];
        if (next && next.value !== selected) onChange(next.value);
      }}
      // Схему передаём явно: контрол системный и по умолчанию следует за
      // системной темой, а в приложении она может быть переопределена своей.
      appearance={theme.scheme}
      fontStyle={{ fontFamily: Platform.OS === 'ios' ? undefined : 'System' }}
      style={style}
    />
  );
};
