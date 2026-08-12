import React from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Glass } from './Glass';
import { Symbol } from './Symbol';

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Поле поиска у нижнего края.
 *
 * Системного поля поиска для этого места нет: `UISearchBar` живёт в шапке
 * навигации, а внизу iOS 26 отдаёт только слот вкладки с ролью `search`.
 * Вкладку поиска мы убрали — искать нужно внутри списка, который перед
 * глазами, а не на отдельном экране, — поэтому поле собрано своё.
 *
 * Собрано оно из системных частей: капсула жидкого стекла, символ `magnifying
 * glass`, обычный `TextInput` с системной клавиатурой и `clearButtonMode`.
 * Ничего из этого не нарисовано заново.
 */
export const SearchField = ({
  value,
  onChangeText,
  placeholder = 'Поиск',
  onSubmitEditing,
  style,
}: SearchFieldProps) => {
  const theme = useTheme();

  return (
    <Glass
      material="thick"
      variant="regular"
      radius={theme.radius.pill}
      style={[
        styles.root,
        styles.shadow,
        {
          height: theme.controlHeight.searchFieldBottom,
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      <Symbol name="magnifyingglass" size={17} color={theme.colors.secondaryLabel} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholderText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        style={[theme.text('body'), styles.input, { color: theme.colors.label }]}
      />

      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Очистить поиск"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
        >
          <Symbol name="xmark.circle.fill" size={17} color={theme.colors.tertiaryLabel} />
        </Pressable>
      ) : null}
    </Glass>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 0 },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
