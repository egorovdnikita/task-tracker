import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
/** Переключатель51×31 из макета; системная озвучка и состояние доступны AX. */
export const FinchSwitch = ({ value, onValueChange, disabled, accessibilityLabel }: { value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean; accessibilityLabel?: string }) => {
  const theme = useTheme();
  return <Pressable accessibilityRole="switch" accessibilityLabel={accessibilityLabel} accessibilityState={{ checked: value, disabled: Boolean(disabled) }} disabled={disabled} onPress={() => onValueChange(!value)} hitSlop={{ top: 7, bottom: 6 }} style={({ pressed }) => ({ width: 51, height: 31, borderRadius: 16, padding: 2, justifyContent: 'center', backgroundColor: value ? theme.hex.accent : theme.hex.systemFill, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 })}>
    <View style={{ width: 27, height: 27, borderRadius: 14, backgroundColor: theme.hex.secondarySystemBackground, alignSelf: value ? 'flex-end' : 'flex-start', shadowColor: theme.hex.label, shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }} />
  </Pressable>;
};
