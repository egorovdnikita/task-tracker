import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../../src/theme';

/** Стек вкладки «Настройки». Правила шапки — те же, что у «Заметок». */
export default function MoreLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: false,
        headerStyle: { backgroundColor: theme.hex.systemGroupedBackground },
        headerShadowVisible: false,
        headerTintColor: theme.hex.accent,
        headerTitleStyle: theme.headerText('headline', 'semibold'),
        contentStyle: { backgroundColor: theme.hex.systemGroupedBackground },
      }}
    />
  );
}
