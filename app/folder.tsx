import { useHeaderHeight } from '@react-navigation/elements';
import { ScreenBackdrop } from '../src/components/ScreenBackdrop';
import { localColors } from '../src/theme/localColors';
import { boxPrimitives } from '../src/vendor/box-ui/primitives';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Button, IconButton, Symbol, Text, headerItems } from '../src/components';
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
  const headerHeight = useHeaderHeight();
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
    <View style={{ flex: 1 }}>
      <ScreenBackdrop />
      <Stack.Screen
        options={{
          title,
          unstable_headerLeftItems: headerItems(() => (
            <IconButton name="xmark" size={20} accessibilityLabel="Закрыть" onPress={() => router.back()} />
          )),

        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: headerHeight + theme.spacing.md, paddingBottom: theme.spacing.xxxl }}
      >
        <View style={{ padding: theme.spacing.lg, gap: 10, borderRadius: theme.radius.xl, backgroundColor: theme.hex.secondarySystemBackground }}>
        {parentName ? (
          <Text variant="subheadline" color="secondaryLabel" style={{ textAlign: 'center' }}>
            Внутри «{splitEmoji(parentName).rest}»
          </Text>
        ) : null}

        {/* Поле — пилюля Opal в шите: заливка на ступень светлее шита. */}
        <View style={{ gap: 10 }}>
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
              { ...theme.text('callout'), lineHeight: 20 },
              styles.field,
              {
                color: theme.colors.label,
                height: boxPrimitives.size['52'],
                paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
                backgroundColor: theme.hex.systemFill,
                borderColor: taken ? theme.colors.systemRed : localColors.folderBorder,
              },
            ]}
          />
          {/* Ошибка — строкой под полем, а не вторым алертом после закрытия первого. */}
          {taken ? (
            <Text variant="footnote" color="systemRed" style={{ marginHorizontal: 0 }}>
              Папка «{trimmed}» на этом уровне уже есть
            </Text>
          ) : (
            <Text variant="footnote" color="secondaryLabel" style={{ marginHorizontal: 0 }}>
              Эмодзи в начале имени встанет вместо иконки
            </Text>
          )}
        </View>

        <View style={{ gap: 10 }}>
          <Text variant="headline" weight="medium" color="label">
            Цвет
          </Text>
          {/* Круги 36 — как дни недели в правиле Opal: выбранный белый ободок. */}
          <View style={[styles.swatches, { columnGap: 16, rowGap: 8 }]}>
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
                      borderColor: selected ? theme.hex.label : 'transparent',
                      backgroundColor: theme.accent(item),
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                >

                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Превью — строка, какой папка встанет в список «Папки». */}
        <View style={{ gap: 10 }}>
          <Text variant="headline" weight="medium" color="label">
            В списке
          </Text>
          <View
            style={[
              styles.preview,
              {
                backgroundColor: 'transparent',
                minHeight: 20,
                gap: theme.spacing.sm,
              },
            ]}
          >
            {preview.emoji ? (
              <Text variant="title3">
                {preview.emoji}
              </Text>
            ) : (
              <View>
                <Symbol name="folder.fill" size={20} color={theme.accent(accent)} />
              </View>
            )}
            <Text variant="callout" numberOfLines={1} style={{ flex: 1, lineHeight: 20 }}>
              {preview.rest}
            </Text>

          </View>
        </View>
          <Button title="Готово" size="large" fullWidth disabled={!ready} onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { borderRadius: 999, borderWidth: 1, borderCurve: 'circular' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap' },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 36, height: 36, borderRadius: 18 },
  preview: { flexDirection: 'row', alignItems: 'center' },
  glyph: { width: boxPrimitives.size['28'], alignItems: 'center', textAlign: 'center' },
});
