import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { NoteEditorScreen, type NoteDraft } from '../src/screens/NoteEditorScreen';
import { collectTags, useNotesStore } from '../src/store/useNotesStore';
import { confirmDestructive } from '../src/utils/confirm';

/**
 * S2 — редактор существующей заметки.
 *
 * Лежит вне группы `(tabs)`, поэтому уезжает поверх панели вкладок:
 * правка — это заход внутрь одной заметки, и переключаться между разделами
 * из неё нечего.
 */
export default function EditorRoute() {
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const notes = useNotesStore((s) => s.notes);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const note = notes.find((n) => n.id === noteId) ?? null;

  const save = (draft: NoteDraft) => {
    if (note) updateNote(note.id, draft);
    else addNote(draft);
    router.back();
  };

  return (
    <NoteEditorScreen
      note={note}
      tags={collectTags(notes)}
      onBack={() => router.back()}
      onSave={save}
      onDelete={
        note
          ? () =>
              confirmDestructive('Удалить заметку?', 'Действие необратимо.', () => {
                deleteNote(note.id);
                router.back();
              })
          : undefined
      }
    />
  );
}
