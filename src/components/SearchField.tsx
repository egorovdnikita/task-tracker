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
  /**
   * Как поле выглядит.
   *
   * `card` — белая карточка на тёплой подложке: поле стоит в потоке списка,
   * под заголовком, и должно отделяться от фона само. Системная заливка
   * `tertiarySystemFill` полупрозрачно-серая, и на тёплом почти-белом фоне
   * она давала серый прямоугольник, который глаз не находил.
   *
   * `glass` — плавающая капсула поверх списка. Стекло оправдано только там,
   * где под полем действительно едет контент.
   */
  tone?: 'card' | 'glass';
  style?: StyleProp<ViewStyle>;
};

/**
 * Поле поиска.
 *
 * Системного поля для этого места нет: `UISearchBar` живёт внутри
 * `UINavigationBar` и приходит вместе с крупным заголовком, а заголовок здесь
 * встроенный — он стоит в одну строку с кнопками управления списком. Поэтому
 * поле собрано своё, но из системных частей: символ `magnifyingglass`,
 * обычный `TextInput` с системной клавиатурой, системная типографика.
 */
export const SearchField = ({
  value,
  onChangeText,
  placeholder = 'Поиск',
  onSubmitEditing,
  tone = 'card',
  style,
}: SearchFieldProps) => {
  const theme = useTheme();

  const shape: ViewStyle = {
    height: theme.controlHeight.searchFieldBottom,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  };

  const body = (
    <>
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
        clearButtonMode="never"
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
    </>
  );

  if (tone === 'glass') {
    return (
      <Glass
        material="thick"
        variant="regular"
        radius={theme.radius.pill}
        style={[styles.root, styles.shadow, shape, style]}
      >
        {body}
      </Glass>
    );
  }

  return (
    <View
      style={[
        styles.root,
        shape,
        {
          borderRadius: theme.radius.md,
          borderCurve: 'continuous',
          // Тот же белый, что у карточки заметки: поле — такой же остров на
          // подложке, как и всё остальное в списке.
          backgroundColor: theme.colors.secondarySystemGroupedBackground,
        },
        style,
      ]}
    >
      {body}
    </View>
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
