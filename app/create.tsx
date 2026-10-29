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
import { BlurView } from 'expo-blur';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Chip, GlassSurface, MenuButton, Separator, Symbol, Text } from '../src/components';
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
 * Создание заметки — панель на кромке клавиатуры.
 *
 * Заметка появляется в тот момент, когда в неё что-то попало, а не когда
 * открыли форму: закрытая без ввода панель не оставляет следов. Полный экран
 * остаётся для существующей заметки — там, где есть что редактировать.
 *
 * У панели ровно три этажа, и высоту каждого задаёт его содержимое:
 *
 *  1. Текст — заголовок и описание до пяти строк.
 *  2. Атрибуты — ряд чипов постоянной высоты.
 *  3. Строка отправки — назначение слева, запись и отправка справа.
 *
 * Высота панели — сумма этажей, а не доля экрана. Прежний шит держался за
 * детент 0.55: клавиатура перекрывала его низ, а над полем ввода оставалась
 * пустая полоса.
 */
export default function CreateScreen() {
  const { folder, tag, kind } = useLocalSearchParams<{
    folder?: string;
    tag?: string;
    kind?: string;
  }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // Клавиатура убрана — под панелью появляется домашний индикатор, и её
  // нужно поднять над ним. Поднята — `KeyboardAvoidingView` уже отвёл ровно
  // столько, сколько занимает клавиатура, и остаётся только зазор.
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

      {/* Клавиатура поднята с самого открытия, и панель обязана стоять на её
          кромке целиком: выбор срока и папки — часть той же строки ввода. */}
      <KeyboardAvoidingView
        style={[styles.grow, styles.bottom]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/*
          Оверлей за панелью: список под ним виден, но приглушён — лёгкий
          блюр и полупрозрачное затемнение. Сплошная заливка прятала контекст,
          из которого человек пришёл. Касание по оверлею закрывает панель.
        */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть"
          onPress={() => router.back()}
          style={StyleSheet.absoluteFill}
        >
          <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        </Pressable>

        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[
            styles.panel,
            {
              marginHorizontal: theme.spacing.sm,
              marginBottom: keyboard ? theme.spacing.sm : Math.max(theme.spacing.sm, insets.bottom),
              borderRadius: theme.radius.xl,
            },
          ]}
        >
          <GlassSurface
            mesh="card"
            stroke="glass"
            tint={theme.colors.elevated as string}
            radius={theme.radius.xl}
            liquid={false}
            pointerEventsNone
            style={StyleSheet.absoluteFill}
          />

          <View
            style={{
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.md,
              gap: theme.spacing.sm,
            }}
          >
            {/*
              Первое, что видно в панели, — собственный текст, а не подпись к
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

            {/* Описание растёт до пяти строк и дальше прокручивается само:
                панель не должна выталкивать свой верх за край экрана. */}
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={checklist ? 'Первый пункт' : 'Описание'}
              placeholderTextColor={theme.colors.placeholderText}
              multiline
              style={[
                theme.text('body'),
                {
                  color: theme.colors.label,
                  padding: 0,
                  maxHeight: 22 * 5,
                  textAlignVertical: 'top',
                },
              ]}
            />
          </View>

          {/*
            Атрибуты — обводные чипы с иконкой и словом, а не ряд одних иконок:
            у иконки без подписи угадывается «микрофон», но не «напоминание».
            Каждый чип показывает своё значение, как только оно выбрано.

            Теги здесь тоже чипы, и их три — заранее заданных: ставятся
            касанием, без списка, который мог оказаться пустым.
          */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            // Высота задана явно: у горизонтальной прокрутки в колонке своей
            // высоты нет, и без числа ряд схлопнулся бы.
            style={[styles.fixed, { height: theme.controlHeight.segmented + theme.spacing.lg }]}
            contentContainerStyle={{
              alignItems: 'center',
              paddingHorizontal: theme.spacing.xl,
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
              {
                paddingHorizontal: theme.spacing.xl,
                paddingVertical: theme.spacing.md,
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
                { opacity: pressed ? 0.5 : 1, gap: theme.spacing.sm },
              ]}
            >
              <Symbol name="folder" size={18} color={theme.colors.secondaryLabel} />
              <Text variant="callout" color="secondaryLabel" numberOfLines={1}>
                {destination ?? 'Без папки'}
              </Text>
              <Symbol name="chevron.down" size={16} color={theme.colors.tertiaryLabel} />
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
        </Animated.View>
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
  const size = theme.controlHeight.buttonCompact;

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
        color={tone === 'accent' ? theme.hex.onAccent : theme.colors.label}
        weight="semibold"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  grow: { flex: 1 },
  bottom: { justifyContent: 'flex-end' },
  // Обрезка дугой — по кривой канта стекла, иначе углы рвутся.
  panel: { overflow: 'hidden', borderCurve: 'circular' },
  // Этажи под прокруткой не растягиваются и не сжимаются: их высота задана
  // содержимым, и делить с прокруткой им нечего.
  fixed: { flexGrow: 0, flexShrink: 0 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  destination: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  round: { alignItems: 'center', justifyContent: 'center' },
});
