import { localColors } from '../src/theme/localColors';
import React, { useMemo, useRef, useState } from 'react';
import {
  Keyboard,
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
import { STATIC_TAGS, staticTag } from '../src/features/tags';
import { showActionSheet } from '../src/utils/actionSheet';
import { notify } from '../src/features/notify';
import { rootFolders, useNotesStore } from '../src/store/useNotesStore';

/** Теги, набранные прямо в строке: `#работа` уезжает в теги, а не в заголовок. */
const parseTags = (text: string): { title: string; tags: string[] } => {
  const tags = [...text.matchAll(/#([^\s#]+)/g)].map((match) => match[1]);
  return {
    title: text
      .replace(/#[^\s#]+/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
    tags,
  };
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
  const details = useRef<React.ComponentRef<typeof TextInput>>(null);

  const roots = useMemo(() => rootFolders(folders), [folders]);
  const destination = folderId ? folders.find((f) => f.id === folderId)?.name : null;

  const parsed = parseTags(text);
  const ready = parsed.title.length > 0 || description.trim().length > 0;

  /** Заметка из того, что набрано в панели. */
  const save = () => {
    // В режиме списка каждая строка описания — свой пункт: раньше всё
    // описание целиком становилось одним пунктом.
    const lines = description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const blocks = checklist
      ? [
          makeChecklistBlock(
            lines.length > 0 ? lines.map((line) => makeChecklistItem(line)) : undefined,
          ),
        ]
      : [makeTextBlock(description.trim())];

    const note = createNote({
      title: parsed.title,
      blocks,
      tags: [...new Set([...tags, ...parsed.tags])],
      folderId,
      remindAt,
    });

    if (remindAt) void scheduleReminder(note, remindAt);
    notify('Заметка добавлена');
    return note;
  };

  const submit = () => {
    if (!ready) return;
    save();
    router.back();
  };

  /**
   * Захват из панели — голос, скан, рисунок.
   *
   * Набранное не выбрасывается: если в панели уже есть текст, заметка
   * создаётся с ним, и захват дописывает в неё. Раньше `replace` на экран
   * записи молча терял всё, что было набрано.
   */
  const capture = (pathname: '/capture/voice' | '/capture/scan' | '/capture/sketch') => {
    if (ready) {
      router.replace({ pathname, params: { id: save().id } });
      return;
    }
    router.replace({
      pathname,
      params: { ...(folderId ? { folder: folderId } : {}), ...(tags[0] ? { tag: tags[0] } : {}) },
    });
  };

  /**
   * Касание по затемнению.
   *
   * Пустую панель оно закрывает. Набранный текст промахом мимо поля не
   * теряется: первое касание убирает клавиатуру, а закрыть панель с текстом
   * можно только ответив на вопрос.
   */
  const dismiss = () => {
    if (!ready) {
      router.back();
      return;
    }
    if (keyboard) {
      Keyboard.dismiss();
      return;
    }
    showActionSheet(
      [
        { title: 'Создать заметку', onPress: submit },
        { title: 'Удалить набранное', destructive: true, onPress: () => router.back() },
      ],
      { title: 'Набранный текст не сохранён' },
    );
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
          accessibilityLabel={ready ? 'Убрать клавиатуру' : 'Закрыть'}
          onPress={dismiss}
          style={StyleSheet.absoluteFill}
        >
          <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: localColors.creationScrim }]} />
        </Pressable>

        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[
            styles.panel,
            {
              marginHorizontal: theme.spacing.lg,
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
              // «Далее» ведёт в описание, а не отправляет: отправка — круглая
              // кнопка, и подпись клавиши не должна обещать другое действие.
              onSubmitEditing={() => details.current?.focus()}
              submitBehavior="submit"
              multiline
              placeholder="Например: Созвон по релизу #работа"
              placeholderTextColor={theme.colors.placeholderText}
              returnKeyType="next"
              style={[theme.text('title3', 'medium'), { color: theme.colors.label, padding: 0, maxHeight: 50 }]}
            />

            {/* Описание растёт до пяти строк и дальше прокручивается само:
                панель не должна выталкивать свой верх за край экрана. */}
            <TextInput
              ref={details}
              value={description}
              onChangeText={setDescription}
              placeholder={checklist ? 'Пункты — каждый с новой строки' : 'Описание'}
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

            Теги собраны в один чип с меню. Пять чипов — список, срок и три
            тега — не помещались по ширине, и ряд уезжал за край: та же
            причина, по которой фильтр на «Заметках» стал сегментом.
          */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
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
                styles.destination, { minHeight: 40, borderRadius: 20, paddingHorizontal: 12, backgroundColor: theme.hex.systemFill },
                { opacity: pressed ? 0.5 : 1, gap: theme.spacing.sm },
              ]}
            >
              <Symbol name="folder" size={16} color={theme.colors.label} />
              <Text variant="footnote" color="label" numberOfLines={1}>
                {destination ?? 'Без папки'}
              </Text>
            </MenuButton>
              <TagChip value={tags} onToggle={toggleTag} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <View><ReminderChip value={remindAt} onChange={setRemindAt} /></View>
              <RoundButton icon="arrow.up" label="Создать" disabled={!ready} onPress={submit} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <RoundButton label="Список" icon="checklist" tone={checklist ? 'accent' : 'muted'} onPress={() => setChecklist(value => !value)} />
              <RoundButton label="Голос" icon="mic" tone="muted" onPress={() => capture('/capture/voice')} />
              <RoundButton label="Скан" icon="camera" tone="muted" onPress={() => capture('/capture/scan')} />
              <RoundButton label="Рисунок" icon="scribble" tone="muted" onPress={() => capture('/capture/sketch')} />
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
}

/**
 * Чип тегов: один на все три тега, с галочками в меню.
 *
 * Выбран один — чип показывает его имя, иконку и цвет; несколько — их число.
 */
const TagChip = ({ value, onToggle }: { value: string[]; onToggle: (id: string) => void }) => {
  const single = value.length === 1 ? staticTag(value[0]) : undefined;
  const label = value.length === 0 ? 'Тег' : single ? single.label : `Теги · ${value.length}`;

  return (
    <MenuButton
      accessibilityLabel={value.length === 0 ? 'Тег' : `Теги: ${label}`}
      title="Теги"
      items={() =>
        STATIC_TAGS.map((tag) => ({
          title: tag.label,
          icon: tag.icon,
          checked: value.includes(tag.id),
          onPress: () => onToggle(tag.id),
        }))
      }
    >
      {/* Касания достаются обёртке — по той же причине, что у чипа срока. */}
      <View pointerEvents="none">
        <Chip
          label={label}
          icon={single?.icon ?? 'tag'}
          accent={single?.accent}
          selected={value.length > 0}
        />
      </View>
    </MenuButton>
  );
};

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
            // Вторичная кнопка — прозрачное белое, как кнопки шапки: серая
            // заливка гасила подсветку Opal.
            tone === 'accent' ? theme.colors.accent : theme.tints.control,
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
  destination: { flexDirection: 'row', alignItems: 'center' },
  round: { alignItems: 'center', justifyContent: 'center' },
});
