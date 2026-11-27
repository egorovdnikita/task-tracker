import { MenuButton, type MenuItem } from './Menu';
import { NumberText } from './NumberText';
import { localColors } from '../theme/localColors';
import { boxPrimitives } from '../vendor/box-ui/primitives';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type RootHeaderProps = {
  title: string;
  /** Кнопки справа в строке заголовка: капсула управления, круг «+». */
  right?: React.ReactNode;
  count?: number;
  menu?: () => MenuItem[];
  menuLabel?: string;
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
export const RootHeader = ({ title, right, count, menu, menuLabel, style }: RootHeaderProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.row, { minHeight: count === undefined ? 68 : 104, gap: theme.spacing.md }, style]}>
      <View style={styles.title}>
        {menu ? <MenuButton accessibilityLabel={menuLabel ?? title} items={menu} style={{ minHeight: 22 }}><Text variant={count === undefined ? 'title1' : 'body'} weight={count === undefined ? 'medium' : 'regular'} color="onBackdrop" numberOfLines={1} accessibilityRole="header">{title}</Text></MenuButton> : <Text variant={count === undefined ? 'title1' : 'body'} weight={count === undefined ? 'medium' : 'regular'} color="onBackdrop" numberOfLines={1} accessibilityRole="header">{title}</Text>}
        {count === undefined ? null : <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm }}>
          <NumberText style={{ color: localColors.white }}>{String(count).padStart(2, '0')}</NumberText>
          <Text variant="footnote" color="secondaryOnBackdrop">заметок</Text>
        </View>}
      </View>
      {right ? <View style={[styles.row, { gap: theme.spacing.md }]}>{right}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1 },
});
