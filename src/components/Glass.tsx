import React from 'react';
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';

import {
  blurIntensity,
  blurTint,
  materialFallback,
  supportsLiquidGlass,
  useTheme,
  type GlassVariant,
  type MaterialName,
} from '../theme';

export type GlassProps = ViewProps & {
  /**
   * Насколько плотный материал под стеклом. Используется, когда жидкого
   * стекла нет: оно само выбирает плотность по тому, что под ним.
   */
  material?: MaterialName;
  /** Вариант жидкого стекла. `clear` — только на заведомо контрастном фоне. */
  variant?: GlassVariant;
  /** Подмешать стеклу тон — например акцент активного элемента. */
  tintColor?: string;
  /** Отзываться на касание бликом. Только для того, что действительно нажимают. */
  interactive?: boolean;
  /** Радиус скругления. Стекло всегда обрезается по нему. */
  radius?: number;
};

/**
 * Стеклянная поверхность.
 *
 * Три уровня, сверху вниз по достоверности:
 *
 *  1. iOS 26+ — настоящее жидкое стекло `UIGlassEffect`. Оно преломляет то,
 *     что под ним, отзывается на наклон и на касание и перетекает при
 *     сближении с соседним стеклом. Повторить это размытием нельзя.
 *  2. iOS ниже 26 — системный материал через `UIVisualEffectView`: размытие
 *     с правильным тоном и vibrancy, но без преломления и движения.
 *  3. Остальное (веб-витрина, Android) — плотная заливка.
 *
 * Третий уровень намеренно не изображает стекло полупрозрачным серым:
 * без размытия это выглядит грязным пятном. Честная непрозрачная поверхность
 * читается лучше и не обещает того, чего платформа не даёт.
 */
export const Glass = ({
  material = 'regular',
  variant = 'regular',
  tintColor,
  interactive = false,
  radius,
  style,
  children,
  ...rest
}: GlassProps) => {
  const theme = useTheme();
  const shape: ViewStyle = {
    borderRadius: radius,
    borderCurve: 'continuous',
    overflow: 'hidden',
  };

  if (Platform.OS === 'ios' && supportsLiquidGlass()) {
    return (
      <GlassView
        {...rest}
        glassEffectStyle={variant}
        tintColor={tintColor}
        isInteractive={interactive}
        style={[shape, style]}
      >
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        {...rest}
        tint={blurTint(material, theme.scheme)}
        intensity={blurIntensity[material]}
        style={[shape, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      {...rest}
      style={[shape, { backgroundColor: materialFallback[material][theme.scheme] }, style]}
    >
      {children}
    </View>
  );
};

/**
 * Контейнер для нескольких стеклянных элементов рядом.
 *
 * Внутри него стёкла сливаются каплей, когда сходятся ближе `spacing` —
 * это поведение системы, а не эффект: так ведут себя кнопки в плавающей
 * панели iOS 26. Вне iOS 26 контейнер — обычная вьюха, и элементы просто
 * стоят рядом.
 */
export type GlassGroupProps = ViewProps & { spacing?: number };

export const GlassGroup = ({ spacing = 12, children, ...rest }: GlassGroupProps) => {
  if (Platform.OS === 'ios' && supportsLiquidGlass()) {
    // Импорт внутри ветки: на остальных платформах модуль в граф не попадает.
    const { GlassContainer } = require('expo-glass-effect') as typeof import('expo-glass-effect');
    return (
      <GlassContainer spacing={spacing} {...rest}>
        {children}
      </GlassContainer>
    );
  }

  return <View {...rest}>{children}</View>;
};
