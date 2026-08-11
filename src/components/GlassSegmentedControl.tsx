import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { GlassSurface } from './GlassSurface';

export type SegmentItem = {
  key: string;
  label: string;
  count?: number;
};

export type GlassSegmentedControlProps = {
  items: SegmentItem[];
  selectedKey: string;
  onSelect?: (key: string) => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

type Rect = { x: number; width: number };

/**
 * Сегмент-контрол на стекле — вместо россыпи чипов.
 *
 * Отличие от чипов не косметическое: чипы выглядят как набор независимых
 * переключателей, хотя фильтр всегда ровно один. Общий трек и одна едущая
 * плашка показывают это самой формой.
 *
 * Ширины сегментов разные и считаются по факту (`onLayout`), а не делением
 * трека на равные доли: подписи тегов задаёт человек, и «Все» рядом с
 * «Личное» на равных долях расползаются пустотой. Если сегменты не влезают,
 * трек скроллится — количество тегов не ограничено.
 */
export const GlassSegmentedControl = ({
  items,
  selectedKey,
  onSelect,
  accessibilityLabel,
  style,
}: GlassSegmentedControlProps) => {
  const theme = useTheme();
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const scroller = useRef<ScrollView>(null);

  const active = rects[selectedKey];

  const thumb = useAnimatedStyle(() => {
    if (!active) return { opacity: 0 };
    const timing = { duration: 240, easing: Easing.out(Easing.cubic) };
    return {
      opacity: withTiming(1, timing),
      width: withTiming(active.width, timing),
      transform: [{ translateX: withTiming(active.x, timing) }],
    };
  });

  const measure = (key: string, x: number, width: number) =>
    setRects((prev) =>
      prev[key]?.x === x && prev[key]?.width === width ? prev : { ...prev, [key]: { x, width } },
    );

  return (
    <GlassSurface
      radius={theme.radius.pill}
      tint={theme.tints.control}
      glassStyle="regular"
      style={StyleSheet.flatten([styles.track, style])}
    >
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Animated.View style={[styles.thumbHolder, thumb]}>
          {/* Плашка — тоже стекло, но плотнее трека: так она читается слоем
              выше, а не просто светлым пятном. */}
          <GlassSurface
            radius={theme.radius.pill}
            tint="rgba(255,255,255,0.16)"
            glassStyle="clear"
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {items.map((item) => {
          const selected = item.key === selectedKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={accessibilityLabel ? `${accessibilityLabel}: ${item.label}` : item.label}
              accessibilityState={{ selected }}
              onLayout={(e) => measure(item.key, e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
              onPress={() => onSelect?.(item.key)}
              style={styles.segment}
            >
              <AppText variant="subtle" tone={selected ? 'default' : 'secondary'}>
                {item.label}
              </AppText>
              {typeof item.count === 'number' ? (
                <AppText variant="subtle" tone={selected ? 'secondary' : 'tertiary'}>
                  {item.count}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </GlassSurface>
  );
};

const HEIGHT = 40;
const INSET = 4;

const styles = StyleSheet.create({
  track: { height: HEIGHT, padding: INSET },
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  thumbHolder: { position: 'absolute', top: 0, bottom: 0, left: 0, borderRadius: 999 },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: HEIGHT - INSET * 2,
    borderRadius: 999,
  },
});
