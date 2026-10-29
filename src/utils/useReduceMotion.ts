import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * «Уменьшение движения» — с подпиской, а не одним вопросом при монтировании.
 *
 * Меню смонтировано в корне навсегда: спрошенное один раз при запуске, оно не
 * замечало, что настройку включили на ходу, и продолжало анимироваться.
 *
 * `initial` — что считать до ответа системы. Там, где анимация заметна сразу
 * при появлении (конфетти), безопаснее начать с `true`.
 */
export const useReduceMotion = (initial = false): boolean => {
  const [reduced, setReduced] = useState(initial);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);

  return reduced;
};
