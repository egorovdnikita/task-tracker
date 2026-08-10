import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader } from './AppHeader';

const meta = {
  title: 'Компоненты/AppHeader',
  component: AppHeader,
  args: { title: 'Заметки' },
  parameters: {
    docs: { description: { component: 'Верхняя панель. Есть во всех экранах S1–S4.' } },
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ListHeader: Story = {
  args: {
    title: 'Заметки',
    subtitle: '12 заметок',
    actions: [{ name: 'settings', accessibilityLabel: 'Настройки' }],
  },
};

export const EditorHeader: Story = {
  args: {
    title: 'Правка',
    onBack: () => {},
    actions: [
      { name: 'pin', accessibilityLabel: 'Закрепить', active: true },
      { name: 'trash', accessibilityLabel: 'Удалить', tone: 'danger' },
    ],
  },
};

export const BackOnly: Story = { args: { title: 'Настройки', onBack: () => {} } };

export const TitleOnly: Story = { args: { title: 'Заметки' } };
