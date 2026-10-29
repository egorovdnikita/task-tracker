import React from 'react';
import { NativeTabs } from 'expo-router/native-tabs';

/**
 * Панель вкладок — настоящий `UITabBarController`.
 *
 * `NativeTabs` рисует её через `react-native-screens`, а не своими вьюхами.
 * Отсюда всё системное поведение разом: жидкое стекло iOS 26 с линзой под
 * выбранной вкладкой, которую можно зажать и провести по панели,
 * сворачивание при прокрутке, Dynamic Type, VoiceOver.
 *
 * Своя капсула здесь уже была — ради светлой плашки под выбранной вкладкой,
 * которой у системной панели не настроить. Её вернули обратно: копия теряла
 * системное стекло и линзу, а это дороже плашки.
 *
 * Фон панели не задаётся намеренно. Стоит указать `backgroundColor` — и стекло
 * заменяется плоской заливкой.
 *
 * Иконки — из box-ui, стиль `bold`. Панель нативная и SVG не принимает,
 * поэтому глифы растрированы в PNG-шаблоны (`assets/tabs`, 24pt, @1x–@3x,
 * белым на прозрачном). 24pt, а не 26: в капсуле фиксированной высоты меньший
 * глиф оставляет воздух вокруг себя и подписи.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      /*
        Все вкладки белые, полужирной подписью; выбранную отличает линза
        стекла под ней, а не цвет. Цвета заданы по состояниям: одного
        `tintColor` стекло пропускает через свою вибрацию, и белый выходит
        серым.
      */
      tintColor="#FFFFFF"
      iconColor={{ default: '#FFFFFF', selected: '#FFFFFF' }}
      // 12pt вместо системных 10: на чёрном стекле десятый кегль читался
      // мелкой сноской под иконкой.
      labelStyle={{
        default: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
        selected: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
      }}
      // Подпись ниже обычного — зазор между глифом и словом.
      titlePositionAdjustment={{ vertical: 3 }}
      // Панель сворачивается, когда список едет вниз, и возвращается при
      // движении вверх — так контенту достаётся весь экран во время чтения.
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="notes">
        <NativeTabs.Trigger.Icon src={require('../../assets/tabs/notes.png')} renderingMode="template" />
        <NativeTabs.Trigger.Label>Заметки</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="folders">
        <NativeTabs.Trigger.Icon src={require('../../assets/tabs/folder.png')} renderingMode="template" />
        <NativeTabs.Trigger.Label>Папки</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/*
        «Настройки», а не «Ещё». «Ещё» — не раздел, а признание, что для
        содержимого не нашлось имени. Внутри лежат сортировка, поведение
        списка и работа с данными — это настройки, так вкладка и называется.
      */}
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Icon src={require('../../assets/tabs/settings.png')} renderingMode="template" />
        <NativeTabs.Trigger.Label>Настройки</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
