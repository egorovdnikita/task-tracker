import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppText } from '../components/AppText';
import { Icon, icons, type IconName } from '../components/Icon';
import { useTheme } from './ThemeProvider';
import { noteColors, radius, spacing, typography, type TypographyVariant } from './tokens';

const meta: Meta = {
  title: 'Основы/Design tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Токены дизайн-системы: сетка 8pt, палитры (светлая/тёмная — переключается в тулбаре), типографика, радиусы, цвета заметок и иконки.',
      },
    },
  },
};

export default meta;

const Swatch = ({ name, value }: { name: string; value: string }) => {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 6, width: 96 }}>
      <View
        style={{
          width: 64,
          height: 44,
          borderRadius: 8,
          backgroundColor: value,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      />
      <AppText variant="caption" style={{ textAlign: 'center' }}>
        {name}
      </AppText>
      <AppText variant="caption" tone="muted">
        {value}
      </AppText>
    </View>
  );
};

export const Colors: StoryObj = {
  name: 'Цвета',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: 520 }}>
        {Object.entries(theme.colors).map(([name, value]) => (
          <Swatch key={name} name={name} value={value} />
        ))}
      </View>
    );
  },
};

export const NoteAccents: StoryObj = {
  name: 'Цвета заметок',
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      {Object.entries(noteColors).map(([name, value]) => (
        <Swatch key={name} name={name} value={value === 'transparent' ? '#00000000' : value} />
      ))}
    </View>
  ),
};

export const Typography: StoryObj = {
  name: 'Типографика',
  render: () => (
    <View style={{ gap: 16, width: 460 }}>
      {(Object.keys(typography) as TypographyVariant[]).map((variant) => (
        <View key={variant} style={{ gap: 2 }}>
          <AppText variant="caption" tone="muted">
            {variant} · {typography[variant].fontSize}/{typography[variant].lineHeight} ·{' '}
            {typography[variant].fontWeight}
          </AppText>
          <AppText variant={variant}>Съешь ещё этих мягких булок</AppText>
        </View>
      ))}
    </View>
  ),
};

export const Spacing: StoryObj = {
  name: 'Отступы и радиусы',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ gap: 20, width: 460 }}>
        <View style={{ gap: 8 }}>
          {Object.entries(spacing).map(([name, value]) => (
            <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AppText variant="caption" tone="muted" style={{ width: 56 }}>
                {name} · {value}
              </AppText>
              <View style={{ width: value * 4, height: 14, backgroundColor: theme.colors.accent, borderRadius: 2 }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {Object.entries(radius).map(([name, value]) => (
            <View key={name} style={{ alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: value,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              />
              <AppText variant="caption" tone="muted">
                {name} · {value}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    );
  },
};

export const Icons: StoryObj = {
  name: 'Иконки',
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, width: 460 }}>
      {(Object.keys(icons) as IconName[]).map((name) => (
        <View key={name} style={{ alignItems: 'center', gap: 6, width: 72 }}>
          <Icon name={name} size={26} />
          <AppText variant="caption" tone="muted">
            {name}
          </AppText>
        </View>
      ))}
    </View>
  ),
};

export const TextTones: StoryObj = {
  name: 'AppText — тона',
  render: () => (
    <View style={{ gap: 8 }}>
      <AppText>default — основной текст</AppText>
      <AppText tone="muted">muted — вторичный текст, даты, теги</AppText>
      <AppText tone="danger">danger — деструктивные действия</AppText>
    </View>
  ),
};
