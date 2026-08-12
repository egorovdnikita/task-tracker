import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '../theme';
import type { ChecklistItem, NoteBlock } from '../types';
import { removeMedia } from '../features/media';
import { makeChecklistItem } from '../utils/blocks';
import { Checkbox } from './Checkbox';
import { ScanBlockView, SketchBlockView, VoiceBlockView } from './MediaBlocks';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type BlockEditorProps = {
  blocks: NoteBlock[];
  onChange: (blocks: NoteBlock[]) => void;
  /** Отмеченные пункты уезжают вниз. Настройка с плиты 03.3. */
  moveCheckedDown?: boolean;
  autoFocus?: boolean;
  /** Открыть рисунок на дорисовку. Плита 04.4. */
  onEditSketch?: (blockId: string) => void;
};

/**
 * Редактор тела заметки.
 *
 * Блоки лежат в потоке один за другим, а не по вкладкам: заметка одна, и
 * список задач внутри неё — часть того же текста, а не другой документ.
 */
export const BlockEditor = ({
  blocks,
  onChange,
  moveCheckedDown = true,
  autoFocus = false,
  onEditSketch,
}: BlockEditorProps) => {
  const theme = useTheme();

  const replace = (id: string, next: NoteBlock) =>
    onChange(blocks.map((b) => (b.id === id ? next : b)));

  /**
   * Удаление блока с медиа уносит и файл.
   *
   * Иначе документы приложения растут записями, на которые уже ничто не
   * ссылается, — и вычистить их потом нечем: связь блока с файлом была
   * единственной.
   */
  const remove = (block: NoteBlock) => {
    if (block.type === 'voice') removeMedia(block.uri);
    if (block.type === 'scan') block.pages.forEach((page) => removeMedia(page.uri));
    onChange(blocks.filter((b) => b.id !== block.id));
  };

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'text':
            return (
              <TextInput
                key={block.id}
                value={block.text}
                onChangeText={(text) => replace(block.id, { ...block, text })}
                placeholder={index === 0 ? 'Начните писать…' : ''}
                placeholderTextColor={theme.colors.placeholderText}
                multiline
                autoFocus={autoFocus && index === 0}
                scrollEnabled={false}
                style={[
                  theme.text('body'),
                  styles.text,
                  { color: theme.colors.label, minHeight: theme.controlHeight.row },
                ]}
              />
            );

          case 'checklist':
            return (
              <ChecklistBlockEditor
                key={block.id}
                block={block}
                moveCheckedDown={moveCheckedDown}
                onChange={(next) => replace(block.id, next)}
              />
            );

          case 'voice':
            return (
              <VoiceBlockView
                key={block.id}
                block={block}
                onChange={(next) => replace(block.id, next)}
                onRemove={() => remove(block)}
              />
            );

          case 'scan':
            return (
              <ScanBlockView
                key={block.id}
                block={block}
                onChange={(next) => replace(block.id, next)}
                onRemove={() => remove(block)}
              />
            );

          case 'sketch':
            return (
              <SketchBlockView
                key={block.id}
                block={block}
                onEdit={() => onEditSketch?.(block.id)}
                onRemove={() => remove(block)}
              />
            );
        }
      })}
    </View>
  );
};

type ChecklistBlock = Extract<NoteBlock, { type: 'checklist' }>;

const ChecklistBlockEditor = ({
  block,
  moveCheckedDown,
  onChange,
}: {
  block: ChecklistBlock;
  moveCheckedDown: boolean;
  onChange: (block: ChecklistBlock) => void;
}) => {
  const theme = useTheme();
  const done = block.items.filter((i) => i.done && i.text.trim()).length;
  const total = block.items.filter((i) => i.text.trim()).length;

  const setItems = (items: ChecklistItem[]) => onChange({ ...block, items });

  const patch = (id: string, next: Partial<ChecklistItem>) =>
    setItems(block.items.map((item) => (item.id === id ? { ...item, ...next } : item)));

  // Отмеченные уезжают вниз только при показе: порядок в данных не трогаем,
  // иначе снятие галочки возвращало бы пункт не туда, откуда он уехал.
  const shown = moveCheckedDown
    ? [...block.items].sort((a, b) => Number(a.done) - Number(b.done))
    : block.items;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {total > 0 ? (
        <Text variant="footnote" color="secondaryLabel">
          {done} из {total}
        </Text>
      ) : null}

      {shown.map((item) => (
        <View key={item.id} style={[styles.item, { gap: theme.spacing.md }]}>
          <Checkbox
            checked={item.done}
            onChange={(checked) => patch(item.id, { done: checked })}
            accessibilityLabel={item.text || 'Пункт списка'}
          />

          <TextInput
            value={item.text}
            onChangeText={(text) => patch(item.id, { text })}
            placeholder="Пункт"
            placeholderTextColor={theme.colors.placeholderText}
            // Ввод завершается созданием следующего пункта: список набирается
            // подряд, без возврата к кнопке «добавить».
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => setItems([...block.items, makeChecklistItem()])}
            style={[
              theme.text('body'),
              styles.text,
              styles.grow,
              {
                color: item.done ? theme.colors.secondaryLabel : theme.colors.label,
                textDecorationLine: item.done ? 'line-through' : 'none',
              },
            ]}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Удалить пункт"
            hitSlop={10}
            onPress={() => setItems(block.items.filter((i) => i.id !== item.id))}
            style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
          >
            <Symbol name="minus.circle" size={18} color={theme.colors.tertiaryLabel} />
          </Pressable>
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={() => setItems([...block.items, makeChecklistItem()])}
        style={({ pressed }) => [
          styles.item,
          { gap: theme.spacing.md, opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <Symbol name="plus.circle" size={22} color={theme.colors.accent} />
        <Text variant="body" color="accent">
          Добавить пункт
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  text: { padding: 0 },
  item: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
});
