import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { Glass } from './Glass';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type ToolbarAction = {
  name: SFSymbol;
  /** Слово рядом с иконкой. Оно же — подпись для VoiceOver. */
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export type EditorToolbarProps = {
  actions: ToolbarAction[];
  /**
   * Показывать ли слова рядом с иконками. Настройка приложения: по умолчанию
   * подписи есть, выключить их — право того, кто панель уже выучил.
   */
  showLabels?: boolean;
  /** Свернуть клавиатуру. Крайняя правая кнопка панели. */
  onDismissKeyboard?: () => void;
};

/**
 * Панель над клавиатурой.
 *
 * Живёт ровно там, где ей место в системе: между текстом и клавиатурой,
 * прижатая к её верхнему краю. Отдельной строкой под шапкой она отнимала бы
 * место у текста всё время, а нужна только пока набирают.
 *
 * Иконка плюс слово, а не одна иконка: в ряду из шести символов угадывается
 * «микрофон», но не «скан» и не «теги», и разбираться приходится нажатием.
 * Подписи удлиняют ряд — поэтому он прокручивается, а кнопка клавиатуры
 * стоит вне прокрутки и на месте.
 */
export const EditorToolbar = ({
  actions,
  showLabels = true,
  onDismissKeyboard,
}: EditorToolbarProps) => {
  const theme = useTheme();

  return (
    <Glass material="chrome" variant="regular" style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          gap: showLabels ? theme.spacing.md : theme.spacing.lg,
          alignItems: 'center',
        }}
      >
        {actions.map((action) => (
          <ToolbarButton key={action.name} showLabel={showLabels} {...action} />
        ))}
      </ScrollView>

      {onDismissKeyboard ? (
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <ToolbarButton
            name="keyboard.chevron.compact.down"
            label="Свернуть клавиатуру"
            showLabel={false}
            onPress={onDismissKeyboard}
          />
        </View>
      ) : null}
    </Glass>
  );
};

const ToolbarButton = ({
  name,
  label,
  onPress,
  disabled,
  showLabel,
}: ToolbarAction & { showLabel: boolean }) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      // Кнопки панели мелкие, поэтому цель касания добирается по вертикали
      // до высоты самой панели, а по горизонтали — половиной зазора.
      hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
      style={({ pressed }) => [
        styles.button,
        { gap: theme.spacing.xs, opacity: disabled ? 0.3 : pressed ? 0.4 : 1 },
      ]}
    >
      <Symbol name={name} size={20} color={theme.colors.accent} />
      {showLabel ? (
        <Text variant="footnote" color="accent" numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', height: 48 },
  button: { flexDirection: 'row', alignItems: 'center' },
});
