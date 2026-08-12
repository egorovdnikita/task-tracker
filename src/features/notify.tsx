import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { MessagePill, UndoButton } from '../components';
import { useTheme } from '../theme';

type Undo = { description: string; action: () => void };

type NotifyState = {
  message: string | null;
  undo: Undo | null;
  /** Сообщить и ничего не требовать: «Заметка добавлена». */
  notify: (message: string) => void;
  /**
   * Предложить вернуть сделанное. `description` — что именно отменяется,
   * он же вторая строка кнопки.
   */
  offerUndo: (description: string, action: () => void, message?: string) => void;
  hideMessage: () => void;
  hideUndo: () => void;
};

/**
 * Уведомления приложения — сообщение и отмена.
 *
 * Стор, а не состояние экрана: заметка создаётся в шите, а сообщение о ней
 * должно появиться на экране под шитом, когда шит уже закрылся. Хранить это
 * в экране значит передавать событие через параметры маршрута обратно.
 */
export const useNotify = create<NotifyState>()((set) => ({
  message: null,
  undo: null,
  notify: (message) => set({ message }),
  offerUndo: (description, action, message) =>
    set({ undo: { description, action }, message: message ?? null }),
  hideMessage: () => set({ message: null }),
  hideUndo: () => set({ undo: null }),
}));

export const notify = (message: string) => useNotify.getState().notify(message);

export const offerUndo = (description: string, action: () => void, message?: string) =>
  useNotify.getState().offerUndo(description, action, message);

/**
 * Место, где уведомления живут на экране.
 *
 * Смонтировано один раз в корне: сообщение всегда у верхнего края на месте
 * заголовка, отмена — всегда слева внизу над нижним рядом. Постоянное место
 * важнее близости к тому, что вызвало сообщение: искать его глазами не нужно.
 */
export const NotificationHost = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { message, undo, hideMessage, hideUndo } = useNotify();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: insets.top + theme.spacing.sm,
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          alignItems: 'center',
        }}
      >
        <MessagePill message={message} onHide={hideMessage} />
      </View>

      <UndoButton
        description={undo?.description ?? null}
        onUndo={() => undo?.action()}
        onHide={hideUndo}
        style={{
          position: 'absolute',
          left: theme.spacing.lg,
          // Над нижним рядом с поиском и созданием, а не поверх него.
          bottom:
            insets.bottom +
            theme.metrics.tabBar +
            theme.controlHeight.fab +
            theme.spacing.md +
            theme.spacing.sm,
        }}
      />
    </View>
  );
};
