import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { withAlpha } from './Button';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type NoteTool = {
  name: SFSymbol;
  /** Слово под иконкой. Оно же — подпись для VoiceOver. */
  label: string;
  onPress: () => void;
};

export type NoteToolsProps = {
  tools: NoteTool[];
  style?: ViewStyle;
};

/**
 * Чем дополнить заметку — плитками на самой странице.
 *
 * Раньше это была панель над клавиатурой: семь голых символов в 20pt, впритык
 * друг к другу. У неё было два порока, и оба тяжёлые.
 *
 * Первый — размер. Символ без подписи в 20pt это цель заметно меньше 44pt и
 * загадка вдобавок: `scribble` от `doc.text.viewfinder` в таком кегле не
 * отличается, и что именно вставится, выяснялось нажатием.
 *
 * Второй — привязка к клавиатуре. Панель существовала, только пока набирают
 * текст. Голосовая заметка, скан и рисунок — это ровно те случаи, когда
 * набирать не собираются: чтобы записать голос, приходилось сначала ткнуть в
 * текст, вызвать клавиатуру и лишь потом дотянуться до микрофона.
 *
 * Поэтому инструменты стоят в теле заметки, под её содержимым, и видны всегда.
 * Плитка — акцентный глиф на бледной акцентной заливке и слово под ним; вся
 * плитка целиком и есть цель касания.
 */
export const NoteTools = ({ tools, style }: NoteToolsProps) => {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.spacing.sm }, style]}>
      <Text variant="footnote" color="secondaryLabel">
        Добавить в заметку
      </Text>

      <View
        style={[
          styles.card,
          {
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.secondarySystemGroupedBackground,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.sm,
          },
        ]}
      >
        {tools.map((tool) => (
          <Tool key={tool.name} {...tool} />
        ))}
      </View>
    </View>
  );
};

const Tool = ({ name, label, onPress }: NoteTool) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tool,
        { gap: theme.spacing.xs, opacity: pressed ? 0.5 : 1 },
      ]}
    >
      <View
        style={[
          styles.glyph,
          {
            borderRadius: theme.radius.md,
            // Бледная акцентная заливка, а не сплошная: плиток пять, и пять
            // насыщенных пятен подряд перетянули бы на себя всю страницу.
            backgroundColor: withAlpha(theme.hex.accent, theme.scheme === 'dark' ? 0.22 : 0.12),
          },
        ]}
      >
        <Symbol name={name} size={24} color={theme.colors.accent} />
      </View>

      <Text variant="caption2" color="secondaryLabel" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderCurve: 'continuous' },
  // Плитки делят ширину поровну: ряд остаётся рядом, а не сползает влево,
  // когда подписи разной длины.
  tool: { flex: 1, alignItems: 'center' },
  glyph: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
});
