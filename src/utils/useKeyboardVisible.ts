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

/**
 * Высота клавиатуры в точках, 0 — когда её нет.
 *
 * Нужна тому, что висит абсолютно: `KeyboardAvoidingView` двигает поток, а
 * плавающая панель в поток не входит и осталась бы под клавиатурой. На iOS
 * событие приходит до анимации и уже знает конечную высоту — панель уезжает
 * вместе с клавиатурой, а не догоняет её.
 */
export const useKeyboardHeight = (): number => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (event) =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
};
