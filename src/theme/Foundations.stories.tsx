import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppText } from '../components/AppText';
import { Icon, iconNames } from '../components/Icon';
import { useTheme } from './ThemeProvider';
import {
  colors,
  gradients,
  NOTE_GLOW_OPACITY,
  noteGlowLabels,
  noteGlows,
  radius,
  sizes,
  spacing,
  typography,
  type NoteGlow,
  type TypographyVariant,
} from './tokens';

const meta: Meta = {
  title: 'Основы/Design tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Токены сняты пиксельно с референса: цвета — гистограммой площади и пробами по насыщенности, ' +
          'радиусы — по кривизне углов ÷3, кегли — по высоте прописных (cap / 0.72). Система dark-only.',
      },
    },
  },
};

export default meta;

const Swatch = ({ name, value }: { name: string; value: string }) => {
  const theme = useTheme();
  return (
    <View style={{ gap: 6, width: 132 }}>
      <View
        style={{
          height: 56,
          borderRadius: theme.radius.sm,
          backgroundColor: value,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      />
      <AppText variant="caption">{name}</AppText>
      <AppText variant="caption" tone="tertiary">
        {value}
      </AppText>
    </View>
  );
};

export const Colors: StoryObj = {
  name: 'Цвета',
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: 600 }}>
      {Object.entries(colors).map(([name, value]) => (
        <Swatch key={name} name={name} value={value} />
      ))}
    </View>
  ),
};

export const Gradients: StoryObj = {
  name: 'Градиенты',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ gap: 16, width: 520 }}>
        {(Object.keys(gradients) as (keyof typeof gradients)[]).map((name) => (
          <View key={name} style={{ gap: 6 }}>
            <AppText variant="caption" tone="secondary">
              {name} · {gradients[name].join(' → ')}
            </AppText>
            <LinearGradient
              colors={gradients[name] as unknown as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 56,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
          </View>
        ))}
      </View>
    );
  },
};

export const NoteGlows: StoryObj = {
  name: 'Свечения заметок',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {(Object.keys(noteGlows) as NoteGlow[]).map((key) => (
          <View key={key} style={{ gap: 8, alignItems: 'center', width: 104 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
              }}
            >
              {noteGlows[key] ? (
                <View
                  style={{
                    position: 'absolute',
                    right: -24,
                    top: -24,
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: noteGlows[key] as string,
                    opacity: NOTE_GLOW_OPACITY,
                  }}
                />
              ) : null}
            </View>
            <AppText variant="caption" tone="secondary">
              {noteGlowLabels[key]}
            </AppText>
          </View>
        ))}
      </View>
    );
  },
};

export const Typography: StoryObj = {
  name: 'Типографика',
  render: () => (
    <View style={{ gap: 18, width: 520 }}>
      {(Object.keys(typography) as TypographyVariant[]).map((variant) => (
        <View key={variant} style={{ gap: 2 }}>
          <AppText variant="caption" tone="tertiary">
            {variant} · {typography[variant].fontSize}/{typography[variant].lineHeight} ·{' '}
            {typography[variant].fontFamily}
          </AppText>
          <AppText variant={variant}>Съешь ещё этих мягких булок</AppText>
        </View>
      ))}
    </View>
  ),
};

export const SpacingAndRadius: StoryObj = {
  name: 'Отступы и радиусы',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ gap: 28, width: 520 }}>
        <View style={{ gap: 8 }}>
          {Object.entries(spacing).map(([name, value]) => (
            <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AppText variant="caption" tone="tertiary" style={{ width: 64 }}>
                {name} · {value}
              </AppText>
              <View
                style={{
                  width: value * 6,
                  height: 12,
                  backgroundColor: theme.colors.accentLime,
                  borderRadius: 2,
                }}
              />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {Object.entries(radius).map(([name, value]) => (
            <View key={name} style={{ alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: value,
                  backgroundColor: theme.colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: theme.colors.borderStrong,
                }}
              />
              <AppText variant="caption" tone="tertiary">
                {name} · {value}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    );
  },
};

export const Sizes: StoryObj = {
  name: 'Высоты контролов',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ gap: 10, width: 520 }}>
        {Object.entries(sizes).map(([name, value]) => (
          <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <AppText variant="caption" tone="tertiary" style={{ width: 110 }}>
              {name} · {value}
            </AppText>
            <View
              style={{
                width: 240,
                height: value,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
          </View>
        ))}
      </View>
    );
  },
};

export const Icons: StoryObj = {
  name: 'Иконки',
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, width: 520 }}>
      {iconNames.map((name) => (
        <View key={name} style={{ alignItems: 'center', gap: 8, width: 84 }}>
          <Icon name={name} size={26} />
          <AppText variant="caption" tone="tertiary">
            {name}
          </AppText>
        </View>
      ))}
    </View>
  ),
};

export const TextTones: StoryObj = {
  name: 'Тона текста',
  render: () => (
    <View style={{ gap: 8 }}>
      <AppText variant="body">default — основной текст</AppText>
      <AppText variant="body" tone="secondary">secondary — подписи строк</AppText>
      <AppText variant="body" tone="tertiary">tertiary — плейсхолдеры</AppText>
      <AppText variant="body" tone="accent">accent — акцентные значения</AppText>
      <AppText variant="body" tone="danger">danger — деструктивные действия</AppText>
    </View>
  ),
};
