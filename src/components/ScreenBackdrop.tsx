import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GlassSurface } from './GlassSurface';
import { backdrops, colors, type BackdropName } from '../theme/tokens';

export type ScreenBackdropProps = {
  /** Раскладка пятен под конкретный экран — см. `backdrops` в токенах. */
  name: BackdropName;
  children?: React.ReactNode;
};

/**
 * Корень экрана: чёрный фон, поверх него цветные пятна, поверх них — контент.
 *
 * Нужен ради стекла. Полупрозрачная подложка карточки на чистом чёрном
 * неотличима от плоского серого прямоугольника — «стекло» появляется только
 * там, где сквозь него просвечивает цвет. Пятна и есть этот цвет.
 *
 * Свечение не перехватывает касания и лежит отдельным слоем, поэтому экраны
 * ниже про него ничего не знают — только оборачиваются.
 */
export const ScreenBackdrop = ({ name, children }: ScreenBackdropProps) => (
  <View style={[styles.root, { backgroundColor: colors.background }]}>
    <GlassSurface
      mesh={backdrops[name]}
      radius={0}
      pointerEventsNone
      style={StyleSheet.absoluteFillObject}
    />
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
