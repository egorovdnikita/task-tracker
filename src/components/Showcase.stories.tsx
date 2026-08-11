import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppHeader } from './AppHeader';
import { AppText } from './AppText';
import { Button } from './Button';
import { Chip, ChipGroup } from './Chip';
import { ConfirmSheet } from './ConfirmSheet';
import { EmptyState } from './EmptyState';
import { Fab } from './Fab';
import { IconButton } from './IconButton';
import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { SettingsRow, SettingsSection } from './SettingsRow';
import { TabBar } from './TabBar';
import { TextField } from './TextField';
import { mockNotes } from '../mocks/notes';
import { useTheme } from '../theme/ThemeProvider';

const meta: Meta = {
  title: 'Основы/Витрина',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Все атомы и молекулы в одном месте — для сверки с референсом.',
      },
    },
  },
};

export default meta;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="overline" tone="tertiary">
        {title.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
};

export const Atoms: StoryObj = {
  name: 'Атомы',
  render: () => {
    const theme = useTheme();
    const [query, setQuery] = useState('');
    const [tag, setTag] = useState('Работа');
    const [title, setTitle] = useState('');

    return (
      <ScrollView
        style={{ width: 390, height: 760 }}
        contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.xxl }}
      >
        <Section title="Кнопки">
          <Button label="Сохранить" icon="check" fullWidth />
          <Button label="Отмена" variant="secondary" fullWidth />
          <Button label="Удалить" variant="danger" fullWidth />
          <Button label="Пропустить" variant="ghost" />
        </Section>

        <Section title="Круглые кнопки">
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <IconButton name="back" accessibilityLabel="Назад" />
            <IconButton name="close" accessibilityLabel="Закрыть" />
            <IconButton name="plus" accessibilityLabel="Добавить" />
            <IconButton name="pin" accessibilityLabel="Закрепить" active />
            <IconButton name="trash" accessibilityLabel="Удалить" tone="danger" />
          </View>
        </Section>

        <Section title="Поиск">
          <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />
        </Section>

        <Section title="Чипы">
          <ChipGroup
            scrollable={false}
            selectedKey={tag}
            onSelect={setTag}
            items={[
              { key: 'Все', label: 'Все', count: 12 },
              { key: 'Работа', label: 'Работа', count: 5 },
              { key: 'Идеи', label: 'Идеи', count: 4 },
            ]}
          />
        </Section>

        <Section title="Поля ввода">
          <TextField value={title} onChangeText={setTitle} placeholder="Заголовок" />
          <TextField value="" placeholder="Текст заметки…" multiline />
        </Section>
      </ScrollView>
    );
  },
};

export const Molecules: StoryObj = {
  name: 'Молекулы',
  render: () => {
    const theme = useTheme();
    return (
      <ScrollView
        style={{ width: 390, height: 760 }}
        contentContainerStyle={{ paddingVertical: theme.spacing.xl, gap: theme.spacing.xxl }}
      >
        <AppHeader title="Правка" onBack={() => {}} actions={[{ name: 'more', accessibilityLabel: 'Ещё' }]} />

        <View style={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.xxl }}>
          <NoteCard note={mockNotes[0]} />
          <NoteCard note={mockNotes[1]} />
        </View>

        <SettingsSection title="Вид">
          <SettingsRow title="Компактный список" description="Скрывать превью текста" type="switch" value icon="grid" />
          <SettingsRow title="По дате изменения" type="select" value icon="sliders" />
          <SettingsRow title="Удалить все заметки" type="danger" icon="trash" />
        </SettingsSection>
      </ScrollView>
    );
  },
};

export const Overlays: StoryObj = {
  name: 'Оверлеи',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ width: 390, height: 500, backgroundColor: theme.colors.background }}>
        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <NoteCard note={mockNotes[3]} />
          <NoteCard note={mockNotes[4]} />
        </View>
        <ConfirmSheet
          inline
          visible
          title="Удалить заметку?"
          description="Действие необратимо — заметка будет удалена навсегда."
        />
      </View>
    );
  },
};

export const Navigation: StoryObj = {
  name: 'Таб-бар и FAB',
  render: () => {
    const theme = useTheme();
    const [tab, setTab] = useState('notes');
    return (
      <View style={{ width: 390, height: 420, backgroundColor: theme.colors.background }}>
        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <NoteCard note={mockNotes[0]} compact />
          <NoteCard note={mockNotes[2]} compact />
        </View>
        <Fab />
        <TabBar
          activeKey={tab}
          onSelect={setTab}
          items={[
            { key: 'notes', label: 'Заметки', icon: 'note' },
            { key: 'search', label: 'Поиск', icon: 'search' },
            { key: 'profile', label: 'Профиль', icon: 'user' },
          ]}
        />
      </View>
    );
  },
};

export const Empty: StoryObj = {
  name: 'Пустое состояние',
  render: () => (
    <View style={{ width: 390, height: 500 }}>
      <EmptyState
        title="Пока нет заметок"
        description="Нажмите +, чтобы создать первую заметку."
        actionLabel="Новая заметка"
      />
    </View>
  ),
};
