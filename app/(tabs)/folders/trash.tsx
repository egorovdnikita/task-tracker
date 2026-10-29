import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

import { EmptyState, ListRow, ListSection } from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { noteTitle } from '../../../src/utils/blocks';
import { confirmDestructive } from '../../../src/utils/actionSheet';
import { daysLeftInTrash, trashedNotes, useNotesStore } from '../../../src/store/useNotesStore';
import { pluralNotes } from '../../../src/utils/date';
import { notify } from '../../../src/features/notify';

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

  const trashed = useMemo(() => trashedNotes(notes), [notes]);

  const restore = (id: string) => {
    const note = notes.find((n) => n.id === id);
    restoreNotes([id]);
    // Заметка возвращается в свою папку; если папки уже нет — в корень,
    // и об этом надо сказать, иначе она «пропадёт» второй раз.
    const home = note?.folderId ? folders.find((f) => f.id === note.folderId) : null;
    notify(
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
          contentContainerStyle={{
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.xxxl,
          }}
        >
          <ListSection
            header="В корзине"
            footer="Нажмите на заметку, чтобы посмотреть её. Долгое нажатие — восстановить или удалить сразу."
          >
            {trashed.map((note) => (
              <ListRow
                key={note.id}
                title={noteTitle(note)}
                subtitle={`Удалится через ${daysLeftInTrash(note)} дн.`}
                accessory={{ type: 'disclosure' }}
                // Касание открывает заметку на просмотр: раньше её нельзя было
                // увидеть, только восстановить или стереть вслепую. Быстрые
                // действия — меню по долгому нажатию из самой строки.
                onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                menuTitle={noteTitle(note)}
                menu={() => [
                  {
                    title: 'Восстановить',
                    icon: 'arrow.uturn.backward',
                    onPress: () => restore(note.id),
                  },
                  {
                    title: 'Удалить навсегда',
                    icon: 'trash',
                    destructive: true,
                    onPress: () =>
                      confirmDestructive(
                        'Удалить навсегда?',
                        'Эту заметку нельзя будет вернуть.',
                        'Удалить',
                        () => deleteForever([note.id]),
                      ),
                  },
                ]}
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
        </ScrollView>
      )}
    </>
  );
}
