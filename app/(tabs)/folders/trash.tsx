import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

import { EmptyState, ListRow, ListSection, Text, Toast } from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { noteTitle } from '../../../src/utils/blocks';
import { confirmDestructive, showActionSheet } from '../../../src/utils/actionSheet';
import {
  daysLeftInTrash,
  trashedNotes,
  useNotesStore,
} from '../../../src/store/useNotesStore';
import { pluralNotes } from '../../../src/utils/date';

/**
 * Плита 08.5 — корзина.
 *
 * У каждой заметки написан свой срок, а не общее правило внизу экрана: «через
 * 30 дней» ничего не говорит о заметке, удалённой три недели назад.
 */
export default function TrashScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);
  const deleteForever = useNotesStore((s) => s.deleteForever);
  const emptyTrash = useNotesStore((s) => s.emptyTrash);
  const folders = useNotesStore((s) => s.folders);

  const [toast, setToast] = useState<string | null>(null);
  const trashed = useMemo(() => trashedNotes(notes), [notes]);

  const restore = (id: string) => {
    const note = notes.find((n) => n.id === id);
    restoreNotes([id]);
    // Заметка возвращается в свою папку; если папки уже нет — в корень,
    // и об этом надо сказать, иначе она «пропадёт» второй раз.
    const home = note?.folderId ? folders.find((f) => f.id === note.folderId) : null;
    setToast(
      note?.folderId && !home
        ? 'Папки больше нет — заметка вернулась в корень'
        : `Восстановлено: «${noteTitle(note!)}»`,
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Корзина' }} />

      {trashed.length === 0 ? (
        <EmptyState
          icon="trash"
          title="Корзина пуста"
          description="Удалённые заметки лежат здесь 30 дней, а потом исчезают навсегда."
        />
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxxl }}
        >
          <ListSection
            header={pluralNotes(trashed.length)}
            footer="Нажмите на заметку, чтобы восстановить её или удалить сразу."
          >
            {trashed.map((note) => (
              <ListRow
                key={note.id}
                title={noteTitle(note)}
                subtitle={`Удалится через ${daysLeftInTrash(note)} дн.`}
                accessory={{ type: 'disclosure' }}
                onPress={() =>
                  showActionSheet(
                    [
                      { title: 'Восстановить', onPress: () => restore(note.id) },
                      {
                        title: 'Удалить навсегда',
                        destructive: true,
                        onPress: () =>
                          confirmDestructive(
                            'Удалить навсегда?',
                            'Эту заметку нельзя будет вернуть.',
                            'Удалить',
                            () => deleteForever([note.id]),
                          ),
                      },
                    ],
                    { title: noteTitle(note) },
                  )
                }
              />
            ))}
          </ListSection>

          <ListSection>
            <ListRow
              title="Очистить корзину"
              destructive
              onPress={() =>
                // Единственное действие в приложении без отмены, поэтому
                // подтверждение с числом: человек должен увидеть масштаб.
                confirmDestructive(
                  'Очистить корзину?',
                  `${pluralNotes(trashed.length)} будут удалены навсегда.`,
                  'Очистить',
                  emptyTrash,
                )
              }
            />
          </ListSection>

          <Text
            variant="caption1"
            color="tertiaryLabel"
            style={{ textAlign: 'center', paddingHorizontal: theme.spacing.xxl }}
          >
            Заметки хранятся только на этом устройстве и никуда не отправляются.
          </Text>
        </ScrollView>
      )}

      <Toast message={toast} actionTitle="Открыть" onAction={() => router.navigate('/notes')} onHide={() => setToast(null)} />
    </>
  );
}
