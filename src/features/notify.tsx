import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { Toast } from '../components';
import { useTheme } from '../theme';

/**
 * Тост один на всё приложение: новое событие заменяет прежнее. Сообщение с
 * отменой и без неё — один и тот же тост, различается только кнопкой.
 */
type Toast = { message: string; undo?: () => void; id: number };

type NotifyState = {
  toast: Toast | null;
  notify: (message: string) => void;
  /** `description` — что случилось и что вернёт «Отменить». */
  offerUndo: (description: string, action: () => void) => void;
  hide: () => void;
};

let seq = 0;

export const useNotify = create<NotifyState>()((set) => ({
  toast: null,
  notify: (message) => set({ toast: { message, id: ++seq } }),
  offerUndo: (description, action) =>
    set({ toast: { message: description, undo: action, id: ++seq } }),
  hide: () => set({ toast: null }),
}));

export const notify = (message: string) => useNotify.getState().notify(message);
export const offerUndo = (description: string, action: () => void) =>
  useNotify.getState().offerUndo(description, action);

export const NotificationHost = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { toast, hide } = useNotify();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        // Над кнопкой создания, а не рядом с ней.
        bottom:
          insets.bottom + theme.metrics.tabBar / 2 + theme.controlHeight.fab + theme.spacing.md,
      }}
    >
      <Toast key={toast?.id} message={toast?.message ?? null} onUndo={toast?.undo} onHide={hide} />
    </View>
  );
};
