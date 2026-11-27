import { boxPrimitives } from '../vendor/box-ui/primitives';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type PaletteName } from '../theme';
import type { LayoutMode, Note } from '../types';
import { checklistProgress, noteSubtitle, noteTitle } from '../utils/blocks';
import { dueState, formatRelativeDate, formatShortDate } from '../utils/date';
import { Symbol } from './Symbol';
import { Text } from './Text';

/**
 * Цвет срока: просрочено — красный, сегодня — зелёный, впереди — фиолетовый.
 *
 * Цвет здесь несёт смысл, а не украшает: он читается раньше текста, и «уже
 * прошло» отличается от «на неделе» до того, как прочитана дата.
 */
const DUE_COLOR: Record<ReturnType<typeof dueState>, PaletteName> = {
  // Цвет несёт смысл, а не украшает: красный — просрочено, акцент — сегодня,
  // всё дальше — обычная справка.
  overdue: 'systemRed',
  today: 'accent',
  future: 'secondaryLabel',
};

export type NoteCardProps = {
  note: Note;
  layout?: LayoutMode;
  onPress?: () => void;
  /**
   * Долгое нажатие. Прямоугольник карточки в координатах окна передаётся
   * вместе с событием: меню растёт из той карточки, к которой относится, и
   * иначе непонятно, чью именно заметку оно сейчас удалит.
   */
  onLongPress?: (anchor: { x: number; y: number; width: number; height: number }) => void;
  /** Режим множественного выбора: слева появляется отметка. Плита 05.2. */
  selectable?: boolean;
  selected?: boolean;
  /** Подсветить совпадение — поиск подсвечивает не только заголовок. */
  highlight?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Карточка заметки.
 *
 * Превью зависит от содержимого, а не от типа: у списка задач это прогресс,
 * у текста — первые строки. Тип заметки — не свойство сущности, а то, чем она
 * оказалась заполнена.
 */
export const NoteCard = ({
  note,
  layout = 'list',
  onPress,
  onLongPress,
  selectable = false,
  selected = false,
  highlight,
  style,
}: NoteCardProps) => {
  const theme = useTheme();
  const progress = checklistProgress(note);
  const preview = noteSubtitle(note);
  const accent = note.accent ? theme.accent(note.accent) : null;
  const pill = layout === 'list' && !note.pinned;
  const ref = useRef<React.ComponentRef<typeof View>>(null);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ selected: selectable ? selected : undefined }}
      onPress={onPress}
      onLongPress={
        onLongPress
          ? () =>
              ref.current?.measureInWindow((x, y, width, height) =>
                onLongPress({ x, y, width, height }),
              )
          : undefined
      }
      style={({ pressed }) => [
        styles.card,
        {
          padding: pill ? 6 : theme.spacing.xl,
          minHeight: pill ? 72 : 172,
          backgroundColor: theme.hex.secondarySystemBackground,
          shadowColor: '#7A3C3C', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 12 },
          gap: theme.spacing.xs,
          borderRadius: pill ? 36 : theme.radius.lg,
          opacity: pressed ? 0.85 : 1,
        },
        selected ? { borderWidth: 1.5, borderColor: theme.colors.accent } : null,
        style,
      ]}
    >
      {pill ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: theme.hex.systemFill, alignItems: 'center', justifyContent: 'center' }}>
            <Symbol name={selectable ? (selected ? 'checkmark.circle.fill' : 'circle') : progress ? 'checklist' : 'note.text'} size={24} color={theme.colors.label} />
          </View>
          <View style={{ flex: 1, gap: 4, paddingRight: theme.spacing.md }}>
            <Text variant="callout" weight="medium" numberOfLines={1}>{noteTitle(note)}</Text>
            <Text variant="footnote" color={note.remindAt && dueState(note.remindAt) === 'overdue' ? 'systemRed' : 'secondaryLabel'} numberOfLines={1}>
              {note.remindAt ? formatShortDate(note.remindAt) : progress ? `${progress.done} из ${progress.total}` : formatRelativeDate(note.updatedAt)}
            </Text>
          </View>
          {accent ? <View style={[styles.dot, { backgroundColor: accent, marginRight: 16, borderRadius: 4 }]} /> : null}
        </View>
      ) : <>
      <View style={[styles.head, { gap: theme.spacing.sm }]}>
        {selectable ? (
          <Symbol
            name={selected ? 'checkmark.circle.fill' : 'circle'}
            size={20}
            color={selected ? theme.colors.accent : theme.colors.tertiaryLabel}
          />
        ) : null}

        {accent ? (
          <View
            accessibilityElementsHidden
            style={[styles.dot, { backgroundColor: accent, borderRadius: theme.radius.pill }]}
          />
        ) : null}

        <Text variant="headline" numberOfLines={1} style={styles.grow}>
          {noteTitle(note)}
        </Text>

        {note.pinned ? (
          <Symbol
            name="pin.fill"
            size={13}
            color={theme.colors.tertiaryLabel}
            accessibilityLabel="Закреплено"
          />
        ) : null}
      </View>

      {progress ? (
        // Прогресс — та же пара «иконка + значение», что и в строке
        // метаданных: один размер и один цвет. Раньше чек-лист и часы были
        // разного кегля и тона и читались как два разных типа сведений.
        <Meta
          icon="checkmark.circle"
          text={`${progress.done} из ${progress.total}`}
          color="secondaryLabel"
        />
      ) : preview ? (
        <Highlighted
          text={preview}
          query={highlight}
          lines={layout === 'grid' ? 6 : 2}
        />
      ) : null}

      {/*
        Строка метаданных: у каждой пары иконка наследует цвет своего значения.
        Одним серым здесь было хуже — срок и дата изменения выглядели одним и
        тем же фактом, хотя один из них про будущее, а другой про прошлое.
      */}
      <View style={[styles.head, { gap: theme.spacing.md, marginTop: theme.spacing.xxs, flexWrap: 'wrap' }]}>
        <Meta icon="clock" text={formatRelativeDate(note.updatedAt)} color="secondaryLabel" />

        {note.remindAt ? (
          <Meta
            icon="bell.fill"
            text={formatShortDate(note.remindAt)}
            color={DUE_COLOR[dueState(note.remindAt)]}
            accessibilityLabel="Напоминание"
          />
        ) : null}

        {note.tags.slice(0, layout === 'grid' ? 1 : 2).map((tag) => (
          <Text key={tag} variant="footnote" color="secondaryLabel" numberOfLines={1}>
            #{tag}
          </Text>
        ))}
      </View>
      </>}
    </Pressable>
  );
};

/** Пара «иконка + значение» одного цвета. Из таких собрана строка метаданных. */
const Meta = ({
  icon,
  text,
  color,
  accessibilityLabel,
}: {
  icon: Parameters<typeof Symbol>[0]['name'];
  text: string;
  color: PaletteName;
  accessibilityLabel?: string;
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.head, { gap: theme.spacing.xs }]}>
      <Symbol
        name={icon}
        size={14}
        color={theme.colors[color]}
        accessibilityLabel={accessibilityLabel}
      />
      <Text variant="footnote" color={color}>
        {text}
      </Text>
    </View>
  );
};

/**
 * Превью с подсветкой совпадения.
 *
 * Подсвечивается строка контекста, а не только заголовок: чаще всего искомое
 * слово стоит в теле, и без подсветки результат выглядит случайным.
 */
const Highlighted = ({
  text,
  query,
  lines,
}: {
  text: string;
  query?: string;
  lines: number;
}) => {
  const theme = useTheme();
  const needle = query?.trim();

  if (!needle) {
    return (
      <Text variant="subheadline" color="secondaryLabel" numberOfLines={lines}>
        {text}
      </Text>
    );
  }

  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (at < 0) {
    return (
      <Text variant="subheadline" color="secondaryLabel" numberOfLines={lines}>
        {text}
      </Text>
    );
  }

  // Окно вокруг совпадения: искомое слово может стоять глубоко в тексте, и
  // без сдвига начала строки его в двух строках превью просто не видно.
  const from = Math.max(0, at - 24);
  const head = from > 0 ? '…' : '';

  return (
    <Text variant="subheadline" color="secondaryLabel" numberOfLines={lines}>
      {head}
      {text.slice(from, at)}
      <Text variant="subheadline" weight="semibold" style={{ color: theme.hex.label, backgroundColor: theme.hex.accent }}>
        {text.slice(at, at + needle.length)}
      </Text>
      {text.slice(at + needle.length)}
    </Text>
  );
};

const styles = StyleSheet.create({
  card: { borderCurve: 'continuous' },
  head: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  dot: { width: boxPrimitives.size['8'], height: boxPrimitives.size['8'] },
});
