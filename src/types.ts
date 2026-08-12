import type { AccentName } from './theme';
import type { AppearancePreference } from './theme';

/** Пункт чек-листа. */
export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

/** Метка на дорожке записи — точка, к которой можно вернуться. Плита 04.1. */
export type VoiceMarker = { id: string; atMs: number };

/** Страница скана. Плита 04.3. */
export type ScanPage = { id: string; uri: string; width: number; height: number };

/**
 * Штрих рисунка. Плита 04.4.
 *
 * Хранится вектором, а не картинкой: скетч по вайрфрейму можно дорисовать
 * позже, а к растру вернуться уже нельзя — только поверх него.
 */
export type SketchStroke = {
  id: string;
  /** Данные пути SVG в координатах холста. */
  d: string;
  color: string;
  width: number;
};

/**
 * Блок внутри заметки.
 *
 * Принцип вайрфрейма — «одна заметка, много форм»: текст, список, запись, скан
 * и рисунок это не разные сущности, а блоки одной заметки. Поэтому у заметки
 * нет поля `body`, есть последовательность блоков, а тип выбирается для
 * скорости и не запирает содержимое.
 */
export type NoteBlock =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'checklist'; items: ChecklistItem[] }
  | {
      id: string;
      type: 'voice';
      uri: string;
      durationMs: number;
      markers: VoiceMarker[];
      /**
       * Подпись записи.
       *
       * Расшифровки нет: она живёт во фреймворке Speech, которого Expo Go не
       * даёт. Подпись — то, чем запись находится поиском; без неё голосовая
       * заметка была бы дырой в выдаче.
       */
      title: string;
    }
  | { id: string; type: 'scan'; pages: ScanPage[]; title: string }
  | { id: string; type: 'sketch'; strokes: SketchStroke[]; width: number; height: number };

export type BlockType = NoteBlock['type'];

/** Что за блок вставляем — общий словарь для меню создания и панели редактора. */
export const BLOCK_LABELS: Record<BlockType, string> = {
  text: 'Текстовая заметка',
  checklist: 'Список задач',
  voice: 'Голосовая заметка',
  scan: 'Скан документа',
  sketch: 'Рисунок',
};

/**
 * Папка — место хранения. Вложенность до двух уровней, как на плите 05.1:
  * `parentId` есть только у папок второго уровня.
 */
export type Folder = {
  id: string;
  name: string;
  accent: AccentName;
  parentId: string | null;
  createdAt: number;
};

export type Note = {
  id: string;
  title: string;
  blocks: NoteBlock[];
  /**
   * Теги — сквозной признак, поэтому их сколько угодно. Папка одна: она
   * отвечает на вопрос «где лежит», а тег — «про что это».
   */
  tags: string[];
  /** `null` — заметка лежит в корне, вне папок. */
  folderId: string | null;
  accent: AccentName | null;
  pinned: boolean;
  /** Время напоминания. `null` — напоминания нет. */
  remindAt: number | null;
  /**
   * Когда заметка отправлена в корзину. `null` — заметка живая.
   *
   * Удаление отложенное, а не мгновенное: на плите 08.5 у каждой заметки в
   * корзине написан свой срок, и посчитать его можно только от этой отметки.
   */
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type SortMode = 'updated' | 'created' | 'title';

/** Список или сетка. Плиты 02.2 и 02.3. */
export type LayoutMode = 'list' | 'grid';

export type Settings = {
  /** Светлая, тёмная или системная схема. */
  appearance: AppearancePreference;
  sort: SortMode;
  /**
   * Режим показа — свой для корня и для каждой папки, как требует плита 02.3.
   * Ключ `root` — корневой список, остальные ключи — идентификаторы папок.
   */
  layout: Record<string, LayoutMode>;
  /** Отмеченные пункты уезжают вниз списка. Плита 03.3. */
  moveCheckedDown: boolean;
  /**
   * Подписи рядом с иконками в панели редактора.
   *
   * У иконки без подписи угадывается «микрофон», но не «дедлайн», поэтому по
   * умолчанию подписи включены. Выключить их — право того, кто панель уже
   * выучил.
   */
  toolbarLabels: boolean;
  /**
   * Отпраздновано ли первое выполненное дело.
   *
   * Хранится, потому что праздник одноразовый: конфетти на каждом чек-боксе
   * перестаёт быть событием и превращается в помеху.
   */
  celebratedFirstDone: boolean;
};

/** Сколько заметка лежит в корзине до безвозвратного удаления. */
export const TRASH_RETENTION_DAYS = 30;
