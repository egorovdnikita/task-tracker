import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmptyState } from './EmptyState';
import { ListRow, ListSection, Separator } from './List';
import { NoteCard } from './NoteCard';
import { Text } from './Text';
import { Toast } from './Toast';
import { useTheme } from '../theme';
import { mockChecklistNote, mockNote, mockNotes } from '../mocks/notes';

const meta = {
  title: 'Компоненты/Коллекции',
  parameters: { layout: 'padded', grouped: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Инсет-группа — основа настроек и папок.
 *
 * Разделители расставляет секция, а не строки: строка не знает, последняя ли
 * она, а линия под последней легла бы поверх скругления.
 */
export const Список: Story = {
  render: () => {
    const theme = useTheme();
    const [switched, setSwitched] = useState(true);
    const [choice, setChoice] = useState('system');

    return (
      <ScrollView>
        <ListSection header="Вид" separatorInset={theme.metrics.separatorInset + 29 + theme.spacing.md}>
          <ListRow
            title="Оформление"
            icon="circle.lefthalf.filled"
            iconBackground={theme.colors.systemIndigo}
            value="Как в системе"
            accessory={{ type: 'disclosure' }}
            onPress={() => {}}
          />
          <ListRow
            title="Отмеченные вниз"
            subtitle="Выполненные пункты уезжают в конец списка"
            icon="checklist"
            iconBackground={theme.colors.systemGreen}
            accessory={{ type: 'switch', value: switched, onValueChange: setSwitched }}
          />
        </ListSection>

        <ListSection header="Оформление" footer="Схема меняется вместе с системной.">
          {['system', 'light', 'dark'].map((value) => (
            <ListRow
              key={value}
              title={{ system: 'Как в системе', light: 'Светлое', dark: 'Тёмное' }[value]!}
              accessory={{ type: 'checkmark', checked: choice === value }}
              onPress={() => setChoice(value)}
            />
          ))}
        </ListSection>

        <ListSection header="Разрушающее">
          <ListRow title="Очистить корзину" destructive onPress={() => {}} />
        </ListSection>

        <View style={{ gap: 8 }}>
          <Text variant="footnote" color="secondaryLabel">
            Разделитель отдельно
          </Text>
          <Separator />
          <Separator inset={32} />
        </View>
      </ScrollView>
    );
  },
};

/** Карточка заметки. Превью зависит от содержимого, а не от типа. */
export const Карточки: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <NoteCard note={mockNote} />
      <NoteCard note={mockChecklistNote} />
      <NoteCard note={mockNotes[2]} />
      <NoteCard note={mockNote} selectable selected />
      <NoteCard note={mockNote} highlight="релиз" />
    </View>
  ),
};

/** Сетка: карточки одной высоты, как в системной галерее «Заметок». */
export const Сетка: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <NoteCard note={mockNote} layout="grid" style={{ flex: 1, height: 168 }} />
      <NoteCard note={mockChecklistNote} layout="grid" style={{ flex: 1, height: 168 }} />
    </View>
  ),
};

/** Пустые состояния: у каждого списка свой текст и свой следующий шаг. */
export const Пусто: Story = {
  parameters: { grouped: false },
  render: () => (
    <View style={{ height: 420 }}>
      <EmptyState
        icon="note.text"
        title="Здесь пока пусто"
        description="Первая заметка обычно самая короткая — так и надо."
        actionTitle="Создать заметку"
        onAction={() => {}}
      />
    </View>
  ),
};

/**
 * Тост с отменой.
 *
 * Живёт ради одного правила: любое разрушающее действие обратимо пять секунд.
 * Без кнопки показывать его незачем.
 */
export const Отмена: Story = {
  parameters: { grouped: false },
  render: () => {
    const [message, setMessage] = useState<string | null>('Заметка в корзине');

    return (
      <View style={{ height: 200, justifyContent: 'flex-end' }}>
        <Text variant="footnote" color="secondaryLabel" onPress={() => setMessage('Заметка в корзине')}>
          Нажмите, чтобы показать снова
        </Text>
        <Toast message={message} onAction={() => {}} onHide={() => setMessage(null)} />
      </View>
    );
  },
};
