import React, { useEffect, useRef, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Glass } from './Glass';
import { GlassSurface } from './GlassSurface';
import { Symbol } from './Symbol';

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  /**
   * Как поле выглядит.
   *
   * `card` — тонкое стекло в потоке списка, под заголовком: прозрачная
   * подложка и световой кант, без блюра — под полем ничего не едет.
   *
   * `glass` — плавающая капсула поверх списка. Стекло оправдано только там,
   * где под полем действительно едет контент.
   */
  tone?: 'card' | 'glass';
  style?: StyleProp<ViewStyle>;
};

/**
 * Поле поиска.
 *
 * Системного поля для этого места нет: `UISearchBar` живёт внутри
 * `UINavigationBar` и приходит вместе с крупным заголовком, а заголовок здесь
 * встроенный — он стоит в одну строку с кнопками управления списком. Поэтому
 * поле собрано своё, но из системных частей: символ `magnifyingglass`,
 * обычный `TextInput` с системной клавиатурой, системная типографика.
 *
 * Поведение повторяет поиск iOS 26. Пока поле в фокусе, справа от него стоит
 * отдельная круглая кнопка с крестиком — выход из поиска: она стирает запрос
 * и убирает клавиатуру. Крестик внутри поля появляется, только когда есть
 * что стереть, и стирает текст, не выходя из поиска. Это два разных действия,
 * и поэтому две разные кнопки.
 */
export const SearchField = ({
  value,
  onChangeText,
  placeholder = 'Поиск',
  onSubmitEditing,
  tone = 'card',
  style,
}: SearchFieldProps) => {
  const theme = useTheme();
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const height = theme.controlHeight.searchFieldBottom;
  const gap = theme.spacing.sm;

  /*
    Выход из поиска въезжает справа одной пружиной: место под кнопку растёт
    от нуля, поле сужается вместе с ним кадр за кадром, а сама кнопка
    проявляется и дорастает до размера. Раньше ширина поля менялась скачком,
    и кнопка возникала поверх уже сузившегося поля.
  */
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, { damping: 22, stiffness: 260, mass: 0.9 });
  }, [focused, progress]);

  const slot = useAnimatedStyle(() => ({
    width: Math.max(0, progress.value) * (height + gap),
  }));

  const button = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, progress.value));
    return { opacity: p, transform: [{ scale: 0.6 + 0.4 * p }] };
  });

  const shape: ViewStyle = {
    flex: 1,
    height,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  };

  const leave = () => {
    onChangeText('');
    input.current?.blur();
  };

  const body = (
    <>
      <Symbol name="magnifyingglass" size={20} color={theme.colors.secondaryLabel} />

      <TextInput
        ref={input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholderText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel={placeholder}
        style={[theme.text('body'), styles.input, { color: theme.colors.label }]}
      />

      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Стереть запрос"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
        >
          <Symbol name="xmark.circle.fill" size={18} color={theme.colors.tertiaryLabel} />
        </Pressable>
      ) : null}
    </>
  );

  const field =
    tone === 'glass' ? (
      <Glass
        material="thick"
        radius={theme.radius.pill}
        style={[styles.root, styles.shadow, shape]}
      >
        {body}
      </Glass>
    ) : (
      <View style={[styles.root, shape, { borderRadius: theme.radius.pill }]}>
        {/* Поле на стекле Opal: своими слоями, без системного стекла — на
            чёрном оно светлеет до молочного. */}
        <GlassSurface
          stroke="glass"
          tint={theme.tints.control}
          radius={theme.radius.pill}
          liquid={false}
          pointerEventsNone
          style={StyleSheet.absoluteFill}
        />
        {body}
      </View>
    );

  return (
    <View style={[styles.root, style]}>
      {field}

      <Animated.View style={[styles.slot, slot]} pointerEvents={focused ? 'auto' : 'none'}>
        <Animated.View style={button}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть поиск"
            accessibilityElementsHidden={!focused}
            onPress={leave}
            style={({ pressed }) => [
              styles.close,
              { width: height, height, borderRadius: height / 2, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <GlassSurface
              stroke="glass"
              tint={theme.tints.control}
              radius={height / 2}
              liquid={false}
              pointerEventsNone
              style={StyleSheet.absoluteFill}
            />
            <Symbol name="xmark" size={24} color={theme.colors.label} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 0 },
  // Кнопка прижата к правому краю места под неё: пока место растёт, она
  // въезжает из-за края, а не раздвигает поле изнутри.
  slot: { flexDirection: 'row', justifyContent: 'flex-end', overflow: 'hidden' },
  close: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
