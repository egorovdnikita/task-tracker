import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { Button, IconButton, Text } from '../../src/components';
import { Waveform } from '../../src/components/Waveform';
import { useTheme } from '../../src/theme';
import { persistMedia } from '../../src/features/media';
import { formatDuration, makeVoiceBlock } from '../../src/utils/blocks';
import type { VoiceMarker } from '../../src/types';
import { useNotesStore } from '../../src/store/useNotesStore';

/**
 * Плита 04.1 — запись голоса.
 *
 * Экран занят одним делом, и всё на нём про одно: слышно ли микрофон. Волна
 * отражает громкость в реальном времени — это не украшение, а единственное
 * подтверждение, что запись идёт. Таймер говорит сколько, волна — что вообще.
 */
export default function VoiceCaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const notes = useNotesStore((s) => s.notes);
  const setBlocks = useNotesStore((s) => s.setBlocks);
  const createNote = useNotesStore((s) => s.createNote);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 100);

  const [denied, setDenied] = useState(false);
  const [markers, setMarkers] = useState<VoiceMarker[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const started = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (cancelled) return;
      if (!granted) {
        setDenied(true);
        return;
      }

      // Запись обязана идти и в «беззвучном» режиме: иначе переключатель на
      // боку телефона молча выключает микрофон, и человек узнаёт об этом,
      // когда запись уже не переснять.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      if (cancelled) return;

      recorder.record();
      started.current = true;
    })();

    return () => {
      cancelled = true;
      if (started.current) recorder.stop().catch(() => {});
    };
    // Записываем ровно один раз за открытие экрана.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Метринг приходит в dBFS: 0 — предел, около −60 — тишина. Приводим к доле,
  // иначе волна на обычной речи почти не отходит от нуля.
  useEffect(() => {
    if (!state.isRecording) return;
    const db = state.metering ?? -60;
    const level = Math.max(0, Math.min(1, (db + 60) / 60));
    setLevels((current) => [...current.slice(-119), level]);
  }, [state.metering, state.isRecording, state.durationMillis]);

  const duration = state.durationMillis ?? 0;

  const markerLabel = useMemo(
    () => (markers.length === 0 ? 'Метка' : `Метка · ${markers.length}`),
    [markers.length],
  );

  const finish = async () => {
    await recorder.stop();
    started.current = false;

    const source = recorder.uri ?? state.url;
    if (!source) {
      router.back();
      return;
    }

    const uri = persistMedia(source, 'm4a');
    const block = makeVoiceBlock(uri, duration, markers);

    const note = notes.find((n) => n.id === id);
    if (note) {
      setBlocks(note.id, [...note.blocks, block]);
      router.back();
      return;
    }

    // Запись из шторки создания: заметки ещё нет, и она заводится вокруг записи.
    const created = createNote({ blocks: [block] });
    router.replace({ pathname: '/note/[id]', params: { id: created.id } });
  };

  const cancel = async () => {
    if (started.current) await recorder.stop().catch(() => {});
    started.current = false;
    router.back();
  };

  if (denied) {
    return (
      <>
        <Stack.Screen options={{ title: 'Запись' }} />
        <View style={[styles.center, { padding: theme.spacing.xxxl, gap: theme.spacing.md }]}>
          <Text variant="title3" weight="semibold" style={styles.middle}>
            Нет доступа к микрофону
          </Text>
          <Text variant="subheadline" color="secondaryLabel" style={styles.middle}>
            Разрешите доступ в «Настройках» → «Конфиденциальность» → «Микрофон», и запись заработает.
          </Text>
          <Button title="Закрыть" variant="tinted" onPress={() => router.back()} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Запись',
          headerLeft: () => (
            <IconButton name="xmark" accessibilityLabel="Отменить запись" onPress={cancel} />
          ),
        }}
      />

      <View style={[styles.root, { padding: theme.spacing.xl, gap: theme.spacing.xxl }]}>
        <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
          <Text variant="largeTitle" weight="semibold">
            {formatDuration(duration)}
          </Text>
          <Text variant="footnote" color="secondaryLabel">
            {state.isRecording ? 'Идёт запись' : 'Пауза'}
          </Text>
        </View>

        <Waveform levels={levels} markers={markers.map((m) => m.atMs)} durationMs={duration} />

        <View style={[styles.controls, { gap: theme.spacing.xxl }]}>
          <Button
            title={markerLabel}
            variant="gray"
            icon="mappin"
            // Метка ставится по текущему времени: к ней потом можно вернуться
            // при прослушивании.
            onPress={() => setMarkers((m) => [...m, { id: `${duration}`, atMs: duration }])}
            disabled={!state.isRecording}
          />

          <Button
            title={state.isRecording ? 'Пауза' : 'Продолжить'}
            variant="tinted"
            icon={state.isRecording ? 'pause.fill' : 'play.fill'}
            onPress={() => {
              if (state.isRecording) recorder.pause();
              else recorder.record();
            }}
          />
        </View>

        <Button
          title="Готово"
          variant="filled"
          size="large"
          fullWidth
          disabled={duration < 500}
          onPress={finish}
        />

        <Text variant="caption1" color="tertiaryLabel" style={styles.middle}>
          Запись хранится на устройстве и никуда не отправляется. Расшифровки нет: она живёт во
          фреймворке Speech, которого Expo Go не даёт.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  middle: { textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center' },
});
