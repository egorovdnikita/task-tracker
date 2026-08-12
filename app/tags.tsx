import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Chip, ChipWrap, ListRow, ListSection, Text, TextField } from '../src/components';
import { useTheme } from '../src/theme';
import { collectTags, useNotesStore } from '../src/store/useNotesStore';

/**
 * Плита 05.4 — редактор тегов заметки.
 *
 * Назначенные теги стоят чипами сверху, подсказки — списком под ними, а
 * создание нового тега — последним пунктом того же списка, а не отдельной
 * кнопкой: набирая имя, человек уже описывает новый тег, и предлагать создать
 * его надо там, где он смотрит.
 */
export default function TagsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const setTags = useNotesStore((s) => s.setTags);

  const [draft, setDraft] = useState('');
  const note = notes.find((n) => n.id === id);
  const all = useMemo(() => collectTags(notes), [notes]);

  if (!note) return null;

  const query = draft.trim();
  const suggestions = all.filter(
    (tag) => !note.tags.includes(tag) && tag.toLowerCase().includes(query.toLowerCase()),
  );
  const canCreate = query.length > 0 && !all.some((t) => t.toLowerCase() === query.toLowerCase());

  const add = (tag: string) => {
    setTags(note.id, [...note.tags, tag]);
    setDraft('');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Теги' }} />

      {/* Шапка шита прозрачная, и без системной поправки на инсеты поле
          «Название тега» встаёт под заголовок. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
      >
        <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md }}>
          {note.tags.length > 0 ? (
            <ChipWrap>
              {note.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  icon="tag"
                  selected
                  onRemove={() => setTags(note.id, note.tags.filter((t) => t !== tag))}
                />
              ))}
            </ChipWrap>
          ) : (
            <Text variant="footnote" color="secondaryLabel">
              У заметки пока нет тегов. Тег — сквозной признак: одна заметка может нести их сколько
              угодно.
            </Text>
          )}

          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder="Название тега"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => canCreate && add(query)}
          />
        </View>

        {suggestions.length > 0 || canCreate ? (
          <ListSection style={{ marginTop: theme.spacing.lg }} header="Выберите или создайте">
            {suggestions.map((tag) => (
              <ListRow key={tag} title={tag} icon="tag" onPress={() => add(tag)} />
            ))}

            {canCreate ? (
              <ListRow
                title={`Создать «${query}»`}
                icon="plus"
                titleColor="accent"
                onPress={() => add(query)}
              />
            ) : null}
          </ListSection>
        ) : null}
      </ScrollView>
    </>
  );
}
