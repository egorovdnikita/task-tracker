import React, { forwardRef, useContext } from 'react';
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Явные inset'ы для собственной шапки: UIKit больше не управляет её высотой. */
export const ScreenScrollView = forwardRef<React.ComponentRef<typeof ScrollView>, ScrollViewProps & { tabbed?: boolean }>(({ contentContainerStyle, style, tabbed = false, ...props }, ref) => {
  const header = useContext(HeaderHeightContext) ?? 0;
  const insets = useSafeAreaInsets();
  const flat = StyleSheet.flatten(contentContainerStyle) ?? {};
  const extra = flat.paddingTop ?? flat.paddingVertical ?? flat.padding ?? (header ? 12 : 0);
  return <ScrollView {...props} ref={ref} style={[{ flex: 1 }, tabbed && { marginBottom: insets.bottom + 66 }, style]} contentInsetAdjustmentBehavior="never" automaticallyAdjustContentInsets={false} contentContainerStyle={[contentContainerStyle, { paddingTop: Math.max(header, insets.top) + (typeof extra === 'number' ? extra : 0) }]} />;
});
ScreenScrollView.displayName = 'ScreenScrollView';
