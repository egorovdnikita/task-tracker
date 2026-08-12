const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

const two = (n: number) => String(n).padStart(2, '0');

/** "11 авг" — short form used on note cards. */
export const formatShortDate = (ts: number): string => {
  const d = new Date(ts);
  return `${two(d.getDate())} ${MONTHS[d.getMonth()]}`;
};

/** "11 авг, 14:20" — long form used in the editor footer. */
export const formatDateTime = (ts: number): string => {
  const d = new Date(ts);
  return `${formatShortDate(ts)}, ${two(d.getHours())}:${two(d.getMinutes())}`;
};

/** "Сегодня" / "Вчера" / "11 авг" — relative label for grouped views. */
export const formatRelativeDate = (ts: number, now: number = Date.now()): string => {
  const startOfDay = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOfDay(now) - startOfDay(ts)) / 86_400_000);
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Вчера';
  return formatShortDate(ts);
};

/**
 * Срок относительно сейчас — просрочен, сегодня или впереди.
 *
 * Нужен затем, что дата на карточке красится по смыслу, а не одним серым:
 * цвет читается раньше, чем текст, и «вчера» от «завтра» отличается до того,
 * как человек прочитал число.
 */
export type DueState = 'overdue' | 'today' | 'future';

export const dueState = (at: number, now: number = Date.now()): DueState => {
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  if (at < now) return 'overdue';
  return at <= endOfToday.getTime() ? 'today' : 'future';
};

/** 12 заметок / 1 заметка / 3 заметки */
export const pluralNotes = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} заметка`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} заметки`;
  return `${count} заметок`;
};
