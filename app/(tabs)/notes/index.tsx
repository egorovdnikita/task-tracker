import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';

import {
  Chip,
  ChipRow,
  EmptyState,
  Fab,
  IconButton,
  NoteList,
  Toast,
} from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { BLOCK_LABELS } from '../../../src/types';
import { makeChecklistBlock, makeTextBlock } from '../../../src/utils/blocks';
import { showActionSheet } from '../../../src/utils/actionSheet';
import { pluralNotes } from '../../../src/utils/date';
import {
  activeNotes,
  collectTags,
  searchNotes,
  sortNotes,
  useNotesStore,
} from '../../../src/store/useNotesStore';
import { SelectionBar, useSelection } from '../../../src/features/selection';

/**
 * Плиты 02.1–02.3 и 02.5 — дом.
 *
 * Главный экран не витрина, а стопка последнего: сортировка по изменению,
 * закреплённое сверху, фильтр тегом. Поиск живёт в шапке и открывается
 * свайпом вниз по списку — это же и есть системное поле поиска в
 * `UINavigationController`.
 */
export default function NotesScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const settings = useNotesStore((s) => s.settings);
  const createNote = useNotesStore((s) => s.createNote);
  const setLayout = useNotesStore((s) => s.setLayout);
  const updateSettings = useNotesStore((s) => s.updateSettings);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);

  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; undo: () => void } | null>(null);
  const selection = useSelection();

  const layout = settings.layout.root ?? 'list';
  const tags = useMemo(() => collectTags(notes), [notes]);

  const visible = useMemo(() => {
    const base = query.trim() ? searchNotes(notes, query) : activeNotes(notes);
    const filtered = tag ? base.filter((n) => n.tags.includes(tag)) : base;
    return sortNotes(filtered, settings.sort);
  }, [notes, query, tag, settings.sort]);

  const openNew = (blocks = [makeTextBlock()]) => {
    const note = createNote({ blocks });
    router.push({ pathname: '/note/[id]', params: { id: note.id } });
  };

  /**
   * Плита 02.5: короткий тап создаёт текстовую заметку, долгий — выбор типа.
   *
   * Порядок не случайный: текст и список закреплены сверху как самые частые,
   * дальше идут те, что требуют разрешений и отдельного экрана.
   */
  const chooseType = () =>
    showActionSheet(
      [
        { title: BLOCK_LABELS.text, onPress: () => openNew() },
        { title: BLOCK_LABELS.checklist, onPress: () => openNew([makeChecklistBlock()]) },
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
    setToast({
      message: ids.length === 1 ? 'Заметка в корзине' : `В корзине: ${ids.length}`,
      undo: () => restoreNotes(ids),
    });
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
        { title: 'По дате изменения', onPress: () => updateSettings({ sort: 'updated' }) },
        { title: 'По дате создания', onPress: () => updateSettings({ sort: 'created' }) },
        { title: 'По заголовку', onPress: () => updateSettings({ sort: 'title' }) },
      ],
      { title: 'Сортировка' },
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Заметки',
          headerSearchBarOptions: {
            placeholder: 'Поиск по заметкам',
            onChangeText: (event) => setQuery(event.nativeEvent.text),
            onCancelButtonPress: () => setQuery(''),
            hideWhenScrolling: true,
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
              <IconButton
                name={layout === 'list' ? 'square.grid.2x2' : 'list.bullet'}
                accessibilityLabel={layout === 'list' ? 'Показать сеткой' : 'Показать списком'}
                onPress={() => setLayout('root', layout === 'list' ? 'grid' : 'list')}
              />
              <IconButton
                name="arrow.up.arrow.down"
                accessibilityLabel="Сортировка"
                onPress={sortMenu}
              />
            </View>
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
        contentInsetBottom={selection.active ? 64 : 0}
        ListHeaderComponent={
          tags.length > 0 && !selection.active ? (
            <ChipRow style={{ marginHorizontal: -theme.spacing.lg, marginBottom: theme.spacing.xs }}>
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
          ) : null
        }
        ListEmptyComponent={
          query.trim() ? (
            <EmptyState
              icon="magnifyingglass"
              title="Ничего не найдено"
              description={`По запросу «${query}» заметок нет.`}
            />
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
              description="Первая заметка обычно самая короткая — так и надо."
              actionTitle="Создать заметку"
              onAction={() => openNew()}
            />
          )
        }
      />

      {/* На пустом экране плавающая кнопка теряется, поэтому там действие
          вынесено в центр — а вместе они не появляются никогда. */}
      {visible.length > 0 && !selection.active ? (
        <Fab onPress={() => openNew()} onLongPress={chooseType} />
      ) : null}

      <SelectionBar
        selection={selection}
        onDelete={(ids) => {
          trashWithUndo(ids);
          selection.clear();
        }}
        summary={pluralNotes(selection.ids.length)}
      />

      <Toast
        message={toast?.message ?? null}
        onAction={toast?.undo}
        onHide={() => setToast(null)}
        offset={64}
      />
    </>
  );
}
