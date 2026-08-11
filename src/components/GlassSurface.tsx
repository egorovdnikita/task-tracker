import React, { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';
import { meshes, strokes, type MeshName, type StrokeName } from '../theme/tokens';

export type MeshBlob = {
  /** Центр эллипса в долях от размера поверхности; допускается выход за 0..1. */
  x: number;
  y: number;
  /** Радиусы в долях от ширины/высоты. */
  rx: number;
  ry: number;
  color: string;
  opacity?: number;
};

export type GlassSurfaceProps = {
  /** Меш из мягких эллипсов вместо линейного градиента. */
  mesh?: MeshName | readonly MeshBlob[] | null;
  /** Градиентная обводка: подхватывает свет меша, поэтому не однотонная. */
  stroke?: StrokeName | { from: string; to: string } | null;
  strokeWidth?: number;
  /** Интенсивность матового стекла; null — без блюра. */
  blurIntensity?: number | null;
  /** Подложка под меш. */
  tint?: string;
  radius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
  pointerEventsNone?: boolean;
};

/**
 * Профиль затухания эллипса. Линейный градиент даёт видимое кольцо на краю,
 * поэтому приближаем гауссову кривую несколькими стопами — край растворяется.
 */
const FALLOFF: [number, number][] = [
  [0, 1],
  [20, 0.92],
  [40, 0.72],
  [58, 0.48],
  [74, 0.26],
  [88, 0.09],
  [100, 0],
];

const resolveMesh = (mesh: GlassSurfaceProps['mesh']): readonly MeshBlob[] => {
  if (!mesh) return [];
  return typeof mesh === 'string' ? meshes[mesh] : mesh;
};

const resolveStroke = (stroke: GlassSurfaceProps['stroke']) => {
  if (!stroke) return null;
  return typeof stroke === 'string' ? strokes[stroke] : stroke;
};

/**
 * Базовая поверхность новой системы: матовое стекло + меш из размытых эллипсов
 * + сложная градиентная обводка.
 *
 * Мягкие эллипсы рисуются радиальными градиентами, затухающими в прозрачность,
 * а не размытием: `FeGaussianBlur` в react-native-svg поддержан неравномерно
 * по платформам, а радиальный градиент даёт тот же визуальный результат
 * одинаково на iOS, Android и в вебе.
 */
export const GlassSurface = ({
  mesh = null,
  stroke = null,
  strokeWidth = 1,
  blurIntensity = null,
  tint,
  radius,
  style,
  children,
  pointerEventsNone = false,
}: GlassSurfaceProps) => {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  // id градиентов глобальны в документе — без префикса два экземпляра
  // поверхности на одном экране перебьют определения друг друга.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const r = radius ?? theme.radius.lg;
  const blobs = resolveMesh(mesh);
  const strokeSpec = resolveStroke(stroke);
  const ready = size.width > 0 && size.height > 0;

  /**
   * Радиус для SVG-обводки, приведённый к тому же контуру, что рисует CSS.
   *
   * `radius.pill` — это 999: CSS ужимает такой border-radius пропорционально
   * и получает пилюлю, а SVG клампит `rx` и `ry` независимо (до width/2 и
   * height/2) и получает из прямоугольника 92×52 честный эллипс. Именно он и
   * лез поверх кнопок светлым контуром. Один общий минимум убирает расхождение.
   */
  const svgRadius = Math.min(r, size.width / 2, size.height / 2);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  return (
    <View
      onLayout={onLayout}
      pointerEvents={pointerEventsNone ? 'none' : undefined}
      style={[{ borderRadius: r, overflow: 'hidden' }, style]}
    >
      {blurIntensity != null ? (
        <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}

      {tint ? <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} /> : null}

      {ready && (blobs.length > 0 || strokeSpec) ? (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            {blobs.map((blob, i) => (
              <RadialGradient key={`g${i}`} id={`${uid}-blob${i}`} cx="50%" cy="50%" r="50%">
                {FALLOFF.map(([offset, k]) => (
                  <Stop
                    key={offset}
                    offset={`${offset}%`}
                    stopColor={blob.color}
                    stopOpacity={(blob.opacity ?? 1) * k}
                  />
                ))}
              </RadialGradient>
            ))}
            {strokeSpec ? (
              <LinearGradient id={`${uid}-edge`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={strokeSpec.from} />
                <Stop offset="100%" stopColor={strokeSpec.to} />
              </LinearGradient>
            ) : null}
          </Defs>

          {blobs.map((blob, i) => (
            <Ellipse
              key={`e${i}`}
              cx={blob.x * size.width}
              cy={blob.y * size.height}
              rx={blob.rx * size.width}
              ry={blob.ry * size.height}
              fill={`url(#${uid}-blob${i})`}
            />
          ))}

          {strokeSpec ? (
            <Rect
              x={strokeWidth / 2}
              y={strokeWidth / 2}
              width={Math.max(size.width - strokeWidth, 0)}
              height={Math.max(size.height - strokeWidth, 0)}
              rx={Math.max(svgRadius - strokeWidth / 2, 0)}
              ry={Math.max(svgRadius - strokeWidth / 2, 0)}
              fill="none"
              stroke={`url(#${uid}-edge)`}
              strokeWidth={strokeWidth}
            />
          ) : null}
        </Svg>
      ) : null}

      {children}
    </View>
  );
};
