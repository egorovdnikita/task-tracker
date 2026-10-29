import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

import {
  GLYPH_SEPARATOR_INSET,
  Fab,
  ListRow,
  ListSection,
  RootHeader,
  ScreenBackdrop,
} from '../../../src/components';
import { accentNames, useTheme } from '../../../src/theme';
import { STATIC_TAGS } from '../../../src/features/tags';
import { splitEmoji } from '../../../src/utils/emoji';
import { showActionSheet } from '../../../src/utils/actionSheet';
import { promptForFolderName } from '../../../src/features/folders';
import {
  activeNotes,
  childFolders,
  folderCount,
  rootFolders,
  trashedNotes,
  useNotesStore,
} from '../../../src/store/useNotesStore';

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
    promptForFolderName({
      title: parentId ? 'Вложенная папка' : 'Новая папка',
      message: 'Как её назвать? Имя может начинаться с эмодзи — оно встанет вместо иконки.',
      parentId,
      onSubmit: (name) =>
        createFolder(name, accentNames[folders.length % accentNames.length], parentId),
    });

  /** Пункты меню папки. Меню растёт из самой строки — его ставит `ListRow`. */
  const folderMenu = (id: string, name: string, nested: boolean) => () => [
    {
      title: 'Переименовать',
      icon: 'pencil' as const,
      onPress: () =>
        promptForFolderName({
          title: 'Переименовать',
          message: 'Новое имя папки',
          parentId: folders.find((f) => f.id === id)?.parentId ?? null,
          initial: name,
          renaming: id,
          onSubmit: (next) => renameFolder(id, next),
        }),
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
      <ScreenBackdrop />
      {/* Корень вкладки — крупный заголовок слева и круг «+» справа. */}
      <Stack.Screen options={{ headerShown: false, title: 'Папки' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: theme.metrics.tabBar + theme.spacing.xxxl }}
      >
        <RootHeader
          title="Папки"
          style={{ marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg }}
          right={
            <Fab
              compact
              accessibilityLabel="Новая папка"
              onPress={() => addFolder(null)}
            />
          }
        />

        <ListSection separatorInset={GLYPH_SEPARATOR_INSET}>
          {/* «Все заметки» здесь больше нет: строка перекидывала на соседнюю
              вкладку и уводила из стека «Папок», а все заметки — это и есть
              вкладка «Заметки». */}
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
            action={{ icon: 'plus', label: 'Новая', onPress: () => addFolder(null) }}
            separatorInset={GLYPH_SEPARATOR_INSET}
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
                  title={splitEmoji(child.name).rest}
                  level={1}
                  hint={`Вложена в «${splitEmoji(folder.name).rest}»`}
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
        <ListSection header="Теги" separatorInset={GLYPH_SEPARATOR_INSET}>
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

        <ListSection separatorInset={GLYPH_SEPARATOR_INSET}>
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
