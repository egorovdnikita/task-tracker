import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';

import {
  BottomBar,
  Chip,
  ChipRow,
  EmptyState,
  IconButton,
  NoteList,
  SegmentedControl,
  Symbol,
  Text,
} from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { BLOCK_LABELS, type BlockType } from '../../../src/types';
import { showActionSheet } from '../../../src/utils/actionSheet';
import { pluralNotes } from '../../../src/utils/date';
import { SORT_LABELS } from '../../../src/features/labels';
import { offerUndo } from '../../../src/features/notify';
import {
  activeNotes,
  collectTags,
  searchNotes,
  sortNotes,
  useNotesStore,
} from '../../../src/store/useNotesStore';
import { SelectionBar, useSelection } from '../../../src/features/selection';

/** Источник совпадения — плита 06.2 разводит выдачу именно по нему. */
type Source = 'all' | 'text' | 'voice' | 'scan';

const SOURCES: { value: Source; label: string; blocks: BlockType[] }[] = [
  { value: 'all', label: 'Все', blocks: [] },
  { value: 'text', label: 'Текст', blocks: ['text', 'checklist'] },
  { value: 'voice', label: 'Голос', blocks: ['voice'] },
  { value: 'scan', label: 'Сканы', blocks: ['scan'] },
];

/**
 * Плиты 02.1–02.3, 02.5 и 06.1–06.2 — дом.
 *
 * Главный экран не витрина, а стопка последнего: сортировка по изменению,
 * закреплённое сверху, фильтр тегом. Поиск живёт полем у нижнего края — там,
 * куда дотягивается большой палец, и там же, где кнопка создания: искать и
 * заводить новое приходится чаще всего, и оба действия стоят на одном месте.
 */
export default function NotesScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const settings = useNotesStore((s) => s.settings);
  const setLayout = useNotesStore((s) => s.setLayout);
  const updateSettings = useNotesStore((s) => s.updateSettings);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);

  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [source, setSource] = useState<Source>('all');
  const selection = useSelection();

  // Поиск идёт, когда набрано хотя бы два символа: по одной букве выдача — это
  // весь список, и показывать её как результат нечестно.
  const searching = query.trim().length >= 2;

  const layout = settings.layout.root ?? 'list';
  const tags = useMemo(() => collectTags(notes), [notes]);

  const visible = useMemo(() => {
    const base = searching ? searchNotes(notes, query) : activeNotes(notes);
    const byTag = tag ? base.filter((n) => n.tags.includes(tag)) : base;

    const wanted = searching ? SOURCES.find((s) => s.value === source)?.blocks ?? [] : [];
    const bySource =
      wanted.length === 0 ? byTag : byTag.filter((n) => n.blocks.some((b) => wanted.includes(b.type)));

    return sortNotes(bySource, settings.sort);
  }, [notes, query, searching, tag, source, settings.sort]);

  /**
   * Плита 02.5: короткий тап открывает шит создания, долгий — выбор типа.
   *
   * Порядок не случайный: текст и список закреплены сверху как самые частые,
   * дальше идут те, что требуют разрешений и отдельного экрана.
   */
  const chooseType = () =>
    showActionSheet(
      [
        { title: BLOCK_LABELS.text, onPress: () => router.push('/create') },
        {
          title: BLOCK_LABELS.checklist,
          onPress: () => router.push({ pathname: '/create', params: { kind: 'checklist' } }),
        },
        // Заметка создаётся не здесь, а на самом экране захвата: если человек
        // передумает и закроет камеру, пустая заметка не должна остаться.
        { title: BLOCK_LABELS.voice, onPress: () => router.push('/capture/voice') },
        { title: BLOCK_LABELS.scan, onPress: () => router.push('/capture/scan') },
        { title: BLOCK_LABELS.sketch, onPress: () => router.push('/capture/sketch') },
      ],
      { title: 'Новая заметка' },
    );

  const trashWithUndo = (ids: string[]) => {
    trashNotes(ids);
    offerUndo(
      ids.length === 1 ? 'Заметка в корзине' : `В корзине: ${ids.length}`,
      () => restoreNotes(ids),
    );
  };

  const noteMenu = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    showActionSheet([
      { title: note.pinned ? 'Открепить' : 'Закрепить', onPress: () => togglePinned(id) },
      {
        title: 'Переместить…',
        onPress: () => router.push({ pathname: '/move', params: { ids: id } }),
      },
      { title: 'Теги…', onPress: () => router.push({ pathname: '/tags', params: { id } }) },
      {
        title: 'Напомнить…',
        onPress: () => router.push({ pathname: '/reminder', params: { id } }),
      },
      { title: 'Удалить', destructive: true, onPress: () => trashWithUndo([id]) },
    ]);
  };

  const sortMenu = () =>
    showActionSheet(
      [
        { title: SORT_LABELS.updated, onPress: () => updateSettings({ sort: 'updated' }) },
        { title: SORT_LABELS.created, onPress: () => updateSettings({ sort: 'created' }) },
        { title: SORT_LABELS.title, onPress: () => updateSettings({ sort: 'title' }) },
      ],
      { title: 'Сортировка' },
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Заметки',
          // Кнопок в шапке остался минимум: переключатель вида. Сортировка
          // уехала под заголовок пилюлей — там видно не только то, что её
          // можно сменить, но и на чём она стоит сейчас.
          headerRight: () => (
            <IconButton
              name={layout === 'list' ? 'square.grid.2x2' : 'list.bullet'}
              accessibilityLabel={layout === 'list' ? 'Показать сеткой' : 'Показать списком'}
              onPress={() => setLayout('root', layout === 'list' ? 'grid' : 'list')}
            />
          ),
        }}
      />

      <NoteList
        notes={visible}
        layout={layout}
        highlight={query}
        selectable={selection.active}
        selectedIds={selection.ids}
        onOpen={(id) =>
          selection.active
            ? selection.toggle(id)
            : router.push({ pathname: '/note/[id]', params: { id } })
        }
        onLongPress={(id) => (selection.active ? selection.toggle(id) : noteMenu(id))}
        onDelete={(id) => trashWithUndo([id])}
        onTogglePin={togglePinned}
        // Место под нижний ряд с поиском и созданием — последняя карточка не
        // должна прятаться под ним.
        contentInsetBottom={
          theme.metrics.tabBar +
          theme.controlHeight.fab +
          (selection.active ? 64 : 0)
        }
        ListHeaderComponent={
          !selection.active ? (
            <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
              {/*
                Во время поиска на месте сортировки стоит фильтр по источнику
                совпадения: сортировка выдачи не про то, а разводить их по
                двум строкам значит держать строку, которая полезна вполовину
                времени.
              */}
              {searching ? (
                <SegmentedControl
                  accessibilityLabel="Источник совпадения"
                  segments={SOURCES.map(({ value, label }) => ({ value, label }))}
                  selected={source}
                  onChange={setSource}
                />
              ) : (
                <SortPill label={SORT_LABELS[settings.sort]} onPress={sortMenu} />
              )}

              {tags.length > 0 ? (
                <ChipRow style={{ marginHorizontal: -theme.spacing.lg }}>
                  <Chip label="Все" selected={tag === null} onPress={() => setTag(null)} />
                  {tags.map((name) => (
                    <Chip
                      key={name}
                      label={name}
                      selected={tag === name}
                      onPress={() => setTag(tag === name ? null : name)}
                    />
                  ))}
                </ChipRow>
              ) : null}
            </View>
          ) : null
        }
        ListEmptyComponent={
          searching ? (
            // Экран не заканчивается тупиком: если пусто только из-за фильтра,
            // предлагаем снять фильтр, а не переписывать запрос.
            source !== 'all' || tag ? (
              <EmptyState
                icon="line.3.horizontal.decrease.circle"
                title="Пусто в этом фильтре"
                description={`По запросу «${query}» с выбранным фильтром ничего нет.`}
                actionTitle="Снять фильтр"
                onAction={() => {
                  setSource('all');
                  setTag(null);
                }}
              />
            ) : (
              <EmptyState
                icon="magnifyingglass"
                title="Ничего не найдено"
                description={`По запросу «${query}» заметок нет. Проверьте раскладку или попробуйте другое слово.`}
              />
            )
          ) : tag ? (
            <EmptyState
              icon="tag"
              title="В этом фильтре пусто"
              description={`С тегом «${tag}» пока нет заметок.`}
              actionTitle="Показать все"
              onAction={() => setTag(null)}
            />
          ) : (
            <EmptyState
              icon="note.text"
              title="Здесь пока пусто"
              description="Первая заметка обычно самая короткая — так и надо. Кнопка создания внизу справа."
            />
          )
        }
      />

      <BottomBar
        hidden={selection.active}
        search={{
          value: query,
          onChangeText: setQuery,
          placeholder: 'Поиск по заметкам',
        }}
        onCreate={() => router.push('/create')}
        onLongPressCreate={chooseType}
      />

      <SelectionBar
        selection={selection}
        onDelete={(ids) => {
          trashWithUndo(ids);
          selection.clear();
        }}
        summary={pluralNotes(selection.ids.length)}
      />
    </>
  );
}

/**
 * Сортировка пилюлей под заголовком.
 *
 * Раньше она пряталась в иконку в шапке, и текущее значение было не видно:
 * список стоял в порядке, который ниоткуда не следовал. Пилюля показывает и
 * то, что порядок можно сменить, и то, какой он сейчас.
 */
const SortPill = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Сортировка: ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          height: theme.controlHeight.segmented,
          paddingHorizontal: theme.spacing.md,
          gap: theme.spacing.xs,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.tertiarySystemFill,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Text variant="subheadline" color="secondaryLabel" numberOfLines={1}>
        {label}
      </Text>
      <Symbol name="chevron.down" size={11} color={theme.colors.tertiaryLabel} weight="semibold" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
});
