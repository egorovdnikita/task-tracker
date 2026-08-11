import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Symbol } from './Symbol';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel?: string;
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * Отметка пункта чек-листа.
 *
 * Кружок, а не квадрат: в системе квадрат с галочкой означает выбор строки в
 * режиме редактирования списка, а кружок — выполнение задачи. Форма здесь
 * несёт смысл, и подменять её нельзя.
 *
 * Состояние передаётся не одной заливкой: у отмеченного пункта появляется
 * галочка внутри и меняется имя символа, поэтому VoiceOver и режим «Различать
 * без цвета» видят разницу так же, как зрячий глаз.
 */
export const Checkbox = ({
  checked,
  onChange,
  accessibilityLabel,
  size = 22,
  disabled = false,
  style,
}: CheckboxProps) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      hitSlop={Math.max(0, (theme.metrics.hitSlop - size) / 2)}
      style={({ pressed }) => [{ opacity: pressed ? 0.4 : 1 }, style]}
    >
      <Symbol
        name={checked ? 'checkmark.circle.fill' : 'circle'}
        size={size}
        color={checked ? theme.colors.systemBlue : theme.colors.tertiaryLabel}
      />
    </Pressable>
  );
};
