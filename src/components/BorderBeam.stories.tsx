import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { BorderBeam } from '../vendor/border-beam';
import type { BorderBeamSize } from '../vendor/border-beam/types';
import { AppText } from './AppText';
import { Button } from './Button';
import { Fab } from './Fab';
import { GlassSurface } from './GlassSurface';
import { NoteCard } from './NoteCard';
import { theme } from '../theme/tokens';
import { mockNote } from '../mocks/notes';

const SIZES: BorderBeamSize[] = ['sm', 'md', 'line', 'pulse-outside', 'pulse-inner'];

/** Карточка-пустышка размером с NoteCard — чтобы луч мерили на реальной геометрии. */
const Card = ({ label }: { label: string }) => (
  <GlassSurface
    mesh="card"
    stroke="card"
    tint={theme.tints.card}
    radius={theme.radius.lg}
    style={{ width: 300, padding: theme.spacing.xl, gap: theme.spacing.sm }}
  >
    <AppText variant="body">{label}</AppText>
    <AppText variant="subtle" tone="secondary">
      Луч идёт по контуру, а не по краю содержимого
    </AppText>
  </GlassSurface>
);

const Case = ({
  title,
  verdict,
  children,
}: {
  title: string;
  verdict: string;
  children: React.ReactNode;
}) => (
  <View style={{ gap: theme.spacing.sm, maxWidth: 340 }}>
    <AppText variant="body">{title}</AppText>
    <AppText variant="subtle" tone="secondary">
      {verdict}
    </AppText>
    <View style={{ paddingVertical: theme.spacing.sm }}>{children}</View>
  </View>
);

const meta = {
  title: 'Компоненты/BorderBeam',
  component: BorderBeam,
  parameters: {
    docs: {
      description: {
        component:
          'Порт border-beam на Skia (см. `src/vendor/border-beam`). В приложении ' +
          'разрешён только тип `sm`: остальные шире контура и на наших радиусах ' +
          'читаются ореолом, а не обводкой. Луч — сигнал, а не украшение: он ' +
          'уместен там, где есть состояние «сейчас требуется действие», и вреден ' +
          'там, где горит постоянно.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: SIZES },
    colorVariant: { control: 'inline-radio', options: ['colorful', 'mono', 'ocean', 'sunset'] },
    strength: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
  args: {
    size: 'sm',
    colorVariant: 'colorful',
    theme: 'dark',
    borderRadius: theme.radius.lg,
    children: <Card label="Черновик доклада" />,
  },
} satisfies Meta<typeof BorderBeam>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Одиночный: Story = {
  render: (args) => (
    <BorderBeam {...args}>
      <Card label="Черновик доклада" />
    </BorderBeam>
  ),
};

/** Почему в приложении разрешён только `sm`. */
export const ПочемуТолькоSm: Story = {
  render: (args) => (
    <View style={{ gap: theme.spacing.xxl }}>
      {SIZES.map((size) => (
        <View key={size} style={{ gap: theme.spacing.sm }}>
          <AppText variant="overline" tone="tertiary">
            {size}
          </AppText>
          <BorderBeam {...args} size={size}>
            <Card label="Черновик доклада" />
          </BorderBeam>
        </View>
      ))}
    </View>
  ),
};

/** Куда луч ставить можно, а куда не стоит. */
export const ГдеПрименять: Story = {
  render: () => {
    const [dirty, setDirty] = useState(true);

    return (
      <View style={{ gap: theme.spacing.xxxl, maxWidth: 360 }}>
        <Case
          title="Да: кнопка, которая ждёт нажатия"
          verdict="Есть несохранённые правки — луч горит; сохранили — гаснет сам через `active`. Так он и стоит в редакторе."
        >
          <BorderBeam
            size="sm"
            active={dirty}
            borderRadius={theme.sizes.buttonLarge / 2}
            style={{ alignSelf: 'stretch' }}
          >
            <Button label="Сохранить" fullWidth onPress={() => setDirty((v) => !v)} />
          </BorderBeam>
        </Case>

        <Case
          title="Да: разовое подтверждение в шите"
          verdict="Шит живёт секунды и на экране один. Луч успевает сработать как указатель и уходит вместе с шитом."
        >
          <BorderBeam size="sm" borderRadius={theme.sizes.buttonLarge / 2} style={{ alignSelf: 'stretch' }}>
            <Button label="Создать заметку" icon="plus" fullWidth />
          </BorderBeam>
        </Case>

        <Case
          title="Нет: закреплённая карточка в списке"
          verdict="Закрепление — это признак, а не событие. Луч будет гореть всегда, тянуть взгляд на каждом скролле и жечь батарею на каждом кадре."
        >
          <BorderBeam size="sm" borderRadius={theme.radius.lg}>
            <NoteCard note={mockNote} />
          </BorderBeam>
        </Case>

        <Case
          title="Нет: FAB"
          verdict="Кнопка и так самый яркий объект экрана — залитый меш лайм → аква. Луч по её краю добавляет второй источник света к тому же силуэту."
        >
          <View style={{ height: 96 }}>
            <BorderBeam size="sm" borderRadius={theme.sizes.fab / 2} style={{ alignSelf: 'flex-start' }}>
              <Fab style={{ position: 'relative', right: 0, bottom: 0 }} />
            </BorderBeam>
          </View>
        </Case>
      </View>
    );
  },
};
