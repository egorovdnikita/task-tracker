import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Компоненты/Button',
  component: Button,
  args: { label: 'Сохранить', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    onPress: { action: 'pressed' },
  },
  parameters: {
    docs: { description: { component: 'Кнопка из S2 (Сохранить) и S5 (Удалить / Отмена).' } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { label: 'Отмена', variant: 'secondary' } };

export const Danger: Story = { args: { label: 'Удалить', variant: 'danger' } };

export const Ghost: Story = { args: { label: 'Пропустить', variant: 'ghost' } };

export const WithIcon: Story = { args: { label: 'Новая заметка', icon: 'plus' } };

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const FullWidthLarge: Story = {
  args: { label: 'Сохранить', size: 'lg', fullWidth: true },
};

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button {...args} label="Primary" variant="primary" />
      <Button {...args} label="Secondary" variant="secondary" />
      <Button {...args} label="Ghost" variant="ghost" />
      <Button {...args} label="Danger" variant="danger" />
    </View>
  ),
};
