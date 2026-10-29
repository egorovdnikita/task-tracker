import React from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Button, IconButton, ListRow, ListSection, StatRing, Text, headerItems } from '../src/components';
import { useTheme } from '../src/theme';
import { formatDateTime } from '../src/utils/date';
import { formatDuration, noteTitle } from '../src/utils/blocks';
import { noteStats } from '../src/utils/stats';
import { tagLabel } from '../src/features/tags';
import { splitEmoji } from '../src/utils/emoji';
import { useNotesStore } from '../src/store/useNotesStore';

/**
 * Шит «О заметке» — справка, без правки.
 *
 * Устроен как шит правила у Opal («Weekend Zen»): подпись-контекст и имя по
 * центру, сверху три кольца-показателя, ниже группа строк на ступень светлее
 * шита и белая кнопка подтверждения.
 */
export default function NoteInfoSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const note = useNotesStore((s) => s.notes.find((n) => n.id === id));
  const folders = useNotesStore((s) => s.folders);

  if (!note) return null;

  const stats = noteStats(note);
  const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;
  const parts = [
    stats.texts > 0 ? `текст ${stats.texts}` : null,
    stats.lists > 0 ? `списки ${stats.lists}` : null,
    stats.voices > 0 ? `записи ${stats.voices}` : null,
    stats.scans > 0 ? `сканы ${stats.scans}` : null,
    stats.sketches > 0 ? `рисунки ${stats.sketches}` : null,
  ].filter(Boolean);

  return (
    <>
      <Stack.Screen
        options={{
          unstable_headerLeftItems: headerItems(() => (
            <IconButton name="xmark" size={20} accessibilityLabel="Закрыть" onPress={() => router.back()} />
          )),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxxl }}
      >
        <View style={{ alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.xl }}>
          <Text variant="footnote" color="secondaryLabel">
            Изменена {formatDateTime(note.updatedAt)}
          </Text>
          <Text variant="title2" weight="bold" numberOfLines={2} style={{ textAlign: 'center' }}>
            {noteTitle(note)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginVertical: theme.spacing.xl,
          }}
        >
          <StatRing value={String(stats.words)} label="Слов" />
          <StatRing
            value={stats.checklist ? `${stats.checklist.done}/${stats.checklist.total}` : '—'}
            label="Пунктов"
            progress={stats.checklist ? stats.checklist.done / stats.checklist.total : 0}
          />
          <StatRing value={String(note.blocks.length)} label="Блоков" />
        </View>

        <ListSection tone="sheet">
          <ListRow title="Создана" value={formatDateTime(note.createdAt)} />
          <ListRow title="Изменена" value={formatDateTime(note.updatedAt)} />
          <ListRow
            title="Папка"
            value={folder ? splitEmoji(folder.name).rest : 'Без папки'}
          />
          <ListRow
            title="Теги"
            value={note.tags.length > 0 ? note.tags.map(tagLabel).join(', ') : 'Нет'}
          />
          {note.remindAt ? <ListRow title="Напоминание" value={formatDateTime(note.remindAt)} /> : null}
        </ListSection>

        <ListSection tone="sheet" header="Содержимое">
          <ListRow title="Символов" value={String(stats.characters)} />
          <ListRow title="Блоки" value={parts.length > 0 ? parts.join(', ') : 'нет'} />
          {stats.voiceMs > 0 ? <ListRow title="Длительность записей" value={formatDuration(stats.voiceMs)} /> : null}
          {stats.pages > 0 ? <ListRow title="Страниц скана" value={String(stats.pages)} /> : null}
        </ListSection>

        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          {/* Белая пилюля — подтверждение в шите, как «Edit Rule» у Opal. */}
          <Button title="Готово" variant="white" size="large" fullWidth onPress={() => router.back()} />
        </View>
      </ScrollView>
    </>
  );
}
