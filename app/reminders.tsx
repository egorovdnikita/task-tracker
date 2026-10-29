import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

import { EmptyState, GLYPH_SEPARATOR_INSET, ListRow, ListSection, backItem } from '../src/components';
import { useTheme } from '../src/theme';
import { dueState, formatDateTime } from '../src/utils/date';
import { noteTitle } from '../src/utils/blocks';
import { cancelReminder, scheduleReminder } from '../src/features/reminders';
import { offerUndo } from '../src/features/notify';
import { activeNotes, useNotesStore } from '../src/store/useNotesStore';
import type { Note } from '../src/types';

const SECTIONS = [
  { state: 'overdue', title: 'Просрочено', icon: 'exclamationmark.circle' },
  { state: 'today', title: 'Сегодня', icon: 'bell' },
  { state: 'future', title: 'Позже', icon: 'calendar' },
] as const;

/**
 * Все напоминания разом.
 *
 * Раньше срок был виден только в карточке и в самой заметке: чтобы понять,
 * что ждёт сегодня, приходилось листать весь список. Здесь — три группы по
 * сроку, как «Rules» у Opal сгруппированы по состоянию. Просроченное наверху:
 * это то, что уже требует внимания.
 *
 * Касание открывает заметку, долгое нажатие — переставить или снять срок.
 */
export default function RemindersScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const setRemindAt = useNotesStore((s) => s.setRemindAt);

  const groups = useMemo(() => {
    const due = activeNotes(notes)
      .filter((n): n is Note & { remindAt: number } => n.remindAt !== null)
      .sort((a, b) => a.remindAt - b.remindAt);
    return SECTIONS.map((section) => ({
      ...section,
      notes: due.filter((n) => dueState(n.remindAt) === section.state),
    })).filter((section) => section.notes.length > 0);
  }, [notes]);

  const clear = (note: Note & { remindAt: number }) => {
    const at = note.remindAt;
    void cancelReminder(note.id);
    setRemindAt(note.id, null);
    // Отмена возвращает и срок, и уведомление — иначе срок вернулся бы молча.
    offerUndo('Напоминание снято', () => {
      setRemindAt(note.id, at);
      if (at > Date.now()) void scheduleReminder(note, at);
    });
  };

  return (
    <>
      <Stack.Screen options={{ unstable_headerLeftItems: backItem(() => router.back()) }} />

      {groups.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Напоминаний нет"
          description="Срок ставится в самой заметке: меню «⋯» → «Напомнить»."
        />
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
        >
          {groups.map((group) => (
            <ListSection separatorInset={GLYPH_SEPARATOR_INSET} key={group.state} header={group.title}>
              {group.notes.map((note) => (
                <ListRow
                  key={note.id}
                  title={noteTitle(note)}
                  subtitle={formatDateTime(note.remindAt)}
                  icon={group.icon}
                  iconColor={group.state === 'overdue' ? theme.colors.systemRed : undefined}
                  accessory={{ type: 'disclosure' }}
                  onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                  menuTitle={noteTitle(note)}
                  menu={() => [
                    {
                      title: 'Перенести срок',
                      icon: 'calendar',
                      onPress: () => router.push({ pathname: '/reminder', params: { id: note.id } }),
                    },
                    {
                      title: 'Снять напоминание',
                      icon: 'bell.slash',
                      destructive: true,
                      onPress: () => clear(note),
                    },
                  ]}
                />
              ))}
            </ListSection>
          ))}
        </ScrollView>
      )}
    </>
  );
}
