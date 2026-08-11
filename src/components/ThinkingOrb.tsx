import React, { useEffect, useMemo } from 'react';
import { AccessibilityInfo, StyleSheet, type ViewStyle } from 'react-native';
import { Canvas, PaintStyle, Picture, Skia, createPicture } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { MODE_DRAWS } from '../vendor/thinking-orbs/engine/registry';
import { createSink, type OrbSink } from '../vendor/thinking-orbs/engine/core';
import { resolvePreset } from '../vendor/thinking-orbs/presets';
import type { OrbSize, OrbState } from '../vendor/thinking-orbs/types';

export type { OrbSize, OrbState };

/** Подписи состояний — уходят в accessibilityLabel, если не задан свой. */
const LABELS: Record<OrbState, string> = {
  working: 'Работаю',
  searching: 'Ищу',
  solving: 'Решаю',
  listening: 'Слушаю',
  connecting: 'Связываю',
  weaving: 'Сплетаю',
  composing: 'Составляю',
  breathing: 'Думаю',
  shaping: 'Формирую',
};

/** Кадр, который движок отдаёт UI-потоку: только числа, без объектов. */
const EMPTY: OrbSink = { dots: [], lines: [] };

export type ThinkingOrbProps = {
  /** Какую из девяти анимаций показывать. */
  state?: OrbState;
  /** Тюнингов ровно два: 64 (аватар) и 20 (в строке текста). */
  size?: OrbSize;
  /** Множитель поверх скорости, вшитой в пресет. */
  speed?: number;
  /** Заморозить на текущем кадре. */
  paused?: boolean;
  /** Светлые чернила на тёмной подложке. У нас тема тёмная — по умолчанию да. */
  dark?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

/**
 * Точечный 3D-орб из thinking-orbs, отрисованный через Skia.
 *
 * Разделение потоков: кадр (позиции, серый, альфа) считается движком на
 * JS-потоке в `requestAnimationFrame` и кладётся в `SharedValue`; сам рисунок
 * собирается воркле́том на UI-потоке. Поэтому React ре-рендерится ноль раз
 * за анимацию — перерисовка не проходит через дерево компонентов.
 *
 * Почему движок не воркле́тизирован — см. `vendor/thinking-orbs/VENDORED.md`.
 */
export const ThinkingOrb = ({
  state = 'working',
  size = 64,
  speed = 1,
  paused = false,
  dark = true,
  accessibilityLabel,
  style,
}: ThinkingOrbProps) => {
  const frame = useSharedValue<OrbSink>(EMPTY);
  const { mode, speed: baseSpeed, opts } = useMemo(() => resolvePreset(state, size), [state, size]);

  useEffect(() => {
    const draw = MODE_DRAWS[mode];
    const effSpeed = baseSpeed * speed;

    const render = (tSec: number) => {
      const sink = createSink();
      draw(sink, size, tSec, dark, opts);
      // Свежий объект на кадр: Reanimated копирует значение при присваивании,
      // и переиспользованный массив пришлось бы копировать ещё раз руками.
      frame.value = sink;
    };

    // Первый кадр рисуем всегда — даже на паузе и до ответа AccessibilityInfo.
    render(paused ? 0.6 : (Date.now() / 1000) * effSpeed);
    if (paused) return;

    let raf = 0;
    let cancelled = false;
    const loop = () => {
      render((Date.now() / 1000) * effSpeed);
      raf = requestAnimationFrame(loop);
    };

    // «Уменьшение движения» — один статичный кадр, как в оригинале.
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) render(0.6);
      else raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [mode, baseSpeed, opts, size, speed, dark, paused, frame]);

  const picture = useDerivedValue(() => {
    const { dots, lines } = frame.value;
    return createPicture(
      (canvas) => {
        const ink = Float32Array.of(1, 1, 1, 1);

        if (lines.length > 0) {
          const stroke = Skia.Paint();
          stroke.setAntiAlias(true);
          stroke.setStyle(PaintStyle.Stroke);
          for (let i = 0; i < lines.length; i += 7) {
            const g = lines[i + 4];
            ink[0] = g;
            ink[1] = g;
            ink[2] = g;
            ink[3] = lines[i + 5];
            stroke.setColor(ink);
            stroke.setStrokeWidth(lines[i + 6]);
            canvas.drawLine(lines[i], lines[i + 1], lines[i + 2], lines[i + 3], stroke);
          }
        }

        const fill = Skia.Paint();
        fill.setAntiAlias(true);
        for (let i = 0; i < dots.length; i += 5) {
          const g = dots[i + 3];
          ink[0] = g;
          ink[1] = g;
          ink[2] = g;
          ink[3] = dots[i + 4];
          fill.setColor(ink);
          canvas.drawCircle(dots[i], dots[i + 1], dots[i + 2], fill);
        }
      },
      { width: size, height: size },
    );
  });

  return (
    <Canvas
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? LABELS[state]}
      // Плоский объект, а не массив: в вебе Skia отдаёт style прямо в DOM,
      // а React DOM массив стилей не принимает.
      style={StyleSheet.flatten([{ width: size, height: size }, style])}
    >
      <Picture picture={picture} />
    </Canvas>
  );
};
