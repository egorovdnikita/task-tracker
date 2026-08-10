import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockNotes } from '../mocks/notes';
import { DEFAULT_TAGS } from '../types';
import { NotesListScreen } from './NotesListScreen';

const meta = {
  title: 'Экраны/S1 Notes List',
  component: NotesListScreen,
  parameters: {
    device: true,
    layout: 'centered',
    docs: {
      description: {
        component:
          'Экран S1 из wireframe: шапка со счётчиком, поиск, лента тегов, список карточек и FAB.',
      },
    },
  },
  args: {
    notes: mockNotes,
    tags: [...DEFAULT_TAGS],
    activeTag: null,
  },
  argTypes: {
    onOpenNote: { action: 'openNote' },
    onNoteMenu: { action: 'noteMenu' },
    onCreateNote: { action: 'createNote' },
    onOpenSearch: { action: 'openSearch' },
    onOpenSettings: { action: 'openSettings' },
  },
} satisfies Meta<typeof NotesListScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CompactMode: Story = { args: { compact: true } };

export const FilteredByTag: Story = { args: { activeTag: 'Работа' } };

export const EmptyFilter: Story = {
  args: { activeTag: 'Идеи', notes: mockNotes.filter((n) => n.tag !== 'Идеи') },
};

export const Empty: Story = { args: { notes: [] } };

export const SingleNote: Story = { args: { notes: [mockNotes[0]] } };

export const Interactive: Story = {
  render: (args) => {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    return <NotesListScreen {...args} activeTag={activeTag} onSelectTag={setActiveTag} />;
  },
};
