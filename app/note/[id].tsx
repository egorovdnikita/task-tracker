import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import {
  BlockEditor,
  Chip,
  ChipWrap,
  Confetti,
  HeaderCapsule,
  IconButton,
  MenuButton,
  NoteTools,
  Symbol,
  Text,
  type MenuItem,
} from '../../src/components';
import { useTheme, type PaletteName } from '../../src/theme';
import { hasContent, makeChecklistBlock, makeTextBlock } from '../../src/utils/blocks';
import { dueState, formatDateTime } from '../../src/utils/date';
import { STATIC_TAGS, tagLabel } from '../../src/features/tags';
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

  const menuItems = (): MenuItem[] => [
    {
      title: note.pinned ? 'Открепить' : 'Закрепить',
      icon: note.pinned ? 'pin.slash' : 'pin',
      onPress: () => togglePinned(note.id),
    },
    {
      title: note.remindAt ? 'Изменить напоминание' : 'Напомнить',
      icon: 'bell' as const,
      onPress: () => router.push({ pathname: '/reminder', params: { id: note.id } }),
    },
    {
      title: 'Переместить',
      icon: 'folder' as const,
      onPress: () => router.push({ pathname: '/move', params: { ids: note.id } }),
    },
    {
      title: 'Удалить',
      icon: 'trash' as const,
      destructive: true,
      onPress: () => {
        trashNotes([note.id]);
        router.back();
      },
    },
  ];

  /** Переключить свой тег. Унаследованные теги при этом остаются на месте. */
  const toggleTag = (id: string) =>
    updateNote(note.id, {
      tags: note.tags.includes(id) ? note.tags.filter((t) => t !== id) : [...note.tags, id],
    });

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

            Группа собрана в ту же стеклянную капсулу, что и на списках, —
            один и тот же орган управления выглядит одинаково везде.
          */
          headerRight: () => (
            <HeaderCapsule>
              <IconButton
                name={note.pinned ? 'pin.fill' : 'pin'}
                size={19}
                accessibilityLabel={note.pinned ? 'Открепить' : 'Закрепить'}
                onPress={() => togglePinned(note.id)}
              />

              <MenuButton
                accessibilityLabel="Меню заметки"
                items={menuItems}
                style={({ pressed }) => ({
                  width: theme.controlHeight.buttonCompact,
                  height: theme.controlHeight.buttonCompact,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.4 : 1,
                })}
              >
                <Symbol name="ellipsis" size={19} color={theme.colors.accent} />
              </MenuButton>
            </HeaderCapsule>
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

          {/*
            Теги — три готовых чипа прямо здесь, а не отдельный шит.

            Шит открывался пустым: своих тегов у новой заметки нет, поле
            «Название тега» не нажималось, и единственным, что он предлагал,
            была подсказка набрать `#тег` где-то ещё. Три заданных признака
            ставятся касанием и видны в том же месте, где всё остальное про
            заметку.
          */}
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="footnote" color="secondaryLabel">
              Теги
            </Text>

            <ChipWrap>
              {STATIC_TAGS.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.label}
                  icon={tag.icon}
                  accent={tag.accent}
                  outlined={!note.tags.includes(tag.id)}
                  selected={note.tags.includes(tag.id)}
                  onPress={() => toggleTag(tag.id)}
                />
              ))}

              {/* Теги из прежних версий не исчезают: их нельзя поставить
                  заново, но снять можно — иначе они остались бы навсегда. */}
              {note.tags
                .filter((tag) => !STATIC_TAGS.some((item) => item.id === tag))
                .map((tag) => (
                  <Chip
                    key={tag}
                    label={tagLabel(tag)}
                    icon="tag"
                    selected
                    onRemove={() =>
                      updateNote(note.id, { tags: note.tags.filter((t) => t !== tag) })
                    }
                  />
                ))}
            </ChipWrap>
          </View>

          {/* Плита 04: запись, скан и рисунок — такие же блоки в потоке, как
              текст и список, поэтому и вставляются одним рядом. */}
          <NoteTools
            tools={[
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
                onPress: () =>
                  router.push({ pathname: '/capture/sketch', params: { id: note.id } }),
              },
            ]}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Confetti active={celebrating} onDone={() => setCelebrating(false)} />
    </>
  );
}
