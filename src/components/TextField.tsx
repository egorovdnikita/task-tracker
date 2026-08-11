import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';

import { useTheme, type TextStyleName } from '../theme';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  /** Подпись над полем. В инсет-группах не нужна — там подписывает строка. */
  label?: string;
  /** Пояснение или ошибка под полем. */
  hint?: string;
  invalid?: boolean;
  /** Стиль текста внутри поля. Заголовок заметки крупнее тела. */
  variant?: TextStyleName;
  /** Поле без заливки — для тела заметки, где рамка мешает читать. */
  plain?: boolean;
  style?: ViewStyle;
};

/**
 * Поле ввода.
 *
 * Два вида. Заполненное — для форм: имя папки, тег. И `plain` — для текста
 * заметки: в редакторе рамка вокруг тела превращает страницу в форму, а текст
 * должен лежать на странице.
 */
export const TextField = ({
  label,
  hint,
  invalid = false,
  variant = 'body',
  plain = false,
  multiline,
  style,
  ...rest
}: TextFieldProps) => {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.spacing.xs }, style]}>
      {label ? (
        <Text variant="footnote" color="secondaryLabel">
          {label}
        </Text>
      ) : null}

      <TextInput
        {...rest}
        multiline={multiline}
        placeholderTextColor={theme.colors.placeholderText}
        style={[
          theme.text(variant),
          {
            color: theme.colors.label,
            // Курсор системного акцента: в поле это единственный элемент,
            // который система красит сама, и подменять его нечем.
            textAlignVertical: multiline ? 'top' : 'center',
          },
          plain
            ? styles.plain
            : {
                minHeight: theme.controlHeight.row,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.sm,
                borderCurve: 'continuous',
                backgroundColor: theme.colors.tertiarySystemFill,
                borderWidth: invalid ? 1 : 0,
                borderColor: theme.colors.systemRed,
              },
        ]}
      />

      {hint ? (
        <Text variant="caption1" color={invalid ? 'systemRed' : 'secondaryLabel'}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  plain: { padding: 0 },
});
