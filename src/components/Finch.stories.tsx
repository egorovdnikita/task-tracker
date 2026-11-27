import React from 'react';
import { ScrollView, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScreenBackdrop } from './ScreenBackdrop';
import { RootHeader } from './RootHeader';
import { Fab } from './Fab';
import { HeaderGlass, IconButton } from './Button';
import { NoteCard } from './NoteCard';
import { EmptyState } from './EmptyState';
import { ListSection, ListRow } from './List';
import { Text } from './Text';
import { mockNotes } from '../mocks/notes';

const meta = { title: 'Компоненты/Finch', parameters: { device: true, layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Главная: Story = { render: () => <View style={{ flex: 1 }}>
  <ScreenBackdrop />
  <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 59, gap: 16 }}>
    <RootHeader title="Заметки" count={mockNotes.length} right={<><HeaderGlass><IconButton name="magnifyingglass" accessibilityLabel="Поиск" /></HeaderGlass><Fab compact onPress={() => {}} /></>} />
    <Text color="onBackdrop" variant="headline">Закреплено</Text>
    <NoteCard note={{ ...mockNotes[0], pinned: true }} />
    <Text color="onBackdrop" variant="headline">Ранее</Text>
    {mockNotes.slice(1, 4).map(note => <NoteCard key={note.id} note={{ ...note, pinned: false }} />)}
  </ScrollView>
</View> };
export const Пусто: Story = { render: () => <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
  <ScreenBackdrop /><EmptyState icon="note.text" title="Здесь пока пусто" description="Первая заметка обычно самая короткая — так и надо." actionTitle="Новая заметка" onAction={() => {}} />
</View> };
export const Группа: Story = { render: () => <View style={{ flex: 1, paddingTop: 100 }}>
  <ScreenBackdrop /><ListSection header="Настройки"><ListRow title="Уведомления" icon="bell" accessory={{ type: 'disclosure' }} /><ListRow title="Статистика" icon="chart.bar" value="6" /></ListSection>
</View> };
