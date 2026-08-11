import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThinkingOrb, type OrbState } from './ThinkingOrb';
import { AppText } from './AppText';
import { theme } from '../theme/tokens';

const STATES: OrbState[] = [
  'working',
  'searching',
  'solving',
  'listening',
  'connecting',
  'weaving',
  'composing',
  'breathing',
  'shaping',
];

const meta = {
  title: 'Компоненты/ThinkingOrb',
  component: ThinkingOrb,
  argTypes: {
    state: { control: 'select', options: STATES },
    size: { control: 'inline-radio', options: [64, 20] },
    speed: { control: { type: 'range', min: 0.25, max: 3, step: 0.05 } },
  },
  args: { state: 'working', size: 64, speed: 1, paused: false },
} satisfies Meta<typeof ThinkingOrb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Одиночный: Story = {};

export const ВсеСостояния: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxl, maxWidth: 360 }}>
      {STATES.map((state) => (
        <View key={state} style={{ alignItems: 'center', gap: theme.spacing.sm, width: 88 }}>
          <ThinkingOrb state={state} size={64} />
          <AppText variant="caption" tone="secondary">
            {state}
          </AppText>
        </View>
      ))}
    </View>
  ),
};

export const ВСтрокеТекста: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <ThinkingOrb state="searching" size={20} />
      <AppText variant="subtle" tone="secondary">
        Ищу по заметкам…
      </AppText>
    </View>
  ),
};
