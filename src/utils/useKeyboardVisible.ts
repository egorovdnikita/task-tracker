import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Поднята ли клавиатура.
 *
 * Нужно шитам: `KeyboardAvoidingView` с `behavior="padding"` сажает панель
 * ровно на кромку клавиатуры, и нижний контрол упирается в ряд клавиш.
 * Зазор нельзя держать постоянным — при убранной клавиатуре шит должен
 * лежать на нижней кромке экрана.
 *
 * На iOS слушаем `keyboardWillShow`: он приходит до анимации, и зазор
 * появляется вместе с подъёмом, а не рывком после него.
 */
export const useKeyboardVisible = (): boolean => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
};
