import type { AppearancePreference } from '../theme';
import type { SortMode } from '../types';

/**
 * Подписи настроек.
 *
 * Живут вне экранов, потому что одну и ту же настройку показывают в двух
 * местах: строкой со значением справа и списком с галочкой внутри. Разойтись
 * этим подписям нельзя — иначе строка обещает одно, а экран под ней предлагает
 * другое.
 */
export const APPEARANCE_LABELS: Record<AppearancePreference, string> = {
  system: 'Как в системе',
  light: 'Светлое',
  dark: 'Тёмное',
};

export const SORT_LABELS: Record<SortMode, string> = {
  updated: 'По дате изменения',
  created: 'По дате создания',
  title: 'По заголовку',
};
