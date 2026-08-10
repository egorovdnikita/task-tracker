import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Note } from '../types';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { IconButton } from '../components/IconButton';
import { NoteList } from '../components/NoteList';
import { SearchBar } from '../components/SearchBar';

export type SearchScreenProps = {
  query: string;
  results: Note[];
  onChangeQuery?: (value: string) => void;
  onBack?: () => void;
  onOpenNote?: (id: string) => void;
  onNoteMenu?: (id: string) => void;
};

/** S3 — Search. */
export const SearchScreen = ({
  query,
  results,
  onChangeQuery,
  onBack,
  onOpenNote,
  onNoteMenu,
}: SearchScreenProps) => {
  const theme = useTheme();
  const searching = query.trim().length > 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.xs,
          },
        ]}
      >
        <IconButton name="back" size={28} accessibilityLabel="Назад" onPress={onBack} />
        <SearchBar
          value={query}
          onChangeText={onChangeQuery}
          onClear={() => onChangeQuery?.('')}
          autoFocus
          style={{ flex: 1, marginRight: theme.spacing.sm }}
          testID="search-input"
        />
      </View>

      {searching ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md }}
        >
          Найдено: {results.length}
        </AppText>
      ) : null}

      <NoteList
        notes={searching ? results : []}
        highlight={query}
        onPressNote={onOpenNote}
        onMenuPress={onNoteMenu}
        ListEmptyComponent={
          searching ? (
            <EmptyState
              icon="search"
              title="Ничего не найдено"
              description={`По запросу «${query}» нет заметок. Попробуйте другой запрос.`}
            />
          ) : (
            <EmptyState
              icon="search"
              title="Найдите заметку"
              description="Поиск идёт по заголовку, тексту и тегу."
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
});
