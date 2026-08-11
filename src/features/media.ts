import { Directory, File, Paths } from 'expo-file-system';

import { makeId } from '../utils/blocks';

/**
 * Файлы записей и сканов.
 *
 * Камера и микрофон отдают файл в кэш, а кэш система вправе вычистить когда
 * угодно. Заметка, у которой запись исчезла после перезапуска, — это не «редкий
 * случай», а гарантированное поведение, если файл оставить там, где его отдали.
 * Поэтому всё, что попадает в заметку, сразу переезжает в документы приложения.
 */
const MEDIA_DIR = 'media';

const mediaDirectory = (): Directory => {
  const dir = new Directory(Paths.document, MEDIA_DIR);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
};

/** Перенести файл из кэша в документы и вернуть постоянный `file://`-путь. */
export const persistMedia = (uri: string, extension: string): string => {
  const source = new File(uri);
  const target = new File(mediaDirectory(), `${makeId()}.${extension}`);
  source.move(target);
  return target.uri;
};

/**
 * Удалить файл заметки.
 *
 * Тихо, без ошибки на отсутствующем файле: сюда приходят и записи, которые
 * человек удалил, не дождавшись сохранения, и файлы, которых уже нет.
 */
export const removeMedia = (uri: string): void => {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Файла нет — значит цель уже достигнута.
  }
};
