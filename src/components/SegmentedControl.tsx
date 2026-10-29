import React from 'react';
import { Platform, type ViewStyle } from 'react-native';
import SegmentedControlModule from '@react-native-segmented-control/segmented-control';

import { useTheme } from '../theme';

/**
 * Типы модуля описывают его классом в стиле React 18, и типы React 19.3 такой
 * класс за JSX-компонент не принимают. Рантайм это не трогает — переописываем
 * только то, чем пользуемся.
 */
type NativeSegmentedControlProps = {
  values: string[];
  selectedIndex: number;
  onChange: (event: { nativeEvent: { selectedSegmentIndex: number } }) => void;
  appearance?: 'dark' | 'light';
  fontStyle?: { fontFamily?: string; color?: string; fontSize?: number };
  activeFontStyle?: { color?: string; fontWeight?: string };
  style?: ViewStyle;
  accessibilityLabel?: string;
};

const NativeSegmentedControl =
  SegmentedControlModule as unknown as React.ComponentType<NativeSegmentedControlProps>;

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
 * Системный контрол знает про Dynamic Type, «Уменьшение движения», отдачу при
 * переключении и озвучку «вкладка 2 из 3» в VoiceOver, а на iOS 26 его
 * плашка — линза жидкого стекла, которую можно зажать и провести по ряду.
 *
 * Свой контрол здесь уже был — ради зазора между плашкой и краем трека — и
 * вернулся обратно: копия теряла системное стекло и линзу. По той же причине
 * не задаются ни `backgroundColor`, ни `tintColor`: с ними iOS рисует трек и
 * плашку плоской заливкой вместо стекла.
 *
 * Обёртка тонкая: работать со значениями, а не с индексами, и передать схему
 * из темы.
 */
export const SegmentedControl = <T extends string>({
  segments,
  selected,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedControlProps<T>) => {
  const theme = useTheme();
  const index = Math.max(
    0,
    segments.findIndex((s) => s.value === selected),
  );

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
      fontStyle={{
        fontFamily: Platform.OS === 'ios' ? undefined : 'System',
        color: theme.hex.secondaryLabel,
        fontSize: 15,
      }}
      activeFontStyle={{ color: theme.hex.label, fontWeight: '600' }}
      // Высоту системному контролу можно задать только снаружи: свои 32pt
      // рядом с полем поиска в 52 выглядели мелкой приставкой к нему.
      style={{ height: theme.controlHeight.segmented, ...style }}
    />
  );
};
