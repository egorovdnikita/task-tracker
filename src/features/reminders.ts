import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { Note } from '../types';
import { noteTitle, notePreview } from '../utils/blocks';

/**
 * Напоминания. Плиты 08.1 и 08.2.
 *
 * Локальные уведомления, а не пуши: сервера у приложения нет, и заметки с него
 * никуда не уходят. Всё, что нужно напоминанию, уже лежит на устройстве.
 */

/**
 * Как показывать уведомление, когда приложение открыто.
 *
 * По умолчанию система его прячет — считается, что приложение и так на экране.
 * Для напоминания это неверно: человек может смотреть другую заметку, и молча
 * пропустить срок хуже, чем показать баннер поверх.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

export const checkPermission = async (): Promise<NotificationPermission> => {
  if (Platform.OS === 'web') return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  return status as NotificationPermission;
};

export const requestPermission = async (): Promise<NotificationPermission> => {
  if (Platform.OS === 'web') return 'denied';
  const { status } = await Notifications.requestPermissionsAsync();
  return status as NotificationPermission;
};

/**
 * Поставить или переставить напоминание.
 *
 * Идентификатор уведомления — идентификатор заметки: у одной заметки не бывает
 * двух напоминаний, и хранить связь отдельной таблицей значит завести второй
 * источник правды о том же самом.
 */
export const scheduleReminder = async (note: Note, at: number): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  await cancelReminder(note.id);

  const status = await checkPermission();
  if (status !== 'granted') return false;

  await Notifications.scheduleNotificationAsync({
    identifier: note.id,
    content: {
      title: noteTitle(note),
      body: notePreview(note).slice(0, 120) || 'Напоминание о заметке',
      // По нажатию открывается сама заметка, а не список: человек помнит,
      // о чём напоминание, и искать его в списке — лишний шаг.
      data: { noteId: note.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
  });

  return true;
};

export const cancelReminder = async (noteId: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(noteId).catch(() => {});
};

/** Готовые сроки — они закрывают почти все случаи, точная дата для остальных. */
export const reminderPresets = (now: number = Date.now()) => {
  const at = (days: number, hour: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date.getTime();
  };

  return [
    { key: 'evening', label: 'Сегодня вечером', at: at(0, 19) },
    { key: 'tomorrow', label: 'Завтра утром', at: at(1, 9) },
    { key: 'weekend', label: 'В субботу', at: at((6 - new Date(now).getDay() + 7) % 7 || 7, 10) },
    { key: 'week', label: 'Через неделю', at: at(7, 9) },
    // Через час — единственный относительный срок: у него нет «своего» часа.
    { key: 'hour', label: 'Через час', at: now + 3_600_000 },
  ].filter((preset) => preset.at > now);
};
