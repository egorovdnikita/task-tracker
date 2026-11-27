import { FinchHeader } from '../../../src/components/FinchHeader';
import React from 'react';
import { Stack } from 'expo-router';

import { backItem } from '../../../src/components';
import { useTheme } from '../../../src/theme';

/** Стек вкладки «Настройки». Правила шапки — те же, что у «Заметок». */
export default function MoreLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={({ navigation, route }) => ({
        statusBarStyle: 'light',
        header: props => <FinchHeader {...props} />,
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
        headerTintColor: theme.hex.onBackdrop,
        // Заголовок белый, а не акцентный: без явного цвета нативная шапка
        // красит его в `headerTintColor`, и название экрана спорило с кнопками.
        headerTitleStyle: { ...theme.headerText('headline', 'medium'), color: theme.hex.onBackdrop },
        contentStyle: { backgroundColor: theme.hex.systemGroupedBackground },
      })}
    />
  );
}
