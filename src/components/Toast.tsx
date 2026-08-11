import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { Glass } from './Glass';
import { Text } from './Text';

export type ToastProps = {
  message: string | null;
  /** Подпись действия. Обычно «Отменить». */
  actionTitle?: string;
  onAction?: () => void;
  onHide: () => void;
  /** Сколько держится. Пять секунд — срок из сквозного состояния C3. */
  duration?: number;
  /** Поднять над панелью вкладок или над плавающей кнопкой. */
  offset?: number;
};

/**
 * Тост с отменой.
 *
 * Существует ради одного правила: любое разрушающее действие обратимо в
 * течение пяти секунд. Поэтому тост не просто сообщает — он несёт кнопку, и
 * без неё показывать его незачем.
 *
 * Живёт поверх содержимого и не отбирает фокус: если человек не собирался
 * отменять, тост не должен требовать реакции.
 */
export const Toast = ({
  message,
  actionTitle = 'Отменить',
  onAction,
  onHide,
  duration = 5000,
  offset = 0,
}: ToastProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 260,
      damping: 26,
      mass: 0.9,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(enter, { toValue: 0, duration: 180, useNativeDriver: true }).start(onHide);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, enter, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      // Тост объявляется VoiceOver сам, но фокус не забирает.
      accessibilityLiveRegion="polite"
      style={[
        styles.root,
        {
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          bottom: insets.bottom + offset + theme.spacing.lg,
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        },
      ]}
    >
      <Glass radius={theme.radius.lg} material="thick" variant="regular">
        <View
          style={[
            styles.body,
            { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, gap: theme.spacing.md },
          ]}
        >
          <Text variant="subheadline" style={styles.grow} numberOfLines={2}>
            {message}
          </Text>

          {onAction ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onAction();
                onHide();
              }}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text variant="subheadline" weight="semibold" color="systemBlue">
                {actionTitle}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Glass>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { position: 'absolute' },
  body: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
});
