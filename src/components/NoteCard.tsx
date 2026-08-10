import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { noteColors } from '../theme/tokens';
import { formatRelativeDate } from '../utils/date';
import type { Note } from '../types';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { Icon } from './Icon';

export type NoteCardProps = {
  note: Note;
  compact?: boolean;
  highlight?: string;
  onPress?: (id: string) => void;
  onMenuPress?: (id: string) => void;
};

/** Splits `text` on `query` so matches can be emphasised in search results (S3). */
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

export const NoteCard = ({ note, compact = false, highlight = '', onPress, onMenuPress }: NoteCardProps) => {
  const theme = useTheme();
  const accent = noteColors[note.color];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={note.title || 'Без заголовка'}
      onPress={() => onPress?.(note.id)}
      style={({ pressed }) => [
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: compact ? theme.spacing.md : theme.spacing.lg,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {accent !== 'transparent' ? (
        <View style={[styles.accentBar, { backgroundColor: accent, borderTopLeftRadius: theme.radius.md, borderBottomLeftRadius: theme.radius.md }]} />
      ) : null}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          {note.pinned ? <Icon name="pin" size={12} tone="muted" /> : null}
          <AppText variant="subtitle" numberOfLines={1} style={styles.title}>
            {splitHighlight(note.title || 'Без заголовка', highlight).map((part, i) => (
              <AppText
                key={i}
                variant="subtitle"
                style={part.match ? { backgroundColor: theme.colors.surfaceAlt } : undefined}
              >
                {part.text}
              </AppText>
            ))}
          </AppText>
          <IconButton
            name="more"
            size={20}
            tone="muted"
            accessibilityLabel="Действия с заметкой"
            onPress={() => onMenuPress?.(note.id)}
            style={styles.menu}
          />
        </View>

        {!compact && note.body ? (
          <AppText variant="body" tone="muted" numberOfLines={2}>
            {note.body}
          </AppText>
        ) : null}

        <View style={styles.metaRow}>
          <AppText variant="caption" tone="muted">
            {note.tag ? `#${note.tag.toLowerCase()}` : '—'}
          </AppText>
          <AppText variant="caption" tone="muted">
            {formatRelativeDate(note.updatedAt)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  body: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1 },
  menu: { width: 28, height: 28, marginRight: -6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
});
