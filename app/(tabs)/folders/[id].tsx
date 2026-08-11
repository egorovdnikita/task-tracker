import React, { useMemo, useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { EmptyState, Fab, IconButton, NoteList, Toast } from '../../../src/components';
import { useNotesStore, activeNotes, sortNotes } from '../../../src/store/useNotesStore';
import { SelectionBar, useSelection } from '../../../src/features/selection';
import { makeTextBlock } from '../../../src/utils/blocks';
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
  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const settings = useNotesStore((s) => s.settings);
  const setLayout = useNotesStore((s) => s.setLayout);
  const createNote = useNotesStore((s) => s.createNote);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);
  const togglePinned = useNotesStore((s) => s.togglePinned);

  const [toast, setToast] = useState<{ message: string; undo: () => void } | null>(null);
  const selection = useSelection();

  const scope = useMemo(() => {
    if (id === 'root') return { title: 'Без папки', folderId: null as string | null, tag: null };
    if (id?.startsWith('tag:')) return { title: id.slice(4), folderId: null, tag: id.slice(4) };
    const folder = folders.find((f) => f.id === id);
    return { title: folder?.name ?? 'Папка', folderId: id ?? null, tag: null };
  }, [id, folders]);

  const layout = settings.layout[id ?? 'root'] ?? 'list';

  const visible = useMemo(() => {
    const base = activeNotes(notes);
    const filtered = scope.tag
      ? base.filter((n) => n.tags.includes(scope.tag!))
      : id === 'root'
        ? base.filter((n) => !n.folderId)
        : base.filter((n) => n.folderId === scope.folderId);
    return sortNotes(filtered, settings.sort);
  }, [notes, scope, id, settings.sort]);

  const trashWithUndo = (ids: string[]) => {
    trashNotes(ids);
    setToast({
      message: ids.length === 1 ? 'Заметка в корзине' : `В корзине: ${ids.length}`,
      undo: () => restoreNotes(ids),
    });
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

  const create = () => {
    // Заметка создаётся сразу в этой папке: человек уже сказал, где он
    // находится, и переспрашивать после создания было бы лишним шагом.
    const note = createNote({ blocks: [makeTextBlock()], folderId: scope.folderId, tags: scope.tag ? [scope.tag] : [] });
    router.push({ pathname: '/note/[id]', params: { id: note.id } });
  };

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
        selectable={selection.active}
        selectedIds={selection.ids}
        onOpen={(noteId) =>
          selection.active
            ? selection.toggle(noteId)
            : router.push({ pathname: '/note/[id]', params: { id: noteId } })
        }
        onLongPress={(noteId) => (selection.active ? selection.toggle(noteId) : noteMenu(noteId))}
        contentInsetBottom={selection.active ? 64 : 0}
        ListEmptyComponent={
          <EmptyState
            icon={scope.tag ? 'tag' : 'folder'}
            title={scope.tag ? 'С этим тегом пусто' : 'В папке пусто'}
            description={
              scope.tag
                ? 'Тег появится в списке, когда им будет помечена хотя бы одна заметка.'
                : 'Перенесите сюда заметки или создайте новую.'
            }
            actionTitle="Создать заметку"
            onAction={create}
          />
        }
      />

      {visible.length > 0 && !selection.active ? <Fab onPress={create} /> : null}

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
