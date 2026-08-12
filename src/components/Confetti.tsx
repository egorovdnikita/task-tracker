import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

export type ConfettiProps = {
  /** Запуск. Ставится один раз на событие и сбрасывается по `onDone`. */
  active: boolean;
  onDone?: () => void;
  /** Сколько частиц. Больше сорока экран уже не читает, а кадры теряет. */
  count?: number;
};

const PALETTE = ['red', 'orange', 'yellow', 'green', 'mint', 'purple', 'pink'] as const;

/**
 * Конфетти на первое выполненное дело.
 *
 * Единственная декорация в приложении, и она оправдана событием: первая
 * закрытая задача случается один раз, и приложение имеет право это заметить.
 * Дальше — молчание: праздник на каждом чек-боксе перестаёт быть праздником.
 *
 * «Уменьшение движения» отменяет анимацию целиком, а не замедляет её: человек,
 * включивший этот режим, просил не двигать экран, а не двигать медленнее. Без
 * анимации остаётся сообщение в пилюле — оно и несёт смысл.
 */
export const Confetti = ({ active, onDone, count = 28 }: ConfettiProps) => {
  const theme = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => setReduceMotion(enabled));
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        key: index,
        left: Math.random(),
        drift: (Math.random() - 0.5) * 120,
        spin: (Math.random() - 0.5) * 6,
        size: 6 + Math.random() * 6,
        color: PALETTE[index % PALETTE.length],
      })),
    [count],
  );

  useEffect(() => {
    if (!active || reduceMotion) {
      if (active && reduceMotion) onDone?.();
      return;
    }

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => onDone?.());
  }, [active, reduceMotion, progress, onDone]);

  if (!active || reduceMotion) return null;

  const height = Dimensions.get('window').height;
  const width = Dimensions.get('window').width;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((particle) => (
        <Animated.View
          key={particle.key}
          style={{
            position: 'absolute',
            top: -20,
            left: particle.left * width,
            width: particle.size,
            height: particle.size * 1.6,
            borderRadius: 2,
            backgroundColor: theme.accent(particle.color),
            opacity: progress.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height + 40],
                }),
              },
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, particle.drift],
                }),
              },
              {
                rotate: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0rad', `${particle.spin}rad`],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};
