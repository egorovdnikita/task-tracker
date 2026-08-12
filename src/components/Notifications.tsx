import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type MessagePillProps = {
  message: string | null;
  /** Сколько держится. Сообщение ничего не требует, поэтому недолго. */
  duration?: number;
  onHide: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Сообщение — пилюля у верхнего края.
 *
 * Раньше сообщение и отмена жили в одном тосте внизу, и он делал две работы
 * сразу: докладывал о случившемся и держал единственный способ это отменить.
 * Внизу же стоят панель вкладок и кнопка создания, так что тост конкурировал
 * с ними за то же место и за тот же палец.
 *
 * Теперь роли разведены. Сообщение встаёт на место заголовка, живёт секунду,
 * кнопки не несёт и пропадает само. Отмена — отдельная кнопка внизу слева.
 */
export const MessagePill = ({ message, duration = 1800, onHide, style }: MessagePillProps) => {
  const theme = useTheme();
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
      Animated.timing(enter, { toValue: 0, duration: 160, useNativeDriver: true }).start(onHide);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, enter, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={[
        styles.pill,
        styles.shadow,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.pill,
          // Приподнятая поверхность, а не карточка: в тёмной схеме пилюля на
          // фоне подложки должна отделяться сама, без обводки.
          backgroundColor: theme.colors.tertiarySystemBackground,
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) },
          ],
        },
        style,
      ]}
    >
      <Text variant="subheadline" weight="semibold" numberOfLines={1}>
        {message}
      </Text>
    </Animated.View>
  );
};

export type UndoButtonProps = {
  /** Что именно отменяется — вторая строка кнопки. */
  description: string | null;
  onUndo: () => void;
  onHide: () => void;
  /** Пять секунд — срок обратимости из сквозного состояния C3. */
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Отмена — кнопка с обводкой, а не тост.
 *
 * Обводка вместо заливки, потому что действие уже случилось и кнопка не
 * главная на экране: она предлагает вернуться, а не зовёт нажать. Две строки —
 * «Отменить» акцентом и под ним серым то, что отменяется: без второй строки
 * через пять секунд неясно, к чему относилось предложение.
 */
export const UndoButton = ({
  description,
  onUndo,
  onHide,
  duration = 5000,
  style,
}: UndoButtonProps) => {
  const theme = useTheme();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!description) return;

    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 260,
      damping: 26,
      mass: 0.9,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(enter, { toValue: 0, duration: 160, useNativeDriver: true }).start(onHide);
    }, duration);

    return () => clearTimeout(timer);
  }, [description, duration, enter, onHide]);

  if (!description) return null;

  return (
    <Animated.View
      style={[
        {
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Отменить: ${description}`}
        onPress={() => {
          onUndo();
          onHide();
        }}
        style={({ pressed }) => [
          styles.undo,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.radius.pill,
            borderWidth: theme.metrics.hairline * 2,
            borderColor: theme.colors.separator,
            backgroundColor: theme.colors.tertiarySystemBackground,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <Text variant="subheadline" weight="semibold" color="accent">
          Отменить
        </Text>
        <Text variant="caption1" color="secondaryLabel" numberOfLines={1}>
          {description}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: { alignSelf: 'center', borderCurve: 'continuous' },
  undo: { alignSelf: 'flex-start', alignItems: 'flex-start', borderCurve: 'continuous' },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
