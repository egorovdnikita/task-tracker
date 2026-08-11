import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';
import { textStyleNames } from '../theme';

const meta = {
  title: 'Компоненты/Текст',
  component: Text,
  parameters: { layout: 'padded' },
  args: { children: 'Съешь ещё этих мягких булок', variant: 'body' },
  argTypes: {
    variant: { control: 'select', options: textStyleNames },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
    color: {
      control: 'select',
      options: ['label', 'secondaryLabel', 'tertiaryLabel', 'systemBlue', 'systemRed'],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Стиль: Story = {};

/**
 * Иерархия держится весом и цветом, а не только кеглем: два соседних текста
 * одного размера различаются вторичным цветом, и это читается быстрее, чем
 * разница в один-два пункта.
 */
export const Иерархия: Story = {
  render: () => (
    <View style={{ gap: 4 }}>
      <Text variant="largeTitle" weight="bold">
        Заметки
      </Text>
      <Text variant="headline">Созвон по релизу</Text>
      <Text variant="subheadline" color="secondaryLabel">
        Обсудить сроки, QA и что выносим в 1.1
      </Text>
      <Text variant="caption1" color="tertiaryLabel">
        Вчера · Работа
      </Text>
    </View>
  ),
};
