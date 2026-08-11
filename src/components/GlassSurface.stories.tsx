import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { GlassSurface } from './GlassSurface';
import { useTheme } from '../theme/ThemeProvider';
import { meshes, strokes } from '../theme/tokens';

const meta = {
  title: 'Основы/Glass surface',
  component: GlassSurface,
  parameters: {
    docs: {
      description: {
        component:
          'Базовая поверхность системы: матовое стекло + меш из мягких эллипсов + градиентная обводка. ' +
          'Эллипсы рисуются радиальными градиентами, затухающими в прозрачность, — визуально это ' +
          'размытое пятно, но работает одинаково на iOS, Android и в вебе.',
      },
    },
  },
} satisfies Meta<typeof GlassSurface>;

export default meta;

/** CTA из референса: свет снизу, оливковый слева → бирюзовый справа. */
export const CtaButton: StoryObj = {
  name: 'CTA — меш + светящаяся обводка',
  render: () => (
    <View style={{ width: 340, gap: 16 }}>
      <GlassSurface
        mesh="cta"
        stroke="cta"
        radius={999}
        tint="rgba(255,255,255,0.04)"
        style={{ height: 56, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="check" size={18} />
          <AppText variant="body">Сохранить</AppText>
        </View>
      </GlassSurface>
    </View>
  ),
};

export const MeshPresets: StoryObj = {
  name: 'Пресеты меша',
  render: () => (
    <View style={{ gap: 20, width: 360 }}>
      {(Object.keys(meshes) as (keyof typeof meshes)[]).map((name) => (
        <View key={name} style={{ gap: 6 }}>
          <AppText variant="caption" tone="tertiary">
            mesh: {name}
          </AppText>
          <GlassSurface
            mesh={name}
            stroke="card"
            tint="rgba(255,255,255,0.03)"
            style={{ height: 96 }}
          />
        </View>
      ))}
    </View>
  ),
};

export const StrokePresets: StoryObj = {
  name: 'Пресеты обводки',
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ gap: 16, width: 360 }}>
        {(Object.keys(strokes) as (keyof typeof strokes)[]).map((name) => (
          <View key={name} style={{ gap: 6 }}>
            <AppText variant="caption" tone="tertiary">
              stroke: {name} · {strokes[name].from} → {strokes[name].to}
            </AppText>
            <GlassSurface
              stroke={name}
              strokeWidth={1}
              tint={theme.colors.surface}
              style={{ height: 72 }}
            />
          </View>
        ))}
      </View>
    );
  },
};

/** Проверка блюра: под стеклом лежит цветная подложка. */
export const FrostedGlass: StoryObj = {
  name: 'Матовое стекло',
  render: () => (
    <View style={{ width: 360, height: 220 }}>
      <View
        style={{
          position: 'absolute',
          left: 24,
          top: 12,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: '#DCFEAA',
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 16,
          top: 60,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: '#7FE3D4',
        }}
      />
      <GlassSurface
        blurIntensity={40}
        stroke="glass"
        tint="rgba(24,24,24,0.55)"
        radius={32}
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 20,
          height: 96,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText variant="body">Матовое стекло поверх цвета</AppText>
      </GlassSurface>
    </View>
  ),
};

export const GlassCard: StoryObj = {
  name: 'Карточка',
  render: () => (
    <GlassSurface
      mesh="card"
      stroke="card"
      tint="#0C0C0C"
      style={{ width: 340, padding: 20, gap: 8 }}
    >
      <AppText variant="title">Созвон по релизу</AppText>
      <AppText variant="subtle" tone="secondary">
        Обсудить сроки, QA и что выносим в 1.1. Проверить, что сторы приняли билд.
      </AppText>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <AppText variant="caption" tone="tertiary">
          #работа
        </AppText>
        <AppText variant="caption" tone="tertiary">
          Сегодня
        </AppText>
      </View>
    </GlassSurface>
  ),
};
