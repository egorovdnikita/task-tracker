import { Alert, Platform } from 'react-native';

/**
 * Системное подтверждение необратимого действия.
 *
 * Здесь именно системный алерт, а не наш `ConfirmSheet`: шит хорош, когда
 * подтверждение — часть экрана и его видно в контексте. Для «удалить всё»
 * из настроек контекста нет, а системный алерт на iOS ещё и перехватывает
 * фокус VoiceOver, чего наш шит не делает.
 */
export const confirmDestructive = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Удалить', style: 'destructive', onPress: onConfirm },
  ]);
};
