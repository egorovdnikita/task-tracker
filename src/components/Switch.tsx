import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/tokens';

export type SwitchProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
};

/**
 * Тумблер по эталону, а не системный.
 *
 * Главное отличие от `UISwitch`: бегунок — не круг, а пилюля заметно шире
 * своей высоты, и он целиком лежит внутри трека, не свисая за его край.
 * Системный круг на той же ширине оставлял справа и слева пустые лунки,
 * а собственный `Switch` из React Native этой геометрии не даёт вовсе.
 *
 * Заодно снимается расхождение платформ: react-native-web не читает
 * кросс-платформенные `thumbColor`/`trackColor` во включённом состоянии и
 * красил бегунок в свой материаловский бирюзовый. Здесь и приложение,
 * и витрина рисуют одно и то же.
 */
export const Switch = ({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: SwitchProps) => {
  // Одна общая пружинообразная доводка на цвет и на сдвиг: в системном
  // тумблере бегунок и трек меняются синхронно, разъезжаться им нельзя.
  const progress = useDerivedValue(() =>
    withTiming(value ? 1 : 0, { duration: 200, easing: Easing.out(Easing.cubic) }),
  );

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.switchOff, colors.switchOn]),
  }));

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (TRACK_WIDTH - KNOB_WIDTH - INSET * 2) }],
  }));

  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange?.(!value)}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.85 : 1 }, style]}
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </Pressable>
  );
};

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const KNOB_WIDTH = 28;
const INSET = 3;

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: INSET,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB_WIDTH,
    height: TRACK_HEIGHT - INSET * 2,
    borderRadius: (TRACK_HEIGHT - INSET * 2) / 2,
    backgroundColor: '#FFFFFF',
  },
});
