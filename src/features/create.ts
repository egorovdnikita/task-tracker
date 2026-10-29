import { router } from 'expo-router';

import { showMenu, type MenuAnchor } from '../components';
import { BLOCK_LABELS } from '../types';

/** Откуда начато создание: заметка ложится туда, где человек стоял. */
export type CreateScope = { folder?: string; tag?: string };

/**
 * Плита 02.5: долгое нажатие на кнопку создания — выбор типа.
 *
 * Порядок не случайный: текст и список закреплены сверху как самые частые,
 * дальше идут те, что требуют разрешений и отдельного экрана. Меню общее для
 * всех списков — раньше в папке его не было вовсе.
 */
export const chooseNoteType = (anchor: MenuAnchor, scope: CreateScope = {}) =>
  showMenu(
    [
      {
        title: BLOCK_LABELS.text,
        icon: 'text.alignleft',
        onPress: () => router.push({ pathname: '/create', params: scope }),
      },
      {
        title: BLOCK_LABELS.checklist,
        icon: 'checklist',
        onPress: () =>
          router.push({ pathname: '/create', params: { ...scope, kind: 'checklist' } }),
      },
      // Заметка создаётся не здесь, а на самом экране захвата: если человек
      // передумает и закроет камеру, пустая заметка не должна остаться.
      {
        title: BLOCK_LABELS.voice,
        icon: 'mic',
        onPress: () => router.push({ pathname: '/capture/voice', params: scope }),
      },
      {
        title: BLOCK_LABELS.scan,
        icon: 'doc.text.viewfinder',
        onPress: () => router.push({ pathname: '/capture/scan', params: scope }),
      },
      {
        title: BLOCK_LABELS.sketch,
        icon: 'scribble',
        onPress: () => router.push({ pathname: '/capture/sketch', params: scope }),
      },
    ],
    anchor,
    'Новая заметка',
  );
