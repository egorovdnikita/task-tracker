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
import { GlassSurface } from './GlassSurface';
import { Text } from './Text';

/**
 * Разделитель строк.
 *
 * Вне групп — тонкая линия в половину точки. Внутри группы строк — линия
 * Opal: 1pt `#191919` с отступом и слева, и справа (см. `ListSection`).
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
  /**
   * Действие справа в шапке — «+ Новая папка».
   *
   * Как «+ New» у Opal: ссылка акцентом со знаком плюса, а не голая иконка.
   * Место действия рядом с названием группы: создаёт оно строку именно здесь.
   */
  action?: { icon: SFSymbol; label: string; onPress: () => void };
  /** На чём лежит группа: на экране или внутри шита — там она светлее. */
  tone?: 'screen' | 'sheet';
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
  action,
  children,
  separatorInset,
  tone = 'screen',
  style,
}: ListSectionProps) => {
  const theme = useTheme();
  const inSheet = tone === 'sheet';
  // Без явного отступа разделитель начинается там же, где текст строки.
  const inset = separatorInset ?? theme.spacing.lg;
  const rows = Children.toArray(children).filter(Boolean);

  return (
    // Зазор между группами крупный: остров держится вместе не рамкой, а
    // воздухом вокруг. При тесной расстановке две группы читаются одной.
    <View style={[{ marginBottom: theme.spacing.xxxl }, style]}>
      {header ? (
        /*
          Шапка секции — как у Opal: белая, 17 semibold, левый край на одной
          линии с текстом строк. Счётчика нет — у Opal его нет нигде, а
          количество и так видно по строкам.
        */
        <View
          style={[
            styles.header,
            {
              marginHorizontal: theme.spacing.lg + theme.spacing.lg,
              marginBottom: theme.spacing.md,
              gap: theme.spacing.sm,
            },
          ]}
        >
          <Text variant="headline" weight="semibold" color="label" style={styles.grow}>
            {header}
          </Text>

          {action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={action.onPress}
              hitSlop={12}
              style={({ pressed }) => [styles.action, { gap: theme.spacing.xxs, opacity: pressed ? 0.4 : 1 }]}
            >
              <Symbol name="plus" size={15} color={theme.colors.accent} />
              <Text variant="subheadline" weight="medium" color="accent">
                {action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/*
        Группа строк — сплошная заливка без меша и канта, радиус 26 дугой:
        замер Opal. Стеклянная карточка здесь была нашей выдумкой — у Opal
        стекло только у плавающих элементов и шитов.
      */}
      <View
        style={[
          styles.group,
          {
            marginHorizontal: theme.spacing.lg,
            borderRadius: theme.radius.group,
            backgroundColor: inSheet ? theme.surfaces.groupInSheet : theme.surfaces.group,
          },
        ]}
      >
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? (
              <View
                style={{
                  height: 1,
                  marginLeft: inset,
                  marginRight: theme.spacing.lg,
                  backgroundColor: inSheet ? theme.surfaces.separatorInSheet : theme.surfaces.separator,
                }}
              />
            ) : null}
            {row}
          </Fragment>
        ))}
      </View>

      {footer ? (
        <Text
          variant="footnote"
          color="secondaryLabel"
          style={{
            marginHorizontal: theme.spacing.lg + theme.spacing.md,
            marginTop: theme.spacing.md,
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
  /**
   * Уровень вложенности — для папки внутри папки.
   *
   * Отступ — отбивкой строки, а не пробелами в начале имени: пробелы VoiceOver
   * читал паузой, и при крупном тексте сдвиг не рос вместе с ним.
   */
  level?: number;
  /** Подсказка VoiceOver — например, в какую папку вложена эта. */
  hint?: string;
};

/** Колонка иконки и зазор за ней: текст встаёт на 16 + 28 + 17 = 61 от края группы. */
const GLYPH_COLUMN = 28;
const ROW_GAP = 17;
/** Отбивка разделителя под строки с иконкой — по началу текста. */
export const GLYPH_SEPARATOR_INSET = 16 + GLYPH_COLUMN + ROW_GAP;

/** Отступ одного уровня вложенности — ширина глифа и зазора за ним. */
const LEVEL_INDENT = 24;

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
  level = 0,
  hint,
}: ListRowProps) => {
  const theme = useTheme();
  const color: PaletteName = destructive ? 'systemRed' : titleColor ?? 'label';
  const ref = useRef<React.ComponentRef<typeof View>>(null);

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
          // Поля строки и зазоры — замер Opal: текст на 16 от края группы,
          // с иконкой — на 61, иконка в колонке 28.
          paddingHorizontal: theme.spacing.lg,
          paddingLeft: theme.spacing.lg + level * LEVEL_INDENT,
          paddingVertical: theme.spacing.md,
          gap: ROW_GAP,
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
          // Иконка строки — приглушённый белый: полный белый спорил с
          // названием строки за первое прочтение.
          <View style={styles.glyph}>
            <Symbol name={icon} size={20} color={iconColor ?? theme.colors.secondaryLabel} />
          </View>
        )
      ) : null}

      <View style={styles.labels}>
        {/* Заголовок строки — 17 regular, подпись — 15: замер Opal. Полужирный
            заголовок был нашим решением и делал список тяжелее эталона. */}
        <Text variant="body" color={color}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subheadline" color="secondaryLabel">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="subheadline" color="secondaryLabel" numberOfLines={1}>
          {value}
        </Text>
      ) : null}

      {trailing}

      {accessory.type === 'disclosure' ? (
        <Symbol name="chevron.right" size={16} color={theme.colors.secondaryLabel} />
      ) : null}

      {accessory.type === 'checkmark' && accessory.checked ? (
        // Галочка выбора — акцентом, как у Opal.
        <Symbol name="checkmark" size={18} color={theme.colors.accent} />
      ) : null}

      {accessory.type === 'switch' ? (
        // Нативный Switch, а не своя анимация: у системного есть отдача,
        // поведение при «Уменьшении движения» и правильный отклик VoiceOver.
        <Switch
          value={accessory.value}
          onValueChange={accessory.onValueChange}
          disabled={disabled}
          // Цвет, а не замена контрола: включённый трек Opal — оливковый.
          trackColor={{ true: theme.surfaces.switchOn }}
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
      accessibilityHint={hint}
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
  emoji: { width: GLYPH_COLUMN, textAlign: 'center' },
  glyph: { width: GLYPH_COLUMN, alignItems: 'center' },
  action: { flexDirection: 'row', alignItems: 'center' },
  // Обрезка дугой, как у канта стекла под группой: суперэллипс срезал бы
  // кант на углах ступенькой.
  group: { overflow: 'hidden', borderCurve: 'circular' },
  row: { flexDirection: 'row', alignItems: 'center' },
  labels: { flex: 1, gap: 1 },
});
