import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../../src/theme';

/**
 * Стек вкладки «Заметки».
 *
 * Заголовок встроенный, а не крупный. Крупный занимал отдельную полосу над
 * списком и уводил кнопки управления на строку выше — переключатель вида
 * оказывался сам по себе над пустым местом, а сортировка не помещалась рядом
 * и уезжала вниз пилюлей. Встроенный заголовок ставит имя раздела и все его
 * кнопки в одну строку: заголовок слева-по-центру, капсула управления справа,
 * ровно как в референсе.
 *
 * Шапка того же цвета, что страница, и без размытия — по той же причине, что
 * и в корневом стеке.
 */
export default function NotesLayout() {
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
