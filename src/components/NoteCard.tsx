import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { LayoutMode, Note } from '../types';
import { checklistProgress, noteSubtitle, noteTitle } from '../utils/blocks';
import { formatRelativeDate } from '../utils/date';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type NoteCardProps = {
  note: Note;
  layout?: LayoutMode;
  onPress?: () => void;
  onLongPress?: () => void;
  /** Режим множественного выбора: слева появляется отметка. Плита 05.2. */
  selectable?: boolean;
  selected?: boolean;
  /** Подсветить совпадение — поиск подсвечивает не только заголовок. */
  highlight?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Карточка заметки.
 *
 * Превью зависит от содержимого, а не от типа: у списка задач это прогресс,
 * у текста — первые строки. Тип заметки — не свойство сущности, а то, чем она
 * оказалась заполнена.
 */
export const NoteCard = ({
  note,
  layout = 'list',
  onPress,
  onLongPress,
  selectable = false,
  selected = false,
  highlight,
  style,
}: NoteCardProps) => {
  const theme = useTheme();
  const progress = checklistProgress(note);
  const preview = noteSubtitle(note);
  const accent = note.accent ? theme.accent(note.accent) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: selectable ? selected : undefined }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        {
          padding: theme.spacing.lg,
          gap: theme.spacing.xs,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.secondarySystemGroupedBackground,
          opacity: pressed ? 0.7 : 1,
        },
        selected ? { borderWidth: 2, borderColor: theme.colors.systemBlue } : null,
        style,
      ]}
    >
      <View style={[styles.head, { gap: theme.spacing.sm }]}>
        {selectable ? (
          <Symbol
            name={selected ? 'checkmark.circle.fill' : 'circle'}
            size={20}
            color={selected ? theme.colors.systemBlue : theme.colors.tertiaryLabel}
          />
        ) : null}

        {accent ? (
          <View
            accessibilityElementsHidden
            style={[styles.dot, { backgroundColor: accent, borderRadius: theme.radius.pill }]}
          />
        ) : null}

        <Text variant="headline" numberOfLines={1} style={styles.grow}>
          {noteTitle(note)}
        </Text>

        {note.pinned ? (
          <Symbol
            name="pin.fill"
            size={13}
            color={theme.colors.tertiaryLabel}
            accessibilityLabel="Закреплено"
          />
        ) : null}
      </View>

      {progress ? (
        <View style={[styles.head, { gap: theme.spacing.xs }]}>
          <Symbol name="checklist" size={13} color={theme.colors.secondaryLabel} />
          <Text variant="footnote" color="secondaryLabel">
            {progress.done} из {progress.total}
          </Text>
        </View>
      ) : preview ? (
        <Highlighted
          text={preview}
          query={highlight}
          lines={layout === 'grid' ? 6 : 2}
        />
      ) : null}

      <View style={[styles.head, { gap: theme.spacing.sm, marginTop: theme.spacing.xxs }]}>
        <Text variant="caption1" color="tertiaryLabel">
          {formatRelativeDate(note.updatedAt)}
        </Text>

        {note.remindAt ? (
          <Symbol
            name="bell.fill"
            size={11}
            color={theme.colors.tertiaryLabel}
            accessibilityLabel="Есть напоминание"
          />
        ) : null}

        {note.tags.slice(0, layout === 'grid' ? 1 : 2).map((tag) => (
          <Text key={tag} variant="caption1" color="tertiaryLabel" numberOfLines={1}>
            #{tag}
          </Text>
        ))}
      </View>
    </Pressable>
  );
};

/**
 * Превью с подсветкой совпадения.
 *
 * Подсвечивается строка контекста, а не только заголовок: чаще всего искомое
 * слово стоит в теле, и без подсветки результат выглядит случайным.
 */
const Highlighted = ({
  text,
  query,
  lines,
}: {
  text: string;
  query?: string;
  lines: number;
}) => {
  const theme = useTheme();
  const needle = query?.trim();

  if (!needle) {
    return (
      <Text variant="subheadline" color="secondaryLabel" numberOfLines={lines}>
        {text}
      </Text>
    );
  }

  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (at < 0) {
    return (
      <Text variant="subheadline" color="secondaryLabel" numberOfLines={lines}>
        {text}
      </Text>
    );
  }

  // Окно вокруг совпадения: искомое слово может стоять глубоко в тексте, и
  // без сдвига начала строки его в двух строках превью просто не видно.
  const from = Math.max(0, at - 24);
  const head = from > 0 ? '…' : '';

  return (
    <Text variant="subheadline" color="secondaryLabel" numberOfLines={lines}>
      {head}
      {text.slice(from, at)}
      <Text variant="subheadline" weight="semibold" style={{ color: theme.hex.systemBlue }}>
        {text.slice(at, at + needle.length)}
      </Text>
      {text.slice(at + needle.length)}
    </Text>
  );
};

const styles = StyleSheet.create({
  card: { borderCurve: 'continuous' },
  head: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  dot: { width: 8, height: 8 },
});
