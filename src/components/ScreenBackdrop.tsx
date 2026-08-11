import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
 * Safe area обрабатывается здесь, а не снаружи: если обернуть экран в
 * `SafeAreaView`, свечение обрежется по нижней кромке статус-бара и сверху
 * останется чёрная полоса — видимый шов между системной зоной и приложением.
 * Поэтому подсветка тянется на всю высоту окна, а отступ получает только
 * содержимое.
 */
export const ScreenBackdrop = ({ name, children }: ScreenBackdropProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <GlassSurface
        mesh={backdrops[name]}
        radius={0}
        pointerEventsNone
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.content, { paddingTop: insets.top }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
