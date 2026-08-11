import React from 'react';
import { Platform, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supportsLiquidGlass, useTheme } from '../theme';
import { Glass } from './Glass';
import { Symbol } from './Symbol';

export type FabProps = {
  onPress: () => void;
  /** Долгое нажатие открывает выбор типа заметки — плита 02.5 вайрфрейма. */
  onLongPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
};

/**
 * Плавающая кнопка создания.
 *
 * Стекло здесь уместно ровно потому, что кнопка плавает над списком: под ней
 * едет контент, и жидкое стекло его преломляет. На плоском фоне тот же приём
 * выродился бы в серый круг.
 *
 * Отступ снизу берётся из safe area, а не константой: над индикатором «домой»
 * и над панелью вкладок высота разная, а на устройствах без индикатора её нет
 * вовсе.
 */
export const Fab = ({
  onPress,
  onLongPress,
  accessibilityLabel = 'Новая заметка',
  accessibilityHint = 'Долгое нажатие — выбрать тип заметки',
  style,
}: FabProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const size = theme.controlHeight.fab;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={onLongPress ? accessibilityHint : undefined}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.root,
        {
          width: size,
          height: size,
          right: theme.spacing.xl,
          bottom: insets.bottom + theme.spacing.xl,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Glass
        radius={size / 2}
        variant="regular"
        interactive
        material="thick"
        style={[
          styles.surface,
          // Тень нужна только тому стеклу, которое системой не отбрасывается
          // само. На iOS 26 жидкое стекло уже лежит со своей тенью, и вторая
          // читается как ореол.
          Platform.OS === 'ios' && supportsLiquidGlass() ? null : styles.shadow,
        ]}
      >
        <Symbol name="plus" size={26} color={theme.colors.systemBlue} weight="medium" />
      </Glass>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { position: 'absolute' },
  surface: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
