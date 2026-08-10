import React from 'react';
import { FlatList, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Note } from '../types';
import { NoteCard } from './NoteCard';

export type NoteListProps = {
  notes: Note[];
  compact?: boolean;
  highlight?: string;
  onPressNote?: (id: string) => void;
  onMenuPress?: (id: string) => void;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  contentContainerStyle?: ViewStyle;
};

export const NoteList = ({
  notes,
  compact = false,
  highlight = '',
  onPressNote,
  onMenuPress,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
}: NoteListProps) => {
  const theme = useTheme();

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ItemSeparatorComponent={() => <View style={{ height: compact ? theme.spacing.sm : theme.spacing.md }} />}
      contentContainerStyle={[
        {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: 96,
          flexGrow: notes.length === 0 ? 1 : undefined,
        },
        contentContainerStyle,
      ]}
      renderItem={({ item }) => (
        <NoteCard
          note={item}
          compact={compact}
          highlight={highlight}
          onPress={onPressNote}
          onMenuPress={onMenuPress}
        />
      )}
    />
  );
};
