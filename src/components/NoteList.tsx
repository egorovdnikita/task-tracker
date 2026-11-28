import { HeaderHeightContext } from 'expo-router/react-navigation';
import { noteSections } from '../utils/noteSections';
import { localColors } from '../theme/localColors';
import { boxPrimitives } from '../vendor/box-ui/primitives';
import React, { useMemo, useRef, useContext } from 'react';
import {
  Pressable,
  SectionList,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '../theme';
import type { LayoutMode, Note } from '../types';
import { NoteCard } from './NoteCard';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type NoteListProps = {
  notes: Note[];
  layout?: LayoutMode;
  groupPinned?: boolean;
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
  groupPinned = true,
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
  const header = useContext(HeaderHeightContext) ?? 0;
  const { fontScale } = useWindowDimensions();

  // Одинокая карточка сеткой не выкладывается: половина ширины занята, вторая
  // пуста, и экран выглядит сломанным, а не полупустым. Сетка начинается там,
  // где есть что ставить рядом.
  const columns = layout === 'grid' && notes.length > 1 ? 2 : 1;
  const swipeable = layout === 'list' && !selectable && Boolean(onDelete || onTogglePin);

  const sections = useMemo<Section[]>(() => groupPinned ? noteSections(notes, columns) : [{ title: null, data: Array.from({ length: Math.ceil(notes.length / columns) }, (_, i) => notes.slice(i * columns, (i + 1) * columns)) }], [notes, columns, groupPinned]);

  const compact = groupPinned && layout === 'list' && notes.some(note => note.pinned);
  const contentStyle = {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Math.max(header, insets.top) + (header ? 12 : 0),
    paddingBottom: insets.bottom + contentInsetBottom + 12,
    gap: compact ? 8 : 16,
    flexGrow: 1,
  };
  if (!notes.length) return <ScrollView style={[{ flex: 1 }, !header && { marginBottom: insets.bottom + 66 }, style]} contentInsetAdjustmentBehavior="never" automaticallyAdjustContentInsets={false} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
    {ListHeaderComponent}
    <View style={{ flex: 1, justifyContent: 'center' }}>{ListEmptyComponent}</View>
  </ScrollView>;
  return (
    <SectionList
      style={[{ flex: 1 }, !header && { marginBottom: insets.bottom + 66 }, style]}
      sections={sections}
      keyExtractor={(row) => row.map((n) => n.id).join('+')}
      stickySectionHeadersEnabled={false}
      // Прозрачная шапка не занимает места в потоке: без этого первая строка
      // списка — ряд чипов или карточка — уезжает под размытие и статус-бар.
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
      contentContainerStyle={contentStyle}
      // `null` в RN 0.88 слоты списка больше не принимают — только «нет».
      ListHeaderComponent={ListHeaderComponent ? <View style={{ marginBottom: compact ? 8 : 0 }}>{ListHeaderComponent}</View> : undefined}
      ListEmptyComponent={ListEmptyComponent ?? undefined}
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
              { gap: theme.spacing.sm, marginTop: compact && section.title === 'Остальные заметки' ? 8 : 0 },
            ]}
          >
            <Text variant="headline" weight="regular" color="onBackdrop">{section.title}</Text>

          </View>
        ) : null
      }
      renderItem={({ item: row }) => (
        <View style={[styles.row, { gap: theme.spacing.md }]}>
          {row.map((note) => {
            const card = (
              <NoteCard
                note={note}
                compact={!groupPinned && layout === 'list'}
                layout={layout}
                highlight={highlight}
                selectable={selectable}
                selected={selectedIds.includes(note.id)}
                onPress={() => onOpen?.(note.id)}
                onLongPress={(anchor) => onLongPress?.(note.id, anchor)}
                style={styles.cell}
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
          {!(groupPinned && row[0]?.pinned) && row.length < columns
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
    progress: SharedValue<number>,
    label: string,
    icon: Parameters<typeof Symbol>[0]['name'],
    background: string,
    onPress: () => void,
    side: 'left' | 'right',
  ) => (
    <SwipeAction
      progress={progress}
      label={label}
      icon={icon}
      background={background}
      side={side}
      onPress={() => {
        methods.current?.close();
        onPress();
      }}
    />
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
          ? (progress) =>
              action(progress, 'Удалить', 'trash.fill', theme.hex.systemRed, onDelete, 'right')
          : undefined
      }
      renderLeftActions={
        onTogglePin
          ? (progress) =>
              action(
                progress,
                pinned ? 'Открепить' : 'Закрепить',
                pinned ? 'pin.slash.fill' : 'pin.fill',
                // Монохромно: закрепление не главное действие и не опасное.
                // Цвет у свайпа остаётся только у «Удалить».
                theme.tints.control,
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

/**
 * Кнопка свайпа.
 *
 * В покое она лежит под карточкой, а карточка — прозрачное стекло: красная и
 * оранжевая плашки просвечивали сквозь каждую заметку цветными пятнами.
 * Поэтому кнопка проявляется вместе со свайпом и в покое невидима.
 */
const SwipeAction = ({
  progress,
  label,
  icon,
  background,
  side,
  onPress,
}: {
  progress: SharedValue<number>;
  label: string;
  icon: Parameters<typeof Symbol>[0]['name'];
  background: string;
  side: 'left' | 'right';
  onPress: () => void;
}) => {
  const theme = useTheme();
  const reveal = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.15, 0.85], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[
        reveal,
        {
          marginLeft: side === 'right' ? theme.spacing.sm : 0,
          marginRight: side === 'left' ? theme.spacing.sm : 0,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.action,
          {
            backgroundColor: background,
            borderRadius: theme.radius.lg,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Symbol name={icon} size={20} color={localColors.white} weight="semibold" />
        <Text variant="caption2" style={{ color: localColors.white }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  cell: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline' },
  action: {
    flex: 1,
    width: boxPrimitives.size['76'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: boxPrimitives.spacing['4'],
    borderCurve: 'continuous',
  },
});
