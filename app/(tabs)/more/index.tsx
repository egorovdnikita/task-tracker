import React, { useMemo } from 'react';
import { ScrollView, Share, View } from 'react-native';
import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';

import { ListRow, ListSection, Symbol, Text } from '../../../src/components';
import { useTheme } from '../../../src/theme';
import type { SortMode } from '../../../src/types';
import { APPEARANCE_LABELS, SORT_LABELS } from '../../../src/features/labels';
import { noteText, noteTitle } from '../../../src/utils/blocks';
import { showActionSheet } from '../../../src/utils/actionSheet';
import { activeNotes, trashedNotes, useNotesStore } from '../../../src/store/useNotesStore';

/** Первые три кнопки панели редактора — их хватает, чтобы показать разницу. */
const TOOLBAR_PREVIEW = [
  { icon: 'checklist', label: 'Список' },
  { icon: 'mic', label: 'Запись' },
  { icon: 'bell', label: 'Напомнить' },
] as const;

/**
 * Плита 08.3 — настройки.
 *
 * Здесь нет аккаунта, синхронизации и подписки: приложение работает локально
 * и целиком, платить и входить не за что. Экспорт стоит рядом с корзиной —
 * это всё «мои данные», и человек ищет их в одном месте.
 */
export default function MoreScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const settings = useNotesStore((s) => s.settings);
  const updateSettings = useNotesStore((s) => s.updateSettings);

  const alive = useMemo(() => activeNotes(notes), [notes]);
  const trashed = useMemo(() => trashedNotes(notes), [notes]);

  /**
   * Экспорт — системный шит «Поделиться» с обычным текстом.
   *
   * Ни в какой сервис заметки не уходят: приложение отдаёт их человеку, а
   * дальше он сам решает, куда их положить. Это принципиально, а не временно.
   */
  const exportNotes = async () => {
    if (alive.length === 0) return;

    const dump = alive
      .map((note) => `# ${noteTitle(note)}\n\n${noteText(note)}`)
      .join('\n\n---\n\n');

    await Share.share({ message: dump, title: 'Мои заметки' });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ещё' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxxl }}
      >
        <ListSection header="Вид">
          <ListRow
            title="Оформление"
            icon="circle.lefthalf.filled"
            iconBackground={theme.colors.systemIndigo}
            value={APPEARANCE_LABELS[settings.appearance]}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/more/appearance')}
          />
          <ListRow
            title="Сортировка"
            icon="arrow.up.arrow.down"
            iconBackground={theme.colors.systemBlue}
            value={SORT_LABELS[settings.sort]}
            accessory={{ type: 'disclosure' }}
            onPress={() =>
              showActionSheet(
                (Object.keys(SORT_LABELS) as SortMode[]).map((mode) => ({
                  title: SORT_LABELS[mode],
                  onPress: () => updateSettings({ sort: mode }),
                })),
                { title: 'Сортировка' },
              )
            }
          />
          <ListRow
            title="Отмеченные вниз"
            subtitle="Выполненные пункты уезжают в конец списка"
            icon="checklist"
            iconBackground={theme.colors.systemGreen}
            accessory={{
              type: 'switch',
              value: settings.moveCheckedDown,
              onValueChange: (moveCheckedDown) => updateSettings({ moveCheckedDown }),
            }}
          />
          <ListRow
            title="Подписи в панели"
            subtitle="Слово рядом с иконкой в панели редактора"
            icon="textformat"
            iconBackground={theme.colors.systemOrange}
            accessory={{
              type: 'switch',
              value: settings.toolbarLabels,
              onValueChange: (toolbarLabels) => updateSettings({ toolbarLabels }),
            }}
          />

          {/*
            Настройка не описывается словами, а показывается: ниже тот самый
            ряд ровно в том виде, в каком он появится над клавиатурой.
          */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              gap: settings.toolbarLabels ? theme.spacing.md : theme.spacing.lg,
            }}
          >
            {TOOLBAR_PREVIEW.map(({ icon, label }) => (
              <View
                key={icon}
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}
              >
                <Symbol name={icon} size={20} color={theme.colors.accent} />
                {settings.toolbarLabels ? (
                  <Text variant="footnote" color="accent">
                    {label}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </ListSection>

        <ListSection header="Мои данные" footer="Заметки хранятся только на этом устройстве.">
          <ListRow
            title="Экспортировать заметки"
            icon="square.and.arrow.up"
            iconBackground={theme.colors.systemTeal}
            value={String(alive.length)}
            disabled={alive.length === 0}
            onPress={exportNotes}
          />
          <ListRow
            title="Корзина"
            icon="trash"
            iconBackground={theme.colors.systemGray}
            value={trashed.length > 0 ? String(trashed.length) : undefined}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/folders/trash')}
          />
        </ListSection>

        <Text
          variant="footnote"
          color="tertiaryLabel"
          style={{ textAlign: 'center', paddingHorizontal: theme.spacing.xxl }}
        >
          {Constants.expoConfig?.name ?? 'Task Tracker Notes'} ·{' '}
          v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </>
  );
}
