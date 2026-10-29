import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { GlassSurface } from './GlassSurface';
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
 * Поэтому инструменты видны всегда: рядом у нижнего края редактора, не
 * завися от клавиатуры. Сначала они стояли в конце прокрутки, но в длинной
 * заметке до них приходилось долистывать. Плитка — глиф на прозрачной
 * плашке и слово под ним; вся плитка целиком и есть цель касания.
 */
export const NoteTools = ({ tools, style }: NoteToolsProps) => {
  const theme = useTheme();

  return (
    // Подпись «Добавить в заметку» над рядом снята: у нижнего края она
    // съедала высоту, а слова под глифами и так говорят, что вставится.
    <View accessibilityRole="toolbar" accessibilityLabel="Добавить в заметку" style={style}>
      <View
        style={[
          styles.card,
          {
            borderRadius: theme.radius.lg,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.sm,
          },
        ]}
      >
        {/* Подложка карточки заметки: системная серая на чёрном не видна. */}
        <GlassSurface
          mesh="card"
          stroke="card"
          tint={theme.tints.card}
          radius={theme.radius.lg}
          liquid={false}
          pointerEventsNone
          style={StyleSheet.absoluteFill}
        />
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
            // Не акцентная: фирменный цвет оставлен главным действиям, а пять
            // цветных пятен подряд перетягивали страницу. И не серая: серая
            // заливка гасит подсветку Opal — прозрачное белое, как у кнопок
            // шапки.
            backgroundColor: theme.tints.control,
          },
        ]}
      >
        <Symbol name={name} size={24} color={theme.colors.label} />
      </View>

      <Text variant="caption2" color="secondaryLabel" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderCurve: 'circular', overflow: 'hidden' },
  // Плитки делят ширину поровну: ряд остаётся рядом, а не сползает влево,
  // когда подписи разной длины.
  tool: { flex: 1, alignItems: 'center' },
  // 40pt, а не 48: ряд закреплён у края и не должен отнимать у заметки
  // высоту. Цель касания — вся плитка вместе со словом, она выше 44pt.
  glyph: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
});
