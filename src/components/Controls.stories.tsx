import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';
import { Chip, ChipWrap } from './Chip';
import { Fab } from './Fab';
import { SearchField } from './SearchField';
import { Text } from './Text';
import { TextField } from './TextField';

const meta = {
  title: 'Компоненты/Контролы',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ gap: 8, marginBottom: 24 }}>
    <Text variant="footnote" color="secondaryLabel" style={{ textTransform: 'uppercase' }}>
      {title}
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {children}
    </View>
  </View>
);

/**
 * Кнопки.
 *
 * Залитая на экране одна: она отвечает на вопрос «что здесь главное». Две
 * залитые кнопки рядом означают, что на вопрос не ответили.
 *
 * Стеклянные варианты в браузере показаны запасной заливкой — на устройстве
 * это жидкое стекло.
 */
export const Кнопки: Story = {
  render: () => (
    <View>
      <Row title="Стили">
        <Button title="Filled" variant="filled" />
        <Button title="Tinted" variant="tinted" />
        <Button title="Gray" variant="gray" />
        <Button title="Plain" variant="plain" />
        <Button title="Glass" variant="glass" />
      </Row>

      <Row title="Размеры">
        <Button title="Regular" size="regular" />
        <Button title="Large" size="large" />
      </Row>

      <Row title="Состояния">
        <Button title="С иконкой" icon="plus" />
        <Button title="Загрузка" loading />
        <Button title="Выключена" disabled />
        <Button title="Удалить" variant="tinted" destructive />
      </Row>

      <Row title="На всю ширину">
        <Button title="Создать заметку" size="large" fullWidth />
      </Row>
    </View>
  ),
};

/** Чипы: капсула означает, что выбор снимается и может быть множественным. */
export const Чипы: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['Работа']);
    const toggle = (tag: string) =>
      setSelected((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));

    return (
      <View style={{ gap: 24 }}>
        <ChipWrap>
          {['Работа', 'Идеи', 'Личное', 'Покупки'].map((tag) => (
            <Chip
              key={tag}
              label={tag}
              icon="tag"
              selected={selected.includes(tag)}
              onPress={() => toggle(tag)}
            />
          ))}
        </ChipWrap>

        <ChipWrap>
          <Chip label="Красный" accent="red" selected />
          <Chip label="Зелёный" accent="green" selected />
          <Chip label="Синий" accent="blue" selected />
          <Chip label="Снимается" selected onRemove={() => {}} />
        </ChipWrap>

        {/* Обводка — чип-действие: он открывает выбор, а не показывает
            сделанный. Заливка у такого читалась бы как уже выбранное. */}
        <ChipWrap>
          <Chip label="Список задач" icon="checklist" outlined onPress={() => {}} />
          <Chip label="Напомнить" icon="bell" outlined onPress={() => {}} />
          <Chip label="Тег" icon="tag" outlined onPress={() => {}} />
        </ChipWrap>
      </View>
    );
  },
};

/**
 * Поля ввода.
 *
 * Поле поиска здесь своё, и это единственное исключение из правила «системное
 * вместо похожего»: системного поля поиска у нижнего края не существует —
 * `UISearchBar` живёт в шапке, а внизу iOS 26 отдаёт только слот вкладки с
 * ролью `search`. Вкладку поиска мы убрали, поэтому поле собрано из системных
 * частей: капсула стекла, символ `magnifyingglass`, обычный `TextInput`.
 */
export const Поля: Story = {
  render: () => {
    const [name, setName] = useState('');

    return (
      <View style={{ gap: 24 }}>
        <TextField label="Имя папки" value={name} onChangeText={setName} placeholder="Например, Работа" />
        <TextField
          label="Имя папки"
          value="Работа"
          invalid
          hint="Папка с таким именем уже есть на этом уровне"
          onChangeText={() => {}}
        />

        <SearchFieldExample />
      </View>
    );
  },
};

const SearchFieldExample = () => {
  const [query, setQuery] = useState('');
  return <SearchField value={query} onChangeText={setQuery} placeholder="Поиск по заметкам" />;
};

/**
 * Кнопка создания.
 *
 * Сплошной круг акцентом, а не стекло: под кнопкой едет список, и стеклянная
 * кнопка растворялась ровно там, где нужна сильнее всего, — на почти пустом
 * экране. На устройстве она стоит в нижнем ряду справа, рядом с полем поиска.
 */
export const Создание: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Fab onPress={() => {}} />
      <Text variant="footnote" color="secondaryLabel">
        Долгое нажатие — выбор типа заметки
      </Text>
    </View>
  ),
};

