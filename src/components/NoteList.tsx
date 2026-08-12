import React, { useMemo, useRef } from 'react';
import { Pressable, SectionList, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useTheme } from '../theme';
import type { LayoutMode, Note } from '../types';
import { NoteCard } from './NoteCard';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type NoteListProps = {
  notes: Note[];
  layout?: LayoutMode;
  onOpen?: (id: string) => void;
  /** Долгое нажатие вместе с прямоугольником карточки — под меню на месте. */
  onLongPress?: (id: string, anchor: { x: number; y: number; width: number; height: number }) => void;
  /** Свайп влево — удалить. Плита 02.2. */
  onDelete?: (id: string) => void;
  /** Свайп вправо — закрепить или открепить. */
  onTogglePin?: (id: string) => void;
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
  onDelete,
  onTogglePin,
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

  // Одинокая карточка сеткой не выкладывается: половина ширины занята, вторая
  // пуста, и экран выглядит сломанным, а не полупустым. Сетка начинается там,
  // где есть что ставить рядом.
  const columns = layout === 'grid' && notes.length > 1 ? 2 : 1;
  const swipeable = layout === 'list' && !selectable && Boolean(onDelete || onTogglePin);

  const sections = useMemo<Section[]>(() => {
    const chunk = (items: Note[]): Note[][] => {
      const rows: Note[][] = [];
      for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
      return rows;
    };

    // Пустой список не даёт ни одной секции. Секция с пустым `data` кажется
    // `SectionList` содержимым, и `ListEmptyComponent` не рендерится вовсе —
    // именно так экран без заметок оказывался пустым насовсем.
    if (notes.length === 0) return [];

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
      // Прозрачная шапка не занимает места в потоке: без этого первая строка
      // списка — ряд чипов или карточка — уезжает под размытие и статус-бар.
      contentInsetAdjustmentBehavior="automatic"
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
          // Название и счётчик одной строкой, обычным кеглем: там, где смысл
          // в числе, прописные вторичным цветом читаются как запрет, а не как
          // подпись группы.
          <View
            style={[
              styles.sectionHeader,
              { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
            ]}
          >
            <Text variant="headline">{section.title}</Text>
            <Text variant="headline" color="tertiaryLabel">
              {section.data.reduce((total, row) => total + row.length, 0)}
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item: row }) => (
        <View style={[styles.row, { gap: theme.spacing.md }]}>
          {row.map((note) => {
            const card = (
              <NoteCard
                note={note}
                layout={layout}
                highlight={highlight}
                selectable={selectable}
                selected={selectedIds.includes(note.id)}
                onPress={() => onOpen?.(note.id)}
                onLongPress={(anchor) => onLongPress?.(note.id, anchor)}
                style={[
                  styles.cell,
                  // Карточка сетки — фиксированной высоты, чтобы строка была
                  // одинаковой независимо от содержимого соседа.
                  columns > 1 ? { height: 140 } : null,
                ]}
              />
            );

            return swipeable ? (
              <SwipeRow
                key={note.id}
                pinned={note.pinned}
                onDelete={onDelete ? () => onDelete(note.id) : undefined}
                onTogglePin={onTogglePin ? () => onTogglePin(note.id) : undefined}
              >
                {card}
              </SwipeRow>
            ) : (
              <React.Fragment key={note.id}>{card}</React.Fragment>
            );
          })}

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

/**
 * Карточка со свайпами.
 *
 * Свайп — основной способ разобрать список в iOS, и до сих пор его здесь не
 * было: удалить или закрепить можно было только долгим нажатием, то есть
 * через меню. Действия те же, что в меню, — свайп не добавляет возможностей,
 * он убирает шаги.
 *
 * Кнопка после срабатывания закрывается сама: оставлять её открытой над уже
 * удалённой строкой не над чем.
 */
const SwipeRow = ({
  children,
  pinned,
  onDelete,
  onTogglePin,
}: {
  children: React.ReactNode;
  pinned: boolean;
  onDelete?: () => void;
  onTogglePin?: () => void;
}) => {
  const theme = useTheme();
  const methods = useRef<SwipeableMethods>(null);

  const action = (
    label: string,
    icon: Parameters<typeof Symbol>[0]['name'],
    background: string,
    onPress: () => void,
    side: 'left' | 'right',
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        methods.current?.close();
        onPress();
      }}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: background,
          borderRadius: theme.radius.lg,
          marginLeft: side === 'right' ? theme.spacing.sm : 0,
          marginRight: side === 'left' ? theme.spacing.sm : 0,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Symbol name={icon} size={20} color="#FFFFFF" weight="semibold" />
      <Text variant="caption2" style={{ color: '#FFFFFF' }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      ref={methods}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
      overshootRight={false}
      overshootLeft={false}
      containerStyle={styles.cell}
      renderRightActions={
        onDelete
          ? () => action('Удалить', 'trash.fill', theme.hex.systemRed, onDelete, 'right')
          : undefined
      }
      renderLeftActions={
        onTogglePin
          ? () =>
              action(
                pinned ? 'Открепить' : 'Закрепить',
                pinned ? 'pin.slash.fill' : 'pin.fill',
                theme.hex.systemOrange,
                onTogglePin,
                'left',
              )
          : undefined
      }
    >
      {children}
    </ReanimatedSwipeable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline' },
  action: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderCurve: 'continuous',
  },
});
