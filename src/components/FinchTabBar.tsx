import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Symbol, type SymbolProps } from './Symbol';

export type FinchTab = { key: string; label: string; icon: SymbolProps['name'] };
export const FinchTabBar = ({ tabs, selected, onSelect, onLongPress }: { tabs: FinchTab[]; selected: string; onSelect: (key: string) => void; onLongPress?: (key: string) => void }) => {
  const theme = useTheme();
  return <View accessibilityRole="tablist" style={styles.capsule}>
    {tabs.map(tab => <Pressable key={tab.key} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected: selected === tab.key }} onPress={() => onSelect(tab.key)} onLongPress={() => onLongPress?.(tab.key)} style={({ pressed }) => [styles.tab, { backgroundColor: selected === tab.key ? theme.hex.secondarySystemBackground : 'transparent', opacity: pressed ? 0.65 : 1 }]}>
      <Symbol name={tab.icon} size={22} color={selected === tab.key ? theme.colors.label : theme.colors.onBackdrop} />
    </Pressable>)}
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.rim]} />
  </View>;
};
export const FinchTabBarPosition = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  return <View pointerEvents="box-none" style={[styles.position, { bottom: insets.bottom + 2 }]}>{children}</View>;
};
const styles = StyleSheet.create({
  position: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  capsule: { width: 204, height: 52, borderRadius: 26, padding: 4, flexDirection: 'row', gap: 32, backgroundColor: 'rgba(255,255,255,0.22)' },
  rim: { borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  tab: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
