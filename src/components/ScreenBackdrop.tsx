import React from 'react';
import { StyleSheet } from 'react-native';

import { backdrops, type BackdropName } from '../theme';
import { GlassSurface } from './GlassSurface';

export type ScreenBackdropProps = {
  /** Раскладка пятен под конкретный экран — см. `backdrops` в `theme/opal.ts`. */
  name: BackdropName;
};

/**
 * Подсветка экрана: цветные пятна над чёрным фоном, позади содержимого.
 *
 * Нужна ради стекла. Полупрозрачная подложка карточки на чистом чёрном
 * неотличима от плоского серого прямоугольника — стекло появляется только там,
 * где сквозь него просвечивает цвет. Пятна и есть этот цвет.
 *
 * Слой кладётся первым ребёнком экрана и растягивается на всё окно, включая
 * зону под прозрачной шапкой и статус-баром: свет в эталоне идёт из-за верхней
 * кромки телефона, и срезанный по шапке он оставлял бы чёрную полосу — шов
 * между системной зоной и приложением.
 */
export const ScreenBackdrop = ({ name }: ScreenBackdropProps) => (
  <GlassSurface
    mesh={backdrops[name]}
    radius={0}
    liquid={false}
    pointerEventsNone
    style={StyleSheet.absoluteFill}
  />
);
