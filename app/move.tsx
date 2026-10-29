import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ListRow, ListSection } from '../src/components';
import { accentNames, useTheme } from '../src/theme';
import { splitEmoji } from '../src/utils/emoji';
import { promptForFolderName } from '../src/features/folders';
import { childFolders, rootFolders, useNotesStore } from '../src/store/useNotesStore';

/**
 * Плита 05.3 — перенос в папку.
 *
 * Шит, а не экран: список за затемнением остаётся виден, и понятно, что именно
 * переносится. Новая папка создаётся прямо здесь — выходить из потока ради
 * одного поля незачем.
 */
export default function MoveScreen() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const theme = useTheme();
  const folders = useNotesStore((s) => s.folders);
  const moveNotes = useNotesStore((s) => s.moveNotes);
  const createFolder = useNotesStore((s) => s.createFolder);

  const targets = useMemo(() => (ids ? ids.split(',').filter(Boolean) : []), [ids]);
  const roots = useMemo(() => rootFolders(folders), [folders]);

  const move = (folderId: string | null) => {
    moveNotes(targets, folderId);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: targets.length > 1 ? `Переместить: ${targets.length}` : 'Переместить',
        }}
      />

      {/* Шапка шита прозрачная, и без системной поправки на инсеты первая
          строка списка встаёт под неё. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
      >
        <ListSection>
          <ListRow
            title="Без папки"
            icon="tray"
            iconColor={theme.colors.secondaryLabel}
            onPress={() => move(null)}
          />
        </ListSection>

        {roots.length > 0 ? (
          <ListSection header="Папки">
            {roots.flatMap((folder) => [
              <ListRow
                key={folder.id}
                title={splitEmoji(folder.name).rest}
                emoji={splitEmoji(folder.name).emoji ?? undefined}
                icon="folder.fill"
                iconColor={theme.accent(folder.accent)}
                onPress={() => move(folder.id)}
              />,
              ...childFolders(folders, folder.id).map((child) => (
                <ListRow
                  key={child.id}
                  title={splitEmoji(child.name).rest}
                  level={1}
                  hint={`Вложена в «${splitEmoji(folder.name).rest}»`}
                  emoji={splitEmoji(child.name).emoji ?? undefined}
                  icon="folder"
                  iconColor={theme.accent(child.accent)}
                  onPress={() => move(child.id)}
                />
              )),
            ])}
          </ListSection>
        ) : null}

        <ListSection>
          <ListRow
            title="Новая папка…"
            icon="folder.badge.plus"
            onPress={() =>
              promptForFolderName({
                title: 'Новая папка',
                message: 'Как её назвать?',
                parentId: null,
                onSubmit: (name) => {
                  const folder = createFolder(
                    name,
                    accentNames[folders.length % accentNames.length],
                    null,
                  );
                  move(folder.id);
                },
              })
            }
          />
        </ListSection>
      </ScrollView>
    </>
  );
}
