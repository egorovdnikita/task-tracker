import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import type { LayoutMode, Note } from '../types';
import { NoteCard } from './NoteCard';
import { Text } from './Text';

export type NoteListProps = {
  notes: Note[];
  layout?: LayoutMode;
  onOpen?: (id: string) => void;
  onLongPress?: (id: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  highlight?: string;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  contentInsetBottom?: number;
  style?: ViewStyle;
};

type Section = { title: string | null; data: Note[][] };

/**
 * Список заметок.
 *
 * `SectionList` виртуализирован — это требование плиты 02: при 500+ заметках
 * список обязан оставаться списком, а не превращаться в одну длинную вьюху.
 *
 * Сетка строится теми же строками, только по две карточки в каждой, поэтому
 * виртуализация работает в обоих режимах. Карточки сетки одной высоты, а не
 * растут под содержимое, как в вайрфрейме: разная высота ломает виртуализацию
 * — окно рендера считается по строкам, и высоту строки нужно знать заранее.
 * В системных «Заметках» галерея тоже из карточек одного размера.
 */
export const NoteList = ({
  notes,
  layout = 'list',
  onOpen,
  onLongPress,
  selectable = false,
  selectedIds = [],
  highlight,
  ListHeaderComponent,
  ListEmptyComponent,
  contentInsetBottom = 0,
  style,
}: NoteListProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const columns = layout === 'grid' ? 2 : 1;

  const sections = useMemo<Section[]>(() => {
    const chunk = (items: Note[]): Note[][] => {
      const rows: Note[][] = [];
      for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
      return rows;
    };

    const pinned = notes.filter((n) => n.pinned);
    const rest = notes.filter((n) => !n.pinned);

    // Заголовок «Закреплено» появляется только когда есть что закрепить,
    // и вместе с ним появляется «Ранее» — одна шапка без второй бессмысленна.
    if (pinned.length === 0) return [{ title: null, data: chunk(rest) }];
    return [
      { title: 'Закреплено', data: chunk(pinned) },
      { title: 'Ранее', data: chunk(rest) },
    ];
  }, [notes, columns]);

  return (
    <SectionList
      style={style}
      sections={sections}
      keyExtractor={(row) => row.map((n) => n.id).join('+')}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: insets.bottom + contentInsetBottom + theme.spacing.xxxl,
        gap: theme.spacing.md,
        flexGrow: 1,
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      // Клавиатура закрывается перетаскиванием списка — системное поведение
      // экранов с поиском.
      keyboardDismissMode="on-drag"
      renderSectionHeader={({ section }) =>
        section.title ? (
          <Text
            variant="footnote"
            color="secondaryLabel"
            style={{ textTransform: 'uppercase', marginTop: theme.spacing.sm }}
          >
            {section.title}
          </Text>
        ) : null
      }
      renderItem={({ item: row }) => (
        <View style={[styles.row, { gap: theme.spacing.md }]}>
          {row.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              layout={layout}
              highlight={highlight}
              selectable={selectable}
              selected={selectedIds.includes(note.id)}
              onPress={() => onOpen?.(note.id)}
              onLongPress={() => onLongPress?.(note.id)}
              style={[
                styles.cell,
                // Карточка сетки — фиксированной высоты, чтобы строка была
                // одинаковой независимо от содержимого соседа.
                layout === 'grid' ? { height: 168 } : null,
              ]}
            />
          ))}

          {/* Добивка последней неполной строки: без неё одинокая карточка
              растянулась бы на всю ширину и выпала из сетки. */}
          {row.length < columns
            ? Array.from({ length: columns - row.length }, (_, i) => (
                <View key={`gap-${i}`} style={styles.cell} />
              ))
            : null}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flex: 1 },
});
