import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { Fab } from './Fab';
import type { MenuAnchor } from './Menu';

export type BottomBarProps = {
  onCreate: () => void;
  onLongPressCreate?: (anchor: MenuAnchor) => void;
  createLabel?: string;
  /** Панель вкладок под кнопкой. На экранах вне вкладок её нет. */
  overTabBar?: boolean;
  /** Спрятать — например, пока идёт множественный выбор. */
  hidden?: boolean;
};

/**
 * Кнопка создания у нижнего края.
 *
 * Поиск отсюда ушёл наверх, под заголовок: искать глазами удобнее там, где
 * заголовок объясняет, что именно ищут, а внизу поле спорило за место и за
 * палец с панелью вкладок. Внизу осталось одно — то, ради чего приложение
 * открывают чаще всего.
 *
 * Кнопка стоит справа, в один ряд с панелью вкладок и в свободном поле рядом
 * с ней: панель вкладок iOS 26 — капсула по центру, и справа от неё остаётся
 * место ровно под круг. Ниже кнопку опускать нельзя: панель вкладок рисуется
 * нативно и лежит поверх содержимого экрана, так что нижняя половина круга
 * ушла бы под неё вместе с половиной цели касания. Поэтому круг накрывает
 * только верхнюю половину панели — визуально он в её ряду, а нажимается
 * целиком.
 */
export const BottomBar = ({
  onCreate,
  onLongPressCreate,
  createLabel,
  overTabBar = true,
  hidden = false,
}: BottomBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (hidden) return null;

  const bottom = insets.bottom + (overTabBar ? theme.metrics.tabBar / 2 : theme.spacing.sm);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, { right: theme.spacing.md, bottom }]}
    >
      <Fab onPress={onCreate} onLongPress={onLongPressCreate} accessibilityLabel={createLabel} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { position: 'absolute' },
});
