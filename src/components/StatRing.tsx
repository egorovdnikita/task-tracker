import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { NumberText } from './NumberText';
export type StatRingProps = { value: string; label: string; progress?: number };
/** Числовая карточка Finch. Имя API сохранено для существующих потребителей. */
export const StatRing = ({ value, label }: StatRingProps) => {
  const theme = useTheme();
  return <View accessible accessibilityLabel={`${label}: ${value}`} style={{ flex: 1, maxWidth: 102, minWidth: 0, minHeight: 102, padding: 8, gap: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: theme.hex.secondarySystemBackground }}>
    <NumberText style={{ fontSize: 34, lineHeight: 38, color: theme.hex.label }}>{value}</NumberText>
    <Text variant="caption1" color="secondaryLabel">{label}</Text>
  </View>;
};
