import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Settings, SortMode } from '../types';
import { AppHeader } from '../components/AppHeader';
import { AppText } from '../components/AppText';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';

export type SettingsScreenProps = {
  settings: Settings;
  version?: string;
  onBack?: () => void;
  onChange?: (patch: Partial<Settings>) => void;
  onClearAll?: () => void;
};

const SORT_LABELS: Record<SortMode, string> = {
  updated: 'По дате изменения',
  created: 'По дате создания',
  title: 'По заголовку',
};

/** S4 — Settings. */
export const SettingsScreen = ({
  settings,
  version = '1.0.0',
  onBack,
  onChange,
  onClearAll,
}: SettingsScreenProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="Настройки" onBack={onBack} />

      <ScrollView contentContainerStyle={{ paddingVertical: theme.spacing.lg, gap: theme.spacing.xl }}>
        <SettingsSection title="Вид">
          <SettingsRow
            title="Тёмная тема"
            type="switch"
            value={settings.scheme === 'dark'}
            onValueChange={(v) => onChange?.({ scheme: v ? 'dark' : 'light' })}
          />
          <SettingsRow
            title="Компактный список"
            description="Скрывать превью текста в карточках"
            type="switch"
            value={settings.compact}
            onValueChange={(compact) => onChange?.({ compact })}
          />
        </SettingsSection>

        <SettingsSection title="Сортировка">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <SettingsRow
              key={mode}
              title={SORT_LABELS[mode]}
              type="select"
              value={settings.sort === mode}
              onPress={() => onChange?.({ sort: mode })}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Данные">
          <SettingsRow title="Удалить все заметки" type="danger" onPress={onClearAll} />
        </SettingsSection>

        <AppText variant="caption" tone="muted" style={styles.version}>
          Task Tracker Notes · v{version}
        </AppText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  version: { textAlign: 'center' },
});
