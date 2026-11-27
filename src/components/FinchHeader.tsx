import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackHeaderProps, NativeStackHeaderItem } from 'expo-router/native-stack';
import { HeaderGlass, IconButton } from './Button';
import { Text } from './Text';
import { useTheme } from '../theme';

const customItems = (items?: NativeStackHeaderItem[]) => items?.filter(item => item.type === 'custom').map((item, index) => item.type === 'custom' ? <React.Fragment key={index}>{item.element}</React.Fragment> : null);
/** Safe area +68pt; заголовок центрирован независимо от ширины кнопок. */
export const FinchHeader = ({ options, route, navigation, back }: NativeStackHeaderProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const props = { tintColor: theme.hex.onBackdrop, canGoBack: Boolean(back) };
  const left = options.unstable_headerLeftItems ? customItems(options.unstable_headerLeftItems(props)) : options.headerLeft?.(props);
  const right = options.unstable_headerRightItems ? customItems(options.unstable_headerRightItems(props)) : options.headerRight?.(props);
  return <View style={{ paddingTop: insets.top + 8, paddingBottom: 8, paddingHorizontal: 16 }}>
    <View style={{ height: 52, justifyContent: 'center' }}>
      <Text variant="headline" weight="medium" color="onBackdrop" numberOfLines={1} accessibilityRole="header" style={{ position: 'absolute', left: 56, right: 56, textAlign: 'center' }}>{options.title ?? route.name}</Text>
      <View pointerEvents="box-none" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{left ?? (back ? <HeaderGlass><IconButton name="chevron.left" size={20} accessibilityLabel="Назад" onPress={() => navigation.goBack()} /></HeaderGlass> : null)}</View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{right}</View>
      </View>
    </View>
  </View>;
};
