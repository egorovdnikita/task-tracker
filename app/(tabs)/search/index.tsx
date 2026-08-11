import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Stack, router } from 'expo-router';

import {
  Chip,
  ChipRow,
  EmptyState,
  ListRow,
  ListSection,
  NoteList,
  SegmentedControl,
  Symbol,
  Text,
} from '../../../src/components';
import { useTheme } from '../../../src/theme';
import type { BlockType } from '../../../src/types';
import { collectTags, searchNotes, useNotesStore } from '../../../src/store/useNotesStore';

/** Источник совпадения — плита 06.2 группирует результаты именно по нему. */
type Source = 'all' | 'text' | 'voice' | 'scan';

const SOURCES: { value: Source; label: string; blocks: BlockType[] }[] = [
  { value: 'all', label: 'Все', blocks: [] },
  { value: 'text', label: 'Текст', blocks: ['text', 'checklist'] },
  { value: 'voice', label: 'Голос', blocks: ['voice'] },
  { value: 'scan', label: 'Сканы', blocks: ['scan'] },
];

/**
 * Плиты 06.1–06.3 — поиск.
 *
 * Поле — системное, в шапке навигации: `UISearchBar` внутри
 * `UINavigationController`. Своё поле здесь стояло раньше и было лишним —
 * система даёт то же самое вместе с кнопкой «Отменить», затемнением списка на
 * время ввода, правильной клавиатурой и поведением при прокрутке.
 *
 * Фильтр по источнику — настоящий `UISegmentedControl`, он же скоуп-бар
 * поиска: выбран всегда ровно один источник.
 */
export default function SearchScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const recent = useNotesStore((s) => s.settings.recentQueries);
  const pushRecent = useNotesStore((s) => s.pushRecentQuery);
  const removeRecent = useNotesStore((s) => s.removeRecentQuery);
  const clearRecent = useNotesStore((s) => s.clearRecentQueries);

  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [source, setSource] = useState<Source>('all');

  const tags = useMemo(() => collectTags(notes), [notes]);

  const results = useMemo(() => {
    const found = query.trim().length >= 2 ? searchNotes(notes, query) : [];
    const byTag = tag ? found.filter((n) => n.tags.includes(tag)) : found;

    const wanted = SOURCES.find((s) => s.value === source)?.blocks ?? [];
    if (wanted.length === 0) return byTag;
    return byTag.filter((n) => n.blocks.some((b) => wanted.includes(b.type)));
  }, [notes, query, tag, source]);

  const asking = query.trim().length >= 2;

  /** Сколько нашлось в каждом источнике — числа в сегментах ставить некуда,
      поэтому они уходят в подпись под контролом. */
  const counts = useMemo(() => {
    if (!asking) return null;
    const found = searchNotes(notes, query);
    return SOURCES.slice(1).map((s) => ({
      label: s.label,
      count: found.filter((n) => n.blocks.some((b) => s.blocks.includes(b.type))).length,
    }));
  }, [notes, query, asking]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Поиск',
          headerSearchBarOptions: {
            placeholder: 'Заголовок, текст, тег',
            onChangeText: (event) => setQuery(event.nativeEvent.text),
            onSearchButtonPress: (event) => pushRecent(event.nativeEvent.text),
            onCancelButtonPress: () => setQuery(''),
            // На этом экране поиск и есть содержимое: поле не должно уезжать
            // при прокрутке, как оно уезжает в списке заметок.
            hideWhenScrolling: false,
            autoCapitalize: 'none',
          },
        }}
      />

      {asking ? (
        <>
          <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.sm }}>
            <SegmentedControl
              accessibilityLabel="Источник совпадения"
              segments={SOURCES.map(({ value, label }) => ({ value, label }))}
              selected={source}
              onChange={setSource}
            />
          </View>

          {tags.length > 0 ? (
            <ChipRow style={{ flexGrow: 0, marginBottom: theme.spacing.sm }}>
              <Chip label="Все теги" selected={tag === null} onPress={() => setTag(null)} />
              {tags.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  icon="tag"
                  selected={tag === name}
                  onPress={() => setTag(tag === name ? null : name)}
                />
              ))}
            </ChipRow>
          ) : null}

          <NoteList
            notes={results}
            highlight={query}
            onOpen={(id) => {
              pushRecent(query);
              router.push({ pathname: '/note/[id]', params: { id } });
            }}
            ListHeaderComponent={
              results.length > 0 && counts ? (
                <Text variant="footnote" color="secondaryLabel">
                  Найдено: {results.length}
                  {counts.some((c) => c.count > 0)
                    ? ` · ${counts.filter((c) => c.count > 0).map((c) => `${c.label} ${c.count}`).join(' · ')}`
                    : ''}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              // Экран не заканчивается тупиком: если пусто только из-за
              // фильтра, предлагаем снять фильтр, а не переписывать запрос.
              source !== 'all' || tag ? (
                <EmptyState
                  icon="line.3.horizontal.decrease.circle"
                  title="Пусто в этом фильтре"
                  description={`По запросу «${query}» с выбранным фильтром ничего нет.`}
                  actionTitle="Снять фильтр"
                  onAction={() => {
                    setSource('all');
                    setTag(null);
                  }}
                />
              ) : (
                <EmptyState
                  icon="magnifyingglass"
                  title="Ничего не найдено"
                  description={`По запросу «${query}» заметок нет. Проверьте раскладку или попробуйте другое слово.`}
                />
              )
            }
          />
        </>
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxxl }}
          keyboardDismissMode="on-drag"
        >
          {recent.length > 0 ? (
            <ListSection
              header="Недавние запросы"
              footer="Записи и сканы находятся по своей подписи: расшифровки речи и распознавания текста в приложении нет."
            >
              {recent.map((item) => (
                <ListRow
                  key={item}
                  title={item}
                  icon="clock.arrow.circlepath"
                  onPress={() => setQuery(item)}
                  // Крестик чистит историю построчно; целиком — строкой ниже.
                  trailing={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Убрать «${item}» из истории`}
                      hitSlop={12}
                      onPress={() => removeRecent(item)}
                    >
                      <Symbol name="xmark" size={13} color={theme.colors.tertiaryLabel} />
                    </Pressable>
                  }
                />
              ))}
              <ListRow title="Очистить историю" destructive onPress={clearRecent} />
            </ListSection>
          ) : (
            <EmptyState
              icon="magnifyingglass"
              title="Найдите заметку"
              description="Поиск идёт по заголовку, тексту, тегам и подписям записей. Достаточно двух символов."
            />
          )}
        </ScrollView>
      )}
    </>
  );
}
