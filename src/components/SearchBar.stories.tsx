import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Компоненты/SearchBar',
  component: SearchBar,
  args: { value: '', placeholder: 'Поиск по заметкам' },
  argTypes: { onChangeText: { action: 'change' }, onClear: { action: 'clear' }, onFocus: { action: 'focus' } },
  parameters: {
    docs: { description: { component: 'Поле поиска: неактивная заглушка на S1 и активное поле на S3.' } },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithQuery: Story = { args: { value: 'релиз' } };

export const ReadOnlyTrigger: Story = {
  args: { editable: false },
  parameters: { docs: { description: { story: 'Вариант с S1 — тап открывает экран поиска.' } } },
};

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <SearchBar {...args} value={value} onChangeText={setValue} onClear={() => setValue('')} />;
  },
};
