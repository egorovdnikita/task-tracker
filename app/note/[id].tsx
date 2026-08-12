import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import {
  BlockEditor,
  Chip,
  ChipWrap,
  Confetti,
  EditorToolbar,
  IconButton,
  Symbol,
  Text,
} from '../../src/components';
import { useTheme, type PaletteName } from '../../src/theme';
import { hasContent, makeChecklistBlock, makeTextBlock } from '../../src/utils/blocks';
import { dueState, formatDateTime } from '../../src/utils/date';
import { showActionSheet } from '../../src/utils/actionSheet';
import { notify } from '../../src/features/notify';
import { useNotesStore } from '../../src/store/useNotesStore';
import type { NoteBlock } from '../../src/types';

const DUE_COLOR: Record<ReturnType<typeof dueState>, PaletteName> = {
  overdue: 'systemRed',
  today: 'systemGreen',
  future: 'systemPurple',
};

/** Сколько пунктов отмечено во всех чек-листах заметки. */
const doneCount = (blocks: NoteBlock[]): number =>
  blocks.reduce(
    (total, block) =>
      block.type === 'checklist'
        ? total + block.items.filter((item) => item.done).length
        : total,
    0,
  );

/**
 * Плиты 03.1–03.3 — редактор.
 *
 * Кнопки «Сохранить» здесь нет и быть не должно: каждое изменение уходит в
 * стор сразу, а стор пишется на диск. Кнопка появляется там, где сохранение
 * может не удаться, — а локальной записи не от чего падать.
 *
 * Поэтому в шапке стоит не действие, а состояние: «Сохранение…» на время
 * записи и «Сохранено» после неё. Дата изменения мелким серым под заголовком
 * этого не заменяла — она меняется молча, и подтверждения человек не получал.
 */
export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const settings = useNotesStore((s) => s.settings);
  const updateNote = useNotesStore((s) => s.updateNote);
  const updateSettings = useNotesStore((s) => s.updateSettings);
  const setBlocks = useNotesStore((s) => s.setBlocks);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const deleteForever = useNotesStore((s) => s.deleteForever);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);

  const note = useMemo(() => notes.find((n) => n.id === id) ?? null, [notes, id]);
  const [titleDraft, setTitleDraft] = useState(note?.title ?? '');

  /**
   * Статус сохранения.
   *
   * Запись мгновенная, но сказать о ней всё равно нужно: «Сохранение…» на
   * долю секунды и «Сохранено» после — это не индикатор процесса, а
   * подтверждение, что правка не потерялась.
   */
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [celebrating, setCelebrating] = useState(false);
  const lastSaved = useRef(note?.updatedAt);

  useEffect(() => {
    if (!note || note.updatedAt === lastSaved.current) return;
    lastSaved.current = note.updatedAt;
    setStatus('saving');
    const timer = setTimeout(() => setStatus('saved'), 500);
    return () => clearTimeout(timer);
  }, [note]);

  if (!note) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text color="secondaryLabel">Заметка не найдена</Text>
      </View>
    );
  }

  const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;

  /**
   * Пустая заметка при выходе не остаётся — и не уезжает в корзину.
   *
   * В корзину попадает то, что было содержимым: оттуда его можно вернуть, и
   * оно лежит там со своим сроком. Заметка, в которую не написали ни строчки,
   * содержимым не была никогда — от неё в корзине оставались записи «Без
   * заголовка», которые нечего восстанавливать.
   */
  const leave = () => {
    if (!note.title.trim() && !hasContent(note.blocks)) deleteForever([note.id]);
    router.back();
  };

  /**
   * Первое выполненное дело замечается один раз.
   *
   * Не на каждом чек-боксе: событие здесь — не «пункт отмечен», а «в этом
   * приложении впервые что-то доведено до конца».
   */
  const changeBlocks = (blocks: NoteBlock[]) => {
    if (!settings.celebratedFirstDone && doneCount(blocks) > doneCount(note.blocks)) {
      updateSettings({ celebratedFirstDone: true });
      setCelebrating(true);
      notify('🎉 Первое дело закрыто');
    }
    setBlocks(note.id, blocks);
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
          title: status === 'saving' ? 'Сохранение…' : status === 'saved' ? 'Сохранено' : '',
          headerLeft: () => (
            <IconButton name="chevron.left" accessibilityLabel="Назад" onPress={leave} />
          ),
          /*
            Обе кнопки рисуются всегда, меняется только символ закрепления.
            Раньше `headerRight` отдавал то один элемент, то два, и нативная
            шапка растягивала группу: один и тот же экран выглядел по-разному
            в зависимости от того, закреплена заметка или нет.
          */
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
              <IconButton
                name={note.pinned ? 'pin.fill' : 'pin'}
                accessibilityLabel={note.pinned ? 'Открепить' : 'Закрепить'}
                onPress={() => togglePinned(note.id)}
              />
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
              color="accent"
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

          {/* Метаданные: срок окрашен по смыслу, иконка того же цвета.
              Остальное — третичным серым: это справка, а не содержание. */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Text variant="caption1" color="tertiaryLabel">
              {formatDateTime(note.updatedAt)}
              {folder ? ` · ${folder.name}` : ''}
            </Text>

            {note.remindAt ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <Symbol
                  name="bell.fill"
                  size={11}
                  color={theme.colors[DUE_COLOR[dueState(note.remindAt)]]}
                />
                <Text variant="caption1" color={DUE_COLOR[dueState(note.remindAt)]}>
                  {formatDateTime(note.remindAt)}
                </Text>
              </View>
            ) : null}
          </View>

          <BlockEditor
            blocks={note.blocks}
            moveCheckedDown={settings.moveCheckedDown}
            onChange={changeBlocks}
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
          showLabels={settings.toolbarLabels}
          onDismissKeyboard={Keyboard.dismiss}
          actions={[
            {
              name: 'checklist',
              label: 'Список',
              onPress: () => setBlocks(note.id, [...note.blocks, makeChecklistBlock()]),
            },
            {
              name: 'text.alignleft',
              label: 'Текст',
              onPress: () => setBlocks(note.id, [...note.blocks, makeTextBlock()]),
            },
            // Плита 04: запись, скан и рисунок — такие же блоки в потоке, как
            // текст и список, поэтому и вставляются той же панелью.
            {
              name: 'mic',
              label: 'Запись',
              onPress: () => router.push({ pathname: '/capture/voice', params: { id: note.id } }),
            },
            {
              name: 'doc.text.viewfinder',
              label: 'Скан',
              onPress: () => router.push({ pathname: '/capture/scan', params: { id: note.id } }),
            },
            {
              name: 'scribble',
              label: 'Рисунок',
              onPress: () => router.push({ pathname: '/capture/sketch', params: { id: note.id } }),
            },
            {
              name: 'bell',
              label: 'Напомнить',
              onPress: () => router.push({ pathname: '/reminder', params: { id: note.id } }),
            },
            {
              name: 'tag',
              label: 'Теги',
              onPress: () => router.push({ pathname: '/tags', params: { id: note.id } }),
            },
          ]}
        />
      </KeyboardAvoidingView>

      <Confetti active={celebrating} onDone={() => setCelebrating(false)} />
    </>
  );
}
