import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../../src/theme';

export default function FoldersLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect:
          theme.scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight',
        headerShadowVisible: false,
        headerTintColor: theme.hex.systemBlue,
        headerTitleStyle: theme.headerText('headline', 'semibold'),
        headerLargeTitleStyle: theme.headerText('largeTitle', 'bold'),
        contentStyle: { backgroundColor: theme.hex.systemGroupedBackground },
      }}
    />
  );
}
