import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { GLYPH_SEPARATOR_INSET, ListRow, ListSection, StatRing, Text } from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { formatDuration } from '../../../src/utils/blocks';
import { libraryStats } from '../../../src/utils/stats';
import { activeNotes, useNotesStore } from '../../../src/store/useNotesStore';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * Статистика — сводка по заметкам на устройстве.
 *
 * Композиция главной Opal: крупное число по центру, под ним три кольца-
 * показателя, ниже карточка с графиком недели и группа строк. Всё считается
 * здесь же из заметок — ничего не собирается и никуда не отправляется.
 */
export default function StatsScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const stats = useMemo(() => libraryStats(activeNotes(notes)), [notes]);

  const peak = Math.max(1, ...stats.week);
  // Подписи дней — от сегодняшнего назад, а не с понедельника.
  const today = (new Date().getDay() + 6) % 7;
  const labels = stats.week.map((_, i) => DAYS[(today - (6 - i) + 7) % 7]);

  return (
    <>
      <Stack.Screen options={{ title: 'Статистика' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.metrics.tabBar + theme.spacing.xxxl }}
      >
        {/* Главное число — как «Score 81» у Opal: подпись над ним, крупно. */}
        <View style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
          <Text variant="subheadline" weight="medium" color="secondaryLabel">
            Заметок
          </Text>
          <Text style={styles.score}>{stats.notes}</Text>
        </View>

        <View style={[styles.rings, { marginVertical: theme.spacing.xl }]}>
          <StatRing
            value={stats.itemsTotal > 0 ? `${Math.round((stats.itemsDone / stats.itemsTotal) * 100)}` : '—'}
            label="Выполнено, %"
            progress={stats.itemsTotal > 0 ? stats.itemsDone / stats.itemsTotal : 0}
          />
          <StatRing value={compact(stats.words)} label="Слов" />
          <StatRing value={String(stats.createdThisWeek)} label="За неделю" />
        </View>

        {/* Карточка недели — сплошная поверхность Opal, столбики лаймом. */}
        <View
          style={{
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.xxxl,
            padding: theme.spacing.lg,
            gap: theme.spacing.lg,
            borderRadius: theme.radius.group,
            backgroundColor: theme.surfaces.group,
          }}
          accessible
          accessibilityLabel={`Новые заметки за неделю: ${stats.week.join(', ')}`}
        >
          <Text variant="headline" weight="semibold">
            Новые заметки
          </Text>
          <View style={[styles.chart, { gap: theme.spacing.sm }]}>
            {stats.week.map((count, i) => (
              <View key={i} style={[styles.bar, { gap: theme.spacing.xs }]}>
                <Text variant="caption1" color="secondaryLabel">
                  {count > 0 ? count : ''}
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: Math.max(4, (count / peak) * 88),
                    borderRadius: 6,
                    backgroundColor: i === 6 ? theme.colors.accent : '#2B2F2C',
                  }}
                />
                <Text variant="caption1" color={i === 6 ? 'label' : 'secondaryLabel'}>
                  {labels[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <ListSection separatorInset={GLYPH_SEPARATOR_INSET} header="Сейчас">
          <ListRow title="Закреплено" icon="pin" value={String(stats.pinned)} />
          <ListRow
            title="С напоминанием"
            icon="bell"
            value={String(stats.withReminder)}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/reminders')}
          />
          <ListRow title="Изменено сегодня" icon="pencil" value={String(stats.editedToday)} />
        </ListSection>

        <ListSection separatorInset={GLYPH_SEPARATOR_INSET} header="Содержимое" footer="Считается на устройстве из заметок вне корзины.">
          <ListRow
            title="Пунктов выполнено"
            icon="checklist"
            value={`${stats.itemsDone} из ${stats.itemsTotal}`}
          />
          <ListRow
            title="Голосовые записи"
            icon="mic"
            value={stats.voices > 0 ? `${stats.voices} · ${formatDuration(stats.voiceMs)}` : '0'}
          />
          <ListRow title="Страниц скана" icon="doc.text.viewfinder" value={String(stats.pages)} />
          <ListRow title="Рисунков" icon="scribble" value={String(stats.sketches)} />
        </ListSection>
      </ScrollView>
    </>
  );
}

/** 12 400 → «12,4 тыс.»: в кольце помещается четыре знака. */
const compact = (n: number): string =>
  n >= 10_000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1).replace('.', ',')}к` : String(n);

const styles = StyleSheet.create({
  score: { color: '#FFFFFF', fontSize: 64, lineHeight: 72, fontWeight: '600', fontVariant: ['tabular-nums'] },
  rings: { flexDirection: 'row', justifyContent: 'space-evenly' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 132 },
  bar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
});
