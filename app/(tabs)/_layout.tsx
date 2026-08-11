import React from 'react';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { colors } from '../../src/theme/tokens';

/**
 * Нативная панель вкладок — настоящий `UITabBarController`.
 *
 * `NativeTabs` из expo-router рисует её через `react-native-screens`
 * (`RNSBottomTabsHostComponentView`), а не своими вьюхами. Отсюда всё
 * системное поведение разом: жидкое стекло iOS 26, сворачивание при
 * скролле, Dynamic Type, VoiceOver — то, что своей панелью пришлось бы
 * повторять вручную и всё равно неточно.
 *
 * Иконки заданы именами SF Symbols: панель системная, и рисовать в ней
 * свои SVG значило бы получить единственный несистемный элемент внутри
 * системного контейнера.
 *
 * Вкладки соответствуют плите 02 вайрфрейма; «Папки» появятся здесь же,
 * когда в модели заметки будет папка.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.accentLime}
      iconColor={{ default: colors.textSecondary, selected: colors.accentLime }}
      labelStyle={{ color: colors.textSecondary }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'note.text', selected: 'note.text' }} />
        <Label>Заметки</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <Icon sf="magnifyingglass" />
        <Label>Поиск</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: 'slider.horizontal.3', selected: 'slider.horizontal.3' }} />
        <Label>Ещё</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
