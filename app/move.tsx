import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ListRow, ListSection } from '../src/components';
import { accentNames, useTheme } from '../src/theme';
import { promptForText } from '../src/utils/actionSheet';
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

      <ScrollView
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
      >
        <ListSection>
          <ListRow
            title="Без папки"
            icon="tray"
            iconBackground={theme.colors.systemGray2}
            onPress={() => move(null)}
          />
        </ListSection>

        {roots.length > 0 ? (
          <ListSection header="Папки">
            {roots.flatMap((folder) => [
              <ListRow
                key={folder.id}
                title={folder.name}
                icon="folder.fill"
                iconBackground={theme.accent(folder.accent)}
                onPress={() => move(folder.id)}
              />,
              ...childFolders(folders, folder.id).map((child) => (
                <ListRow
                  key={child.id}
                  title={`    ${child.name}`}
                  icon="folder"
                  iconBackground={theme.accent(child.accent)}
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
            iconBackground={theme.colors.systemBlue}
            onPress={() =>
              promptForText('Новая папка', 'Как её назвать?', (name) => {
                const folder = createFolder(
                  name,
                  accentNames[folders.length % accentNames.length],
                  null,
                );
                move(folder.id);
              })
            }
          />
        </ListSection>
      </ScrollView>
    </>
  );
}
