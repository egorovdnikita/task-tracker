import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { NoteComposerSheet } from './NoteComposerSheet';

const meta = {
  title: 'Компоненты/NoteComposerSheet',
  component: NoteComposerSheet,
  parameters: {
    device: true,
    docs: {
      description: {
        component:
          'Создание заметки идёт шитом поверх списка, а не отдельным экраном. ' +
          'Раскладка шапки снята с эталона: закрытие слева, заголовок по центру, ' +
          'подтверждение — акцентным кругом справа. Кнопка стоит в шапке, потому ' +
          'что под клавиатурой нижний край шита уезжает за экран.',
      },
    },
  },
  args: {
    visible: true,
    inline: true,
    tags: ['Работа', 'Идеи', 'Личное'],
  },
} satisfies Meta<typeof NoteComposerSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Пустой: Story = {};

export const БезТегов: Story = { args: { tags: [] } };
