import React, { useRef } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { MenuAnchor } from './Menu';
import { Symbol } from './Symbol';

export type FabProps = {
  onPress: () => void;
  /**
   * Долгое нажатие открывает выбор типа заметки — плита 02.5 вайрфрейма.
   * Кнопка отдаёт свой прямоугольник: меню разворачивается вверх от круга.
   */
  onLongPress?: (anchor: MenuAnchor) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Круглая кнопка создания.
 *
 * Сплошная заливка акцентом, а не стекло. Стекло здесь было ошибкой: оно
 * показывает то, что под ним, а под кнопкой создания — список, то есть серый
 * текст на тёплом фоне. Кнопка растворялась ровно в том состоянии, где нужна
 * сильнее всего, — на почти пустом экране.
 *
 * Позиционированием кнопка не занимается: её ставит `BottomBar` справа в ряду
 * панели вкладок, и место у неё одно на всех экранах.
 */
export const Fab = ({
  onPress,
  onLongPress,
  accessibilityLabel = 'Новая заметка',
  accessibilityHint = 'Долгое нажатие — выбрать тип заметки',
  style,
}: FabProps) => {
  const theme = useTheme();
  const size = theme.controlHeight.fab;
  const ref = useRef<View>(null);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={onLongPress ? accessibilityHint : undefined}
      onPress={onPress}
      onLongPress={
        onLongPress
          ? () =>
              ref.current?.measureInWindow((x, y, width, height) =>
                onLongPress({ x, y, width, height }),
              )
          : undefined
      }
      style={({ pressed }) => [
        styles.root,
        styles.shadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.accent,
          // Нажатие гасит кнопку, как гасит любую системную: пружина здесь
          // читалась бы как элемент из другого приложения.
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Symbol name="plus" size={28} color="#FFFFFF" weight="semibold" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  // Тень здесь своя, а не системная: круг лежит не на стекле, а поверх
  // списка, и без тени он выглядит наклеенным.
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
