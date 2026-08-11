import type {
  ChecklistItem,
  Note,
  NoteBlock,
  ScanPage,
  SketchStroke,
  VoiceMarker,
} from '../types';

/** Идентификаторы блоков и пунктов — те же, что у заметок в сторе. */
export const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const makeTextBlock = (text = ''): NoteBlock => ({ id: makeId(), type: 'text', text });

export const makeChecklistItem = (text = ''): ChecklistItem => ({
  id: makeId(),
  text,
  done: false,
});

export const makeChecklistBlock = (items: ChecklistItem[] = [makeChecklistItem()]): NoteBlock => ({
  id: makeId(),
  type: 'checklist',
  items,
});

export const makeVoiceBlock = (
  uri: string,
  durationMs: number,
  markers: VoiceMarker[] = [],
): NoteBlock => ({ id: makeId(), type: 'voice', uri, durationMs, markers, title: '' });

export const makeScanBlock = (pages: ScanPage[]): NoteBlock => ({
  id: makeId(),
  type: 'scan',
  pages,
  title: '',
});

export const makeSketchBlock = (
  strokes: SketchStroke[],
  width: number,
  height: number,
): NoteBlock => ({ id: makeId(), type: 'sketch', strokes, width, height });

/**
 * Плоский текст блока — для поиска и превью.
 *
 * У записи и скана это подпись, а не содержимое: расшифровка речи и
 * распознавание текста живут во фреймворках Speech и Vision, которых Expo Go
 * не даёт. Отдавать здесь пустую строку значило бы, что голосовая заметка
 * не находится ничем.
 */
export const blockText = (block: NoteBlock): string => {
  switch (block.type) {
    case 'text':
      return block.text;
    case 'checklist':
      return block.items.map((i) => i.text).join(' ');
    case 'voice':
    case 'scan':
      return block.title;
    case 'sketch':
      return '';
  }
};

/** Сколько страниц, секунд или штрихов — подпись под превью блока. */
export const blockSummary = (block: NoteBlock): string => {
  switch (block.type) {
    case 'voice':
      return formatDuration(block.durationMs);
    case 'scan':
      return block.pages.length === 1 ? '1 страница' : `${block.pages.length} страниц`;
    case 'sketch':
      return `${block.strokes.length} штрихов`;
    default:
      return '';
  }
};

/** «1:04» — длительность записи. Часов у голосовой заметки не бывает. */
export const formatDuration = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/** Весь текст заметки одной строкой. По нему ищет поиск. */
export const noteText = (note: Note): string => note.blocks.map(blockText).join(' ');

/**
 * Строка превью для карточки.
 *
 * Берётся первый блок, в котором есть что показать, а не первый вообще:
 * пустой текстовый блок сверху — обычное состояние свежей заметки, и
 * карточка из-за него выглядела бы пустой при непустом содержимом.
 */
export const notePreview = (note: Note): string => {
  for (const block of note.blocks) {
    switch (block.type) {
      case 'text': {
        const text = block.text.trim();
        if (text) return text;
        break;
      }
      case 'checklist': {
        const filled = block.items.filter((i) => i.text.trim());
        if (filled.length > 0) return filled.map((i) => i.text.trim()).join(', ');
        break;
      }
      // У записи, скана и рисунка своего текста нет. Показываем, что это
      // такое и сколько его: «Голосовая заметка · 1:04» осмысленнее пустой
      // строки, за которой на самом деле лежит содержимое.
      case 'voice':
        return block.title.trim() || `Голосовая заметка · ${blockSummary(block)}`;
      case 'scan':
        return block.title.trim() || `Скан · ${blockSummary(block)}`;
      case 'sketch':
        if (block.strokes.length > 0) return `Рисунок · ${blockSummary(block)}`;
        break;
    }
  }
  return '';
};

/**
 * Прогресс по всем чек-листам заметки — «3 из 7» на карточке.
 * `null`, если списков нет: показывать «0 из 0» не о чем.
 */
export const checklistProgress = (note: Note): { done: number; total: number } | null => {
  let done = 0;
  let total = 0;

  for (const block of note.blocks) {
    if (block.type !== 'checklist') continue;
    for (const item of block.items) {
      if (!item.text.trim()) continue;
      total += 1;
      if (item.done) done += 1;
    }
  }

  return total === 0 ? null : { done, total };
};

/**
 * Есть ли в заметке хоть что-то, кроме заголовка.
 *
 * По одному тексту судить нельзя: у записи без подписи текст пустой, а сама
 * запись есть — и заметка с ней уехала бы в корзину при выходе из редактора
 * как пустая.
 */
export const hasContent = (blocks: NoteBlock[]): boolean =>
  blocks.some((block) => {
    switch (block.type) {
      case 'voice':
        return true;
      case 'scan':
        return block.pages.length > 0;
      case 'sketch':
        return block.strokes.length > 0;
      default:
        return blockText(block).trim().length > 0;
    }
  });

/**
 * Заголовок для показа.
 *
 * Если своего заголовка нет, берётся первая строка тела — так же, как в
 * системных «Заметках». Требовать заголовок отдельно значит ставить диалог
 * между намерением и курсором, а это ровно то, чего первый принцип вайрфрейма
 * велит не делать.
 */
export const noteTitle = (note: Note): string => {
  const own = note.title.trim();
  if (own) return own;

  const preview = notePreview(note).trim();
  if (!preview) return 'Без заголовка';

  const firstLine = preview.split('\n')[0].trim();
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}…` : firstLine;
};

/**
 * Строка под заголовком карточки.
 *
 * Если своего заголовка у заметки нет, его роль играет первая строка тела —
 * и повторять её же в превью незачем: карточка выглядела бы так, будто в
 * заметке одно предложение, написанное дважды. Показываем то, что идёт дальше.
 */
export const noteSubtitle = (note: Note): string => {
  const preview = notePreview(note);
  if (note.title.trim()) return preview;

  const shown = noteTitle(note).replace(/…$/, '');
  const rest = preview.startsWith(shown) ? preview.slice(shown.length) : preview;
  return rest.replace(/^[\s\n·,]+/, '');
};
