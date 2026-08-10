import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockNotes } from '../mocks/notes';
import { NoteCard } from './NoteCard';

const meta = {
  title: 'Компоненты/NoteCard',
  component: NoteCard,
  args: { note: mockNotes[1], compact: false, highlight: '' },
  argTypes: { onPress: { action: 'open' }, onMenuPress: { action: 'menu' } },
  parameters: {
    docs: {
      description: {
        component:
          'Карточка заметки из S1: заголовок, превью в 2 строки, тег, дата, «⋮» и цветовая метка слева.',
      },
    },
  },
} satisfies Meta<typeof NoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pinned: Story = { args: { note: mockNotes[0] } };

export const Compact: Story = { args: { compact: true } };

export const NoTagNoColor: Story = { args: { note: mockNotes[2] } };

export const Untitled: Story = {
  args: { note: { ...mockNotes[2], title: '', body: 'Заметка без заголовка' } },
};

export const LongContent: Story = {
  args: {
    note: {
      ...mockNotes[1],
      title: 'Очень длинный заголовок заметки, который точно не помещается в одну строку',
      body: 'Длинный текст заметки, который обрезается на второй строке многоточием — так карточки остаются одинаковой высоты и список читается как сетка.',
    },
  },
};

export const SearchHighlight: Story = {
  args: { note: mockNotes[0], highlight: 'релиз' },
};

export const AllColors: Story = {
  render: (args) => (
    <View style={{ gap: 12, width: 340 }}>
      {(['default', 'yellow', 'green', 'blue', 'pink'] as const).map((color) => (
        <NoteCard key={color} {...args} note={{ ...mockNotes[1], id: color, color }} />
      ))}
    </View>
  ),
};
