import React, { useMemo } from 'react';
import { ScrollView, Share, View } from 'react-native';
import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';

import {
  GLYPH_SEPARATOR_INSET,
  ListRow,
  ListSection,
  MenuButton,
  RootHeader,
  ScreenBackdrop,
  Text,
} from '../../../src/components';
import { useTheme } from '../../../src/theme';
import type { SortMode } from '../../../src/types';
import { SORT_LABELS } from '../../../src/features/labels';
import { noteText, noteTitle } from '../../../src/utils/blocks';
import { activeNotes, useNotesStore } from '../../../src/store/useNotesStore';

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
      <ScreenBackdrop />
      <Stack.Screen options={{ headerShown: false, title: 'Настройки' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: theme.metrics.tabBar + theme.spacing.xxxl }}
      >
        <RootHeader
          title="Настройки"
          style={{ marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg }}
        />
        {/*
          Иконки строк — акцентный контурный глиф, а не белый символ в цветном
          квадрате. Квадраты были системным приёмом из «Настроек» iOS, где ими
          различают десятки разделов чужих приложений; здесь разделов четыре,
          и пять разноцветных плашек оказывались самым ярким, что есть на
          экране, — глаз шёл по цветам, а не по названиям. Контурный глиф
          одного цвета подписывает строку и уступает ей первое место.
        */}
        <ListSection separatorInset={GLYPH_SEPARATOR_INSET} header="Вид">
          {/* Выбор из списка — то же меню с галочкой, что в шапке «Заметок».
              Лист снизу без отметки текущего значения здесь не к месту:
              `ActionSheetIOS` оставлен вопросам. */}
          <MenuButton
            accessibilityLabel={`Сортировка: ${SORT_LABELS[settings.sort]}`}
            title="Сортировка"
            items={() =>
              (Object.keys(SORT_LABELS) as SortMode[]).map((mode) => ({
                title: SORT_LABELS[mode],
                checked: settings.sort === mode,
                onPress: () => updateSettings({ sort: mode }),
              }))
            }
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <View pointerEvents="none">
              <ListRow
                title="Сортировка"
                icon="arrow.up.arrow.down"
                value={SORT_LABELS[settings.sort]}
              />
            </View>
          </MenuButton>
          <ListRow
            title="Отмеченные вниз"
            icon="checklist"
            accessory={{
              type: 'switch',
              value: settings.moveCheckedDown,
              onValueChange: (moveCheckedDown) => updateSettings({ moveCheckedDown }),
            }}
          />
        </ListSection>

        {/* Обзор — новые разделы: сводка по заметкам и всё про напоминания. */}
        <ListSection separatorInset={GLYPH_SEPARATOR_INSET} header="Обзор">
          <ListRow
            title="Статистика"
            subtitle="Сколько заметок, слов и выполненных пунктов"
            icon="chart.bar"
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/more/stats')}
          />
          <ListRow
            title="Уведомления"
            subtitle="Разрешение, все сроки и готовые варианты"
            icon="bell"
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/more/notifications')}
          />
        </ListSection>

        <ListSection separatorInset={GLYPH_SEPARATOR_INSET} header="Мои данные" footer="Заметки хранятся только на этом устройстве.">
          <ListRow
            title="Экспортировать заметки"
            icon="square.and.arrow.up"
            value={String(alive.length)}
            disabled={alive.length === 0}
            onPress={exportNotes}
          />
        </ListSection>

        <Text
          variant="footnote"
          color="secondaryLabel"
          style={{ textAlign: 'center', paddingHorizontal: theme.spacing.xxl }}
        >
          {Constants.expoConfig?.name ?? 'Task Tracker Notes'} ·{' '}
          v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </>
  );
}
