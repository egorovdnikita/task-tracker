import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Chip, ChipRow, Symbol, Text } from '../src/components';
import { useTheme } from '../src/theme';
import { makeChecklistBlock, makeChecklistItem, makeTextBlock } from '../src/utils/blocks';
import { formatDateTime } from '../src/utils/date';
import { showActionSheet } from '../src/utils/actionSheet';
import { reminderPresets, scheduleReminder } from '../src/features/reminders';
import { notify } from '../src/features/notify';
import { collectTags, rootFolders, useNotesStore } from '../src/store/useNotesStore';

/** Теги, набранные прямо в строке: `#работа` уезжает в теги, а не в заголовок. */
const parseTags = (text: string): { title: string; tags: string[] } => {
  const tags = [...text.matchAll(/#([^\s#]+)/g)].map((match) => match[1]);
  return { title: text.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim(), tags };
};

/**
 * Создание заметки — шит с поднятой клавиатурой.
 *
 * Раньше плюс заводил заметку в сторе и открывал полноценный редактор. Это
 * оставляло мусор: передумал — а заметка уже создана, и уезжает в корзину
 * пустой. Теперь заметка появляется в тот момент, когда в неё что-то попало,
 * а не когда открыли форму; закрытый без ввода шит не оставляет следов.
 *
 * Полный экран заметки остаётся для существующей заметки — там, где есть что
 * редактировать.
 */
export default function CreateScreen() {
  const { folder, tag, kind } = useLocalSearchParams<{
    folder?: string;
    tag?: string;
    kind?: string;
  }>();
  const theme = useTheme();

  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const createNote = useNotesStore((s) => s.createNote);

  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState(kind === 'checklist');
  const [remindAt, setRemindAt] = useState<number | null>(null);
  // Открыто из списка тега — тег уже проставлен: он и есть то место, откуда
  // человек пришёл.
  const [tags, setTags] = useState<string[]>(tag ? [tag] : []);
  const [folderId, setFolderId] = useState<string | null>(folder ?? null);

  const allTags = useMemo(() => collectTags(notes), [notes]);
  const roots = useMemo(() => rootFolders(folders), [folders]);
  const destination = folderId ? folders.find((f) => f.id === folderId)?.name : null;

  const parsed = parseTags(text);
  const ready = parsed.title.length > 0 || description.trim().length > 0;

  const submit = async () => {
    if (!ready) return;

    const body = description.trim();
    const blocks = checklist
      ? [makeChecklistBlock(body ? [makeChecklistItem(body)] : undefined)]
      : [makeTextBlock(body)];

    const note = createNote({
      title: parsed.title,
      blocks,
      tags: [...new Set([...tags, ...parsed.tags])],
      folderId,
      remindAt,
    });

    if (remindAt) await scheduleReminder(note, remindAt);

    notify('Заметка добавлена');
    router.back();
  };

  const chooseReminder = () =>
    showActionSheet(
      [
        ...reminderPresets().map((preset) => ({
          title: `${preset.label} · ${formatDateTime(preset.at)}`,
          onPress: () => setRemindAt(preset.at),
        })),
        ...(remindAt ? [{ title: 'Без напоминания', onPress: () => setRemindAt(null) }] : []),
      ],
      { title: 'Напомнить' },
    );

  const chooseTag = () =>
    showActionSheet(
      allTags.length > 0
        ? allTags.map((tag) => ({
            title: tags.includes(tag) ? `✓ ${tag}` : tag,
            onPress: () =>
              setTags((current) =>
                current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
              ),
          }))
        : [{ title: 'Наберите #тег прямо в строке', onPress: () => {} }],
      { title: 'Теги' },
    );

  const chooseFolder = () =>
    showActionSheet(
      [
        { title: 'Без папки', onPress: () => setFolderId(null) },
        ...roots.map((item) => ({ title: item.name, onPress: () => setFolderId(item.id) })),
      ],
      { title: 'Куда положить' },
    );

  return (
    <>
      <Stack.Screen options={{ title: 'Новая заметка' }} />

      {/* Клавиатура поднята с самого открытия, и всё, кроме текста, обязано
          остаться над ней: выбор срока и папки — часть той же строки ввода. */}
      <KeyboardAvoidingView
        style={styles.grow}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
        >
          {/*
            Плейсхолдер учит синтаксису вместо экрана онбординга: `#работа`
            в строке станет тегом, а не частью заголовка.
          */}
          <TextInput
            autoFocus
            value={text}
            onChangeText={setText}
            onSubmitEditing={submit}
            placeholder="Например: Созвон по релизу #работа"
            placeholderTextColor={theme.colors.placeholderText}
            returnKeyType="done"
            style={[theme.text('title3', 'semibold'), { color: theme.colors.label, padding: 0 }]}
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={checklist ? 'Первый пункт' : 'Описание'}
            placeholderTextColor={theme.colors.placeholderText}
            multiline
            style={[
              theme.text('body'),
              { color: theme.colors.label, padding: 0, minHeight: 44, textAlignVertical: 'top' },
            ]}
          />
        </ScrollView>

        {/*
          Атрибуты — обводные чипы с иконкой и словом, а не ряд одних иконок:
          у иконки без подписи угадывается «микрофон», но не «напоминание».
          Каждый чип показывает своё значение, как только оно выбрано.
        */}
        <ChipRow style={{ flexGrow: 0, marginBottom: theme.spacing.sm }}>
          <Chip
            label="Список задач"
            icon="checklist"
            outlined={!checklist}
            selected={checklist}
            onPress={() => setChecklist((value) => !value)}
          />
          <Chip
            label={remindAt ? formatDateTime(remindAt) : 'Напомнить'}
            icon="bell"
            outlined={!remindAt}
            selected={Boolean(remindAt)}
            onPress={chooseReminder}
          />
          <Chip
            label={tags.length > 0 ? tags.join(', ') : 'Тег'}
            icon="tag"
            outlined={tags.length === 0}
            selected={tags.length > 0}
            onPress={chooseTag}
          />
        </ChipRow>

        <View
          style={[
            styles.actions,
            {
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              gap: theme.spacing.md,
            },
          ]}
        >
          {/* Куда положить — до создания и одним касанием, а не отдельным
              шитом переноса после. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Куда положить"
            onPress={chooseFolder}
            style={({ pressed }) => [styles.destination, { opacity: pressed ? 0.5 : 1, gap: theme.spacing.xs }]}
          >
            <Symbol name="folder" size={15} color={theme.colors.secondaryLabel} />
            <Text variant="subheadline" color="secondaryLabel" numberOfLines={1}>
              {destination ?? 'Без папки'}
            </Text>
            <Symbol name="chevron.down" size={11} color={theme.colors.tertiaryLabel} />
          </Pressable>

          {/* Голос — второй способ ввода после клавиатуры, а не пункт меню
              наравне со сканом и рисунком. */}
          <RoundButton
            icon="waveform"
            label="Записать голосом"
            tone="muted"
            onPress={() => router.replace('/capture/voice')}
          />

          <RoundButton icon="arrow.up" label="Создать" disabled={!ready} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const RoundButton = ({
  icon,
  label,
  onPress,
  disabled = false,
  tone = 'accent',
}: {
  icon: Parameters<typeof Symbol>[0]['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'accent' | 'muted';
}) => {
  const theme = useTheme();
  const size = theme.controlHeight.button;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor:
            tone === 'accent' ? theme.colors.accent : theme.colors.tertiarySystemFill,
          opacity: disabled ? 0.35 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Symbol
        name={icon}
        size={22}
        color={tone === 'accent' ? '#FFFFFF' : theme.colors.label}
        weight="semibold"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  grow: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  destination: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  round: { alignItems: 'center', justifyContent: 'center' },
});
