import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField';

const meta = {
  title: 'Компоненты/TextField',
  component: TextField,
  args: { value: '', placeholder: 'Заголовок' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['boxed', 'plain'] },
    size: { control: 'inline-radio', options: ['title', 'body'] },
    onChangeText: { action: 'change' },
  },
  parameters: {
    docs: { description: { component: 'Поля ввода редактора S2: заголовок и многострочный текст.' } },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleInput: Story = { args: { size: 'title', placeholder: 'Заголовок' } };

export const Filled: Story = { args: { size: 'title', value: 'Созвон по релизу' } };

export const BodyMultiline: Story = {
  args: {
    multiline: true,
    placeholder: 'Текст заметки...',
    style: { height: 180 },
    inputStyle: { minHeight: 160 },
  },
};

export const WithLabel: Story = { args: { label: 'Заголовок', value: 'Список покупок' } };

export const WithError: Story = { args: { value: '', error: 'Заполните заголовок или текст' } };

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};
