import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip, ChipGroup } from './Chip';

const meta = {
  title: 'Компоненты/Chip',
  component: Chip,
  args: { label: 'Работа', selected: false },
  argTypes: { onPress: { action: 'press' } },
  parameters: {
    docs: { description: { component: 'Тег-фильтр из S1 и выбор тега в редакторе S2.' } },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { selected: true } };

export const WithCount: Story = { args: { count: 4 } };

export const Disabled: Story = { args: { disabled: true } };

export const Group: StoryObj<typeof ChipGroup> = {
  render: () => {
    const [selected, setSelected] = useState('__all__');
    return (
      <ChipGroup
        scrollable={false}
        selectedKey={selected}
        onSelect={setSelected}
        items={[
          { key: '__all__', label: 'Все', count: 12 },
          { key: 'Работа', label: 'Работа', count: 5 },
          { key: 'Идеи', label: 'Идеи', count: 4 },
          { key: 'Личное', label: 'Личное', count: 3 },
        ]}
      />
    );
  },
};
