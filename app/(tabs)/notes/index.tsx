import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';

import {
  BottomBar,
  EmptyState,
  HeaderCapsule,
  IconButton,
  MenuButton,
  NoteList,
  SearchField,
  SegmentedControl,
  Symbol,
  showMenu,
  type MenuAnchor,
} from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { BLOCK_LABELS } from '../../../src/types';
import { pluralNotes } from '../../../src/utils/date';
import { SORT_LABELS } from '../../../src/features/labels';
import { STATIC_TAGS } from '../../../src/features/tags';
import { offerUndo } from '../../../src/features/notify';
import { activeNotes, searchNotes, sortNotes, useNotesStore } from '../../../src/store/useNotesStore';
import { SelectionBar, useSelection } from '../../../src/features/selection';

/** Фильтр по тегу. `all` — без фильтра, остальное — идентификатор своего тега. */
const TAG_SEGMENTS = [
  { value: 'all', label: 'Все' },
  ...STATIC_TAGS.map((tag) => ({ value: tag.id, label: tag.label })),
];

/**
 * Плиты 02.1–02.3, 02.5 и 06.1–06.2 — дом.
 *
 * Порядок сверху вниз повторяет порядок вопросов: как называется раздел и чем
 * в нём управляют (шапка), что ищем (поле), какой срез смотрим (сегменты),
 * сам список. Раньше эта же четвёрка была разложена по трём краям экрана —
 * заголовок сверху, сортировка пилюлей под ним, поиск у нижнего края, — и
 * связь между ними приходилось держать в голове.
 */
export default function NotesScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const settings = useNotesStore((s) => s.settings);
  const setLayout = useNotesStore((s) => s.setLayout);
  const updateSettings = useNotesStore((s) => s.updateSettings);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);

  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('all');
  const selection = useSelection();

  // Поиск идёт, когда набрано хотя бы два символа: по одной букве выдача — это
  // весь список, и показывать её как результат нечестно.
  const searching = query.trim().length >= 2;

  const layout = settings.layout.root ?? 'list';

  const visible = useMemo(() => {
    const base = searching ? searchNotes(notes, query) : activeNotes(notes);
    const byTag = tag === 'all' ? base : base.filter((n) => n.tags.includes(tag));
    return sortNotes(byTag, settings.sort);
  }, [notes, query, searching, tag, settings.sort]);

  /**
   * Плита 02.5: короткий тап открывает шит создания, долгий — выбор типа.
   *
   * Порядок не случайный: текст и список закреплены сверху как самые частые,
   * дальше идут те, что требуют разрешений и отдельного экрана.
   */
  const chooseType = (anchor: MenuAnchor) =>
    showMenu(
      [
        { title: BLOCK_LABELS.text, icon: 'text.alignleft', onPress: () => router.push('/create') },
        {
          title: BLOCK_LABELS.checklist,
          icon: 'checklist',
          onPress: () => router.push({ pathname: '/create', params: { kind: 'checklist' } }),
        },
        // Заметка создаётся не здесь, а на самом экране захвата: если человек
        // передумает и закроет камеру, пустая заметка не должна остаться.
        { title: BLOCK_LABELS.voice, icon: 'mic', onPress: () => router.push('/capture/voice') },
        {
          title: BLOCK_LABELS.scan,
          icon: 'doc.text.viewfinder',
          onPress: () => router.push('/capture/scan'),
        },
        {
          title: BLOCK_LABELS.sketch,
          icon: 'scribble',
          onPress: () => router.push('/capture/sketch'),
        },
      ],
      anchor,
      'Новая заметка',
    );

  const trashWithUndo = (ids: string[]) => {
    trashNotes(ids);
    offerUndo(
      ids.length === 1 ? 'Заметка в корзине' : `В корзине: ${ids.length}`,
      () => restoreNotes(ids),
    );
  };

  /** Меню карточки — растёт из неё самой, а не приезжает от нижнего края. */
  const noteMenu = (id: string, anchor: MenuAnchor) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    showMenu(
      [
        {
          title: note.pinned ? 'Открепить' : 'Закрепить',
          icon: note.pinned ? 'pin.slash' : 'pin',
          onPress: () => togglePinned(id),
        },
        {
          title: 'Переместить',
          icon: 'folder',
          onPress: () => router.push({ pathname: '/move', params: { ids: id } }),
        },
        {
          title: 'Напомнить',
          icon: 'bell',
          onPress: () => router.push({ pathname: '/reminder', params: { id } }),
        },
        { title: 'Удалить', icon: 'trash', destructive: true, onPress: () => trashWithUndo([id]) },
      ],
      anchor,
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Заметки',
          /*
            Обе кнопки управления списком — в одной стеклянной капсуле справа,
            в одну строку с заголовком. Сортировка вернулась сюда из пилюли
            под заголовком: её место рядом с переключателем вида, потому что
            обе меняют не содержимое списка, а его подачу.
          */
          headerRight: () => (
            <HeaderCapsule>
              <IconButton
                name={layout === 'list' ? 'square.grid.2x2' : 'list.bullet'}
                size={19}
                accessibilityLabel={layout === 'list' ? 'Показать сеткой' : 'Показать списком'}
                onPress={() => setLayout('root', layout === 'list' ? 'grid' : 'list')}
              />

              <MenuButton
                accessibilityLabel={`Сортировка: ${SORT_LABELS[settings.sort]}`}
                title="Сортировка"
                items={() =>
                  (Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map((mode) => ({
                    title: SORT_LABELS[mode],
                    checked: settings.sort === mode,
                    onPress: () => updateSettings({ sort: mode }),
                  }))
                }
                style={({ pressed }) => ({
                  width: theme.controlHeight.buttonCompact,
                  height: theme.controlHeight.buttonCompact,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.4 : 1,
                })}
              >
                <Symbol name="arrow.up.arrow.down" size={19} color={theme.colors.accent} />
              </MenuButton>
            </HeaderCapsule>
          ),
        }}
      />

      <NoteList
        notes={visible}
        layout={layout}
        highlight={query}
        selectable={selection.active}
        selectedIds={selection.ids}
        onOpen={(id) =>
          selection.active
            ? selection.toggle(id)
            : router.push({ pathname: '/note/[id]', params: { id } })
        }
        onLongPress={(id, anchor) =>
          selection.active ? selection.toggle(id) : noteMenu(id, anchor)
        }
        onDelete={(id) => trashWithUndo([id])}
        onTogglePin={togglePinned}
        // Место под кнопку создания в ряду панели вкладок — последняя карточка
        // не должна прятаться под ней.
        contentInsetBottom={
          theme.metrics.tabBar + theme.spacing.xxl + (selection.active ? 64 : 0)
        }
        ListHeaderComponent={
          !selection.active ? (
            <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xs }}>
              {/* Поиск сразу под заголовком: белой карточкой, в потоке
                  списка, а не плавающей капсулой у нижнего края. */}
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Поиск по заметкам"
              />

              {/*
                Срез — сегмент-контрол, а не ряд чипов.

                Выбор здесь ровно один, а чипы обещают множественный: их можно
                набрать несколько, и ряд ещё и прокручивался, так что часть
                фильтров была за краем. Тегов три, они заданы заранее — вместе
                с «Все» весь фильтр помещается в один системный контрол,
                который сам знает про Dynamic Type и VoiceOver.
              */}
              <SegmentedControl
                accessibilityLabel="Фильтр по тегу"
                segments={TAG_SEGMENTS}
                selected={tag}
                onChange={setTag}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          searching ? (
            // Экран не заканчивается тупиком: если пусто только из-за фильтра,
            // предлагаем снять фильтр, а не переписывать запрос.
            tag !== 'all' ? (
              <EmptyState
                icon="line.3.horizontal.decrease.circle"
                title="Пусто в этом фильтре"
                description={`По запросу «${query}» с выбранным тегом ничего нет.`}
                actionTitle="Снять фильтр"
                onAction={() => setTag('all')}
              />
            ) : (
              <EmptyState
                icon="magnifyingglass"
                title="Ничего не найдено"
                description={`По запросу «${query}» заметок нет. Проверьте раскладку или попробуйте другое слово.`}
              />
            )
          ) : tag !== 'all' ? (
            <EmptyState
              icon="tag"
              title="В этом фильтре пусто"
              description={`С тегом «${TAG_SEGMENTS.find((s) => s.value === tag)?.label}» пока нет заметок.`}
              actionTitle="Показать все"
              onAction={() => setTag('all')}
            />
          ) : (
            <EmptyState
              icon="note.text"
              title="Здесь пока пусто"
              description="Первая заметка обычно самая короткая — так и надо. Кнопка создания внизу справа."
            />
          )
        }
      />

      <BottomBar
        hidden={selection.active}
        onCreate={() => router.push('/create')}
        onLongPressCreate={chooseType}
      />

      <SelectionBar
        selection={selection}
        onDelete={(ids) => {
          trashWithUndo(ids);
          selection.clear();
        }}
        summary={pluralNotes(selection.ids.length)}
      />
    </>
  );
}
