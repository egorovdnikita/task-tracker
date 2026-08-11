import { ActionSheetIOS, Alert, Platform } from 'react-native';

export type SheetOption = {
  title: string;
  onPress: () => void;
  destructive?: boolean;
};

/**
 * Меню действий.
 *
 * На iOS — системный `UIAlertController`. Не «похожий на системный»: он
 * приезжает поверх всего, сам ловит фокус VoiceOver, закрывается свайпом и
 * жестом «назад», рисуется жидким стеклом и знает, что делать при повороте.
 * Свой шит всё это повторяет приблизительно, а расхождения замечаются именно
 * там, где на них меньше всего рассчитываешь.
 *
 * Вне iOS системного меню нет — раскладываем варианты в алерт.
 */
export const showActionSheet = (
  options: SheetOption[],
  config: { title?: string; message?: string; cancelTitle?: string } = {},
) => {
  const { title, message, cancelTitle = 'Отмена' } = config;

  if (Platform.OS === 'ios') {
    const titles = [...options.map((o) => o.title), cancelTitle];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: titles,
        cancelButtonIndex: titles.length - 1,
        destructiveButtonIndex: options.findIndex((o) => o.destructive),
      },
      (index) => options[index]?.onPress(),
    );
    return;
  }

  Alert.alert(title ?? '', message, [
    ...options.map((option) => ({
      text: option.title,
      style: option.destructive ? ('destructive' as const) : ('default' as const),
      onPress: option.onPress,
    })),
    { text: cancelTitle, style: 'cancel' as const },
  ]);
};

/**
 * Подтверждение необратимого действия.
 *
 * Спрашивается только то, что вернуть нельзя: очистка корзины и удаление
 * навсегда. Всё остальное разрушающее обратимо тостом «Отменить», и лишний
 * диалог там был бы данью привычке, а не защитой.
 */
export const confirmDestructive = (
  title: string,
  message: string,
  confirmTitle: string,
  onConfirm: () => void,
) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    { text: confirmTitle, style: 'destructive', onPress: onConfirm },
  ]);
};

/**
 * Ввод одной строки — имя папки, название тега.
 *
 * `Alert.prompt` есть только на iOS: это системный алерт с полем, отдельного
 * экрана под одно поле система не заводит.
 */
export const promptForText = (
  title: string,
  message: string,
  onSubmit: (value: string) => void,
  defaultValue = '',
) => {
  if (Platform.OS === 'ios') {
    Alert.prompt(
      title,
      message,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Готово',
          onPress: (value?: string) => {
            const trimmed = value?.trim();
            if (trimmed) onSubmit(trimmed);
          },
        },
      ],
      'plain-text',
      defaultValue,
    );
    return;
  }

  if (typeof window !== 'undefined' && window.prompt) {
    const value = window.prompt(`${title}\n${message}`, defaultValue);
    if (value?.trim()) onSubmit(value.trim());
  }
};
