import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

import { IconButton, ListRow, ListSection } from '../../../src/components';
import { accentNames, useTheme } from '../../../src/theme';
import { confirmDestructive, promptForText, showActionSheet } from '../../../src/utils/actionSheet';
import {
  activeNotes,
  childFolders,
  collectTags,
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
 */
export default function FoldersScreen() {
  const theme = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const createFolder = useNotesStore((s) => s.createFolder);
  const renameFolder = useNotesStore((s) => s.renameFolder);
  const deleteFolder = useNotesStore((s) => s.deleteFolder);

  const roots = useMemo(() => rootFolders(folders), [folders]);
  const tags = useMemo(() => collectTags(notes), [notes]);
  const inbox = useMemo(() => activeNotes(notes).filter((n) => !n.folderId).length, [notes]);
  const trashed = useMemo(() => trashedNotes(notes).length, [notes]);

  const addFolder = (parentId: string | null = null) =>
    promptForText(
      parentId ? 'Вложенная папка' : 'Новая папка',
      'Как её назвать?',
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

  const folderMenu = (id: string, name: string, nested: boolean) =>
    showActionSheet(
      [
        {
          title: 'Переименовать…',
          onPress: () =>
            promptForText('Переименовать', 'Новое имя папки', (next) => renameFolder(id, next), name),
        },
        ...(nested ? [] : [{ title: 'Вложенная папка…', onPress: () => addFolder(id) }]),
        {
          title: 'Удалить папку',
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
      ],
      { title: name },
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Папки',
          headerRight: () => (
            <IconButton
              name="folder.badge.plus"
              accessibilityLabel="Новая папка"
              onPress={() => addFolder(null)}
            />
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxxl }}
      >
        <ListSection separatorInset={theme.metrics.separatorInset + 29 + theme.spacing.md}>
          <ListRow
            title="Все заметки"
            icon="tray.full"
            iconBackground={theme.colors.systemGray}
            value={String(activeNotes(notes).length)}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.navigate('/notes')}
          />
          <ListRow
            title="Без папки"
            icon="tray"
            iconBackground={theme.colors.systemGray2}
            value={String(inbox)}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push({ pathname: '/folders/[id]', params: { id: 'root' } })}
          />
        </ListSection>

        {roots.length > 0 ? (
          <ListSection
            header="Мои папки"
            separatorInset={theme.metrics.separatorInset + 29 + theme.spacing.md}
          >
            {roots.flatMap((folder) => [
              <ListRow
                key={folder.id}
                title={folder.name}
                icon="folder.fill"
                iconBackground={theme.accent(folder.accent)}
                value={String(folderCount(notes, folders, folder.id))}
                accessory={{ type: 'disclosure' }}
                onPress={() =>
                  router.push({ pathname: '/folders/[id]', params: { id: folder.id } })
                }
                onLongPress={() => folderMenu(folder.id, folder.name, false)}
              />,
              // Второй уровень рисуется отступом, а не деревом со стрелками:
              // глубина всего одна, и раскрывать здесь нечего.
              ...childFolders(folders, folder.id).map((child) => (
                <ListRow
                  key={child.id}
                  title={`    ${child.name}`}
                  icon="folder"
                  iconBackground={theme.accent(child.accent)}
                  value={String(folderCount(notes, folders, child.id))}
                  accessory={{ type: 'disclosure' }}
                  onPress={() =>
                    router.push({ pathname: '/folders/[id]', params: { id: child.id } })
                  }
                  onLongPress={() => folderMenu(child.id, child.name, true)}
                />
              )),
            ])}
          </ListSection>
        ) : (
          <ListSection footer="Папка — место хранения. Создайте её, когда заметок станет больше, чем помещается в голове.">
            <ListRow title="Создать папку" icon="folder.badge.plus" onPress={() => addFolder(null)} />
          </ListSection>
        )}

        {tags.length > 0 ? (
          <ListSection header="Теги" separatorInset={theme.metrics.separatorInset + 22 + theme.spacing.md}>
            {tags.map((tag) => (
              <ListRow
                key={tag}
                title={tag}
                icon="tag"
                value={String(activeNotes(notes).filter((n) => n.tags.includes(tag)).length)}
                accessory={{ type: 'disclosure' }}
                onPress={() =>
                  router.push({ pathname: '/folders/[id]', params: { id: `tag:${tag}` } })
                }
              />
            ))}
          </ListSection>
        ) : null}

        <ListSection separatorInset={theme.metrics.separatorInset + 29 + theme.spacing.md}>
          <ListRow
            title="Корзина"
            icon="trash"
            iconBackground={theme.colors.systemGray}
            value={trashed > 0 ? String(trashed) : undefined}
            accessory={{ type: 'disclosure' }}
            onPress={() => router.push('/folders/trash')}
          />
        </ListSection>
      </ScrollView>
    </>
  );
}
