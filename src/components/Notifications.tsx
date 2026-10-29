import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type ToastProps = {
  /** Что случилось. `null` — тоста нет. */
  message: string | null;
  /** Отмена случившегося. Есть — в тосте кнопка «Отменить». */
  onUndo?: () => void;
  /**
   * Сколько держится. Сообщение ничего не требует и живёт недолго; с отменой —
   * пять секунд, срок обратимости из сквозного состояния C3.
   */
  duration?: number;
  onHide: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Тост — одна пилюля над кнопкой создания: что случилось и, если это можно
 * вернуть, «Отменить» в той же строке.
 *
 * Сообщение и отмена уже жили раздельно — пилюля у верхнего края и кнопка
 * внизу слева, — и после удаления человек видел их одновременно в
 * противоположных углах экрана: связь «что отменяется» терялась. Теперь у
 * события одно место. Оно над кнопкой создания, а не рядом с ней: тост не
 * спорит с ней и с панелью вкладок за палец.
 */
export const Toast = ({ message, onUndo, duration, onHide, style }: ToastProps) => {
  const theme = useTheme();
  const enter = useRef(new Animated.Value(0)).current;
  const hold = duration ?? (onUndo ? 5000 : 1800);

  useEffect(() => {
    if (!message) return;

    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 260,
      damping: 26,
      mass: 0.9,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(enter, { toValue: 0, duration: 160, useNativeDriver: true }).start(onHide);
    }, hold);

    return () => clearTimeout(timer);
  }, [message, hold, enter, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      pointerEvents="box-none"
      style={[
        styles.toast,
        styles.shadow,
        {
          paddingLeft: theme.spacing.lg,
          paddingRight: onUndo ? theme.spacing.xs : theme.spacing.lg,
          minHeight: theme.controlHeight.buttonCompact,
          gap: theme.spacing.sm,
          borderRadius: theme.radius.pill,
          // Плотная приподнятая поверхность с кантом: тост всплывает поверх
          // списка, и прозрачная подложка смешала бы его текст с текстом под ним.
          backgroundColor: theme.colors.elevated,
          borderWidth: theme.metrics.hairline * 2,
          borderColor: theme.colors.separator,
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
        style,
      ]}
    >
      <Text variant="subheadline" weight="semibold" numberOfLines={1} style={styles.shrink}>
        {message}
      </Text>

      {onUndo ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Отменить: ${message}`}
          hitSlop={4}
          onPress={() => {
            onUndo();
            onHide();
          }}
          style={({ pressed }) => [
            styles.action,
            {
              height: theme.controlHeight.buttonCompact,
              paddingHorizontal: theme.spacing.md,
              opacity: pressed ? 0.5 : 1,
            },
          ]}
        >
          <Text variant="subheadline" weight="semibold" color="accent">
            Отменить
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  shrink: { flexShrink: 1 },
  action: { justifyContent: 'center' },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
