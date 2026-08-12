import React from 'react';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '../../src/theme';

/**
 * Панель вкладок — настоящий `UITabBarController`.
 *
 * `NativeTabs` рисует её через `react-native-screens`, а не своими вьюхами.
 * Отсюда всё системное поведение разом: жидкое стекло iOS 26, сворачивание
 * при прокрутке, Dynamic Type, VoiceOver, длинное нажатие на активную вкладку.
 *
 * Фон панели не задаётся намеренно. Стоит указать `backgroundColor` — и стекло
 * заменяется плоской заливкой: панель перестаёт пропускать контент под собой
 * и превращается в полосу внизу экрана.
 *
 * Иконки — имена SF Symbols. Свои SVG здесь были бы единственными
 * несистемными элементами внутри системного контейнера.
 *
 * Вкладки поиска здесь нет намеренно. Поиск — не раздел, а действие над тем
 * списком, который человек уже видит; вкладка уводила его на пустой экран и
 * требовала принести список туда заново. Поле поиска теперь стоит у нижнего
 * края самого списка, вместе с кнопкой создания.
 */
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <NativeTabs
      tintColor={theme.hex.accent}
      // Панель сворачивается, когда список едет вниз, и возвращается при
      // движении вверх — так контенту достаётся весь экран во время чтения.
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="notes">
        <Icon sf={{ default: 'note.text', selected: 'note.text' }} />
        <Label>Заметки</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="folders">
        <Icon sf={{ default: 'folder', selected: 'folder.fill' }} />
        <Label>Папки</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="more">
        <Icon sf={{ default: 'ellipsis.circle', selected: 'ellipsis.circle.fill' }} />
        <Label>Ещё</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
