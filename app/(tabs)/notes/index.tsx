import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';

import {
  EmptyState,
  Fab,
  HeaderGlass,
  RootHeader,
  IconButton,
  NoteList,
  SearchField,
  SegmentedControl,
  showMenu,
  type MenuAnchor,
  ScreenBackdrop,
} from '../../../src/components';
import { useTheme } from '../../../src/theme';
import { pluralNotes } from '../../../src/utils/date';
import { STATIC_TAGS } from '../../../src/features/tags';
import { offerUndo } from '../../../src/features/notify';
import {
  activeNotes,
  isSearching,
  searchNotes,
  sortNotes,
  useNotesStore,
} from '../../../src/store/useNotesStore';
import { SelectionBar, useSelection } from '../../../src/features/selection';
import { chooseNoteType } from '../../../src/features/create';
import { SORT_LABELS } from '../../../src/features/labels';

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
  const updateSettings = useNotesStore(s => s.updateSettings);
  const setLayout = useNotesStore((s) => s.setLayout);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const trashNotes = useNotesStore((s) => s.trashNotes);
  const restoreNotes = useNotesStore((s) => s.restoreNotes);

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [tag, setTag] = useState('all');
  const selection = useSelection();

  const searching = isSearching(query);

  const layout = settings.layout.root ?? 'list';

  const visible = useMemo(() => {
    const base = searching ? searchNotes(notes, query) : activeNotes(notes);
    const byTag = tag === 'all' ? base : base.filter((n) => n.tags.includes(tag));
    return sortNotes(byTag, settings.sort);
  }, [notes, query, searching, tag, settings.sort]);

  const trashWithUndo = (ids: string[]) => {
    trashNotes(ids);
    offerUndo(ids.length === 1 ? 'Заметка в корзине' : `В корзине: ${ids.length}`, () =>
      restoreNotes(ids),
    );
  };

  /** Меню карточки — растёт из неё самой, а не приезжает от нижнего края. */
  const noteMenu = (id: string, anchor: MenuAnchor) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    showMenu(
      [
        // Вход в множественный выбор. Без него панель с переносом и удалением
        // была недостижима: отмечать начинали только из уже начатого выбора.
        { title: 'Выбрать', icon: 'checkmark.circle', onPress: () => selection.toggle(id) },
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

  /**
   * Строка заголовка корня: имя раздела слева, справа — капсула подачи
   * списка и лаймовый круг «+». Круг — как у Opal на «Rules»: плавающей
   * кнопки создания у Opal нет. В режиме выбора на месте капсулы
   * «Выбрать все».
   */
  const allSelected = visible.length > 0 && visible.every((n) => selection.ids.includes(n.id));

  const header = (
    <RootHeader
      title="Заметки"
      count={layout === 'list' && activeNotes(notes).length > 0 ? activeNotes(notes).length : undefined}
      menuLabel="Подача и сортировка заметок"
      menu={() => [
        { title: 'Списком', checked: layout === 'list', icon: 'list.bullet', onPress: () => setLayout('root', 'list') },
        { title: 'Сеткой', checked: layout === 'grid', icon: 'square.grid.2x2', onPress: () => setLayout('root', 'grid') },
        ...(Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map(mode => ({ title: SORT_LABELS[mode], checked: settings.sort === mode, onPress: () => updateSettings({ sort: mode }) })),
      ]}
      right={
        selection.active ? (
          <HeaderGlass>
            <IconButton
              name={allSelected ? 'checkmark.circle.fill' : 'checkmark.circle'}
              size={19}
              accessibilityLabel={allSelected ? 'Снять отметку со всех' : 'Выбрать все'}
              onPress={() => selection.toggleAll(visible.map((n) => n.id))}
            />
          </HeaderGlass>
        ) : (
          <>
            {layout === 'list' && activeNotes(notes).length > 0 ? <HeaderGlass diameter={52}>
              <IconButton style={{ width: 52, height: 52 }} name="magnifyingglass" accessibilityLabel="Поиск по заметкам" onPress={() => setSearchOpen(open => !open)} />
            </HeaderGlass> : null}
            <Fab
              compact
              diameter={layout === 'list' && activeNotes(notes).length > 0 ? 56 : 44}
              onPress={() => router.push('/create')}
              onLongPress={(anchor) => chooseNoteType(anchor)}
            />
          </>
        )
      }
    />
  );

  return (
    <>
      <ScreenBackdrop />
      {/* Системная шапка у корня скрыта: заголовок и кнопки — строкой
          `RootHeader` в начале списка, как у Opal. */}
      <Stack.Screen options={{ headerShown: false, title: 'Заметки' }} />

      <NoteList
        notes={visible}
        layout={layout}
        highlight={searching ? query : undefined}
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
        // Место под панель вкладок — последняя карточка не должна прятаться
        // под ней.
        contentInsetBottom={theme.metrics.tabBar + (selection.active ? 64 : 0)}
        ListHeaderComponent={
          !selection.active ? (
            <View
              // Под сегментом — полный зазор секции: без него заголовок
              // «Закреплено» и первая карточка прилипали к контролу.
              style={{ gap: theme.spacing.md }}
            >
              {header}
              <View style={{ gap: 16 }}>
              {/* Поиск сразу под заголовком: белой карточкой, в потоке
                  списка, а не плавающей капсулой у нижнего края. */}
              {searchOpen || searching || layout === 'grid' || activeNotes(notes).length === 0 ? <SearchField autoFocus={searchOpen} value={query} onChangeText={setQuery} placeholder="Поиск по заметкам" /> : null}

              {/*
                Срез — сегмент-контрол, а не ряд чипов.

                Выбор здесь ровно один, а чипы обещают множественный: их можно
                набрать несколько, и ряд ещё и прокручивался, так что часть
                фильтров была за краем. Тегов три, они заданы заранее — вместе
                с «Все» весь фильтр помещается в один системный контрол,
                который сам знает про Dynamic Type и VoiceOver.
              */}
              <SegmentedControl accessibilityLabel="Фильтр по тегу" segments={TAG_SEGMENTS} selected={tag} onChange={setTag} />
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: theme.spacing.md }}>{header}</View>
          )
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
              description="Сохраните мысль, составьте список или запишите голосом."
              // Действие вместо слов «кнопка внизу справа»: инструкция о
              // положении кнопки врёт при любой другой раскладке.
              actionTitle="Создать заметку"
              onAction={() => router.push('/create')}
            />
          )
        }
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
