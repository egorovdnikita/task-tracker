import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '../theme';
import { Text } from './Text';

export type StatRingProps = {
  value: string;
  label: string;
  /** Заполнение кольца, 0…1. Без него кольцо ровное, без прогресса. */
  progress?: number;
};

const SIZE = 64;
const STROKE = 3;

/**
 * Показатель с кольцом — как «53 Sleep / 90 Focus / 100 Rest» на главной
 * Opal: число в тонком кольце, подпись под ним. Кольцо — ось акцента лайм →
 * аква, трек — тёмный, как у колец Opal.
 */
export const StatRing = ({ value, label, progress = 1 }: StatRingProps) => {
  const theme = useTheme();
  const r = (SIZE - STROKE) / 2;
  const length = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.root, { gap: theme.spacing.sm }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#DCFEAA" />
              <Stop offset="1" stopColor="#BBFBE7" />
            </LinearGradient>
          </Defs>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke="#2B2F2C" strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={r}
            stroke="url(#ring)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${length * p} ${length}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text variant="headline" weight="semibold" style={{ fontVariant: ['tabular-nums'] }}>
            {value}
          </Text>
        </View>
      </View>
      <Text variant="footnote" weight="semibold" color="secondaryLabel">
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
