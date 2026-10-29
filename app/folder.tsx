import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Fab, IconButton, Symbol, Text, headerItems } from '../src/components';
import { accentLabels, accentNames, useTheme, type AccentName } from '../src/theme';
import { folderNameTaken } from '../src/features/folders';
import { splitEmoji } from '../src/utils/emoji';
import { useNotesStore } from '../src/store/useNotesStore';

/**
 * Шит папки — создание, вложенная папка и правка одним экраном.
 *
 * Раньше имя спрашивал системный алерт с полем: цвет в нём выбрать нельзя,
 * а «имя занято» приходило вторым алертом после того, как первый уже закрыт.
 * Здесь — как «Name Your Rule» у Opal: поле-пилюля, закрыть слева, лаймовый
 * круг подтверждения справа. Ниже — цвет папки кругами, как дни недели в
 * правиле Opal, и превью строки, какой папка встанет в список.
 *
 * Параметры: `id` — правка существующей; `parent` — вложенная; `move` —
 * заметки, которые переносятся в новую папку сразу после создания (шит
 * «Переместить → Новая папка…»).
 */
export default function FolderSheet() {
  const { id, parent, move } = useLocalSearchParams<{ id?: string; parent?: string; move?: string }>();
  const theme = useTheme();
  const folders = useNotesStore((s) => s.folders);
  const createFolder = useNotesStore((s) => s.createFolder);
  const updateFolder = useNotesStore((s) => s.updateFolder);
  const moveNotes = useNotesStore((s) => s.moveNotes);

  const existing = id ? folders.find((f) => f.id === id) : undefined;
  const parentId = existing ? existing.parentId : (parent ?? null);
  const parentName = parentId ? folders.find((f) => f.id === parentId)?.name : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [accent, setAccent] = useState<AccentName>(
    existing?.accent ?? accentNames[folders.length % accentNames.length],
  );

  const trimmed = name.trim();
  const taken = trimmed.length > 0 && folderNameTaken(trimmed, parentId, existing?.id);
  const ready = trimmed.length > 0 && !taken;
  const preview = splitEmoji(trimmed || 'Новая папка');

  const save = () => {
    if (!ready) return;
    if (existing) {
      updateFolder(existing.id, { name: trimmed, accent });
      router.back();
      return;
    }
    const folder = createFolder(trimmed, accent, parentId);
    const ids = move ? move.split(',').filter(Boolean) : [];
    if (ids.length > 0) {
      moveNotes(ids, folder.id);
      // Закрываются оба шита — и этот, и «Переместить» под ним: перенос сделан.
      router.dismiss(2);
      return;
    }
    router.back();
  };

  const title = existing ? 'Папка' : parentId ? 'Вложенная папка' : 'Новая папка';

  return (
    <>
      <Stack.Screen
        options={{
          title,
          unstable_headerLeftItems: headerItems(() => (
            <IconButton name="xmark" size={20} accessibilityLabel="Закрыть" onPress={() => router.back()} />
          )),
          unstable_headerRightItems: headerItems(
            () => null,
            () => (
              <Fab
                compact
                icon="checkmark"
                accessibilityLabel={existing ? 'Сохранить папку' : 'Создать папку'}
                disabled={!ready}
                onPress={save}
              />
            ),
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.xl }}
      >
        {parentName ? (
          <Text variant="subheadline" color="secondaryLabel" style={{ textAlign: 'center' }}>
            Внутри «{splitEmoji(parentName).rest}»
          </Text>
        ) : null}

        {/* Поле — пилюля Opal в шите: заливка на ступень светлее шита. */}
        <View style={{ gap: theme.spacing.sm }}>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            onSubmitEditing={save}
            placeholder="Название, можно с эмодзи"
            placeholderTextColor={theme.colors.placeholderText}
            returnKeyType="done"
            maxLength={40}
            accessibilityLabel="Название папки"
            style={[
              theme.text('body'),
              styles.field,
              {
                color: theme.colors.label,
                height: 52,
                paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
                backgroundColor: theme.surfaces.groupInSheet,
                borderColor: taken ? theme.colors.systemRed : 'rgba(255,255,255,0.12)',
              },
            ]}
          />
          {/* Ошибка — строкой под полем, а не вторым алертом после закрытия первого. */}
          {taken ? (
            <Text variant="footnote" color="systemRed" style={{ marginHorizontal: theme.spacing.lg }}>
              Папка «{trimmed}» на этом уровне уже есть
            </Text>
          ) : (
            <Text variant="footnote" color="secondaryLabel" style={{ marginHorizontal: theme.spacing.lg }}>
              Эмодзи в начале имени встанет вместо иконки
            </Text>
          )}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <Text variant="headline" weight="semibold" style={{ marginHorizontal: theme.spacing.lg }}>
            Цвет
          </Text>
          {/* Круги 36 — как дни недели в правиле Opal: выбранный белый ободок. */}
          <View style={[styles.swatches, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.xs }]}>
            {accentNames.map((item) => {
              const selected = item === accent;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityLabel={accentLabels[item]}
                  accessibilityState={{ selected }}
                  onPress={() => setAccent(item)}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.swatch,
                    {
                      borderColor: selected ? '#FFFFFF' : 'transparent',
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: theme.accent(item) }]} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Превью — строка, какой папка встанет в список «Папки». */}
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="headline" weight="semibold" style={{ marginHorizontal: theme.spacing.lg }}>
            В списке
          </Text>
          <View
            style={[
              styles.preview,
              {
                backgroundColor: theme.surfaces.groupInSheet,
                borderRadius: theme.radius.group,
                minHeight: theme.controlHeight.row,
                paddingHorizontal: theme.spacing.lg,
                gap: 17,
              },
            ]}
          >
            {preview.emoji ? (
              <Text variant="title3" style={styles.glyph}>
                {preview.emoji}
              </Text>
            ) : (
              <View style={styles.glyph}>
                <Symbol name="folder.fill" size={20} color={theme.accent(accent)} />
              </View>
            )}
            <Text variant="body" numberOfLines={1} style={{ flex: 1 }}>
              {preview.rest}
            </Text>
            <Symbol name="chevron.right" size={16} color={theme.colors.secondaryLabel} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  field: { borderRadius: 999, borderWidth: 1, borderCurve: 'circular' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap' },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 32, height: 32, borderRadius: 16 },
  preview: { flexDirection: 'row', alignItems: 'center' },
  glyph: { width: 28, alignItems: 'center', textAlign: 'center' },
});
