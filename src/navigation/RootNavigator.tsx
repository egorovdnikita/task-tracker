import React, { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer, type NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmSheet } from '../components/ConfirmSheet';
import { NoteComposerSheet } from '../components/NoteComposerSheet';
import { NotesListScreen } from '../screens/NotesListScreen';
import { NoteEditorScreen, type NoteDraft } from '../screens/NoteEditorScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { collectTags, searchNotes, sortNotes, useNotesStore } from '../store/useNotesStore';
import { useTheme } from '../theme/ThemeProvider';

export type RootStackParamList = {
  Notes: undefined;
  Editor: { noteId?: string } | undefined;
  Search: undefined;
  Settings: undefined;
};

export type RootStackScreens = NavigatorScreenParams<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Shared chrome: safe area + themed background for every screen. */
const Screen = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>{children}</View>
    </SafeAreaView>
  );
};

const confirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Удалить', style: 'destructive', onPress: onConfirm },
  ]);
};

const NotesRoute = ({ navigation }: any) => {
  const { notes, settings } = useNotesStore();
  const addNote = useNotesStore((s) => s.addNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const togglePinned = useNotesStore((s) => s.togglePinned);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const sorted = useMemo(() => sortNotes(notes, settings.sort), [notes, settings.sort]);
  const menuNote = notes.find((n) => n.id === menuId) ?? null;

  return (
    <Screen>
      <NotesListScreen
        notes={sorted}
        tags={collectTags(notes)}
        activeTag={activeTag}
        compact={settings.compact}
        onSelectTag={setActiveTag}
        onOpenNote={(noteId) => navigation.navigate('Editor', { noteId })}
        onNoteMenu={setMenuId}
        // Создание — шит поверх списка; экран редактора остаётся для правки.
        onCreateNote={() => setComposing(true)}
        onOpenSearch={() => navigation.navigate('Search')}
        onOpenSettings={() => navigation.navigate('Settings')}
      />
      <NoteComposerSheet
        visible={composing}
        tags={collectTags(notes)}
        onCancel={() => setComposing(false)}
        onCreate={(draft) => {
          addNote(draft);
          setComposing(false);
        }}
      />
      <ConfirmSheet
        visible={menuNote !== null}
        title={menuNote?.pinned ? 'Открепить заметку?' : 'Удалить заметку?'}
        description={
          menuNote?.pinned
            ? 'Заметка перестанет быть первой в списке.'
            : 'Действие необратимо — заметка будет удалена навсегда.'
        }
        confirmLabel={menuNote?.pinned ? 'Открепить' : 'Удалить'}
        destructive={!menuNote?.pinned}
        onConfirm={() => {
          if (!menuId) return;
          if (menuNote?.pinned) togglePinned(menuId);
          else deleteNote(menuId);
          setMenuId(null);
        }}
        onCancel={() => setMenuId(null)}
      />
    </Screen>
  );
};

const EditorRoute = ({ navigation, route }: any) => {
  const noteId: string | undefined = route.params?.noteId;
  const notes = useNotesStore((s) => s.notes);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const note = notes.find((n) => n.id === noteId) ?? null;

  const save = (draft: NoteDraft) => {
    if (note) updateNote(note.id, draft);
    else addNote(draft);
    navigation.goBack();
  };

  return (
    <Screen>
      <NoteEditorScreen
        note={note}
        tags={collectTags(notes)}
        onBack={() => navigation.goBack()}
        onSave={save}
        onDelete={
          note
            ? () =>
                confirm('Удалить заметку?', 'Действие необратимо.', () => {
                  deleteNote(note.id);
                  navigation.goBack();
                })
            : undefined
        }
      />
    </Screen>
  );
};

const SearchRoute = ({ navigation }: any) => {
  const notes = useNotesStore((s) => s.notes);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchNotes(notes, query), [notes, query]);

  return (
    <Screen>
      <SearchScreen
        query={query}
        results={results}
        onChangeQuery={setQuery}
        onBack={() => navigation.goBack()}
        onOpenNote={(noteId) => navigation.navigate('Editor', { noteId })}
      />
    </Screen>
  );
};

const SettingsRoute = ({ navigation }: any) => {
  const settings = useNotesStore((s) => s.settings);
  const updateSettings = useNotesStore((s) => s.updateSettings);
  const clearAll = useNotesStore((s) => s.clearAll);

  return (
    <Screen>
      <SettingsScreen
        settings={settings}
        onBack={() => navigation.goBack()}
        onChange={updateSettings}
        onClearAll={() => confirm('Удалить все заметки?', 'Действие необратимо.', clearAll)}
      />
    </Screen>
  );
};

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Notes" component={NotesRoute} />
      <Stack.Screen name="Editor" component={EditorRoute} />
      <Stack.Screen name="Search" component={SearchRoute} options={{ animation: 'fade' }} />
      <Stack.Screen name="Settings" component={SettingsRoute} />
    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({ flex: { flex: 1 } });
