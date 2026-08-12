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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Chip, MenuButton, Separator, Symbol, Text } from '../src/components';
import { useTheme } from '../src/theme';
import { useKeyboardVisible } from '../src/utils/useKeyboardVisible';
import { makeChecklistBlock, makeChecklistItem, makeTextBlock } from '../src/utils/blocks';
import { formatDateTime } from '../src/utils/date';
import { reminderPresets, scheduleReminder } from '../src/features/reminders';
import { STATIC_TAGS } from '../src/features/tags';
import { notify } from '../src/features/notify';
import { rootFolders, useNotesStore } from '../src/store/useNotesStore';

/** Теги, набранные прямо в строке: `#работа` уезжает в теги, а не в заголовок. */
const parseTags = (text: string): { title: string; tags: string[] } => {
  const tags = [...text.matchAll(/#([^\s#]+)/g)].map((match) => match[1]);
  return { title: text.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim(), tags };
};

/**
 * Создание заметки — шит с поднятой клавиатурой.
 *
 * Заметка появляется в тот момент, когда в неё что-то попало, а не когда
 * открыли форму: закрытый без ввода шит не оставляет следов. Полный экран
 * остаётся для существующей заметки — там, где есть что редактировать.
 *
 * Раскладка собрана по референсу и держится на одном правиле: у шита ровно
 * три этажа, и каждый знает свою высоту.
 *
 *  1. Текст — растёт и прокручивается, забирает всё свободное место.
 *  2. Атрибуты — ряд чипов постоянной высоты.
 *  3. Строка отправки — назначение слева, запись и отправка справа.
 *
 * Прежняя версия этого не разделяла: прокрутка стояла в колонке без `flex`,
 * то есть без заданной высоты, и схлопывалась в ноль. Всё, что шло после неё,
 * наезжало на её содержимое — заголовок, описание, чипы и кнопки оказывались
 * в одной точке экрана. Отсюда `flex: 1` на прокрутке и `flexGrow: 0` на
 * обоих нижних этажах.
 */
export default function CreateScreen() {
  const { folder, tag, kind } = useLocalSearchParams<{
    folder?: string;
    tag?: string;
    kind?: string;
  }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // Клавиатура убрана — под строкой отправки появляется домашний индикатор,
  // и её нужно поднять над ним. Поднята — `KeyboardAvoidingView` уже отвёл
  // ровно столько, сколько занимает клавиатура, и добавлять нечего.
  const keyboard = useKeyboardVisible();

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

  const toggleTag = (id: string) =>
    setTags((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id],
    );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Клавиатура поднята с самого открытия, и нижние два этажа обязаны
          остаться над ней: выбор срока и папки — часть той же строки ввода. */}
      <KeyboardAvoidingView
        style={[styles.grow, { backgroundColor: theme.colors.systemGroupedBackground }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.grow}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            // Сверху — место под ручку шита: без неё первая строка текста
            // упирается в кромку.
            paddingTop: theme.spacing.xxl,
            paddingBottom: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}
        >
          {/*
            Первое, что видно в шите, — собственный текст, а не подпись к
            полю. Плейсхолдер при этом учит синтаксису вместо онбординга:
            `#работа` в строке станет тегом, а не частью заголовка.
          */}
          <TextInput
            autoFocus
            value={text}
            onChangeText={setText}
            onSubmitEditing={submit}
            placeholder="Например: Созвон по релизу #работа"
            placeholderTextColor={theme.colors.placeholderText}
            returnKeyType="next"
            style={[
              theme.text('title3', 'semibold'),
              { color: theme.colors.label, padding: 0 },
            ]}
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={checklist ? 'Первый пункт' : 'Описание'}
            placeholderTextColor={theme.colors.placeholderText}
            multiline
            style={[
              theme.text('body'),
              { color: theme.colors.label, padding: 0, textAlignVertical: 'top' },
            ]}
          />
        </ScrollView>

        {/*
          Атрибуты — обводные чипы с иконкой и словом, а не ряд одних иконок:
          у иконки без подписи угадывается «микрофон», но не «напоминание».
          Каждый чип показывает своё значение, как только оно выбрано.

          Теги здесь тоже чипы, и их три — заранее заданных. Раньше на их
          месте стоял один чип «Тег», открывавший список; когда своих тегов
          ещё не было, список оказывался пустым, и вместо выбора появлялся
          алерт с текстом «наберите #тег прямо в строке» — то есть кнопка,
          которая ничего не делает. Три готовых тега ставятся касанием.
        */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Высота задана явно, а не выведена из содержимого: у прокрутки в
          // колонке своей высоты нет, и без числа этот этаж схлопнулся бы —
          // ровно так и разъезжался прежний шит.
          style={[styles.fixed, { height: theme.controlHeight.segmented + theme.spacing.xl }]}
          contentContainerStyle={{
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}
        >
          <Chip
            label="Список задач"
            icon="checklist"
            outlined={!checklist}
            selected={checklist}
            onPress={() => setChecklist((value) => !value)}
          />

          <ReminderChip value={remindAt} onChange={setRemindAt} />

          {STATIC_TAGS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              icon={item.icon}
              accent={item.accent}
              outlined={!tags.includes(item.id)}
              selected={tags.includes(item.id)}
              onPress={() => toggleTag(item.id)}
            />
          ))}
        </ScrollView>

        {/* Линия отделяет ввод от отправки: ниже неё ничего не набирают,
            ниже неё только решают, куда это уйдёт. */}
        <Separator />

        <View
          style={[
            styles.actions,
            styles.fixed,
            {
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              paddingBottom: keyboard ? theme.spacing.md : Math.max(theme.spacing.md, insets.bottom),
              gap: theme.spacing.md,
            },
          ]}
        >
          {/* Куда положить — до создания и одним касанием, а не отдельным
              шитом переноса после. */}
          <MenuButton
            accessibilityLabel={`Куда положить: ${destination ?? 'Без папки'}`}
            title="Куда положить"
            items={() => [
              {
                title: 'Без папки',
                icon: 'tray',
                checked: folderId === null,
                onPress: () => setFolderId(null),
              },
              ...roots.map((item) => ({
                title: item.name,
                icon: 'folder' as const,
                checked: folderId === item.id,
                onPress: () => setFolderId(item.id),
              })),
            ]}
            style={({ pressed }) => [
              styles.destination,
              { opacity: pressed ? 0.5 : 1, gap: theme.spacing.xs },
            ]}
          >
            <Symbol name="folder" size={15} color={theme.colors.secondaryLabel} />
            <Text variant="subheadline" color="secondaryLabel" numberOfLines={1}>
              {destination ?? 'Без папки'}
            </Text>
            <Symbol name="chevron.down" size={11} color={theme.colors.tertiaryLabel} />
          </MenuButton>

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

/** Чип срока: показывает выбранное время и открывает меню из себя же. */
const ReminderChip = ({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (at: number | null) => void;
}) => (
  <MenuButton
    accessibilityLabel={value ? `Напомнить ${formatDateTime(value)}` : 'Напомнить'}
    title="Напомнить"
    items={() => [
      ...reminderPresets().map((preset) => ({
        title: `${preset.label} · ${formatDateTime(preset.at)}`,
        onPress: () => onChange(preset.at),
      })),
      ...(value
        ? [{ title: 'Без напоминания', destructive: true, onPress: () => onChange(null) }]
        : []),
    ]}
  >
    {/* Чип внутри кнопки касаний не принимает: нажатие должно достаться
        обёртке, иначе измерять нечего — меню растёт из прямоугольника
        триггера, а не из того, что оказалось под пальцем. */}
    <View pointerEvents="none">
      <Chip
        label={value ? formatDateTime(value) : 'Напомнить'}
        icon="bell"
        outlined={!value}
        selected={Boolean(value)}
      />
    </View>
  </MenuButton>
);

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
  // Этажи под прокруткой не растягиваются и не сжимаются: их высота задана
  // содержимым, и делить с прокруткой им нечего.
  fixed: { flexGrow: 0, flexShrink: 0 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  destination: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  round: { alignItems: 'center', justifyContent: 'center' },
});
