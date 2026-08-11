import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockNotes } from '../mocks/notes';
import { DEFAULT_TAGS } from '../types';
import { NoteEditorScreen } from './NoteEditorScreen';

const meta = {
  title: 'Экраны/S2 Note Editor',
  component: NoteEditorScreen,
  parameters: {
    device: true,
    docs: {
      description: {
        component:
          'Экран S2: заголовок, текст, выбор тега и цвета, футер с датой изменения и кнопкой «Сохранить». Кнопка активна только при изменениях.',
      },
    },
  },
  args: { note: mockNotes[0], tags: [...DEFAULT_TAGS] },
  argTypes: {
    onBack: { action: 'back' },
    onSave: { action: 'save' },
    onDelete: { action: 'delete' },
  },
} satisfies Meta<typeof NoteEditorScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EditExisting: Story = {};

export const CreateNew: Story = {
  args: { note: null },
  parameters: {
    docs: {
      description: {
        story:
          'Пустой черновик. В приложении этим путём больше не ходят: создание ' +
          'идёт шитом `NoteComposerSheet`, а редактор открывается только на ' +
          'существующей заметке. Состояние оставлено — экран его поддерживает.',
      },
    },
  },
};

export const WithoutTag: Story = { args: { note: mockNotes[2] } };

export const PinnedNote: Story = { args: { note: { ...mockNotes[1], pinned: true } } };

export const LongBody: Story = {
  args: {
    note: {
      ...mockNotes[0],
      body: Array.from({ length: 12 }, (_, i) => `${i + 1}. Пункт плана релиза с описанием задачи.`).join('\n'),
    },
  },
};
