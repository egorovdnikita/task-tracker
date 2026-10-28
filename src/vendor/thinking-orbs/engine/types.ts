// Engine-level contracts shared by every mode implementation.
//
// Отличие от оригинала: вместо `CanvasRenderingContext2D` режимы получают
// `OrbSink` — тот же контракт «нарисуй кадр», только результат складывается
// в плоские массивы, а не в canvas. Сигнатура в остальном не тронута.

import type { ModeOpts } from './profiles';

export type { Dot, Line, OrbSink } from './core';

import type { OrbSink } from './core';

/** One frame painter: draws a mode into a sink at logical-px `size`. */
export type ModeDraw = (
  sink: OrbSink,
  size: number,
  t: number,
  dark: boolean,
  opts: ModeOpts
) => void;
