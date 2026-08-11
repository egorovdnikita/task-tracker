import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { Glass, IconButton, Text } from '../../src/components';
import { useTheme } from '../../src/theme';
import { makeId, makeSketchBlock } from '../../src/utils/blocks';
import type { SketchStroke } from '../../src/types';
import { useNotesStore } from '../../src/store/useNotesStore';

/** Толщины пера. Выбираются кружками — размер кружка и есть толщина. */
const WIDTHS = [2, 4, 8, 16];

/** Палитра пера: те же системные акценты плюс цвет текста. */
const PEN_ACCENTS = ['blue', 'red', 'orange', 'green', 'purple'] as const;

/**
 * Плита 04.4 — рисунок.
 *
 * Штрихи хранятся вектором, а не картинкой: по вайрфрейму скетч можно
 * дорисовать позже, а к растру вернуться уже нельзя — только положить сверху
 * ещё один слой.
 *
 * PencilKit здесь не используется: `PKCanvasView` даёт распознавание нажима
 * стилуса и игнорирование ладони, но обёртки для него в Expo Go нет. Ладонь
 * поэтому не отсекается — об этом честнее сказать, чем сделать вид.
 */
export default function SketchCaptureScreen() {
  const { id, block: blockId } = useLocalSearchParams<{ id?: string; block?: string }>();
  const theme = useTheme();

  const notes = useNotesStore((s) => s.notes);
  const setBlocks = useNotesStore((s) => s.setBlocks);
  const createNote = useNotesStore((s) => s.createNote);

  const note = notes.find((n) => n.id === id) ?? null;
  const existing = useMemo(() => {
    const found = note?.blocks.find((b) => b.id === blockId);
    return found?.type === 'sketch' ? found : null;
  }, [note, blockId]);

  const [strokes, setStrokes] = useState<SketchStroke[]>(existing?.strokes ?? []);
  const [current, setCurrent] = useState<string>('');
  const [width, setWidth] = useState(4);
  const [accent, setAccent] = useState<(typeof PEN_ACCENTS)[number]>('blue');
  const [canvas, setCanvas] = useState({ width: existing?.width ?? 0, height: existing?.height ?? 0 });

  // Перо держим в ref, а не в состоянии: PanResponder создаётся один раз, и
  // замыкание на состоянии заморозило бы в нём цвет и толщину первого штриха.
  const pen = useRef({ width, color: theme.accent(accent) });
  pen.current = { width, color: theme.accent(accent) };

  const path = useRef('');

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          path.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          setCurrent(path.current);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          path.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          setCurrent(path.current);
        },
        onPanResponderRelease: () => {
          const d = path.current;
          path.current = '';
          setCurrent('');
          // Точка без движения — тоже штрих: ставить точки карандашом законно.
          if (d) {
            setStrokes((s) => [
              ...s,
              { id: makeId(), d, color: pen.current.color, width: pen.current.width },
            ]);
          }
        },
      }),
    [],
  );

  const measure = (event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    setCanvas({ width: w, height: h });
  };

  const finish = () => {
    if (strokes.length === 0) {
      router.back();
      return;
    }

    const block = makeSketchBlock(strokes, canvas.width, canvas.height);

    if (note && existing) {
      // Дорисовка: заменяем содержимое того же блока, чтобы не плодить копии.
      setBlocks(
        note.id,
        note.blocks.map((b) => (b.id === existing.id ? { ...block, id: existing.id } : b)),
      );
      router.back();
      return;
    }

    if (note) {
      setBlocks(note.id, [...note.blocks, block]);
      router.back();
      return;
    }

    const created = createNote({ blocks: [block] });
    router.replace({ pathname: '/note/[id]', params: { id: created.id } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Дорисовать' : 'Рисунок',
          headerLeft: () => (
            <IconButton name="xmark" accessibilityLabel="Отменить" onPress={() => router.back()} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
              <IconButton
                name="arrow.uturn.backward"
                accessibilityLabel="Отменить штрих"
                disabled={strokes.length === 0}
                onPress={() => setStrokes((s) => s.slice(0, -1))}
              />
              <IconButton
                name="checkmark"
                accessibilityLabel="Готово"
                disabled={strokes.length === 0}
                onPress={finish}
              />
            </View>
          ),
        }}
      />

      <View style={styles.root}>
        <View
          onLayout={measure}
          {...responder.panHandlers}
          style={[styles.canvas, { backgroundColor: theme.colors.secondarySystemGroupedBackground }]}
        >
          <Svg style={StyleSheet.absoluteFill}>
            {strokes.map((stroke) => (
              <Path
                key={stroke.id}
                d={stroke.d}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {current ? (
              <Path
                d={current}
                stroke={theme.accent(accent)}
                strokeWidth={width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}
          </Svg>

          {strokes.length === 0 && !current ? (
            <View pointerEvents="none" style={styles.hint}>
              <Text variant="subheadline" color="tertiaryLabel">
                Рисуйте пальцем или стилусом
              </Text>
            </View>
          ) : null}
        </View>

        <Glass
          material="chrome"
          variant="regular"
          style={[styles.tools, { padding: theme.spacing.lg, gap: theme.spacing.xl }]}
        >
          <View style={[styles.group, { gap: theme.spacing.md }]}>
            {WIDTHS.map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`Толщина ${value}`}
                accessibilityState={{ selected: width === value }}
                onPress={() => setWidth(value)}
                hitSlop={8}
                style={{
                  width: 26,
                  height: 26,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 13,
                  backgroundColor: width === value ? theme.colors.systemFill : 'transparent',
                }}
              >
                <View
                  style={{
                    width: value + 4,
                    height: value + 4,
                    borderRadius: (value + 4) / 2,
                    backgroundColor: theme.colors.label,
                  }}
                />
              </Pressable>
            ))}
          </View>

          <View style={[styles.group, { gap: theme.spacing.md }]}>
            {PEN_ACCENTS.map((name) => (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityLabel={`Цвет ${name}`}
                accessibilityState={{ selected: accent === name }}
                onPress={() => setAccent(name)}
                hitSlop={8}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: theme.accent(name),
                  borderWidth: accent === name ? 3 : 0,
                  borderColor: theme.colors.label,
                }}
              />
            ))}
          </View>
        </Glass>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  canvas: { flex: 1 },
  hint: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  group: { flexDirection: 'row', alignItems: 'center' },
});
