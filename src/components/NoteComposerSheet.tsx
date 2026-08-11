import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '../theme/ThemeProvider';
import type { NoteGlow } from '../theme/tokens';
import { AppText } from './AppText';
import { Chip } from './Chip';
import { ColorPicker } from './ColorPicker';
import { GlassSurface } from './GlassSurface';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { TextField } from './TextField';
import { useKeyboardVisible } from '../utils/useKeyboardVisible';

export type NoteComposerDraft = {
  title: string;
  body: string;
  tag: string | null;
  glow: NoteGlow;
  pinned: boolean;
};

export type NoteComposerSheetProps = {
  visible: boolean;
  tags: string[];
  onCancel?: () => void;
  onCreate?: (draft: NoteComposerDraft) => void;
  /** Рендер без Modal — для сторис. */
  inline?: boolean;
};

const EMPTY: NoteComposerDraft = { title: '', body: '', tag: null, glow: 'none', pinned: false };

/**
 * Создание заметки — шит, а не отдельный экран.
 *
 * Раскладка снята с эталона («Name Your Rule»): грабер, слева круглая
 * кнопка закрытия, по центру заголовок, справа круглая кнопка подтверждения
 * акцентным цветом. Подтверждение стоит в шапке, а не внизу: у шита нет
 * фиксированной высоты — под клавиатурой нижняя кнопка уезжает за край.
 *
 * Почему шит, а не экран: создание — короткий заход на один-два абзаца,
 * и после сохранения человек возвращается в список. Полный push с уходом
 * списка из-под рук обещает работу длиннее, чем она есть.
 */
export const NoteComposerSheet = ({
  visible,
  tags,
  onCancel,
  onCreate,
  inline = false,
}: NoteComposerSheetProps) => {
  const theme = useTheme();
  const keyboardVisible = useKeyboardVisible();
  const [draft, setDraft] = useState<NoteComposerDraft>(EMPTY);

  // Каждое открытие — с чистого листа: черновик прошлого захода в шите
  // выглядел бы как незаконченная работа, которой человек не давал имени.
  useEffect(() => {
    if (visible) setDraft(EMPTY);
  }, [visible]);

  if (!visible) return null;

  const patch = (next: Partial<NoteComposerDraft>) => setDraft((prev) => ({ ...prev, ...next }));
  const canCreate = Boolean(draft.title.trim() || draft.body.trim());

  const sheet = (
    <View style={styles.overlay}>
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
        accessibilityLabel="Закрыть"
        onPress={onCancel}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GlassSurface
          blurIntensity={60}
          mesh="card"
          stroke="glass"
          tint={theme.tints.glass}
          glassStyle="clear"
          radius={theme.radius.xl}
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.xxxl,
            gap: theme.spacing.lg,
            // Зазор до клавиатуры: `behavior="padding"` сажает шит вплотную
            // к её кромке, и нижнее поле упирается в ряд клавиш.
            marginBottom: keyboardVisible ? 10 : 0,
          }}
        >
          <View style={[styles.grabber, { backgroundColor: theme.colors.borderStrong }]} />

          <View style={styles.header}>
            <IconButton name="close" accessibilityLabel="Отменить" onPress={onCancel} />
            <AppText variant="heading">Новая заметка</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Создать заметку"
              accessibilityState={{ disabled: !canCreate }}
              disabled={!canCreate}
              onPress={() => onCreate?.(draft)}
              style={({ pressed }) => ({ opacity: !canCreate ? 0.35 : pressed ? 0.7 : 1 })}
              testID="composer-create"
            >
              <GlassSurface
                mesh="fab"
                liquid={false}
                tint={theme.colors.accentLime}
                radius={theme.sizes.iconButton / 2}
                style={styles.confirm}
              >
                <Icon name="check" size={20} tone="inverse" strokeWidth={2.2} />
              </GlassSurface>
            </Pressable>
          </View>

          <TextField
            value={draft.title}
            onChangeText={(title) => patch({ title })}
            placeholder="Заголовок"
            size="title"
            autoFocus
            testID="composer-title"
          />

          <TextField
            value={draft.body}
            onChangeText={(body) => patch({ body })}
            placeholder="Текст заметки..."
            multiline
            inputStyle={{ minHeight: 96 }}
            style={{ minHeight: 120 }}
            testID="composer-body"
          />

          {tags.length > 0 ? (
            <View style={styles.chipRow}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={draft.tag === tag}
                  onPress={() => patch({ tag: draft.tag === tag ? null : tag })}
                />
              ))}
            </View>
          ) : null}

          <ColorPicker value={draft.glow} onChange={(glow) => patch({ glow })} />
        </GlassSurface>
      </KeyboardAvoidingView>
    </View>
  );

  if (inline) return sheet;

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onCancel}>
      {sheet}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confirm: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
