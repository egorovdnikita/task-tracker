import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { NOTE_GLOW_OPACITY, noteGlows } from '../theme/tokens';
import { formatRelativeDate } from '../utils/date';
import type { Note } from '../types';
import { AppText } from './AppText';
import { GlassSurface } from './GlassSurface';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

export type NoteCardProps = {
  note: Note;
  compact?: boolean;
  highlight?: string;
  onPress?: (id: string) => void;
  onMenuPress?: (id: string) => void;
};

/** Разбивает текст по совпадению, чтобы подсветить его в результатах поиска. */
const splitHighlight = (text: string, query: string) => {
  if (!query.trim()) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  const needle = query.trim().toLowerCase();
  let cursor = 0;
  let idx = lower.indexOf(needle, cursor);
  while (idx !== -1) {
    if (idx > cursor) parts.push({ text: text.slice(cursor, idx), match: false });
    parts.push({ text: text.slice(idx, idx + needle.length), match: true });
    cursor = idx + needle.length;
    idx = lower.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
};

/**
 * Карточка на стеклянной поверхности: меш даёт лёгкое свечение по углам,
 * цвет заметки добавляется четвёртым эллипсом поверх пресета.
 */
export const NoteCard = ({
  note,
  compact = false,
  highlight = '',
  onPress,
  onMenuPress,
}: NoteCardProps) => {
  const theme = useTheme();
  const glow = noteGlows[note.glow];

  const mesh = [
    ...theme.meshes.card,
    ...(glow
      ? [{ x: 0.95, y: -0.15, rx: 0.5, ry: 0.85, color: glow, opacity: NOTE_GLOW_OPACITY }]
      : []),
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={note.title || 'Без заголовка'}
      onPress={() => onPress?.(note.id)}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      <GlassSurface
        mesh={mesh}
        stroke="card"
        tint={theme.tints.card}
        // Карточка нажимается — отклик стекла тут уместен. Цветное свечение
        // заметки при этом остаётся: меш рисуется поверх материала.
        interactive
        radius={theme.radius.lg}
        style={{ padding: compact ? theme.spacing.lg : theme.spacing.xl, gap: theme.spacing.sm }}
      >
        <View style={styles.titleRow}>
          {note.pinned ? <Icon name="pin" size={14} tone="accent" /> : null}
          <AppText variant="body" numberOfLines={1} style={styles.title}>
            {splitHighlight(note.title || 'Без заголовка', highlight).map((part, i) => (
              <AppText
                key={i}
                variant="body"
                tone={part.match ? 'accent' : 'default'}
              >
                {part.text}
              </AppText>
            ))}
          </AppText>
          <IconButton
            name="more"
            size={32}
            tone="tertiary"
            variant="plain"
            accessibilityLabel="Действия с заметкой"
            onPress={() => onMenuPress?.(note.id)}
            style={styles.menu}
          />
        </View>

        {!compact && note.body ? (
          <AppText variant="subtle" tone="secondary" numberOfLines={2}>
            {note.body}
          </AppText>
        ) : null}

        <View style={styles.metaRow}>
          <AppText variant="caption" tone="tertiary">
            {note.tag ? `#${note.tag.toLowerCase()}` : '—'}
          </AppText>
          <AppText variant="caption" tone="tertiary">
            {formatRelativeDate(note.updatedAt)}
          </AppText>
        </View>
      </GlassSurface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
  menu: { marginRight: -8, marginVertical: -8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
});
