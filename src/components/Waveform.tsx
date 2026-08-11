import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export type WaveformProps = {
  /** Громкость по столбикам, 0…1. Последний элемент — «сейчас». */
  levels: number[];
  /** Метки на дорожке, в миллисекундах от начала. */
  markers?: number[];
  durationMs?: number;
  /** Доля проигранного, 0…1 — для плеера. У записи не задаётся. */
  progress?: number;
  height?: number;
  style?: ViewStyle;
};

const BARS = 48;

/**
 * Дорожка звука.
 *
 * Столбиками, а не сплошной кривой: столбик — это отсчёт громкости, и по нему
 * видно, что замеры приходят. Сплошная линия сглаживает паузы и на тишине
 * выглядит ровно так же, как на речи, — то есть врёт ровно там, где от неё
 * ждут ответа «микрофон слышит?».
 *
 * Рисуется вьюхами, а не холстом: сорок восемь прямоугольников дешевле любого
 * канваса, а вьюхи умеют то, чего не умеет свой рендер, — расти вместе с
 * системным шрифтом и не сбиваться при повороте.
 */
export const Waveform = ({
  levels,
  markers = [],
  durationMs = 0,
  progress,
  height = 96,
  style,
}: WaveformProps) => {
  const theme = useTheme();

  // Берём хвост: дорожка показывает недавнее, а не всю запись целиком —
  // сжимать полчаса записи в ширину экрана бессмысленно.
  const shown = levels.slice(-BARS);
  const padding = Array.from({ length: Math.max(0, BARS - shown.length) }, () => 0);
  const bars = [...padding, ...shown];

  return (
    <View style={[{ height }, style]}>
      <View style={styles.track}>
        {bars.map((level, index) => {
          const played = progress !== undefined && index / BARS <= progress;
          return (
            <View
              key={index}
              style={{
                flex: 1,
                // Минимум в 2pt: пустой столбик всё равно должен быть виден,
                // иначе на паузе дорожка выглядит сломанной, а не тихой.
                height: Math.max(2, level * height),
                borderRadius: theme.radius.pill,
                backgroundColor:
                  progress === undefined || played
                    ? theme.colors.systemBlue
                    : theme.colors.quaternaryLabel,
              }}
            />
          );
        })}
      </View>

      {durationMs > 0
        ? markers.map((at) => (
            <View
              key={at}
              accessibilityLabel={`Метка на ${Math.round(at / 1000)} секунде`}
              style={[
                styles.marker,
                {
                  left: `${Math.min(100, (at / durationMs) * 100)}%`,
                  backgroundColor: theme.colors.systemOrange,
                },
              ]}
            />
          ))
        : null}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, borderRadius: 1 },
});
