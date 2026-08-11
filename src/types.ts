import type { NoteGlow } from './theme/tokens';

export type Note = {
  id: string;
  title: string;
  body: string;
  tag: string | null;
  /** Цветовое свечение карточки; `none` — без акцента. */
  glow: NoteGlow;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SortMode = 'updated' | 'created' | 'title';

/** Система dark-only, поэтому выбора цветовой схемы здесь нет. */
export type Settings = {
  compact: boolean;
  sort: SortMode;
};

export const DEFAULT_TAGS = ['Работа', 'Идеи', 'Личное'] as const;
