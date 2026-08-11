import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { NoteGlow } from '../theme/tokens';

import { Button } from './Button';
import { ColorPicker } from './ColorPicker';
import { ConfirmSheet } from './ConfirmSheet';
import { EmptyState } from './EmptyState';
import { Fab } from './Fab';
import { IconButton } from './IconButton';
import { SettingsRow, SettingsSection } from './SettingsRow';

const meta: Meta = {
  title: 'Компоненты/Прочее',
  parameters: {
    docs: {
      description: {
        component: 'Остальные элементы wireframe: пустые состояния, FAB, шит подтверждения, строки настроек.',
      },
    },
  },
};

export default meta;

export const EmptyNotes: StoryObj = {
  name: 'EmptyState — нет заметок',
  render: () => (
    <View style={{ height: 380, width: 340 }}>
      <EmptyState
        title="Пока нет заметок"
        description="Нажмите +, чтобы создать первую заметку."
        actionLabel="Новая заметка"
      />
    </View>
  ),
};

export const EmptySearch: StoryObj = {
  name: 'EmptyState — ничего не найдено',
  render: () => (
    <View style={{ height: 320, width: 340 }}>
      <EmptyState
        icon="search"
        title="Ничего не найдено"
        description="По запросу «релиз» нет заметок. Попробуйте другой запрос."
      />
    </View>
  ),
};

export const FloatingActionButton: StoryObj = {
  name: 'Fab',
  render: () => (
    <View style={{ height: 200, width: 340 }}>
      <Fab />
    </View>
  ),
};

export const IconButtons: StoryObj = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <IconButton name="back" accessibilityLabel="Назад" />
      <IconButton name="search" accessibilityLabel="Поиск" />
      <IconButton name="settings" accessibilityLabel="Настройки" />
      <IconButton name="pin" accessibilityLabel="Закрепить" active />
      <IconButton name="trash" accessibilityLabel="Удалить" tone="danger" />
      <IconButton name="more" accessibilityLabel="Ещё" tone="secondary" />
    </View>
  ),
};

export const NoteColorPicker: StoryObj = {
  name: 'ColorPicker',
  render: () => {
    const [glow, setGlow] = useState<NoteGlow>('lime');
    return <ColorPicker value={glow} onChange={setGlow} />;
  },
};

export const DeleteSheet: StoryObj = {
  name: 'ConfirmSheet — удаление',
  render: () => (
    <View style={{ width: 360, height: 420 }}>
      <ConfirmSheet
        inline
        visible
        title="Удалить заметку?"
        description="Действие необратимо — заметка будет удалена навсегда."
      />
    </View>
  ),
};

export const SettingsRows: StoryObj = {
  name: 'SettingsRow / SettingsSection',
  render: () => {
    const [dark, setDark] = useState(false);
    const [compact, setCompact] = useState(true);
    return (
      <View style={{ width: 360, gap: 24 }}>
        <SettingsSection title="Вид">
          <SettingsRow title="Тёмная тема" type="switch" value={dark} onValueChange={setDark} />
          <SettingsRow
            title="Компактный список"
            description="Скрывать превью текста"
            type="switch"
            value={compact}
            onValueChange={setCompact}
          />
        </SettingsSection>
        <SettingsSection title="Сортировка">
          <SettingsRow title="По дате изменения" type="select" value />
          <SettingsRow title="По заголовку" type="select" />
        </SettingsSection>
        <SettingsSection title="Данные">
          <SettingsRow title="Удалить все заметки" type="danger" />
        </SettingsSection>
      </View>
    );
  },
};

export const ButtonsInSheet: StoryObj = {
  name: 'Button — пара в шите',
  render: () => (
    <View style={{ width: 320, gap: 8 }}>
      <Button label="Удалить" variant="danger" size="lg" fullWidth />
      <Button label="Отмена" variant="secondary" size="lg" fullWidth />
    </View>
  ),
};
