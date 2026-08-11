import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../../src/theme';

/**
 * Стек вкладки «Заметки».
 *
 * Свой стек у каждой вкладки — условие того, чтобы шапка была системной:
 * крупный заголовок, поле поиска в шапке и его сжатие при прокрутке живут
 * в `UINavigationController`, а не рисуются вьюхами.
 */
export default function NotesLayout() {
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
        headerLargeStyle: { backgroundColor: 'transparent' },
        contentStyle: { backgroundColor: theme.hex.systemGroupedBackground },
      }}
    />
  );
}
