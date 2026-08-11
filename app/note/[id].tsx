import React, { useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import {
  BlockEditor,
  Chip,
  ChipWrap,
  EditorToolbar,
  IconButton,
  Text,
} from '../../src/components';
import { useTheme } from '../../src/theme';
import { hasContent, makeChecklistBlock, makeTextBlock } from '../../src/utils/blocks';
import { formatDateTime } from '../../src/utils/date';
import { showActionSheet } from '../../src/utils/actionSheet';
import { useNotesStore } from '../../src/store/useNotesStore';

/**
 * Плиты 03.1–03.3 — редактор.
 *
 * Кнопки «Сохранить» здесь нет и быть не должно: каждое изменение уходит в
 * стор сразу, а стор пишется на диск. Кнопка появляется там, где сохранение
 * может не удаться, — а локальной записи не от чего падать.
 *
 * Поэтому в шапке стоит не действие, а состояние: когда заметка изменена
 * последний раз. Это то же самое место, где в вайрфрейме стоял статус.
 */
export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const moveCheckedDown = useNotesStore((s) => s.settings.moveCheckedDown);
  const updateNote = useNotesStore((s) => s.updateNote);
  const setBlocks = useNotesStore((s) => s.setBlocks);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);

  const note = useMemo(() => notes.find((n) => n.id === id) ?? null, [notes, id]);
  const [titleDraft, setTitleDraft] = useState(note?.title ?? '');

  if (!note) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text color="secondaryLabel">Заметка не найдена</Text>
      </View>
    );
  }

  const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;

  /**
   * Пустая заметка при выходе не остаётся.
   *
   * Создание происходит до открытия редактора — иначе некуда писать, — и
   * если человек ничего не написал, он не создавал заметку, а передумал.
   */
  const leave = () => {
    if (!note.title.trim() && !hasContent(note.blocks)) trashNotes([note.id]);
    router.back();
  };

  const menu = () =>
    showActionSheet([
      { title: note.pinned ? 'Открепить' : 'Закрепить', onPress: () => togglePinned(note.id) },
      {
        title: note.remindAt ? 'Изменить напоминание…' : 'Напомнить…',
        onPress: () => router.push({ pathname: '/reminder', params: { id: note.id } }),
      },
      {
        title: 'Переместить…',
        onPress: () => router.push({ pathname: '/move', params: { ids: note.id } }),
      },
      { title: 'Теги…', onPress: () => router.push({ pathname: '/tags', params: { id: note.id } }) },
      {
        title: 'Удалить',
        destructive: true,
        onPress: () => {
          trashNotes([note.id]);
          router.back();
        },
      },
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton name="chevron.left" accessibilityLabel="Назад" onPress={leave} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
              {note.pinned ? (
                <IconButton
                  name="pin.fill"
                  accessibilityLabel="Открепить"
                  onPress={() => togglePinned(note.id)}
                />
              ) : null}
              <IconButton name="ellipsis.circle" accessibilityLabel="Меню заметки" onPress={menu} />
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {note.deletedAt ? (
          <View
            style={{
              backgroundColor: theme.colors.tertiarySystemFill,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
            }}
          >
            <Text variant="footnote" color="secondaryLabel" style={{ flex: 1 }}>
              Заметка в корзине — правки не сохранятся
            </Text>
            <Text
              variant="footnote"
              weight="semibold"
              color="systemBlue"
              onPress={() => restoreNotes([note.id])}
            >
              Восстановить
            </Text>
          </View>
        ) : null}

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: theme.spacing.lg,
            gap: theme.spacing.lg,
            paddingBottom: theme.spacing.xxxl,
          }}
        >
          <TextInput
            value={titleDraft}
            onChangeText={(value) => {
              setTitleDraft(value);
              updateNote(note.id, { title: value });
            }}
            placeholder="Заголовок"
            placeholderTextColor={theme.colors.placeholderText}
            style={[theme.text('title2', 'bold'), { color: theme.colors.label, padding: 0 }]}
          />

          <Text variant="caption1" color="tertiaryLabel">
            {formatDateTime(note.updatedAt)}
            {folder ? ` · ${folder.name}` : ''}
            {note.remindAt ? ` · напоминание ${formatDateTime(note.remindAt)}` : ''}
          </Text>

          <BlockEditor
            blocks={note.blocks}
            moveCheckedDown={moveCheckedDown}
            onChange={(blocks) => setBlocks(note.id, blocks)}
            onEditSketch={(blockId) =>
              router.push({ pathname: '/capture/sketch', params: { id: note.id, block: blockId } })
            }
          />

          {note.tags.length > 0 ? (
            <ChipWrap>
              {note.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  icon="tag"
                  selected
                  onRemove={() =>
                    updateNote(note.id, { tags: note.tags.filter((t) => t !== tag) })
                  }
                />
              ))}
            </ChipWrap>
          ) : null}
        </ScrollView>

        <EditorToolbar
          onDismissKeyboard={Keyboard.dismiss}
          actions={[
            {
              name: 'checklist',
              accessibilityLabel: 'Добавить список задач',
              onPress: () => setBlocks(note.id, [...note.blocks, makeChecklistBlock()]),
            },
            {
              name: 'text.alignleft',
              accessibilityLabel: 'Добавить текстовый блок',
              onPress: () => setBlocks(note.id, [...note.blocks, makeTextBlock()]),
            },
            // Плита 04: запись, скан и рисунок — такие же блоки в потоке, как
            // текст и список, поэтому и вставляются той же панелью.
            {
              name: 'mic',
              accessibilityLabel: 'Записать голос',
              onPress: () => router.push({ pathname: '/capture/voice', params: { id: note.id } }),
            },
            {
              name: 'doc.text.viewfinder',
              accessibilityLabel: 'Отсканировать документ',
              onPress: () => router.push({ pathname: '/capture/scan', params: { id: note.id } }),
            },
            {
              name: 'scribble',
              accessibilityLabel: 'Нарисовать',
              onPress: () => router.push({ pathname: '/capture/sketch', params: { id: note.id } }),
            },
            {
              name: 'tag',
              accessibilityLabel: 'Теги заметки',
              onPress: () => router.push({ pathname: '/tags', params: { id: note.id } }),
            },
          ]}
        />
      </KeyboardAvoidingView>
    </>
  );
}
