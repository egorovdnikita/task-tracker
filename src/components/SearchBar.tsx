import React from 'react';
import { StyleSheet, TextInput, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

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
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.md,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing.md,
        },
        style,
      ]}
    >
      <Icon name="search" size={18} tone="muted" />
      <TextInput
        testID={testID}
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        style={[styles.input, { color: theme.colors.text }]}
      />
      {value.length > 0 ? (
        <IconButton
          name="close"
          size={16}
          tone="muted"
          accessibilityLabel="Очистить поиск"
          onPress={onClear}
          style={styles.clear}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  clear: { width: 28, height: 28 },
});
