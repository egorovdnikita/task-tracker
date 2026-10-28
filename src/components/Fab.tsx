import React, { useRef } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { MenuAnchor } from './Menu';
import { GlassSurface } from './GlassSurface';
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
 * Круг «+» из эталона Opal: сплошной меш лайм → аква, глиф чёрный.
 *
 * Без системного стекла: заливка мешем и есть смысл кнопки, материал бы её
 * замутил. Свечение под кругом — его же цвета, а не чёрная тень: на чёрном
 * фоне тень не видна, а лаймовый ореол отделяет круг от списка под ним.
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
        styles.glow,
        { width: size, height: size, borderRadius: size / 2 },
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
        style,
      ]}
    >
      <GlassSurface
        mesh="fab"
        liquid={false}
        radius={size / 2}
        tint={theme.hex.accent}
        style={[styles.root, { width: size, height: size }]}
      >
        <Symbol name="plus" size={26} color={theme.hex.onAccent} weight="semibold" />
      </GlassSurface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    shadowColor: '#DCFEAA',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
