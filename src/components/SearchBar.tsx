import React from 'react';
import { StyleSheet, TextInput, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { GlassSurface } from './GlassSurface';
import { IconButton } from './IconButton';
import { ThinkingOrb } from './ThinkingOrb';

export type SearchBarProps = {
  value: string;
  onChangeText?: (value: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  style?: ViewStyle;
  testID?: string;
};

/** Поле-пилюля: стеклянная подложка + мягкая обводка, как в референсе. */
export const SearchBar = ({
  value,
  onChangeText,
  onClear,
  onFocus,
  placeholder = 'Поиск по заметкам',
  autoFocus = false,
  editable = true,
  style,
  testID,
}: SearchBarProps) => {
  const theme = useTheme();

  return (
    <GlassSurface
      radius={theme.radius.pill}
      tint={theme.tints.control}
      // Как и у TextField — без контура: в эталоне поля держатся заливкой,
      // а светлая рамка вокруг каждого собирает экран в сетку прямоугольников.
      stroke={null}
      style={StyleSheet.flatten([
        {
          height: theme.sizes.buttonLarge,
          paddingHorizontal: theme.spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        },
        style,
      ])}
    >
      {/* Вместо лупы — инлайн-орб на 20pt, тот же тюнинг, что в строке текста. */}
      <ThinkingOrb state="searching" size={20} />
      <TextInput
        testID={testID}
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        style={[styles.input, theme.typography.body, { color: theme.colors.text }]}
      />
      {value.length > 0 ? (
        <IconButton
          name="close"
          size={28}
          tone="secondary"
          variant="plain"
          accessibilityLabel="Очистить поиск"
          onPress={onClear}
        />
      ) : null}
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  input: { flex: 1, paddingVertical: 0 },
});
