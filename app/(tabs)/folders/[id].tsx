import React, { useMemo, useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { BottomBar, EmptyState, IconButton, NoteList } from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { useNotesStore, activeNotes, searchNotes, sortNotes } from '../../../src/store/useNotesStore';
import { SelectionBar, useSelection } from '../../../src/features/selection';
import { offerUndo } from '../../../src/features/notify';
import { pluralNotes } from '../../../src/utils/date';
import { showActionSheet } from '../../../src/utils/actionSheet';

/**
 * Содержимое папки, тега или корня.
 *
 * Один экран на три случая: с точки зрения человека это один и тот же список,
 * отличается только чем он ограничен. Разводить их по трём файлам значило бы
 * трижды повторить одно поведение и трижды потом его чинить.
 *
 * `id` = идентификатор папки · `root` — заметки без папки · `tag:<имя>` — тег.
 */
export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const settings = useNotesStore((s) => s.settings);
  const setLayout = useNotesStore((s) => s.setLayout);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);
  const togglePinned = useNotesStore((s) => s.togglePinned);

  const [query, setQuery] = useState('');
  const selection = useSelection();

  const scope = useMemo(() => {
    if (id === 'root') return { title: 'Без папки', folderId: null as string | null, tag: null };
    if (id?.startsWith('tag:')) return { title: id.slice(4), folderId: null, tag: id.slice(4) };
    const folder = folders.find((f) => f.id === id);
    return { title: folder?.name ?? 'Папка', folderId: id ?? null, tag: null };
  }, [id, folders]);

  const layout = settings.layout[id ?? 'root'] ?? 'list';

  const visible = useMemo(() => {
    // Поиск идёт внутри папки, а не по всем заметкам: человек ищет там, где
    // стоит, — иначе список под полем перестал бы быть содержимым папки.
    const base = query.trim() ? searchNotes(notes, query) : activeNotes(notes);
    const filtered = scope.tag
      ? base.filter((n) => n.tags.includes(scope.tag!))
      : id === 'root'
        ? base.filter((n) => !n.folderId)
        : base.filter((n) => n.folderId === scope.folderId);
    return sortNotes(filtered, settings.sort);
  }, [notes, query, scope, id, settings.sort]);

  const trashWithUndo = (ids: string[]) => {
    trashNotes(ids);
    offerUndo(
      ids.length === 1 ? 'Заметка в корзине' : `В корзине: ${ids.length}`,
      () => restoreNotes(ids),
    );
  };

  const noteMenu = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    showActionSheet([
      { title: note.pinned ? 'Открепить' : 'Закрепить', onPress: () => togglePinned(noteId) },
      {
        title: 'Переместить…',
        onPress: () => router.push({ pathname: '/move', params: { ids: noteId } }),
      },
      { title: 'Удалить', destructive: true, onPress: () => trashWithUndo([noteId]) },
    ]);
  };

  // Шит создания открывается сразу с этой папкой: человек уже сказал, где он
  // находится, и переспрашивать после создания было бы лишним шагом.
  const create = () =>
    router.push({
      pathname: '/create',
      params: scope.tag
        ? { tag: scope.tag }
        : scope.folderId
          ? { folder: scope.folderId }
          : {},
    });

  return (
    <>
      <Stack.Screen
        options={{
          title: scope.title,
          headerRight: () => (
            <IconButton
              name={layout === 'list' ? 'square.grid.2x2' : 'list.bullet'}
              accessibilityLabel={layout === 'list' ? 'Показать сеткой' : 'Показать списком'}
              onPress={() => setLayout(id ?? 'root', layout === 'list' ? 'grid' : 'list')}
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
        onOpen={(noteId) =>
          selection.active
            ? selection.toggle(noteId)
            : router.push({ pathname: '/note/[id]', params: { id: noteId } })
        }
        onLongPress={(noteId) => (selection.active ? selection.toggle(noteId) : noteMenu(noteId))}
        onDelete={(noteId) => trashWithUndo([noteId])}
        onTogglePin={togglePinned}
        contentInsetBottom={
          theme.metrics.tabBar + theme.controlHeight.fab + (selection.active ? 64 : 0)
        }
        ListEmptyComponent={
          query.trim() ? (
            <EmptyState
              icon="magnifyingglass"
              title="Ничего не найдено"
              description={`По запросу «${query}» здесь заметок нет.`}
            />
          ) : (
            <EmptyState
              icon={scope.tag ? 'tag' : 'folder'}
              title={scope.tag ? 'С этим тегом пусто' : 'В папке пусто'}
              description={
                scope.tag
                  ? 'Тег появится в списке, когда им будет помечена хотя бы одна заметка.'
                  : 'Перенесите сюда заметки или создайте новую кнопкой внизу справа.'
              }
            />
          )
        }
      />

      <BottomBar
        hidden={selection.active}
        search={{ value: query, onChangeText: setQuery, placeholder: `Поиск: ${scope.title}` }}
        onCreate={create}
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
