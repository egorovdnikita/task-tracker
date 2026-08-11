import React from 'react';
import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { ListRow, ListSection, Text } from '../../../src/components';
import { palette, useTheme, type AppearancePreference } from '../../../src/theme';
import { useNotesStore } from '../../../src/store/useNotesStore';
import { APPEARANCE_LABELS } from '../../../src/features/labels';

const ORDER: AppearancePreference[] = ['system', 'light', 'dark'];

const HINTS: Record<AppearancePreference, string> = {
  system: 'Схема меняется вместе с системной — в том числе по расписанию.',
  light: 'Всегда светлая, независимо от настроек системы.',
  dark: 'Всегда тёмная, независимо от настроек системы.',
};

/**
 * Выбор схемы.
 *
 * Переключение не перекрашивает только наши экраны: выбор уезжает в
 * `Appearance.setColorScheme`, то есть в системное окно приложения. Вместе с
 * содержимым схему меняют панель вкладок, шапки, клавиатура, алерты и стекло —
 * всё, что рисует система.
 */
export default function AppearanceScreen() {
  const theme = useTheme();
  const appearance = useNotesStore((s) => s.settings.appearance);
  const updateSettings = useNotesStore((s) => s.updateSettings);

  return (
    <>
      <Stack.Screen options={{ title: 'Оформление', headerLargeTitle: false }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxxl }}
      >
        <ListSection footer={HINTS[appearance]}>
          {ORDER.map((value) => (
            <ListRow
              key={value}
              title={APPEARANCE_LABELS[value]}
              accessory={{ type: 'checkmark', checked: appearance === value }}
              onPress={() => updateSettings({ appearance: value })}
            />
          ))}
        </ListSection>

        <ListSection header="Как это выглядит">
          <View
            style={{
              flexDirection: 'row',
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            <SchemeSwatch scheme="light" title="Светлая" />
            <SchemeSwatch scheme="dark" title="Тёмная" />
          </View>
        </ListSection>
      </ScrollView>
    </>
  );
}

/**
 * Образец обеих схем рядом.
 *
 * Цвета берутся из палитры напрямую, а не из текущей темы: смысл образца в
 * том, чтобы показать ту схему, которая сейчас не включена.
 */
const SchemeSwatch = ({ scheme, title }: { scheme: 'light' | 'dark'; title: string }) => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, gap: theme.spacing.sm }}>
      <View
        style={{
          borderRadius: theme.radius.md,
          borderCurve: 'continuous',
          overflow: 'hidden',
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
          height: 108,
          backgroundColor: palette.systemGroupedBackground[scheme],
          borderWidth: theme.metrics.hairline,
          borderColor: palette.separator[scheme],
        }}
      >
        {[0, 1].map((i) => (
          <View
            key={i}
            style={{
              borderRadius: theme.radius.sm,
              borderCurve: 'continuous',
              backgroundColor: palette.secondarySystemGroupedBackground[scheme],
              padding: theme.spacing.sm,
              gap: 5,
            }}
          >
            <View
              style={{
                height: 6,
                width: i === 0 ? '62%' : '48%',
                borderRadius: 3,
                backgroundColor: palette.label[scheme],
              }}
            />
            <View
              style={{
                height: 5,
                width: '86%',
                borderRadius: 3,
                backgroundColor: palette.tertiaryLabel[scheme],
              }}
            />
          </View>
        ))}
      </View>

      <Text variant="caption1" color="secondaryLabel" style={{ textAlign: 'center' }}>
        {title}
      </Text>
    </View>
  );
};
