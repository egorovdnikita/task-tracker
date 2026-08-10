import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { formatDateTime } from '../utils/date';
import type { NoteColor } from '../theme/tokens';
import type { Note } from '../types';
import { AppHeader } from '../components/AppHeader';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ColorPicker } from '../components/ColorPicker';
import { TextField } from '../components/TextField';

export type NoteDraft = {
  title: string;
  body: string;
  tag: string | null;
  color: NoteColor;
  pinned: boolean;
};

export type NoteEditorScreenProps = {
  note?: Note | null;
  tags: string[];
  onBack?: () => void;
  onSave?: (draft: NoteDraft) => void;
  onDelete?: () => void;
};

const emptyDraft: NoteDraft = { title: '', body: '', tag: null, color: 'default', pinned: false };

/** S2 — Note editor (create + edit share one screen). */
export const NoteEditorScreen = ({ note, tags, onBack, onSave, onDelete }: NoteEditorScreenProps) => {
  const theme = useTheme();
  const [draft, setDraft] = useState<NoteDraft>(
    note ? { title: note.title, body: note.body, tag: note.tag, color: note.color, pinned: note.pinned } : emptyDraft,
  );

  useEffect(() => {
    setDraft(
      note
        ? { title: note.title, body: note.body, tag: note.tag, color: note.color, pinned: note.pinned }
        : emptyDraft,
    );
  }, [note]);

  const patch = (next: Partial<NoteDraft>) => setDraft((d) => ({ ...d, ...next }));
  const dirty =
    !note ||
    note.title !== draft.title ||
    note.body !== draft.body ||
    note.tag !== draft.tag ||
    note.color !== draft.color ||
    note.pinned !== draft.pinned;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader
        title={note ? 'Правка' : 'Новая заметка'}
        onBack={onBack}
        actions={[
          {
            name: 'pin',
            accessibilityLabel: draft.pinned ? 'Открепить' : 'Закрепить',
            active: draft.pinned,
            onPress: () => patch({ pinned: !draft.pinned }),
          },
          ...(note
            ? [{ name: 'trash' as const, accessibilityLabel: 'Удалить заметку', tone: 'danger' as const, onPress: onDelete }]
            : []),
        ]}
      />

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          value={draft.title}
          onChangeText={(title) => patch({ title })}
          placeholder="Заголовок"
          size="title"
          autoFocus={!note}
          testID="editor-title"
        />

        <TextField
          value={draft.body}
          onChangeText={(body) => patch({ body })}
          placeholder="Текст заметки..."
          multiline
          style={{ minHeight: 220 }}
          inputStyle={{ minHeight: 200 }}
          testID="editor-body"
        />

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="label" tone="muted">
            ТЕГ
          </AppText>
          <View style={styles.chipRow}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={draft.tag === tag}
                onPress={() => patch({ tag: draft.tag === tag ? null : tag })}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="label" tone="muted">
            ЦВЕТ
          </AppText>
          <ColorPicker value={draft.color} onChange={(color) => patch({ color })} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            padding: theme.spacing.lg,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <AppText variant="caption" tone="muted">
          {note ? `Изменено ${formatDateTime(note.updatedAt)}` : 'Черновик не сохранён'}
        </AppText>
        <Button
          label="Сохранить"
          size="lg"
          fullWidth
          disabled={!dirty || (!draft.title.trim() && !draft.body.trim())}
          onPress={() => onSave?.(draft)}
          testID="editor-save"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
});
