import React, { Children, Fragment, useRef, type ReactNode } from 'react';
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
import { showMenu, type MenuItem } from './Menu';
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
  /**
   * Число в шапке — «Папки 8».
   *
   * Меняет и набор: с числом шапка перестаёт быть прописными и становится
   * обычной строкой. Прописные вторичным читаются как служебная подпись, а
   * когда в шапке важно количество, эта строгость мешает его увидеть.
   */
  count?: number;
  /** Пояснение под секцией: что произойдёт, а не что это такое. */
  footer?: string;
  /**
   * Кнопка справа в шапке — «добавить в эту группу».
   *
   * Место действия рядом с названием группы, а не в шапке экрана: в шапке
   * оно относилось бы ко всему экрану, а создаёт оно строку именно здесь.
   */
  action?: { icon: SFSymbol; label: string; onPress: () => void };
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
  count,
  footer,
  action,
  children,
  separatorInset = 0,
  style,
}: ListSectionProps) => {
  const theme = useTheme();
  const rows = Children.toArray(children).filter(Boolean);

  return (
    // Зазор между группами крупный: остров держится вместе не рамкой, а
    // воздухом вокруг. При тесной расстановке две группы читаются одной.
    <View style={[{ marginBottom: theme.spacing.xxxl }, style]}>
      {header ? (
        /*
          Шапка секции — одна строка на все случаи: название, при нужде число
          рядом с ним и действие справа.

          Набор не прописной. Прописные в 13pt — системный приём из «Настроек»
          iOS, и он там уместен: разделов десятки, и шапка обязана быть
          незаметнее любого из них. Здесь секций две-три, и шапка у них не
          служебная подпись, а единственное, что объясняет группу. Прописные
          её при этом ещё и растягивают: «МОИ ДАННЫЕ» занимает вдвое больше
          места, чем читает глаз.

          С числом шапка становится тёмной и крупнее: там, где важно
          количество, вторичный серый прячет и его тоже.
        */
        <View
          style={[
            styles.header,
            {
              marginHorizontal: theme.spacing.lg + theme.spacing.xs,
              marginBottom: theme.spacing.sm,
              gap: theme.spacing.sm,
            },
          ]}
        >
          <Text
            variant={count === undefined ? 'subheadline' : 'headline'}
            weight="semibold"
            color={count === undefined ? 'secondaryLabel' : 'label'}
          >
            {header}
          </Text>

          {count !== undefined ? (
            <Text variant="headline" color="tertiaryLabel">
              {count}
            </Text>
          ) : null}

          <View style={styles.grow} />

          {action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={action.onPress}
              hitSlop={12}
              style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
            >
              <Symbol name={action.icon} size={19} color={theme.colors.accent} />
            </Pressable>
          ) : null}
        </View>
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
  /**
   * Цвет самого глифа — вместо плашки.
   *
   * Признак живёт в цвете символа, а не в заливке под ним: плашка 29pt
   * тяжелее того, что обозначает, и в списке из десяти папок первым, что
   * видит глаз, оказываются десять цветных квадратов.
   */
  iconColor?: ColorValue;
  /**
   * Эмодзи вместо иконки — когда человек назвал папку «📦 Покупки».
   *
   * Своё обозначение всегда лучше назначенного: цвет различает две папки,
   * эмодзи — десять, и выбирает его тот, кто эти папки завёл.
   */
  emoji?: string;
  accessory?: ListRowAccessory;
  /** Свой элемент справа — например крестик, снимающий строку. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Контекстное меню строки — переименовать, вложить, удалить. */
  onLongPress?: () => void;
  /**
   * Меню по долгому нажатию, растущее из самой строки.
   *
   * Строка измеряет себя и отдаёт прямоугольник меню — иначе оно приезжало бы
   * от нижнего края экрана, и было бы не видно, к какой из десяти папок оно
   * относится. Считается в момент нажатия: набор пунктов зависит от текущего
   * состояния строки.
   */
  menu?: () => MenuItem[];
  menuTitle?: string;
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
  iconColor,
  emoji,
  accessory = { type: 'none' },
  trailing,
  onPress,
  onLongPress,
  menu,
  menuTitle,
  destructive = false,
  disabled = false,
  titleColor,
}: ListRowProps) => {
  const theme = useTheme();
  const color: PaletteName = destructive ? 'systemRed' : titleColor ?? 'label';
  const ref = useRef<View>(null);

  const openMenu = menu
    ? () =>
        ref.current?.measureInWindow((x, y, width, height) =>
          showMenu(menu(), { x, y, width, height }, menuTitle),
        )
    : undefined;

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
      {emoji ? (
        <Text variant="title3" style={styles.emoji}>
          {emoji}
        </Text>
      ) : icon ? (
        iconBackground ? (
          <SymbolBadge name={icon} background={iconBackground} />
        ) : (
          <Symbol name={icon} size={22} color={iconColor ?? theme.colors.accent} />
        )
      ) : null}

      <View style={styles.labels}>
        {/* Заголовок строки — Semibold: в списке он подписывает всё, что стоит
            под ним и справа от него, и обычным весом теряется среди значений. */}
        <Text variant="body" weight="semibold" color={color}>
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
        <Symbol name="checkmark" size={16} color={theme.colors.accent} weight="semibold" />
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
  if ((!onPress && !onLongPress && !openMenu) || accessory.type === 'switch') return content;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: accessory.type === 'checkmark' ? accessory.checked : undefined }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={openMenu ?? onLongPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.systemFill : 'transparent',
      })}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  // Ширина как у глифа: с эмодзи и без него строки стоят в одну колонку.
  emoji: { width: 22, textAlign: 'center' },
  group: { overflow: 'hidden', borderCurve: 'continuous' },
  row: { flexDirection: 'row', alignItems: 'center' },
  labels: { flex: 1, gap: 1 },
});
