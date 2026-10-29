import React, { useCallback, useMemo, useState } from 'react';
import { AppState, Linking, ScrollView, View } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';

import { Button, GLYPH_SEPARATOR_INSET, ListRow, ListSection, Text } from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { formatDateTime } from '../../../src/utils/date';
import {
  checkPermission,
  reminderPresets,
  requestPermission,
  type NotificationPermission,
} from '../../../src/features/reminders';
import { activeNotes, useNotesStore } from '../../../src/store/useNotesStore';

const STATUS: Record<NotificationPermission, string> = {
  granted: 'Включены',
  denied: 'Выключены',
  undetermined: 'Не спрашивали',
};

/**
 * Уведомления — состояние разрешения и все напоминания в одном месте.
 *
 * Раньше о выключенных уведомлениях человек узнавал, только открыв шит
 * напоминания у конкретной заметки. Здесь видно сразу: разрешены ли они,
 * сколько сроков стоит и в какое время сработают готовые сроки.
 *
 * Разрешение, раз отказанное, приложение заново спросить не может — iOS это
 * запрещает. Поэтому при отказе кнопка ведёт в системные «Настройки».
 */
export default function NotificationsScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');

  // Проверяем при каждом входе и при возврате из системных «Настроек».
  useFocusEffect(
    useCallback(() => {
      checkPermission().then(setPermission);
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') checkPermission().then(setPermission);
      });
      return () => sub.remove();
    }, []),
  );

  const upcoming = useMemo(
    () => activeNotes(notes).filter((n) => n.remindAt !== null && n.remindAt > Date.now()).length,
    [notes],
  );
  const presets = useMemo(() => reminderPresets(), []);

  return (
    <>
      <Stack.Screen options={{ title: 'Уведомления' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.metrics.tabBar + theme.spacing.xxxl }}
      >
        <ListSection separatorInset={GLYPH_SEPARATOR_INSET}
          footer={
            permission === 'granted'
              ? 'Напоминание приходит баннером, даже когда приложение открыто.'
              : 'Без разрешения срок сохранится в заметке, но система о нём не напомнит.'
          }
        >
          <ListRow title="Уведомления" icon="bell" value={STATUS[permission]} />
        </ListSection>

        {permission !== 'granted' ? (
          <View style={{ paddingHorizontal: theme.spacing.lg, marginTop: -theme.spacing.md, marginBottom: theme.spacing.xxxl }}>
            {/* Белая пилюля — главное действие экрана, как «Confirm» у Opal. */}
            <Button
              title={permission === 'denied' ? 'Открыть настройки iOS' : 'Разрешить уведомления'}
              variant="white"
              size="large"
              fullWidth
              onPress={async () => {
                if (permission === 'denied') await Linking.openSettings();
                else setPermission(await requestPermission());
              }}
            />
          </View>
        ) : null}

        <ListSection separatorInset={GLYPH_SEPARATOR_INSET} header="Напоминания">
          <ListRow
            title="Все напоминания"
            icon="calendar"
            value={String(upcoming)}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/reminders')}
          />
        </ListSection>

        <ListSection separatorInset={GLYPH_SEPARATOR_INSET}
          header="Готовые сроки"
          footer="Так срабатывают варианты в меню «Напомнить». Точное время ставится в самой заметке."
        >
          {presets.map((preset) => (
            <ListRow key={preset.key} title={preset.label} value={formatDateTime(preset.at)} />
          ))}
        </ListSection>

        <Text
          variant="footnote"
          color="secondaryLabel"
          style={{ textAlign: 'center', paddingHorizontal: theme.spacing.xxl }}
        >
          Уведомления локальные: их ставит само устройство, без сервера.
        </Text>
      </ScrollView>
    </>
  );
}
