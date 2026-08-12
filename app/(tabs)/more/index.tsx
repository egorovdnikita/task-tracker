import React, { useMemo } from 'react';
import { ScrollView, Share } from 'react-native';
import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';

import { ListRow, ListSection, Text } from '../../../src/components';
import { useTheme } from '../../../src/theme';
import type { SortMode } from '../../../src/types';
import { APPEARANCE_LABELS, SORT_LABELS } from '../../../src/features/labels';
import { noteText, noteTitle } from '../../../src/utils/blocks';
import { showActionSheet } from '../../../src/utils/actionSheet';
import { activeNotes, trashedNotes, useNotesStore } from '../../../src/store/useNotesStore';

/**
 * Плита 08.3 — настройки.
 *
 * Раздел называется «Настройки», а не «Ещё»: за «Ещё» может лежать что
 * угодно, и зайти туда можно только наугад. Внутри — оформление, порядок
 * списка и работа с данными, и это ровно настройки.
 *
 * Аккаунта, синхронизации и подписки здесь нет: приложение работает локально
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
      <Stack.Screen options={{ title: 'Настройки' }} />

      <ScrollView
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
      >
        {/*
          Иконки строк — акцентный контурный глиф, а не белый символ в цветном
          квадрате. Квадраты были системным приёмом из «Настроек» iOS, где ими
          различают десятки разделов чужих приложений; здесь разделов четыре,
          и пять разноцветных плашек оказывались самым ярким, что есть на
          экране, — глаз шёл по цветам, а не по названиям. Контурный глиф
          одного цвета подписывает строку и уступает ей первое место.
        */}
        <ListSection header="Вид">
          <ListRow
            title="Оформление"
            icon="circle.lefthalf.filled"
            value={APPEARANCE_LABELS[settings.appearance]}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/more/appearance')}
          />
          <ListRow
            title="Сортировка"
            icon="arrow.up.arrow.down"
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
            accessory={{
              type: 'switch',
              value: settings.moveCheckedDown,
              onValueChange: (moveCheckedDown) => updateSettings({ moveCheckedDown }),
            }}
          />
        </ListSection>

        <ListSection header="Мои данные" footer="Заметки хранятся только на этом устройстве.">
          <ListRow
            title="Экспортировать заметки"
            icon="square.and.arrow.up"
            value={String(alive.length)}
            disabled={alive.length === 0}
            onPress={exportNotes}
          />
          <ListRow
            title="Корзина"
            icon="trash"
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
