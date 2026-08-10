import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockNotes } from '../mocks/notes';
import { searchNotes } from '../store/useNotesStore';
import { SearchScreen } from './SearchScreen';

const meta = {
  title: 'Экраны/S3 Search',
  component: SearchScreen,
  parameters: {
    device: true,
    docs: {
      description: {
        component: 'Экран S3: поиск по заголовку, тексту и тегу с подсветкой совпадений в карточках.',
      },
    },
  },
  args: { query: '', results: [] },
  argTypes: { onBack: { action: 'back' }, onOpenNote: { action: 'openNote' } },
} satisfies Meta<typeof SearchScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const WithResults: Story = {
  args: { query: 'релиз', results: searchNotes(mockNotes, 'релиз') },
};

export const NoResults: Story = { args: { query: 'квартальный отчёт', results: [] } };

export const Interactive: Story = {
  render: (args) => {
    const [query, setQuery] = useState('');
    const results = useMemo(() => searchNotes(mockNotes, query), [query]);
    return <SearchScreen {...args} query={query} results={results} onChangeQuery={setQuery} />;
  },
};
