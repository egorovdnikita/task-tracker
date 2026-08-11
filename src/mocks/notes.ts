import type { Note } from '../types';

const day = 86_400_000;
const base = new Date('2026-08-11T14:20:00').getTime();

/** Fixture data shared by Storybook stories (stable timestamps → stable snapshots). */
export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Созвон по релизу',
    body: 'Обсудить сроки, QA и что выносим в 1.1. Проверить, что сторы приняли билд.',
    tag: 'Работа',
    glow: 'lime',
    pinned: true,
    createdAt: base - 3 * day,
    updatedAt: base,
  },
  {
    id: '2',
    title: 'Идея для приложения',
    body: 'Трекер привычек с недельными сериями и мягкими напоминаниями без гилт-триппинга.',
    tag: 'Идеи',
    glow: 'aqua',
    pinned: false,
    createdAt: base - 5 * day,
    updatedAt: base - day,
  },
  {
    id: '3',
    title: 'Список покупок',
    body: 'молоко, хлеб, кофе, оливковое масло',
    tag: 'Личное',
    glow: 'none',
    pinned: false,
    createdAt: base - 6 * day,
    updatedAt: base - 2 * day,
  },
  {
    id: '4',
    title: 'Чек-лист релиза',
    body: '1. смоук-тест 2. сторы 3. changelog 4. пост в канал',
    tag: 'Работа',
    glow: 'violet',
    pinned: false,
    createdAt: base - 8 * day,
    updatedAt: base - 3 * day,
  },
  {
    id: '5',
    title: 'Книги на осень',
    body: 'Дизайн привычных вещей, Ясно и понятно, Атомные привычки',
    tag: 'Личное',
    glow: 'rose',
    pinned: false,
    createdAt: base - 10 * day,
    updatedAt: base - 6 * day,
  },
];

export const mockNote = mockNotes[0];
