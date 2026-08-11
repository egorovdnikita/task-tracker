import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AccentName } from '../theme';
import {
  TRASH_RETENTION_DAYS,
  type Folder,
  type LayoutMode,
  type Note,
  type NoteBlock,
  type Settings,
  type SortMode,
} from '../types';
import { makeId, makeTextBlock, noteText } from '../utils/blocks';

const DAY = 86_400_000;

export type NoteInput = {
  title?: string;
  blocks?: NoteBlock[];
  tags?: string[];
  folderId?: string | null;
  accent?: AccentName | null;
  pinned?: boolean;
  remindAt?: number | null;
};

type NotesState = {
  notes: Note[];
  folders: Folder[];
  settings: Settings;
  hydrated: boolean;

  createNote: (input?: NoteInput) => Note;
  updateNote: (id: string, patch: NoteInput) => void;
  setBlocks: (id: string, blocks: NoteBlock[]) => void;
  toggleChecklistItem: (noteId: string, blockId: string, itemId: string) => void;
  togglePinned: (id: string) => void;
  setTags: (id: string, tags: string[]) => void;
  moveNotes: (ids: string[], folderId: string | null) => void;
  setRemindAt: (id: string, at: number | null) => void;

  trashNotes: (ids: string[]) => void;
  restoreNotes: (ids: string[]) => void;
  deleteForever: (ids: string[]) => void;
  emptyTrash: () => void;
  purgeExpired: () => void;

  createFolder: (name: string, accent: AccentName, parentId?: string | null) => Folder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string, contents: 'moveToRoot' | 'trash') => void;

  updateSettings: (patch: Partial<Settings>) => void;
  setLayout: (scope: string, mode: LayoutMode) => void;
  pushRecentQuery: (query: string) => void;
  removeRecentQuery: (query: string) => void;
  clearRecentQueries: () => void;
};

export const defaultSettings: Settings = {
  appearance: 'system',
  sort: 'updated',
  layout: { root: 'list' },
  moveCheckedDown: true,
  recentQueries: [],
};

const touch = <T extends Note>(note: T): T => ({ ...note, updatedAt: Date.now() });

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [] as Note[],
      folders: [] as Folder[],
      settings: defaultSettings,
      hydrated: false as boolean,

      createNote: (input = {}) => {
        const now = Date.now();
        const note: Note = {
          id: makeId(),
          title: input.title ?? '',
          // Пустой текстовый блок — не мусор, а курсор: редактор открывается
          // сразу в теле, и ему нужно во что встать.
          blocks: input.blocks ?? [makeTextBlock()],
          tags: input.tags ?? [],
          folderId: input.folderId ?? null,
          accent: input.accent ?? null,
          pinned: input.pinned ?? false,
          remindAt: input.remindAt ?? null,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        set({ notes: [note, ...get().notes] });
        return note;
      },

      updateNote: (id, patch) =>
        set({ notes: get().notes.map((n) => (n.id === id ? touch({ ...n, ...patch }) : n)) }),

      setBlocks: (id, blocks) =>
        set({ notes: get().notes.map((n) => (n.id === id ? touch({ ...n, blocks }) : n)) }),

      toggleChecklistItem: (noteId, blockId, itemId) =>
        set({
          notes: get().notes.map((note) => {
            if (note.id !== noteId) return note;
            return touch({
              ...note,
              blocks: note.blocks.map((block) => {
                if (block.id !== blockId || block.type !== 'checklist') return block;
                return {
                  ...block,
                  items: block.items.map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item,
                  ),
                };
              }),
            });
          }),
        }),

      togglePinned: (id) =>
        set({ notes: get().notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) }),

      setTags: (id, tags) =>
        set({ notes: get().notes.map((n) => (n.id === id ? touch({ ...n, tags }) : n)) }),

      moveNotes: (ids, folderId) =>
        set({
          notes: get().notes.map((n) => (ids.includes(n.id) ? touch({ ...n, folderId }) : n)),
        }),

      setRemindAt: (id, at) =>
        set({ notes: get().notes.map((n) => (n.id === id ? touch({ ...n, remindAt: at }) : n)) }),

      // Удаление отложенное: заметка уезжает в корзину и живёт там срок из
      // TRASH_RETENTION_DAYS. Мгновенное удаление есть только в самой корзине.
      trashNotes: (ids) =>
        set({
          notes: get().notes.map((n) =>
            ids.includes(n.id) ? { ...n, deletedAt: Date.now(), pinned: false } : n,
          ),
        }),

      restoreNotes: (ids) =>
        set({
          notes: get().notes.map((n) => (ids.includes(n.id) ? { ...n, deletedAt: null } : n)),
        }),

      deleteForever: (ids) => set({ notes: get().notes.filter((n) => !ids.includes(n.id)) }),

      emptyTrash: () => set({ notes: get().notes.filter((n) => n.deletedAt === null) }),

      /** Чистка просроченных. Вызывается при запуске, а не по таймеру. */
      purgeExpired: () => {
        const edge = Date.now() - TRASH_RETENTION_DAYS * DAY;
        const notes = get().notes.filter((n) => n.deletedAt === null || n.deletedAt > edge);
        if (notes.length !== get().notes.length) set({ notes });
      },

      createFolder: (name, accent, parentId = null) => {
        const folder: Folder = { id: makeId(), name, accent, parentId, createdAt: Date.now() };
        set({ folders: [...get().folders, folder] });
        return folder;
      },

      renameFolder: (id, name) =>
        set({ folders: get().folders.map((f) => (f.id === id ? { ...f, name } : f)) }),

      /**
       * Удаление папки всегда спрашивает про содержимое (плита 05.1), поэтому
       * решение приходит сюда параметром, а не выбирается здесь по умолчанию.
       * Вложенные папки уходят вместе с родителем.
       */
      deleteFolder: (id, contents) => {
        const nested = get().folders.filter((f) => f.parentId === id).map((f) => f.id);
        const doomed = [id, ...nested];
        const now = Date.now();

        set({
          folders: get().folders.filter((f) => !doomed.includes(f.id)),
          notes: get().notes.map((n) => {
            if (!n.folderId || !doomed.includes(n.folderId)) return n;
            return contents === 'moveToRoot'
              ? { ...n, folderId: null }
              : { ...n, folderId: null, deletedAt: now, pinned: false };
          }),
        });
      },

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      setLayout: (scope, mode) =>
        set({
          settings: { ...get().settings, layout: { ...get().settings.layout, [scope]: mode } },
        }),

      pushRecentQuery: (query) => {
        const value = query.trim();
        if (value.length < 2) return;
        const rest = get().settings.recentQueries.filter((q) => q !== value);
        set({ settings: { ...get().settings, recentQueries: [value, ...rest].slice(0, 8) } });
      },

      removeRecentQuery: (query) =>
        set({
          settings: {
            ...get().settings,
            recentQueries: get().settings.recentQueries.filter((q) => q !== query),
          },
        }),

      clearRecentQueries: () => set({ settings: { ...get().settings, recentQueries: [] } }),
    }),
    {
      name: 'task-tracker-notes',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      /**
       * v1 хранил тело строкой и цвет из светлой палитры, v2 — свечение из
       * dark-only системы и один тег. Обе схемы переводятся вперёд без потерь:
       * тело становится текстовым блоком, тег — списком из одного элемента,
       * свечение — акцентом из системной палитры.
       */
      migrate: (persisted: any, from) => {
        if (from >= 3 || !persisted) return persisted;

        const accentOf = (value: unknown): AccentName | null => {
          const map: Record<string, AccentName> = {
            lime: 'green', aqua: 'mint', violet: 'purple', amber: 'orange', rose: 'pink',
            yellow: 'yellow', green: 'green', blue: 'blue', pink: 'pink', default: 'gray',
          };
          return typeof value === 'string' ? map[value] ?? null : null;
        };

        return {
          folders: [],
          notes: (persisted.notes ?? []).map((n: any) => ({
            id: n.id,
            title: n.title ?? '',
            blocks: Array.isArray(n.blocks) ? n.blocks : [makeTextBlock(n.body ?? '')],
            tags: Array.isArray(n.tags) ? n.tags : n.tag ? [n.tag] : [],
            folderId: n.folderId ?? null,
            accent: accentOf(n.accent ?? n.glow ?? n.color),
            pinned: Boolean(n.pinned),
            remindAt: n.remindAt ?? null,
            deletedAt: n.deletedAt ?? null,
            createdAt: n.createdAt ?? Date.now(),
            updatedAt: n.updatedAt ?? Date.now(),
          })),
          settings: { ...defaultSettings, sort: persisted.settings?.sort ?? 'updated' },
        };
      },
      partialize: ({ notes, folders, settings }) => ({ notes, folders, settings }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        useNotesStore.setState({ hydrated: true });
        useNotesStore.getState().purgeExpired();
      },
    },
  ),
);

// ── Селекторы ───────────────────────────────────────────────────────────────

/** Живые заметки — всё, что не в корзине. */
export const activeNotes = (notes: Note[]): Note[] => notes.filter((n) => n.deletedAt === null);

export const trashedNotes = (notes: Note[]): Note[] =>
  notes.filter((n) => n.deletedAt !== null).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));

/** Сколько дней осталось заметке в корзине. Плита 08.5. */
export const daysLeftInTrash = (note: Note, now: number = Date.now()): number =>
  Math.max(0, Math.ceil((note.deletedAt! + TRASH_RETENTION_DAYS * DAY - now) / DAY));

/** Сортировка по выбранному режиму; закреплённые всегда сверху. */
export const sortNotes = (notes: Note[], sort: SortMode): Note[] =>
  [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
    if (sort === 'title') return (a.title || '').localeCompare(b.title || '', 'ru');
    if (sort === 'created') return b.createdAt - a.createdAt;
    return b.updatedAt - a.updatedAt;
  });

/**
 * Поиск по заголовку, всему тексту блоков и тегам.
 *
 * Корзина не ищется: заметка в ней уже удалена, и находить её вперемешку с
 * живыми значит показывать результат, по которому нельзя работать.
 */
export const searchNotes = (notes: Note[], query: string): Note[] => {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  return activeNotes(notes).filter((note) =>
    [note.title, noteText(note), note.tags.join(' ')].some((field) =>
      field.toLowerCase().includes(needle),
    ),
  );
};

export const notesInFolder = (notes: Note[], folderId: string | null): Note[] =>
  activeNotes(notes).filter((n) => n.folderId === folderId);

/** Все теги, которые где-то используются, по алфавиту. */
export const collectTags = (notes: Note[]): string[] =>
  [...new Set(activeNotes(notes).flatMap((n) => n.tags))].sort((a, b) => a.localeCompare(b, 'ru'));

/**
 * Сколько заметок в папке. Счётчик включает вложенные папки — так на плите
 * 05.1: у родителя число, в которое входит содержимое детей.
 */
export const folderCount = (notes: Note[], folders: Folder[], folderId: string): number => {
  const nested = folders.filter((f) => f.parentId === folderId).map((f) => f.id);
  const scope = [folderId, ...nested];
  return activeNotes(notes).filter((n) => n.folderId && scope.includes(n.folderId)).length;
};

export const rootFolders = (folders: Folder[]): Folder[] =>
  folders.filter((f) => f.parentId === null);

export const childFolders = (folders: Folder[], parentId: string): Folder[] =>
  folders.filter((f) => f.parentId === parentId);
