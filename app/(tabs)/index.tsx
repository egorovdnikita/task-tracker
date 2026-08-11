import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';

import { ConfirmSheet } from '../../src/components/ConfirmSheet';
import { NoteComposerSheet } from '../../src/components/NoteComposerSheet';
import { NotesListScreen } from '../../src/screens/NotesListScreen';
import { collectTags, sortNotes, useNotesStore } from '../../src/store/useNotesStore';

/** S1 — список заметок, стартовая вкладка. */
export default function NotesRoute() {
  const { notes, settings } = useNotesStore();
  const addNote = useNotesStore((s) => s.addNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const sorted = useMemo(() => sortNotes(notes, settings.sort), [notes, settings.sort]);
  const menuNote = notes.find((n) => n.id === menuId) ?? null;

  return (
    <>
      <NotesListScreen
        notes={sorted}
        tags={collectTags(notes)}
        activeTag={activeTag}
        compact={settings.compact}
        onSelectTag={setActiveTag}
        onOpenNote={(noteId) => router.push({ pathname: '/editor', params: { noteId } })}
        onNoteMenu={setMenuId}
        // Создание — шит поверх списка; экран редактора остаётся для правки.
        onCreateNote={() => setComposing(true)}
        onOpenSearch={() => router.navigate('/search')}
        onOpenSettings={() => router.navigate('/settings')}
      />

      <NoteComposerSheet
        visible={composing}
        tags={collectTags(notes)}
        onCancel={() => setComposing(false)}
        onCreate={(draft) => {
          addNote(draft);
          setComposing(false);
        }}
      />

      <ConfirmSheet
        visible={menuNote !== null}
        title={menuNote?.pinned ? 'Открепить заметку?' : 'Удалить заметку?'}
        description={
          menuNote?.pinned
            ? 'Заметка перестанет быть первой в списке.'
            : 'Действие необратимо — заметка будет удалена навсегда.'
        }
        confirmLabel={menuNote?.pinned ? 'Открепить' : 'Удалить'}
        icon={menuNote?.pinned ? 'pin' : 'trash'}
        destructive={!menuNote?.pinned}
        onConfirm={() => {
          if (!menuId) return;
          if (menuNote?.pinned) togglePinned(menuId);
          else deleteNote(menuId);
          setMenuId(null);
        }}
        onCancel={() => setMenuId(null)}
      />
    </>
  );
}
