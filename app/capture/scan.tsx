import React, { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { Button, Glass, IconButton, Symbol, Text } from '../../src/components';
import { useTheme } from '../../src/theme';
import { persistMedia } from '../../src/features/media';
import { makeId, makeScanBlock } from '../../src/utils/blocks';
import type { ScanPage } from '../../src/types';
import { useNotesStore } from '../../src/store/useNotesStore';

/**
 * Плита 04.3 — скан документа.
 *
 * Многостраничный режим по умолчанию: счётчик справа, миниатюра последней
 * страницы слева. Снимать по одной странице и каждый раз возвращаться в
 * заметку — самый частый способ сделать скан договора невыносимым.
 *
 * Автоматической рамки по границам листа здесь нет: её даёт
 * `VNDocumentCameraViewController`, который в Expo Go недоступен. Вместо
 * обещания, которого камера не выполнит, — честная рамка-подсказка и кадр
 * целиком.
 */
export default function ScanCaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const notes = useNotesStore((s) => s.notes);
  const setBlocks = useNotesStore((s) => s.setBlocks);
  const createNote = useNotesStore((s) => s.createNote);

  const [permission, requestPermission] = useCameraPermissions();
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [busy, setBusy] = useState(false);
  const camera = useRef<CameraView>(null);

  const shoot = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const shot = await camera.current?.takePictureAsync({ quality: 0.8, skipProcessing: false });
      if (shot?.uri) {
        setPages((current) => [
          ...current,
          {
            id: makeId(),
            uri: persistMedia(shot.uri, 'jpg'),
            width: shot.width,
            height: shot.height,
          },
        ]);
      }
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    if (pages.length === 0) return;
    const block = makeScanBlock(pages);

    const note = notes.find((n) => n.id === id);
    if (note) {
      setBlocks(note.id, [...note.blocks, block]);
      router.back();
      return;
    }

    const created = createNote({ blocks: [block] });
    router.replace({ pathname: '/note/[id]', params: { id: created.id } });
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <>
        <Stack.Screen options={{ title: 'Скан' }} />
        <View style={[styles.center, { padding: theme.spacing.xxxl, gap: theme.spacing.md }]}>
          <Symbol name="camera" size={52} color={theme.colors.quaternaryLabel} />
          <Text variant="title3" weight="semibold" style={styles.middle}>
            Нужен доступ к камере
          </Text>
          <Text variant="subheadline" color="secondaryLabel" style={styles.middle}>
            Снимки остаются на устройстве: в фотоплёнку и никуда наружу они не попадают.
          </Text>
          <Button
            title={permission.canAskAgain ? 'Разрешить' : 'Закрыть'}
            variant="tinted"
            onPress={() => (permission.canAskAgain ? requestPermission() : router.back())}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: pages.length > 0 ? `Страниц: ${pages.length}` : 'Скан',
          headerLeft: () => (
            <IconButton name="xmark" accessibilityLabel="Отменить" onPress={() => router.back()} />
          ),
          headerRight: () =>
            pages.length > 0 ? (
              <IconButton name="checkmark" accessibilityLabel="Готово" onPress={finish} />
            ) : null,
        }}
      />

      <View style={styles.root}>
        <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />

        {/* Рамка кадра — подсказка, куда класть лист, а не результат распознавания. */}
        <View pointerEvents="none" style={styles.frame}>
          <View style={[styles.guide, { borderColor: 'rgba(255,255,255,0.7)' }]} />
        </View>

        <Glass
          material="chrome"
          variant="regular"
          style={[styles.bar, { padding: theme.spacing.xl, gap: theme.spacing.xl }]}
        >
          {/* Миниатюра последней страницы слева — по ней видно, что снято. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              pages.length > 0 ? `Убрать последнюю страницу, всего ${pages.length}` : 'Пока пусто'
            }
            disabled={pages.length === 0}
            onPress={() => setPages((current) => current.slice(0, -1))}
            style={[
              styles.thumb,
              {
                borderRadius: theme.radius.sm,
                borderColor: theme.colors.separator,
                opacity: pages.length === 0 ? 0.3 : 1,
              },
            ]}
          >
            {pages.length > 0 ? (
              <Image source={{ uri: pages[pages.length - 1].uri }} style={styles.thumbImage} />
            ) : (
              <Symbol name="doc" size={20} color={theme.colors.tertiaryLabel} />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Снять страницу"
            onPress={shoot}
            disabled={busy}
            style={({ pressed }) => [
              styles.shutter,
              { borderColor: theme.colors.label, opacity: pressed || busy ? 0.5 : 1 },
            ]}
          >
            <View style={[styles.shutterCore, { backgroundColor: theme.colors.label }]} />
          </Pressable>

          <View style={styles.counter}>
            <Text variant="headline" weight="semibold">
              {pages.length}
            </Text>
            <Text variant="caption2" color="secondaryLabel">
              страниц
            </Text>
          </View>
        </Glass>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  middle: { textAlign: 'center' },
  frame: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  guide: { width: '82%', aspectRatio: 0.72, borderWidth: 2, borderRadius: 12, borderStyle: 'dashed' },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: { width: '100%', height: '100%' },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: 58, height: 58, borderRadius: 29 },
  counter: { width: 52, alignItems: 'center' },
});
