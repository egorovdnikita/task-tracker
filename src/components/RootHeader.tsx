import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type RootHeaderProps = {
  title: string;
  /** Кнопки справа в строке заголовка: капсула управления, круг «+». */
  right?: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Шапка корня вкладки — как у Opal: крупный заголовок слева (34 bold, замер
 * «Apps»: левый край 16), кнопки справа в той же строке, как логотип и
 * аватар на главной Opal.
 *
 * Это не системная шапка: системный крупный заголовок встаёт отдельной
 * полосой под строкой кнопок и разводит имя раздела и управление им по двум
 * строкам. Шапка лежит первой строкой списка и уезжает вместе с ним; у
 * корней вкладок системная шапка скрыта.
 */
export const RootHeader = ({ title, right, style }: RootHeaderProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.row, { minHeight: 52, gap: theme.spacing.sm }, style]}>
      <Text variant="largeTitle" weight="bold" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {right ? <View style={[styles.row, { gap: theme.spacing.sm }]}>{right}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1 },
});
