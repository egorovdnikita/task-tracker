import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Settings } from '../types';
import { SettingsScreen } from './SettingsScreen';

const base: Settings = { scheme: 'light', compact: false, sort: 'updated' };

const meta = {
  title: 'Экраны/S4 Settings',
  component: SettingsScreen,
  parameters: {
    device: true,
    docs: { description: { component: 'Экран S4: вид, сортировка, очистка данных, версия.' } },
  },
  args: { settings: base },
  argTypes: { onBack: { action: 'back' }, onChange: { action: 'change' }, onClearAll: { action: 'clearAll' } },
} satisfies Meta<typeof SettingsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CompactAndSortedByTitle: Story = {
  args: { settings: { ...base, compact: true, sort: 'title' } },
};

export const Interactive: Story = {
  render: (args) => {
    const [settings, setSettings] = useState<Settings>(base);
    return (
      <SettingsScreen
        {...args}
        settings={settings}
        onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Переключатель «Тёмная тема» здесь меняет только состояние экрана — глобальную тему Storybook переключайте в тулбаре.',
      },
    },
  },
};
