import React from 'react';
import { StyleSheet } from 'react-native';

import { backdrops } from '../theme';
import { GlassSurface } from './GlassSurface';

/**
 * Подсветка корня вкладки: приглушённый серо-зелёный свет у верхней кромки.
 *
 * Только на корнях трёх вкладок — так у Opal. Вложенные экраны и шиты стоят
 * на чистом чёрном; раньше пятна лайма и аквы лежали на каждом экране.
 *
 * Слой кладётся первым ребёнком экрана и растягивается на всё окно, включая
 * зону под прозрачной шапкой и статус-баром: свет в эталоне идёт из-за верхней
 * кромки телефона, и срезанный по шапке он оставлял бы чёрную полосу — шов
 * между системной зоной и приложением.
 */
export const ScreenBackdrop = () => (
  <GlassSurface
    mesh={backdrops.root}
    radius={0}
    liquid={false}
    pointerEventsNone
    style={StyleSheet.absoluteFill}
  />
);
