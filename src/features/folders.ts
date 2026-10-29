import { useNotesStore } from '../store/useNotesStore';

/**
 * Имя папки занято — одно правило на создание, вложение, переименование и
 * «Новую папку…» в шите переноса.
 *
 * Сравнение — без учёта регистра и только среди соседей по уровню: «Работа»
 * в корне и «Работа» внутри «Проектов» — разные места. Своё прежнее имя при
 * переименовании занятым не считается.
 */
export const folderNameTaken = (name: string, parentId: string | null, except?: string): boolean =>
  useNotesStore
    .getState()
    .folders.some(
      (f) =>
        f.parentId === parentId &&
        f.id !== except &&
        f.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
