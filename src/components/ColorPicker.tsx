import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { noteGlowLabels, noteGlows, type NoteGlow } from '../theme/tokens';
import { Icon } from './Icon';

export type ColorPickerProps = {
  value: NoteGlow;
  onChange?: (glow: NoteGlow) => void;
};

/** Выбор свечения заметки (S2). Кружок 40pt — по референсу. */
export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const theme = useTheme();
  const keys = Object.keys(noteGlows) as NoteGlow[];

  return (
    <View style={[styles.row, { gap: theme.spacing.md }]}>
      {keys.map((key) => {
        const selected = key === value;
        const glow = noteGlows[key];

        return (
          <Pressable
            key={key}
            accessibilityRole="radio"
            accessibilityLabel={noteGlowLabels[key]}
            accessibilityState={{ selected }}
            onPress={() => onChange?.(key)}
            style={({ pressed }) => [
              styles.swatch,
              {
                // Свечение полупрозрачное, поэтому под ним нужна база поверхности.
                backgroundColor: glow ?? theme.colors.surfaceElevated,
                borderColor: selected ? theme.colors.accentLime : theme.colors.border,
                borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {selected ? <Icon name="check" size={16} tone="accent" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
