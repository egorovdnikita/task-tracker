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
  /**
   * Круг 44 в шапке — как «+» у Opal на экране «Rules»: тот же лаймовый меш,
   * без свечения. Плавающей кнопки у Opal нет, создание живёт в шапке.
   */
  compact?: boolean;
  /** Глиф в круге: `plus` для создания, `checkmark` — подтверждение в шите. */
  icon?: 'plus' | 'checkmark';
  disabled?: boolean;
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
  compact = false,
  icon = 'plus',
  disabled = false,
  style,
}: FabProps) => {
  const theme = useTheme();
  const size = compact ? theme.controlHeight.buttonCompact : theme.controlHeight.fab;
  const ref = useRef<React.ComponentRef<typeof View>>(null);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
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
        compact ? null : styles.glow,
        { width: size, height: size, borderRadius: size / 2 },
        { transform: [{ scale: pressed ? 0.94 : 1 }], opacity: disabled ? 0.35 : 1 },
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
        <Symbol name={icon} size={compact ? 22 : 26} color={theme.hex.onAccent} weight="semibold" />
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
