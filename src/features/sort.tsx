import React from 'react';

import { MenuButton, Symbol } from '../components';
import { useTheme } from '../theme';
import { useNotesStore } from '../store/useNotesStore';
import { SORT_LABELS } from './labels';

/**
 * Кнопка сортировки для капсулы в шапке списка.
 *
 * Одна на «Заметки», папку и тег: сортировка общая для всех списков, и
 * менять её нужно там же, где видно, на что она влияет. Раньше она была
 * только на «Заметках», а в папке и в теге её не было вовсе.
 */
export const SortButton = () => {
  const theme = useTheme();
  const sort = useNotesStore((s) => s.settings.sort);
  const updateSettings = useNotesStore((s) => s.updateSettings);

  return (
    <MenuButton
      accessibilityLabel={`Сортировка: ${SORT_LABELS[sort]}`}
      title="Сортировка"
      items={() =>
        (Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map((mode) => ({
          title: SORT_LABELS[mode],
          checked: sort === mode,
          onPress: () => updateSettings({ sort: mode }),
        }))
      }
      style={({ pressed }) => ({
        width: theme.controlHeight.buttonCompact,
        height: theme.controlHeight.buttonCompact,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.4 : 1,
      })}
    >
      <Symbol name="arrow.up.arrow.down" size={20} color={theme.colors.label} />
    </MenuButton>
  );
};
