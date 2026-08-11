import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Glass, IconButton, Text } from '../components';
import { useTheme } from '../theme';

export type Selection = {
  active: boolean;
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

/**
 * Множественный выбор. Плита 05.2.
 *
 * Режим включается первым долгим нажатием и выключается, когда снята
 * последняя отметка: отдельная кнопка «Готово» здесь лишняя — выйти из режима
 * и так можно, сняв всё, а два способа выхода из одного состояния читаются
 * как два разных состояния.
 */
export const useSelection = (): Selection => {
  const [ids, setIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return useMemo(
    () => ({ active: ids.length > 0, ids, toggle, clear }),
    [ids, toggle, clear],
  );
};

export type SelectionBarProps = {
  selection: Selection;
  onDelete: (ids: string[]) => void;
  /** Что именно выбрано — «3 заметки». Заменяет заголовок экрана. */
  summary: string;
};

/**
 * Панель действий над выбранным.
 *
 * Она встаёт на место панели вкладок, а не над ней: два ряда кнопок внизу
 * экрана — это два ряда кнопок, между которыми приходится выбирать глазами.
 */
export const SelectionBar = ({ selection, onDelete, summary }: SelectionBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!selection.active) return null;

  return (
    <Glass
      material="chrome"
      variant="regular"
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom || theme.spacing.md,
          paddingTop: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing.xl,
        },
      ]}
    >
      <Text variant="subheadline" color="secondaryLabel" style={styles.grow} numberOfLines={1}>
        {summary}
      </Text>

      <IconButton
        name="folder"
        accessibilityLabel="Переместить выбранное"
        onPress={() => {
          router.push({ pathname: '/move', params: { ids: selection.ids.join(',') } });
          selection.clear();
        }}
      />

      <IconButton
        name="trash"
        color="systemRed"
        accessibilityLabel="Удалить выбранное"
        onPress={() => onDelete(selection.ids)}
      />

      <IconButton name="xmark" accessibilityLabel="Снять выделение" onPress={selection.clear} />
    </Glass>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: { flex: 1 },
});
