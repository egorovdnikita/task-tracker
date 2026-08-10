import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { noteColors, type NoteColor } from '../theme/tokens';
import { Icon } from './Icon';

export type ColorPickerProps = {
  value: NoteColor;
  onChange?: (color: NoteColor) => void;
};

const LABELS: Record<NoteColor, string> = {
  default: 'Без цвета',
  yellow: 'Жёлтый',
  green: 'Зелёный',
  blue: 'Синий',
  pink: 'Розовый',
};

/** Note accent swatches from S2. */
export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const theme = useTheme();
  const keys = Object.keys(noteColors) as NoteColor[];

  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      {keys.map((key) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            accessibilityRole="radio"
            accessibilityLabel={LABELS[key]}
            accessibilityState={{ selected }}
            onPress={() => onChange?.(key)}
            style={({ pressed }) => [
              styles.swatch,
              {
                backgroundColor: key === 'default' ? theme.colors.surface : noteColors[key],
                borderColor: selected ? theme.colors.accent : theme.colors.border,
                borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {selected ? <Icon name="check" size={14} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
