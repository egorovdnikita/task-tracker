import type { Note, NoteBlock } from '../types';
import { blockText, checklistProgress, noteText } from './blocks';

/** Слова — последовательности букв и цифр; эмодзи и знаки не считаются. */
export const countWords = (text: string): number => text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;

/** Сводка одной заметки — для шита «О заметке». */
export const noteStats = (note: Note) => {
  const text = [note.title, noteText(note)].join(' ');
  const count = (type: NoteBlock['type']) => note.blocks.filter((b) => b.type === type).length;
  const voiceMs = note.blocks.reduce((ms, b) => (b.type === 'voice' ? ms + b.durationMs : ms), 0);
  const pages = note.blocks.reduce((n, b) => (b.type === 'scan' ? n + b.pages.length : n), 0);

  return {
    words: countWords(text),
    characters: note.blocks.map(blockText).join('').replace(/\s/g, '').length,
    checklist: checklistProgress(note),
    texts: count('text'),
    lists: count('checklist'),
    voices: count('voice'),
    scans: count('scan'),
    sketches: count('sketch'),
    voiceMs,
    pages,
  };
};

const DAY = 86_400_000;

/** Сводка по всем живым заметкам — для страницы «Статистика». */
export const libraryStats = (notes: Note[], now: number = Date.now()) => {
  const per = notes.map(noteStats);
  const sum = (pick: (s: ReturnType<typeof noteStats>) => number) =>
    per.reduce((total, s) => total + pick(s), 0);
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);

  return {
    notes: notes.length,
    words: sum((s) => s.words),
    itemsDone: sum((s) => s.checklist?.done ?? 0),
    itemsTotal: sum((s) => s.checklist?.total ?? 0),
    voiceMs: sum((s) => s.voiceMs),
    voices: sum((s) => s.voices),
    pages: sum((s) => s.pages),
    sketches: sum((s) => s.sketches),
    pinned: notes.filter((n) => n.pinned).length,
    withReminder: notes.filter((n) => n.remindAt !== null && n.remindAt > now).length,
    createdThisWeek: notes.filter((n) => n.createdAt > now - 7 * DAY).length,
    editedToday: notes.filter((n) => n.updatedAt >= startOfToday).length,
    /** Заметки по дням за последние 7 дней, от старых к новым. */
    week: Array.from({ length: 7 }, (_, i) => {
      const from = startOfToday - (6 - i) * DAY;
      return notes.filter((n) => n.createdAt >= from && n.createdAt < from + DAY).length;
    }),
  };
};
