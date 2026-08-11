import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { Glass } from './Glass';
import { Symbol } from './Symbol';

export type ToolbarAction = {
  name: SFSymbol;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

export type EditorToolbarProps = {
  actions: ToolbarAction[];
  /** Свернуть клавиатуру. Крайняя правая кнопка панели. */
  onDismissKeyboard?: () => void;
};

/**
 * Панель над клавиатурой.
 *
 * Живёт ровно там, где ей место в системе: между текстом и клавиатурой,
 * прижатая к её верхнему краю. Отдельной строкой под шапкой она отнимала бы
 * место у текста всё время, а нужна только пока набирают.
 */
export const EditorToolbar = ({ actions, onDismissKeyboard }: EditorToolbarProps) => {
  const theme = useTheme();

  return (
    <Glass
      material="chrome"
      variant="regular"
      style={[styles.bar, { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }]}
    >
      {actions.map((action) => (
        <ToolbarButton key={action.name} {...action} />
      ))}

      <View style={styles.grow} />

      {onDismissKeyboard ? (
        <ToolbarButton
          name="keyboard.chevron.compact.down"
          accessibilityLabel="Свернуть клавиатуру"
          onPress={onDismissKeyboard}
        />
      ) : null}
    </Glass>
  );
};

const ToolbarButton = ({ name, accessibilityLabel, onPress, disabled }: ToolbarAction) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      // Кнопки панели мелкие, поэтому цель касания добирается по вертикали
      // до высоты самой панели, а по горизонтали — половиной зазора.
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={({ pressed }) => ({ opacity: disabled ? 0.3 : pressed ? 0.4 : 1 })}
    >
      <Symbol name={name} size={22} color={theme.colors.systemBlue} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', height: 48 },
  grow: { flex: 1 },
});
