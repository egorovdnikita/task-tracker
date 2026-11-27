import { sketchViewport } from '../../src/utils/sketchViewport';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirmDestructive } from '../../src/utils/actionSheet';
import { ScreenBackdrop } from '../../src/components/ScreenBackdrop';
import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { Fab, HeaderGlass, MenuButton, Symbol, IconButton, Text, headerItems } from '../../src/components';
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
  const {
    id,
    block: blockId,
    folder,
    tag,
  } = useLocalSearchParams<{
    id?: string;
    block?: string;
    folder?: string;
    tag?: string;
  }>();
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

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
  const [canvas, setCanvas] = useState({
    width: existing?.width ?? 0,
    height: existing?.height ?? 0,
  });

  // Перо держим в ref, а не в состоянии: PanResponder создаётся один раз, и
  // замыкание на состоянии заморозило бы в нём цвет и толщину первого штриха.
  const pen = useRef({ width, color: theme.accent(accent) });
  pen.current = { width, color: theme.accent(accent) };

  const path = useRef('');
  const viewport = useRef(sketchViewport({ width: 0, height: 0 }, existing));

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const point = viewport.current.point(event.nativeEvent.locationX, event.nativeEvent.locationY);
          const locationX = point.x, locationY = point.y;
          path.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          setCurrent(path.current);
        },
        onPanResponderMove: (event) => {
          const point = viewport.current.point(event.nativeEvent.locationX, event.nativeEvent.locationY);
          const locationX = point.x, locationY = point.y;
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
    viewport.current = sketchViewport({ width: w, height: h }, existing);
    setCanvas({ width: viewport.current.width, height: viewport.current.height });
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

    const created = createNote({
      blocks: [block],
      // Начато из папки или тега — заметка ложится туда же.
      folderId: folder ?? null,
      tags: tag ? [tag] : [],
    });
    router.replace({ pathname: '/note/[id]', params: { id: created.id } });
  };

  return (
    <>
      <ScreenBackdrop />
      <Stack.Screen
        options={{
          title: existing ? 'Дорисовать' : 'Рисунок',
          unstable_headerLeftItems: headerItems(() => (
            <HeaderGlass><IconButton name="chevron.left" accessibilityLabel="Назад" onPress={() => router.back()} /></HeaderGlass>
          )),

        }}
      />

      <View style={[styles.root, { paddingHorizontal: 16, paddingTop: headerHeight + 12, paddingBottom: insets.bottom + 16, gap: 16 }]}>
        <View
          onLayout={measure}
          {...responder.panHandlers}
          style={[
            styles.canvas,
            { backgroundColor: theme.colors.secondarySystemGroupedBackground, borderRadius: 32, overflow: 'hidden' },
          ]}
        >
          <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${Math.max(1, canvas.width)} ${Math.max(1, canvas.height)}`} preserveAspectRatio="xMinYMin meet">
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

        <View style={styles.tools}>
          <HeaderGlass><MenuButton accessibilityLabel="Толщина пера" items={() => [{ title: 'Отменить штрих', icon: 'arrow.uturn.backward', disabled: strokes.length === 0, onPress: () => setStrokes(s => s.slice(0, -1)) }, ...WIDTHS.map(value => ({ title: `Толщина ${value}`, checked: width === value, onPress: () => setWidth(value) }))]} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Symbol name="pencil" size={22} color={theme.colors.onBackdrop} /></MenuButton></HeaderGlass>
          <HeaderGlass><MenuButton accessibilityLabel="Цвет пера" items={() => PEN_ACCENTS.map(name => ({ title: name === 'blue' ? 'Синий' : name === 'red' ? 'Красный' : name === 'orange' ? 'Оранжевый' : name === 'green' ? 'Зелёный' : 'Фиолетовый', checked: accent === name, onPress: () => setAccent(name) }))} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Symbol name="scribble" size={22} color={theme.colors.onBackdrop} /></MenuButton></HeaderGlass>
          <HeaderGlass><IconButton name="trash" accessibilityLabel="Очистить рисунок" disabled={!strokes.length} onPress={() => confirmDestructive('Очистить рисунок?', 'Штрихи в текущем черновике будут удалены.', 'Очистить', () => setStrokes([]))} /></HeaderGlass>
          <Fab compact icon="checkmark" accessibilityLabel="Готово" disabled={!strokes.length} onPress={finish} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  canvas: { flex: 1 },
  hint: { position: 'absolute', left: 20, right: 20, top: 20, alignItems: 'center' },
  tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  group: { flexDirection: 'row', alignItems: 'center' },
});
