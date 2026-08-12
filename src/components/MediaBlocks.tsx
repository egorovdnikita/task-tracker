import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../theme';
import type { NoteBlock } from '../types';
import { blockSummary, formatDuration } from '../utils/blocks';
import { Symbol } from './Symbol';
import { Text } from './Text';
import { Waveform } from './Waveform';

type VoiceBlock = Extract<NoteBlock, { type: 'voice' }>;
type ScanBlock = Extract<NoteBlock, { type: 'scan' }>;
type SketchBlock = Extract<NoteBlock, { type: 'sketch' }>;

/**
 * Оболочка медиа-блока.
 *
 * У записи и скана есть подпись, и она — не украшение: расшифровки и
 * распознавания текста в Expo Go нет, поэтому подпись остаётся единственным,
 * чем блок находится поиском.
 */
const BlockShell = ({
  icon,
  summary,
  title,
  placeholder,
  onChangeTitle,
  onRemove,
  children,
}: {
  icon: Parameters<typeof Symbol>[0]['name'];
  summary: string;
  title?: string;
  placeholder?: string;
  onChangeTitle?: (value: string) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) => {
  const theme = useTheme();

  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.secondarySystemGroupedBackground,
        padding: theme.spacing.md,
        gap: theme.spacing.md,
      }}
    >
      <View style={[styles.head, { gap: theme.spacing.sm }]}>
        <Symbol name={icon} size={16} color={theme.colors.secondaryLabel} />

        {onChangeTitle ? (
          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholderText}
            style={[theme.text('subheadline', 'semibold'), styles.grow, { color: theme.colors.label, padding: 0 }]}
          />
        ) : (
          <Text variant="subheadline" weight="semibold" style={styles.grow}>
            {placeholder}
          </Text>
        )}

        <Text variant="caption1" color="tertiaryLabel">
          {summary}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Удалить блок"
          hitSlop={10}
          onPress={onRemove}
          style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
        >
          <Symbol name="minus.circle" size={18} color={theme.colors.tertiaryLabel} />
        </Pressable>
      </View>

      {children}
    </View>
  );
};

/**
 * Запись голоса в теле заметки. Плиты 04.1 и 04.2.
 *
 * Метки с дорожки записи никуда не деваются при прослушивании: они и заводились
 * ради того, чтобы вернуться к месту позже.
 */
export const VoiceBlockView = ({
  block,
  onChange,
  onRemove,
}: {
  block: VoiceBlock;
  onChange: (block: VoiceBlock) => void;
  onRemove: () => void;
}) => {
  const theme = useTheme();
  const player = useAudioPlayer({ uri: block.uri });
  const status = useAudioPlayerStatus(player);

  const duration = status.duration > 0 ? status.duration * 1000 : block.durationMs;
  const progress = duration > 0 ? (status.currentTime * 1000) / duration : 0;

  // Дорожка нарисована ровными столбиками: сохранять форму волны вместе с
  // записью значило бы хранить второй звук рядом со звуком. Здесь дорожка —
  // шкала перемотки, а не портрет сигнала.
  const bars = Array.from({ length: 48 }, (_, i) => 0.35 + 0.4 * Math.abs(Math.sin(i * 1.7)));

  return (
    <BlockShell
      icon="waveform"
      summary={formatDuration(duration)}
      title={block.title}
      placeholder="Голосовая заметка"
      onChangeTitle={(title) => onChange({ ...block, title })}
      onRemove={onRemove}
    >
      <View style={[styles.head, { gap: theme.spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={status.playing ? 'Пауза' : 'Воспроизвести'}
          onPress={() => (status.playing ? player.pause() : player.play())}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Symbol
            name={status.playing ? 'pause.circle.fill' : 'play.circle.fill'}
            size={38}
            color={theme.colors.accent}
          />
        </Pressable>

        <Waveform
          levels={bars}
          markers={block.markers.map((m) => m.atMs)}
          durationMs={duration}
          progress={progress}
          height={40}
          style={styles.grow}
        />
      </View>

      {block.markers.length > 0 ? (
        <View style={[styles.markers, { gap: theme.spacing.sm }]}>
          {block.markers.map((marker) => (
            <Pressable
              key={marker.id}
              accessibilityRole="button"
              accessibilityLabel={`Перемотать на ${formatDuration(marker.atMs)}`}
              onPress={() => player.seekTo(marker.atMs / 1000)}
              style={({ pressed }) => [
                styles.marker,
                {
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.tertiarySystemFill,
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
            >
              <Text variant="caption1" color="secondaryLabel">
                {formatDuration(marker.atMs)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </BlockShell>
  );
};

/** Скан документа в теле заметки. Плита 04.3. */
export const ScanBlockView = ({
  block,
  onChange,
  onRemove,
}: {
  block: ScanBlock;
  onChange: (block: ScanBlock) => void;
  onRemove: () => void;
}) => {
  const theme = useTheme();

  return (
    <BlockShell
      icon="doc.text.viewfinder"
      summary={blockSummary(block)}
      title={block.title}
      placeholder="Скан документа"
      onChangeTitle={(title) => onChange({ ...block, title })}
      onRemove={onRemove}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
        {block.pages.map((page, index) => (
          <View key={page.id} style={{ gap: 4 }}>
            <Image
              source={{ uri: page.uri }}
              accessibilityLabel={`Страница ${index + 1}`}
              style={[
                styles.page,
                { borderRadius: theme.radius.sm, borderColor: theme.colors.separator },
              ]}
            />
            <Text variant="caption2" color="tertiaryLabel" style={styles.center}>
              {index + 1}
            </Text>
          </View>
        ))}
      </ScrollView>
    </BlockShell>
  );
};

/** Рисунок в теле заметки. Плита 04.4. Нажатие открывает дорисовку. */
export const SketchBlockView = ({
  block,
  onEdit,
  onRemove,
}: {
  block: SketchBlock;
  onEdit: () => void;
  onRemove: () => void;
}) => {
  const theme = useTheme();

  // Холст рисовался в своих размерах, а карточка уже другой ширины: сжимаем
  // содержимое через viewBox, чтобы штрихи не уехали за край.
  const viewBox = `0 0 ${Math.max(1, block.width)} ${Math.max(1, block.height)}`;

  return (
    <BlockShell icon="scribble" summary={blockSummary(block)} placeholder="Рисунок" onRemove={onRemove}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Дорисовать"
        onPress={onEdit}
        style={({ pressed }) => [
          styles.sketch,
          {
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.tertiarySystemFill,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {block.strokes.map((stroke) => (
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
        </Svg>
      </Pressable>
    </BlockShell>
  );
};

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  center: { textAlign: 'center' },
  markers: { flexDirection: 'row', flexWrap: 'wrap' },
  marker: { paddingHorizontal: 10, paddingVertical: 4 },
  page: { width: 92, height: 124, borderWidth: 1 },
  sketch: { height: 160, overflow: 'hidden' },
});
