import React, { Children, Fragment, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  View,
  type ColorValue,
  type ViewStyle,
} from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme, type PaletteName } from '../theme';
import { Symbol, SymbolBadge } from './Symbol';
import { Text } from './Text';

/**
 * Разделитель строк.
 *
 * Толщина — половина точки, а не единица: на экране с плотностью 3x единица
 * даёт линию в три физических пикселя, и список выглядит расчерченным, а не
 * разделённым. Отступ слева выравнивает линию по началу текста, чтобы она
 * не пересекала иконку.
 */
export const Separator = ({ inset = 0, style }: { inset?: number; style?: ViewStyle }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        { height: theme.metrics.hairline, backgroundColor: theme.colors.separator, marginLeft: inset },
        style,
      ]}
    />
  );
};

export type ListSectionProps = {
  /** Шапка секции. В системе — прописными и вторичным цветом. */
  header?: string;
  /** Пояснение под секцией: что произойдёт, а не что это такое. */
  footer?: string;
  children: ReactNode;
  /** Отступ разделителя слева — под ширину иконки в строках этой секции. */
  separatorInset?: number;
  style?: ViewStyle;
};

/**
 * Инсет-группа — контейнер строк со скруглением и полями по краям экрана.
 *
 * Разделители расставляет сама секция, а не строки: строка не знает, последняя
 * ли она, а рисовать линию под последней нельзя — она ляжет поверх скругления.
 */
export const ListSection = ({
  header,
  footer,
  children,
  separatorInset = 0,
  style,
}: ListSectionProps) => {
  const theme = useTheme();
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View style={[{ marginBottom: theme.spacing.xxl }, style]}>
      {header ? (
        <Text
          variant="footnote"
          color="secondaryLabel"
          style={{
            marginHorizontal: theme.spacing.lg + theme.spacing.lg,
            marginBottom: theme.spacing.sm,
            textTransform: 'uppercase',
          }}
        >
          {header}
        </Text>
      ) : null}

      <View
        style={[
          styles.group,
          {
            marginHorizontal: theme.spacing.lg,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.secondarySystemGroupedBackground,
          },
        ]}
      >
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <Separator inset={separatorInset} /> : null}
            {row}
          </Fragment>
        ))}
      </View>

      {footer ? (
        <Text
          variant="footnote"
          color="secondaryLabel"
          style={{
            marginHorizontal: theme.spacing.lg + theme.spacing.lg,
            marginTop: theme.spacing.sm,
          }}
        >
          {footer}
        </Text>
      ) : null}
    </View>
  );
};

export type ListRowAccessory =
  /** Стрелка вправо: строка ведёт на другой экран. */
  | { type: 'disclosure' }
  /** Галочка: строка — вариант выбора внутри секции. */
  | { type: 'checkmark'; checked: boolean }
  /** Тумблер: строка сама и есть настройка. */
  | { type: 'switch'; value: boolean; onValueChange: (value: boolean) => void }
  /** Ничего справа. */
  | { type: 'none' };

export type ListRowProps = {
  title: string;
  /** Пояснение под заголовком. */
  subtitle?: string;
  /** Текущее значение справа — видно, не заходя внутрь. */
  value?: string;
  icon?: SFSymbol;
  /** Цвет плашки под иконкой. Без него иконка рисуется без плашки. */
  iconBackground?: ColorValue;
  accessory?: ListRowAccessory;
  /** Свой элемент справа — например крестик, снимающий строку. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Контекстное меню строки — переименовать, вложить, удалить. */
  onLongPress?: () => void;
  /** Разрушающее действие — заголовок красный. */
  destructive?: boolean;
  disabled?: boolean;
  titleColor?: PaletteName;
};

export const ListRow = ({
  title,
  subtitle,
  value,
  icon,
  iconBackground,
  accessory = { type: 'none' },
  trailing,
  onPress,
  onLongPress,
  destructive = false,
  disabled = false,
  titleColor,
}: ListRowProps) => {
  const theme = useTheme();
  const color: PaletteName = destructive ? 'systemRed' : titleColor ?? 'label';

  const content = (
    <View
      style={[
        styles.row,
        {
          minHeight: subtitle ? theme.controlHeight.rowDetail : theme.controlHeight.row,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          gap: theme.spacing.md,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      {icon ? (
        iconBackground ? (
          <SymbolBadge name={icon} background={iconBackground} />
        ) : (
          <Symbol name={icon} size={22} color={theme.colors.systemBlue} />
        )
      ) : null}

      <View style={styles.labels}>
        <Text variant="body" color={color}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="secondaryLabel">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="body" color="secondaryLabel" numberOfLines={1}>
          {value}
        </Text>
      ) : null}

      {trailing}

      {accessory.type === 'disclosure' ? (
        <Symbol name="chevron.right" size={14} color={theme.colors.tertiaryLabel} weight="semibold" />
      ) : null}

      {accessory.type === 'checkmark' && accessory.checked ? (
        <Symbol name="checkmark" size={16} color={theme.colors.systemBlue} weight="semibold" />
      ) : null}

      {accessory.type === 'switch' ? (
        // Нативный Switch, а не своя анимация: у системного есть отдача,
        // поведение при «Уменьшении движения» и правильный отклик VoiceOver.
        <Switch
          value={accessory.value}
          onValueChange={accessory.onValueChange}
          disabled={disabled}
        />
      ) : null}
    </View>
  );

  // Строка с тумблером не нажимается целиком: нажатие на неё и переключение
  // тумблера — два разных жеста, и объединять их значит переключать настройку
  // случайным касанием по подписи.
  if ((!onPress && !onLongPress) || accessory.type === 'switch') return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: accessory.type === 'checkmark' ? accessory.checked : undefined }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.systemFill : 'transparent',
      })}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  group: { overflow: 'hidden', borderCurve: 'continuous' },
  row: { flexDirection: 'row', alignItems: 'center' },
  labels: { flex: 1, gap: 1 },
});
