import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from './Switch';
import { AppText } from './AppText';
import { theme } from '../theme/tokens';

const meta = {
  title: 'Компоненты/Switch',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          'Тумблер по эталону, а не системный: бегунок — пилюля заметно шире своей ' +
          'высоты и целиком лежит внутри трека. Системный круг на той же ширине ' +
          'оставлял по краям пустые лунки, а `Switch` из React Native такой ' +
          'геометрии не даёт вовсе.',
      },
    },
  },
  args: { value: true },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Включён: Story = {};

export const Выключен: Story = { args: { value: false } };

export const Отключён: Story = { args: { value: true, disabled: true } };

export const Интерактивный: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <View style={{ alignItems: 'center', gap: theme.spacing.md }}>
        <Switch value={on} onValueChange={setOn} accessibilityLabel="Компактный список" />
        <AppText variant="caption" tone="secondary">
          {on ? 'Включено' : 'Выключено'}
        </AppText>
      </View>
    );
  },
};
