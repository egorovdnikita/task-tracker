import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Note } from '../types';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { IconButton } from '../components/IconButton';
import { NoteList } from '../components/NoteList';
import { ScreenBackdrop } from '../components/ScreenBackdrop';
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
    <ScreenBackdrop name="search">
      {/*
        Поля те же, что у остальных экранов (lg по краям), кнопка «назад» —
        штатные 44pt. До этого панель шла с полем sm и кнопкой 28: строка
        упиралась в края экрана, а кнопка не добирала до тач-таргета.
      */}
      <View
        style={[
          styles.bar,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            gap: theme.spacing.md,
          },
        ]}
      >
        <IconButton name="back" accessibilityLabel="Назад" onPress={onBack} />
        <SearchBar
          value={query}
          onChangeText={onChangeQuery}
          onClear={() => onChangeQuery?.('')}
          autoFocus
          style={{ flex: 1 }}
          testID="search-input"
        />
      </View>

      {searching ? (
        <AppText
          variant="caption"
          tone="secondary"
          style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}
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
    </ScreenBackdrop>
  );
};

const styles = StyleSheet.create({
  // Без заливки и без разделителя: панель поиска пропускает свечение фона,
  // иначе она стала бы единственным глухим прямоугольником на экране.
  bar: { flexDirection: 'row', alignItems: 'center' },
});
