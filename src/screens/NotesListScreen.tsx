import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { pluralNotes } from '../utils/date';
import type { Note } from '../types';
import { AppHeader } from '../components/AppHeader';
import { ChipGroup } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { Fab } from '../components/Fab';
import { NoteList } from '../components/NoteList';
import { ScreenBackdrop } from '../components/ScreenBackdrop';
import { SearchBar } from '../components/SearchBar';

export type NotesListScreenProps = {
  notes: Note[];
  tags: string[];
  activeTag: string | null;
  compact?: boolean;
  onSelectTag?: (tag: string | null) => void;
  onOpenNote?: (id: string) => void;
  onNoteMenu?: (id: string) => void;
  onCreateNote?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
};

/** S1 — Notes list / home. */
export const NotesListScreen = ({
  notes,
  tags,
  activeTag,
  compact = false,
  onSelectTag,
  onOpenNote,
  onNoteMenu,
  onCreateNote,
  onOpenSearch,
  onOpenSettings,
}: NotesListScreenProps) => {
  const theme = useTheme();

  const chips = [
    { key: '__all__', label: 'Все', count: notes.length },
    ...tags.map((tag) => ({
      key: tag,
      label: tag,
      count: notes.filter((n) => n.tag === tag).length,
    })),
  ];

  const visible = activeTag ? notes.filter((n) => n.tag === activeTag) : notes;
  const sorted = [...visible].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <ScreenBackdrop name="notes">
      <AppHeader
        title="Заметки"
        subtitle={pluralNotes(notes.length)}
        actions={[{ name: 'settings', accessibilityLabel: 'Настройки', onPress: onOpenSettings }]}
      />

      <View style={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
        <SearchBar value="" editable={false} onFocus={onOpenSearch} />
      </View>

      <ChipGroup
        items={chips}
        selectedKey={activeTag ?? '__all__'}
        onSelect={(key) => onSelectTag?.(key === '__all__' ? null : key)}
        style={{ flexGrow: 0, marginBottom: theme.spacing.md }}
      />

      <NoteList
        notes={sorted}
        compact={compact}
        onPressNote={onOpenNote}
        onMenuPress={onNoteMenu}
        ListEmptyComponent={
          <EmptyState
            title={activeTag ? `В «${activeTag}» пусто` : 'Пока нет заметок'}
            description={
              activeTag
                ? 'Смените фильтр или создайте заметку с этим тегом.'
                : 'Нажмите +, чтобы создать первую заметку.'
            }
            actionLabel="Новая заметка"
            onAction={onCreateNote}
          />
        }
      />

      <Fab onPress={onCreateNote} testID="fab-create-note" />
    </ScreenBackdrop>
  );
};
