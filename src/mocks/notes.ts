import type { Note } from '../types';

const day = 86_400_000;
const base = new Date('2026-08-12T14:20:00').getTime();

const text = (id: string, value: string) => ({ id, type: 'text' as const, text: value });

/** Данные для витрины. Метки времени фиксированы — истории не «плывут» день ото дня. */
export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Созвон по релизу',
    blocks: [text('1a', 'Обсудить сроки, QA и что выносим в 1.1. Проверить, что сторы приняли билд.')],
    tags: ['Работа'],
    folderId: null,
    accent: 'blue',
    pinned: true,
    remindAt: base + day,
    deletedAt: null,
    createdAt: base - 3 * day,
    updatedAt: base,
  },
  {
    id: '2',
    title: 'Чек-лист релиза',
    blocks: [
      {
        id: '2a',
        type: 'checklist',
        items: [
          { id: '2a1', text: 'Смоук-тест', done: true },
          { id: '2a2', text: 'Загрузить в App Store Connect', done: true },
          { id: '2a3', text: 'Changelog', done: true },
          { id: '2a4', text: 'Пост в канал', done: false },
          { id: '2a5', text: 'Ответить на отзывы', done: false },
          { id: '2a6', text: 'Снять метрики через неделю', done: false },
          { id: '2a7', text: 'Ретро', done: false },
        ],
      },
    ],
    tags: ['Работа'],
    folderId: null,
    accent: 'orange',
    pinned: false,
    remindAt: null,
    deletedAt: null,
    createdAt: base - 8 * day,
    updatedAt: base - day,
  },
  {
    id: '3',
    title: '',
    blocks: [text('3a', 'Трекер привычек с недельными сериями и мягкими напоминаниями без гилт-триппинга.')],
    tags: ['Идеи'],
    folderId: null,
    accent: null,
    pinned: false,
    remindAt: null,
    deletedAt: null,
    createdAt: base - 5 * day,
    updatedAt: base - 2 * day,
  },
  {
    id: '4',
    title: 'Список покупок',
    blocks: [text('4a', 'молоко, хлеб, кофе, оливковое масло')],
    tags: ['Личное'],
    folderId: null,
    accent: 'green',
    pinned: false,
    remindAt: null,
    deletedAt: null,
    createdAt: base - 6 * day,
    updatedAt: base - 3 * day,
  },
  {
    id: '6',
    title: '',
    blocks: [
      {
        id: '6a',
        type: 'voice',
        uri: 'file:///mock/voice.m4a',
        durationMs: 42_000,
        markers: [{ id: '6m1', atMs: 12_000 }],
        title: '',
      },
    ],
    tags: ['Работа'],
    folderId: null,
    accent: 'red',
    pinned: false,
    remindAt: null,
    deletedAt: null,
    createdAt: base - 4 * day,
    updatedAt: base - 4 * day,
  },
  {
    id: '5',
    title: 'Книги на осень',
    blocks: [text('5a', 'Дизайн привычных вещей · Ясно и понятно · Атомные привычки')],
    tags: ['Личное', 'Идеи'],
    folderId: null,
    accent: 'purple',
    pinned: false,
    remindAt: null,
    deletedAt: null,
    createdAt: base - 10 * day,
    updatedAt: base - 6 * day,
  },
];

export const mockNote = mockNotes[0];
export const mockChecklistNote = mockNotes[1];
