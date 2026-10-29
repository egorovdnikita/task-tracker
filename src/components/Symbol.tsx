import React from 'react';
import { Platform, StyleSheet, View, type ColorValue, type ViewStyle } from 'react-native';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { SvgXml } from 'react-native-svg';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { BOX_ICONS } from '../vendor/box-ui/icons';

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
 * Стрелки и шевроны рисуются крупнее своей коробки: в сетке 24pt набора они
 * занимают середину, и в строке рядом с глифом папки выглядели вдвое мельче
 * него. Обрезанный `viewBox` увеличивает знак, не трогая раскладку.
 */
const ENLARGED = /^(arrow\.|chevron\.|xmark$)/;

/**
 * Символ интерфейса.
 *
 * Иконки — из box-ui (`BOX_ICONS`), под системными именами SF Symbols: код
 * зовёт `folder` или `chevron.right`, а рисуется знак набора. Так подмена
 * живёт в одном месте, и иконку можно поменять, не трогая экраны. Имени,
 * которого в наборе нет, остаётся системный символ.
 *
 * Иконки панели вкладок идут мимо этого компонента и остаются системными:
 * панель нативная и принимает только SF Symbols.
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

  const glyph = BOX_ICONS[name];
  if (glyph) {
    const viewBox = ENLARGED.test(name) ? '3 3 18 18' : '0 0 24 24';
    return (
      <View
        style={[box, style]}
        accessible={Boolean(accessibilityLabel)}
        accessibilityLabel={accessibilityLabel}
      >
        <SvgXml
          xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">${glyph}</svg>`}
          width={size}
          height={size}
          color={tint as string}
        />
      </View>
    );
  }

  // За пределами iOS системных символов нет: пустое место тех же размеров,
  // чтобы раскладка не прыгала.
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
