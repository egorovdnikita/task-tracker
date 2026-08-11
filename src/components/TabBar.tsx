import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { GlassSurface } from './GlassSurface';
import { Icon, type IconName } from './Icon';

export type TabItem = {
  key: string;
  label: string;
  icon: IconName;
};

export type TabBarProps = {
  items: TabItem[];
  activeKey: string;
  onSelect?: (key: string) => void;
  style?: ViewStyle;
};

/**
 * Плавающая панель вкладок по раскладке iOS 26 (Liquid Glass):
 *
 *  - капсула не приклеена к нижней кромке, а висит над ней и по ширине
 *    равна содержимому — контент виден и слева, и справа от неё;
 *  - подложка — толстое матовое стекло с волосяной светлой обводкой;
 *  - активная вкладка получает вложенную капсулу, а не подчёркивание
 *    и не смену цвета иконки в одиночку;
 *  - иконка над подписью, подпись мелкая и всегда видна.
 *
 * Системный `UITabBar` сюда не подставить: React Navigation рисует свою
 * панель обычными вьюхами, нативного таб-бара iOS в ней нет. Это ближайшее
 * повторение раскладки на наших же примитивах.
 */
export const TabBar = ({ items, activeKey, onSelect, style }: TabBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      // Над индикатором «домой», а не поверх него. На устройствах без выреза
      // inset нулевой — там панель садится на собственный отступ.
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) + 8 }, style]}
    >
      <GlassSurface
        blurIntensity={60}
        stroke="glass"
        tint="rgba(28,28,30,0.66)"
        radius={HEIGHT / 2}
        style={styles.bar}
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => onSelect?.(item.key)}
              style={({ pressed }) => [
                styles.tab,
                {
                  borderRadius: theme.radius.pill,
                  backgroundColor: active ? theme.colors.surfaceHigh : 'transparent',
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Icon name={item.icon} size={24} tone={active ? 'default' : 'secondary'} />
              <AppText variant="caption" tone={active ? 'default' : 'secondary'}>
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
};

/** Высота капсулы; радиус берётся от неё, чтобы торцы были полукругом. */
const HEIGHT = 60;

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { height: HEIGHT, flexDirection: 'row', alignItems: 'center', padding: 5, gap: 2 },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
});
