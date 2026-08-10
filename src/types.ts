import type { NoteColor } from './theme/tokens';

export type Note = {
  id: string;
  title: string;
  body: string;
  tag: string | null;
  color: NoteColor;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SortMode = 'updated' | 'created' | 'title';

export type Settings = {
  scheme: 'light' | 'dark';
  compact: boolean;
  sort: SortMode;
};

export const DEFAULT_TAGS = ['Работа', 'Идеи', 'Личное'] as const;
