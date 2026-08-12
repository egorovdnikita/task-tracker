import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

import { HeaderCapsule, IconButton, ListRow, ListSection } from '../../../src/components';
import { accentNames, useTheme } from '../../../src/theme';
import { STATIC_TAGS } from '../../../src/features/tags';
import { splitEmoji } from '../../../src/utils/emoji';
import { confirmDestructive, promptForText, showActionSheet } from '../../../src/utils/actionSheet';
import {
  activeNotes,
  childFolders,
  folderCount,
  rootFolders,
  trashedNotes,
  useNotesStore,
} from '../../../src/store/useNotesStore';

/**
 * Отбивка разделителя под глифом строки: поле экрана, ширина символа и зазор.
 *
 * Считается от глифа в 22pt, а не от плашки в 29pt: плашки под иконками
 * больше нет — цвет папки живёт в самом символе.
 */
const GLYPH_INSET = 16 + 22 + 12;

/**
 * Плита 05.1 — папки и теги.
 *
 * Папка отвечает на вопрос «где лежит», тег — «про что это», поэтому это два
 * разных блока, а не один список с иконками разной формы. Корзина стоит внизу
 * отдельно: она не папка, и попадать в неё перебором папок неправильно.
 *
 * Каждая группа подписана и посчитана, как в референсе: «Папки 3», «Теги 3».
 * Кнопка «новая папка» стоит в шапке своей группы, а не в шапке экрана — она
 * создаёт строку именно здесь, и её место рядом с тем, что она пополняет.
 */
export default function FoldersScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const createFolder = useNotesStore((s) => s.createFolder);
  const renameFolder = useNotesStore((s) => s.renameFolder);
  const deleteFolder = useNotesStore((s) => s.deleteFolder);

  const roots = useMemo(() => rootFolders(folders), [folders]);
  const inbox = useMemo(() => activeNotes(notes).filter((n) => !n.folderId).length, [notes]);
  const trashed = useMemo(() => trashedNotes(notes).length, [notes]);
  const tagCount = useMemo(() => {
    const alive = activeNotes(notes);
    return Object.fromEntries(
      STATIC_TAGS.map((tag) => [tag.id, alive.filter((n) => n.tags.includes(tag.id)).length]),
    ) as Record<string, number>;
  }, [notes]);

  const addFolder = (parentId: string | null = null) =>
    promptForText(
      parentId ? 'Вложенная папка' : 'Новая папка',
      'Как её назвать? Имя может начинаться с эмодзи — оно встанет вместо иконки.',
      (name) => {
        // Одинаковые имена на одном уровне запрещены: две папки «Работа»
        // рядом невозможно различить, а переименование потом не помогает —
        // человек уже разложил заметки не туда.
        const siblings = folders.filter((f) => f.parentId === parentId);
        if (siblings.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
          confirmDestructive(
            'Имя занято',
            `Папка «${name}» на этом уровне уже есть.`,
            'Понятно',
            () => {},
          );
          return;
        }
        createFolder(name, accentNames[folders.length % accentNames.length], parentId);
      },
    );

  /** Пункты меню папки. Меню растёт из самой строки — его ставит `ListRow`. */
  const folderMenu = (id: string, name: string, nested: boolean) => () => [
    {
      title: 'Переименовать',
      icon: 'pencil' as const,
      onPress: () =>
        promptForText('Переименовать', 'Новое имя папки', (next) => renameFolder(id, next), name),
    },
    ...(nested
      ? []
      : [
          {
            title: 'Вложенная папка',
            icon: 'folder.badge.plus' as const,
            onPress: () => addFolder(id),
          },
        ]),
    {
      title: 'Удалить папку',
      icon: 'trash' as const,
      destructive: true,
      onPress: () =>
        // Что делать с содержимым — вопрос, а не решение по умолчанию:
        // молча удалить чужие заметки вместе с папкой нельзя.
        showActionSheet(
          [
            {
              title: 'Перенести заметки в корень',
              onPress: () => deleteFolder(id, 'moveToRoot'),
            },
            {
              title: 'Удалить вместе с заметками',
              destructive: true,
              onPress: () => deleteFolder(id, 'trash'),
            },
          ],
          { title: `Удалить «${name}»`, message: 'Что сделать с заметками внутри?' },
        ),
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Папки',
          headerRight: () => (
            <HeaderCapsule>
              <IconButton
                name="folder.badge.plus"
                size={19}
                accessibilityLabel="Новая папка"
                onPress={() => addFolder(null)}
              />
            </HeaderCapsule>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
      >
        <ListSection separatorInset={GLYPH_INSET}>
          <ListRow
            title="Все заметки"
            icon="tray.full"
            value={String(activeNotes(notes).length)}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.navigate('/notes')}
          />
          <ListRow
            title="Без папки"
            icon="tray"
            value={String(inbox)}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push({ pathname: '/folders/[id]', params: { id: 'root' } })}
          />
        </ListSection>

        {roots.length > 0 ? (
          <ListSection
            header="Папки"
            count={roots.length}
            action={{ icon: 'plus', label: 'Новая папка', onPress: () => addFolder(null) }}
            separatorInset={GLYPH_INSET}
          >
            {roots.flatMap((folder) => [
              <ListRow
                key={folder.id}
                title={splitEmoji(folder.name).rest}
                emoji={splitEmoji(folder.name).emoji ?? undefined}
                icon="folder.fill"
                iconColor={theme.accent(folder.accent)}
                value={String(folderCount(notes, folders, folder.id))}
                accessory={{ type: 'disclosure' }}
                onPress={() =>
                  router.push({ pathname: '/folders/[id]', params: { id: folder.id } })
                }
                menu={folderMenu(folder.id, folder.name, false)}
                menuTitle={folder.name}
              />,
              // Второй уровень рисуется отступом, а не деревом со стрелками:
              // глубина всего одна, и раскрывать здесь нечего.
              ...childFolders(folders, folder.id).map((child) => (
                <ListRow
                  key={child.id}
                  title={`    ${splitEmoji(child.name).rest}`}
                  emoji={splitEmoji(child.name).emoji ?? undefined}
                  icon="folder"
                  iconColor={theme.accent(child.accent)}
                  value={String(folderCount(notes, folders, child.id))}
                  accessory={{ type: 'disclosure' }}
                  onPress={() =>
                    router.push({ pathname: '/folders/[id]', params: { id: child.id } })
                  }
                  menu={folderMenu(child.id, child.name, true)}
                  menuTitle={child.name}
                />
              )),
            ])}
          </ListSection>
        ) : (
          <ListSection footer="Папка — место хранения. Создайте её, когда заметок станет больше, чем помещается в голове.">
            <ListRow title="Создать папку" icon="folder.badge.plus" onPress={() => addFolder(null)} />
          </ListSection>
        )}

        {/*
          Теги — те же три, что в фильтре списка, и стоят они здесь всегда,
          а не появляются, когда хоть один назначен. Раздел, который то есть,
          то нет, приходится каждый раз искать заново; постоянный со счётчиком
          «0» ещё и говорит, что тег свободен.
        */}
        <ListSection header="Теги" count={STATIC_TAGS.length} separatorInset={GLYPH_INSET}>
          {STATIC_TAGS.map((tag) => (
            <ListRow
              key={tag.id}
              title={tag.label}
              icon={tag.icon}
              iconColor={theme.accent(tag.accent)}
              value={String(tagCount[tag.id] ?? 0)}
              accessory={{ type: 'disclosure' }}
              onPress={() =>
                router.push({ pathname: '/folders/[id]', params: { id: `tag:${tag.id}` } })
              }
            />
          ))}
        </ListSection>

        <ListSection separatorInset={GLYPH_INSET}>
          <ListRow
            title="Корзина"
            icon="trash"
            value={trashed > 0 ? String(trashed) : undefined}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/folders/trash')}
          />
        </ListSection>
      </ScrollView>
    </>
  );
}
