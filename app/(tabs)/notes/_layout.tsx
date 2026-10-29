import React from 'react';
import { Stack } from 'expo-router';

import { backItem } from '../../../src/components';
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
      screenOptions={({ navigation, route }) => ({
        headerLargeTitle: false,
        // «Назад» — та же кнопка, что на экране заметки. На корневом экране
        // вкладки возвращаться некуда, там её нет.
        unstable_headerLeftItems:
          navigation.getState().routes[0]?.key !== route.key
            ? backItem(() => navigation.goBack())
            : undefined,
        // Прозрачная, как в корневом стеке: подсветка фона идёт из-под неё.
        headerTransparent: true,
        headerShadowVisible: false,
        // Шапка монохромная: фирменный цвет остаётся главным действиям экрана.
        headerTintColor: theme.hex.label,
        // Заголовок белый, а не акцентный: без явного цвета нативная шапка
        // красит его в `headerTintColor`, и название экрана спорило с кнопками.
        headerTitleStyle: { ...theme.headerText('headline', 'semibold'), color: theme.hex.label },
        contentStyle: { backgroundColor: theme.hex.systemGroupedBackground },
      })}
    />
  );
}
