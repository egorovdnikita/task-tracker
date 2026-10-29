import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams, useNavigation } from 'expo-router';

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
  ScreenBackdrop,
  GlassSurface,
  headerItems,
  backItem,
} from '../../src/components';
import { useTheme, type PaletteName } from '../../src/theme';
import { hasContent, makeChecklistBlock, makeTextBlock } from '../../src/utils/blocks';
import { dueState, formatDateTime } from '../../src/utils/date';
import { STATIC_TAGS, tagLabel } from '../../src/features/tags';
import { notify, offerUndo } from '../../src/features/notify';
import { useKeyboardVisible } from '../../src/utils/useKeyboardVisible';
import { useNotesStore } from '../../src/store/useNotesStore';
import { confirmDestructive } from '../../src/utils/actionSheet';
import type { NoteBlock } from '../../src/types';

const REMOVED: Record<NoteBlock['type'], string> = {
  text: 'Текст удалён',
  checklist: 'Список удалён',
  voice: 'Запись удалена',
  scan: 'Скан удалён',
  sketch: 'Рисунок удалён',
};

const DUE_COLOR: Record<ReturnType<typeof dueState>, PaletteName> = {
  // Цвет несёт смысл, а не украшает: красный — просрочено, акцент — сегодня,
  // всё дальше — обычная справка.
  overdue: 'systemRed',
  today: 'accent',
  future: 'secondaryLabel',
};

/** Сколько пунктов отмечено во всех чек-листах заметки. */
const doneCount = (blocks: NoteBlock[]): number =>
  blocks.reduce(
    (total, block) =>
      block.type === 'checklist' ? total + block.items.filter((item) => item.done).length : total,
    0,
  );

/**
 * Плиты 03.1–03.3 — редактор.
 *
 * Каждое изменение уходит в стор сразу, а стор пишется на диск, поэтому под
 * заголовком, рядом с датой, на мгновение появляется «Сохранено».
 *
 * Кнопки «Сохранить» нет. Она обещала то, что уже произошло: без неё правки
 * будто бы пропадали, и человек боялся уйти жестом «назад». Её место у
 * нижнего края заняли инструменты добавления — они нужны из любой точки
 * длинной заметки, а не только из её конца.
 */
export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();

  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const settings = useNotesStore((s) => s.settings);
  const updateNote = useNotesStore((s) => s.updateNote);
  const updateSettings = useNotesStore((s) => s.updateSettings);
  const setBlocks = useNotesStore((s) => s.setBlocks);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);
  const deleteForever = useNotesStore((s) => s.deleteForever);

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
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // Подтверждение гаснет само: висящее «Сохранено» перестаёт что-либо значить.
  useEffect(() => {
    if (!note || note.updatedAt === lastSaved.current) return;
    lastSaved.current = note.updatedAt;
    setStatus('saving');
    const saved = setTimeout(() => setStatus('saved'), 500);
    const idle = setTimeout(() => setStatus('idle'), 2000);
    return () => {
      clearTimeout(saved);
      clearTimeout(idle);
    };
  }, [note]);

  /**
   * Пустая заметка при выходе не остаётся — и не уезжает в корзину.
   *
   * В корзину попадает то, что было содержимым: оттуда его можно вернуть, и
   * оно лежит там со своим сроком. Заметка, в которую не написали ни строчки,
   * содержимым не была никогда — от неё в корзине оставались записи «Без
   * заголовка», которые нечего восстанавливать.
   *
   * Проверка висит на `beforeRemove`, а не на нашей кнопке «Назад»: системный
   * жест от левого края кнопку не нажимает, и пустая заметка оставалась.
   */
  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        const current = useNotesStore.getState().notes.find((n) => n.id === id);
        if (current && !current.title.trim() && !hasContent(current.blocks))
          useNotesStore.getState().deleteForever([current.id]);
      }),
    [navigation, id],
  );

  if (!note) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text color="secondaryLabel">Заметка не найдена</Text>
      </View>
    );
  }

  const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;

  const leave = () => router.back();

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

  /** Заметка из корзины открывается на просмотр: правки в ней недоступны. */
  const trashed = note.deletedAt !== null;

  const trashedMenu = (): MenuItem[] => [
    {
      title: 'Восстановить',
      icon: 'arrow.uturn.backward' as const,
      onPress: () => restoreNotes([note.id]),
    },
    {
      title: 'Удалить навсегда',
      icon: 'trash' as const,
      destructive: true,
      onPress: () =>
        confirmDestructive(
          'Удалить навсегда?',
          'Эту заметку нельзя будет вернуть.',
          'Удалить',
          () => {
            router.back();
            deleteForever([note.id]);
          },
        ),
    },
  ];

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
      // Отмена та же, что при удалении из списка: место удаления не должно
      // менять, можно ли его отменить.
      onPress: () => {
        trashNotes([note.id]);
        offerUndo('Заметка в корзине', () => restoreNotes([note.id]));
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
      <ScreenBackdrop name="editor" />
      <Stack.Screen
        options={{
          // Статус сохранения в заголовок не ставится: заголовок прыгал при
          // каждом символе. Он стоит строкой метаданных под заголовком.
          title: '',
          unstable_headerLeftItems: backItem(leave),
          /*
            Обе кнопки рисуются всегда, меняется только символ закрепления.
            Раньше `headerRight` отдавал то один элемент, то два, и нативная
            шапка растягивала группу: один и тот же экран выглядел по-разному
            в зависимости от того, закреплена заметка или нет.

            Группа собрана в ту же стеклянную капсулу, что и на списках, —
            один и тот же орган управления выглядит одинаково везде.
          */
          unstable_headerRightItems: headerItems(() => (
            <HeaderCapsule>
              {/* В корзине закреплять нечего — там только меню восстановления. */}
              {!trashed ? (
                <IconButton
                  name={note.pinned ? 'pin.fill' : 'pin'}
                  size={19}
                  accessibilityLabel={note.pinned ? 'Открепить' : 'Закрепить'}
                  onPress={() => togglePinned(note.id)}
                />
              ) : null}

              <MenuButton
                accessibilityLabel="Меню заметки"
                items={trashed ? trashedMenu : menuItems}
                style={({ pressed }) => ({
                  width: theme.controlHeight.buttonCompact,
                  height: theme.controlHeight.buttonCompact,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.4 : 1,
                })}
              >
                <Symbol name="ellipsis" size={20} color={theme.colors.label} />
              </MenuButton>
            </HeaderCapsule>
          )),
        }}
      />

      {/*
        Отступ от прозрачной шапки — здесь, а не системной поправкой у списка:
        над списком может стоять плашка «в корзине», и под шапку уехала бы она.
      */}
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: headerHeight }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {note.deletedAt ? (
          <View
            style={{
              marginHorizontal: theme.spacing.lg,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
              borderRadius: theme.radius.md,
              borderCurve: 'circular',
              overflow: 'hidden',
            }}
          >
            {/* Стекло Opal, а не серая заливка: серая гасила подсветку фона. */}
            <GlassSurface
              mesh="card"
              stroke="card"
              tint={theme.tints.card}
              radius={theme.radius.md}
              liquid={false}
              pointerEventsNone
              style={StyleSheet.absoluteFill}
            />
            <Text variant="footnote" color="secondaryLabel" style={{ flex: 1 }}>
              Заметка в корзине. Восстановите её, чтобы править
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
            editable={!trashed}
            placeholder="Заголовок"
            placeholderTextColor={theme.colors.placeholderText}
            style={[theme.text('title2', 'bold'), { color: theme.colors.label, padding: 0 }]}
          />

          {/* Метаданные: срок окрашен по смыслу, иконка того же цвета.
              Остальное — вторичным серым: это справка, а не содержание, но
              третичный на чистом чёрном в 12pt давал контраст около 3:1. */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Text variant="caption1" color="secondaryLabel">
              {formatDateTime(note.updatedAt)}
              {folder ? ` · ${folder.name}` : ''}
              {status === 'saving' ? ' · Сохранение…' : status === 'saved' ? ' · Сохранено' : ''}
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

          {/* Тело и теги в корзине только для чтения: раньше плашка обещала,
              что правки не сохранятся, а они сохранялись. */}
          <View pointerEvents={trashed ? 'none' : 'auto'} style={{ gap: theme.spacing.lg }}>
            <BlockEditor
              blocks={note.blocks}
              moveCheckedDown={settings.moveCheckedDown}
              onChange={changeBlocks}
              onEditSketch={(blockId) =>
                router.push({
                  pathname: '/capture/sketch',
                  params: { id: note.id, block: blockId },
                })
              }
              onRemoved={(block, index) =>
                offerUndo(REMOVED[block.type], () => {
                  // Возвращаем в текущие блоки, а не в снимок до удаления: правки,
                  // сделанные за время показа отмены, не должны пропасть.
                  const current = useNotesStore.getState().notes.find((n) => n.id === note.id);
                  if (!current) return;
                  const next = [...current.blocks];
                  next.splice(Math.min(index, next.length), 0, block);
                  setBlocks(note.id, next);
                })
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
          </View>
        </ScrollView>

        {/* Плита 04: чем дополнить заметку — рядом у нижнего края, а не в
            конце прокрутки: в длинной заметке до конца ещё нужно долистать.
            Запись, скан и рисунок — такие же блоки в потоке, как текст и
            список, поэтому вставляются одним рядом. Над клавиатурой ряд
            держит `KeyboardAvoidingView`. */}
        {!note.deletedAt ? (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.sm,
              paddingBottom: keyboard
                ? theme.spacing.sm
                : Math.max(theme.spacing.lg, insets.bottom),
            }}
          >
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
                  onPress: () =>
                    router.push({ pathname: '/capture/voice', params: { id: note.id } }),
                },
                {
                  name: 'doc.text.viewfinder',
                  label: 'Скан',
                  onPress: () =>
                    router.push({ pathname: '/capture/scan', params: { id: note.id } }),
                },
                {
                  name: 'scribble',
                  label: 'Рисунок',
                  onPress: () =>
                    router.push({ pathname: '/capture/sketch', params: { id: note.id } }),
                },
              ]}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <Confetti active={celebrating} onDone={() => setCelebrating(false)} />
    </>
  );
}
