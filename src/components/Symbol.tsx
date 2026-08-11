import React from 'react';
import { Platform, StyleSheet, View, type ColorValue, type ViewStyle } from 'react-native';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';

export type SymbolProps = {
  /** Имя SF Symbol — как в приложении Apple SF Symbols. */
  name: SFSymbol;
  size?: number;
  color?: ColorValue;
  weight?: SymbolWeight;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/**
 * Символ интерфейса.
 *
 * Иконки берутся из SF Symbols, а не рисуются своими SVG. Дело не в экономии:
 * системный символ выровнен по базовой линии текста, знает оптические веса,
 * масштабируется вместе с Dynamic Type и подменяется на локализованный вариант
 * там, где направление письма другое. Свой SVG рядом с системными в панели
 * вкладок и в шапке виден сразу — он единственный не попадает в ритм.
 *
 * За пределами iOS символов нет. Вместо силуэта-заглушки рисуем пустое место
 * тех же размеров: раскладка не прыгает, а отсутствующая иконка честно
 * отсутствует, вместо того чтобы притворяться другой.
 */
export const Symbol = ({
  name,
  size = 20,
  color,
  weight = 'regular',
  style,
  accessibilityLabel,
}: SymbolProps) => {
  const theme = useTheme();
  const tint = color ?? theme.colors.label;
  const box: ViewStyle = { width: size, height: size };

  if (Platform.OS !== 'ios') {
    return <View style={[box, style]} accessibilityLabel={accessibilityLabel} />;
  }

  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={tint}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={[box, style]}
      accessibilityLabel={accessibilityLabel}
      accessible={Boolean(accessibilityLabel)}
      fallback={<View style={box} />}
    />
  );
};

/** Символ в круглой цветной плашке — метка папки, тип блока, пункт настроек. */
export type SymbolBadgeProps = SymbolProps & {
  background: ColorValue;
  /** Сторона плашки. Системная — 29pt в строке списка. */
  boxSize?: number;
};

export const SymbolBadge = ({ background, boxSize = 29, size, ...rest }: SymbolBadgeProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: theme.radius.xs,
          backgroundColor: background,
        },
      ]}
    >
      <Symbol {...rest} size={size ?? Math.round(boxSize * 0.58)} color="#FFFFFF" weight="medium" />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' },
});
