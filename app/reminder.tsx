import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Button, ListRow, ListSection, Text } from '../src/components';
import { useTheme } from '../src/theme';
import { formatDateTime } from '../src/utils/date';
import {
  cancelReminder,
  checkPermission,
  reminderPresets,
  requestPermission,
  scheduleReminder,
  type NotificationPermission,
} from '../src/features/reminders';
import { useNotesStore } from '../src/store/useNotesStore';

/**
 * Плита 08.1 — напоминание.
 *
 * Если системные уведомления выключены, об этом сказано сразу — до того, как
 * человек выберет срок. Узнать, что напоминание не сработает, после того как
 * оно не сработало, — худший из возможных моментов.
 */
export default function ReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const setRemindAt = useNotesStore((s) => s.setRemindAt);

  const [permission, setPermission] = useState<NotificationPermission>('undetermined');
  // Час вперёд — разумная отправная точка: ставить пикер на «сейчас» значит
  // предлагать напоминание, которое уже просрочено.
  const [exact, setExact] = useState(() => new Date(Date.now() + 3_600_000));
  const presets = useMemo(() => reminderPresets(), []);
  const note = notes.find((n) => n.id === id);

  useEffect(() => {
    checkPermission().then(setPermission);
  }, []);

  if (!note) return null;

  const choose = async (at: number) => {
    const scheduled = await scheduleReminder(note, at);
    // Отметка ставится в любом случае: даже без права на уведомления срок
    // виден в заметке и на карточке — просто система о нём не напомнит.
    setRemindAt(note.id, at);
    if (!scheduled) setPermission(await checkPermission());
    router.back();
  };

  const clear = async () => {
    await cancelReminder(note.id);
    setRemindAt(note.id, null);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Напоминание' }} />

      {/* Без системной поправки на инсеты блок «Уведомления выключены»
          заезжал под заголовок шита и первая строка была перекрыта. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
      >
        {permission !== 'granted' ? (
          <View
            style={{
              marginHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
              borderRadius: theme.radius.md,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.secondarySystemGroupedBackground,
            }}
          >
            <Text variant="subheadline" weight="semibold">
              Уведомления выключены
            </Text>
            <Text variant="footnote" color="secondaryLabel">
              Срок сохранится в заметке, но система о нём не напомнит.
            </Text>
            <Button
              title="Разрешить уведомления"
              variant="tinted"
              onPress={async () => setPermission(await requestPermission())}
            />
          </View>
        ) : null}

        <ListSection header="Когда напомнить">
          {presets.map((preset) => (
            <ListRow
              key={preset.key}
              title={preset.label}
              value={formatDateTime(preset.at)}
              onPress={() => choose(preset.at)}
            />
          ))}
        </ListSection>

        {/*
          Готовые сроки закрывают почти все случаи, точная дата — остальные.
          Пикер системный: колёса, календарь, локаль, 12/24 часа и Dynamic Type
          в нём уже есть, и повторять это своими барабанами незачем.
        */}
        <ListSection
          header="Точное время"
          footer="Напоминание живёт на устройстве и никуда не отправляется."
        >
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
              gap: theme.spacing.md,
            }}
          >
            <DateTimePicker
              value={exact}
              mode="datetime"
              display="compact"
              minimumDate={new Date()}
              locale="ru-RU"
              onChange={(_, date) => date && setExact(date)}
              accessibilityLabel="Дата и время напоминания"
            />
            <Button
              title={`Напомнить ${formatDateTime(exact.getTime())}`}
              variant="tinted"
              onPress={() => choose(exact.getTime())}
            />
          </View>
        </ListSection>

        {note.remindAt ? (
          <ListSection footer={`Сейчас стоит на ${formatDateTime(note.remindAt)}.`}>
            <ListRow title="Убрать напоминание" destructive onPress={clear} />
          </ListSection>
        ) : null}
      </ScrollView>
    </>
  );
}
