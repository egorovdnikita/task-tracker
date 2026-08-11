import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../components/Text';
import {
  accentLabels,
  accentNames,
  controlHeight,
  materialNames,
  palette,
  radius,
  spacing,
  textStyleNames,
  textStyles,
  useTheme,
  type PaletteName,
} from './index';

const meta = {
  title: 'Основы/Токены',
  parameters: { layout: 'padded', grouped: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xxl }}>
      <Text variant="footnote" color="secondaryLabel" style={{ textTransform: 'uppercase' }}>
        {title}
      </Text>
      {children}
    </View>
  );
};

const Swatch = ({ name }: { name: PaletteName }) => {
  const theme = useTheme();

  return (
    <View style={[styles.row, { gap: theme.spacing.md }]}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radius.sm,
          borderCurve: 'continuous',
          backgroundColor: theme.colors[name],
          borderWidth: theme.metrics.hairline,
          borderColor: theme.colors.separator,
        }}
      />
      <View style={styles.grow}>
        <Text variant="subheadline">{name}</Text>
        <Text variant="caption1" color="tertiaryLabel">
          {theme.hex[name]}
        </Text>
      </View>
    </View>
  );
};

/**
 * Цвета.
 *
 * Переключатель схемы в тулбаре меняет обе колонки разом: значение внизу
 * каждого образца — то, что реально подставится в этой схеме.
 */
export const Цвета: Story = {
  render: () => (
    <ScrollView>
      <Group title="Фоны">
        {(['systemBackground', 'secondarySystemBackground', 'tertiarySystemBackground',
           'systemGroupedBackground', 'secondarySystemGroupedBackground',
           'tertiarySystemGroupedBackground'] as PaletteName[]).map((name) => (
          <Swatch key={name} name={name} />
        ))}
      </Group>

      <Group title="Текст">
        {(['label', 'secondaryLabel', 'tertiaryLabel', 'quaternaryLabel', 'placeholderText'] as PaletteName[]).map(
          (name) => <Swatch key={name} name={name} />,
        )}
      </Group>

      <Group title="Разделители и заливки">
        {(['separator', 'opaqueSeparator', 'systemFill', 'secondarySystemFill',
           'tertiarySystemFill', 'quaternarySystemFill'] as PaletteName[]).map((name) => (
          <Swatch key={name} name={name} />
        ))}
      </Group>

      <Group title="Акценты">
        {accentNames.map((accent) => (
          <AccentSwatch key={accent} accent={accent} />
        ))}
      </Group>

      <Group title="Серые">
        {(['systemGray', 'systemGray2', 'systemGray3', 'systemGray4', 'systemGray5',
           'systemGray6'] as PaletteName[]).map((name) => <Swatch key={name} name={name} />)}
      </Group>
    </ScrollView>
  ),
};

const AccentSwatch = ({ accent }: { accent: (typeof accentNames)[number] }) => {
  const theme = useTheme();
  const value = theme.accent(accent);

  return (
    <View style={[styles.row, { gap: theme.spacing.md }]}>
      <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: value }} />
      <View style={styles.grow}>
        <Text variant="subheadline">{accentLabels[accent]}</Text>
        <Text variant="caption1" color="tertiaryLabel">
          {accent} · {value}
        </Text>
      </View>
    </View>
  );
};

/**
 * Типографика.
 *
 * Значения — при системном размере Large. На устройстве всё это растёт вместе
 * с Dynamic Type: кегли здесь — точка отсчёта, а не константы.
 */
export const Типографика: Story = {
  render: () => (
    <ScrollView>
      {textStyleNames.map((name) => (
        <View key={name} style={{ marginBottom: 20, gap: 2 }}>
          <Text variant="caption2" color="tertiaryLabel">
            {name} · {textStyles[name].fontSize}/{textStyles[name].lineHeight} · вес{' '}
            {textStyles[name].fontWeight} · трекинг {textStyles[name].letterSpacing}
          </Text>
          <Text variant={name}>Съешь ещё этих мягких булок</Text>
        </View>
      ))}
    </ScrollView>
  ),
};

/** Метрики: шаг сетки, радиусы и высоты контролов. */
export const Метрики: Story = {
  render: () => {
    const Bar = ({ label, size }: { label: string; size: number }) => (
      <View style={[styles.row, { gap: 12, marginBottom: 8 }]}>
        <Text variant="caption1" color="secondaryLabel" style={{ width: 108 }}>
          {label}
        </Text>
        <View style={{ height: 16, width: size, borderRadius: 3, backgroundColor: '#0A84FF' }} />
        <Text variant="caption1" color="tertiaryLabel">
          {size}
        </Text>
      </View>
    );

    return (
      <ScrollView>
        <Group title="Отступы">
          {Object.entries(spacing).map(([name, value]) => (
            <Bar key={name} label={name} size={value} />
          ))}
        </Group>

        <Group title="Радиусы">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(radius).map(([name, value]) => (
              <View key={name} style={{ alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: Math.min(value, 32),
                    borderCurve: 'continuous',
                    backgroundColor: '#8E8E93',
                  }}
                />
                <Text variant="caption2" color="tertiaryLabel">
                  {name} · {value}
                </Text>
              </View>
            ))}
          </View>
        </Group>

        <Group title="Высоты контролов">
          {Object.entries(controlHeight).map(([name, value]) => (
            <Bar key={name} label={name} size={value} />
          ))}
        </Group>
      </ScrollView>
    );
  },
};

/**
 * Материалы.
 *
 * В браузере размытия нет — показана запасная заливка, та самая, что уедет
 * на веб и на Android. На устройстве вместо неё будет системный материал,
 * а на iOS 26 — жидкое стекло.
 */
export const Материалы: Story = {
  render: () => {
    const theme = useTheme();

    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="footnote" color="secondaryLabel">
          Ниже — запасной уровень: плотная заливка без размытия.
        </Text>
        {materialNames.map((name) => (
          <View
            key={name}
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radius.lg,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.tertiarySystemFill,
            }}
          >
            <Text variant="subheadline" weight="semibold">
              {name}
            </Text>
            <Text variant="caption1" color="secondaryLabel">
              {name === 'ultraThin'
                ? 'Поверх фотографии — максимум просвечивает'
                : name === 'chrome'
                  ? 'Под панелью навигации — сквозь стекло виден только факт содержимого'
                  : 'Плавающие панели и шиты'}
            </Text>
          </View>
        ))}
      </View>
    );
  },
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
});
