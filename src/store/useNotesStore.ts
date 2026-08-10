import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { NoteColor } from '../theme/tokens';
import { DEFAULT_TAGS, type Note, type Settings, type SortMode } from '../types';

export type NoteInput = {
  title: string;
  body: string;
  tag: string | null;
  color: NoteColor;
  pinned: boolean;
};

type NotesState = {
  notes: Note[];
  settings: Settings;
  hydrated: boolean;
  addNote: (input: NoteInput) => Note;
  updateNote: (id: string, input: Partial<NoteInput>) => void;
  deleteNote: (id: string) => void;
  togglePinned: (id: string) => void;
  clearAll: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
};

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const defaultSettings: Settings = { scheme: 'light', compact: false, sort: 'updated' };

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [] as Note[],
      settings: defaultSettings,
      hydrated: false as boolean,

      addNote: (input) => {
        const now = Date.now();
        const note: Note = { id: makeId(), ...input, createdAt: now, updatedAt: now };
        set({ notes: [note, ...get().notes] });
        return note;
      },

      updateNote: (id, input) =>
        set({
          notes: get().notes.map((n) => (n.id === id ? { ...n, ...input, updatedAt: Date.now() } : n)),
        }),

      deleteNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),

      togglePinned: (id) =>
        set({
          notes: get().notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        }),

      clearAll: () => set({ notes: [] }),

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
    }),
    {
      name: 'task-tracker-notes',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ notes, settings }) => ({ notes, settings }),
      onRehydrateStorage: () => (state) => state && useNotesStore.setState({ hydrated: true }),
    },
  ),
);

/** Sorts notes by the active sort mode, pinned notes always first. */
export const sortNotes = (notes: Note[], sort: SortMode): Note[] =>
  [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
    if (sort === 'title') return (a.title || '').localeCompare(b.title || '', 'ru');
    if (sort === 'created') return b.createdAt - a.createdAt;
    return b.updatedAt - a.updatedAt;
  });

/** Case-insensitive search across title, body and tag. */
export const searchNotes = (notes: Note[], query: string): Note[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return notes.filter((n) =>
    [n.title, n.body, n.tag ?? ''].some((field) => field.toLowerCase().includes(needle)),
  );
};

/** Default tags plus any tag already used by a note. */
export const collectTags = (notes: Note[]): string[] => {
  const set = new Set<string>(DEFAULT_TAGS);
  notes.forEach((n) => n.tag && set.add(n.tag));
  return [...set];
};
