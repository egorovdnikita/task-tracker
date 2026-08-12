import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { useKeyboardHeight } from '../utils/useKeyboardVisible';
import { Fab } from './Fab';
import { SearchField } from './SearchField';

export type BottomBarProps = {
  /** Поле поиска слева. Без него в ряду остаётся одна кнопка создания. */
  search?: {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
  };
  onCreate: () => void;
  onLongPressCreate?: () => void;
  createLabel?: string;
  /** Панель вкладок под рядом. На экранах вне вкладок её нет. */
  overTabBar?: boolean;
  /** Спрятать — например, пока идёт множественный выбор. */
  hidden?: boolean;
};

/**
 * Нижний ряд: поиск и создание.
 *
 * Здесь сходятся два решения. Первое — поиск перестал быть вкладкой: искать
 * нужно в списке, который перед глазами, а не на отдельном экране, куда
 * список надо принести. Второе — кнопка создания стоит на одном месте всегда,
 * в том числе на пустом экране: раньше она пряталась, когда список пуст, и
 * приложение без единой заметки оказывалось без способа её завести.
 *
 * Ряд прижат к нижнему краю над панелью вкладок — туда дотягивается большой
 * палец. С клавиатурой он поднимается: искать вслепую под клавиатурой нельзя.
 */
export const BottomBar = ({
  search,
  onCreate,
  onLongPressCreate,
  createLabel,
  overTabBar = true,
  hidden = false,
}: BottomBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();

  if (hidden) return null;

  const resting = insets.bottom + (overTabBar ? theme.metrics.tabBar : 0) + theme.spacing.sm;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.root,
        {
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          bottom: keyboard > 0 ? keyboard + theme.spacing.sm : resting,
          gap: theme.spacing.md,
        },
      ]}
    >
      {search ? (
        <SearchField
          value={search.value}
          onChangeText={search.onChangeText}
          placeholder={search.placeholder}
          style={styles.grow}
        />
      ) : (
        <View style={styles.grow} pointerEvents="none" />
      )}

      <Fab onPress={onCreate} onLongPress={onLongPressCreate} accessibilityLabel={createLabel} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
});
