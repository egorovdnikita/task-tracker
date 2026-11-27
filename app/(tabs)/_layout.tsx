import React from 'react';
import { Tabs } from 'expo-router';
import { getFocusedRouteNameFromRoute } from 'expo-router/react-navigation';
import { FinchTabBar, FinchTabBarPosition, type FinchTab } from '../../src/components/FinchTabBar';

const TABS: FinchTab[] = [
  { key: 'notes', label: 'Заметки', icon: 'note.text' },
  { key: 'folders', label: 'Папки', icon: 'folder' },
  { key: 'more', label: 'Настройки', icon: 'gearshape' },
];
/** Навигацией управляет React Navigation; геометрия панели — из Finch. */
export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }} tabBar={({ state, emitter, navigateToTab }) => {
    const route = state.routes[state.index];
    const child = getFocusedRouteNameFromRoute(route);
    if (child && child !== 'index') return null;
    return <FinchTabBarPosition><FinchTabBar tabs={TABS} selected={route.name} onSelect={name => {
      const target = state.routes.find(item => item.name === name);
      if (!target) return;
      const event = emitter.emit({ type: 'tabPress', target: target.key, canPreventDefault: true });
      if (!event.defaultPrevented && route.key !== target.key) navigateToTab(target.key);
    }} onLongPress={name => {
      const target = state.routes.find(item => item.name === name);
      if (target) emitter.emit({ type: 'tabLongPress', target: target.key });
    }} /></FinchTabBarPosition>;
  }}>
    <Tabs.Screen name="notes" options={{ title: 'Заметки' }} />
    <Tabs.Screen name="folders" options={{ title: 'Папки' }} />
    <Tabs.Screen name="more" options={{ title: 'Настройки' }} />
  </Tabs>;
}
