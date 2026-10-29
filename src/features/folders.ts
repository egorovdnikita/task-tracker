import { confirmDestructive, promptForText } from '../utils/actionSheet';
import { useNotesStore } from '../store/useNotesStore';

/**
 * Спросить имя папки — одно правило на создание, вложение, переименование и
 * «Новую папку…» в шите переноса.
 *
 * Проверка «имя занято» раньше жила только при создании на экране «Папки», и
 * переименованием или из шита переноса можно было получить две «Работы»
 * рядом. Сравнение — без учёта регистра и только среди соседей по уровню:
 * «Работа» в корне и «Работа» внутри «Проектов» — разные места.
 */
export const promptForFolderName = ({
  title,
  message,
  parentId,
  initial = '',
  renaming,
  onSubmit,
}: {
  title: string;
  message: string;
  parentId: string | null;
  initial?: string;
  /** Идентификатор переименовываемой папки: её собственное имя не занято. */
  renaming?: string;
  onSubmit: (name: string) => void;
}) =>
  promptForText(
    title,
    message,
    (name) => {
      const taken = useNotesStore
        .getState()
        .folders.some(
          (f) =>
            f.parentId === parentId &&
            f.id !== renaming &&
            f.name.toLowerCase() === name.toLowerCase(),
        );

      if (taken) {
        confirmDestructive('Имя занято', `Папка «${name}» на этом уровне уже есть.`, 'Понятно', () => {});
        return;
      }

      onSubmit(name);
    },
    initial,
  );
