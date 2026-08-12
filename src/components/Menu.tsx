import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type LayoutRectangle,
} from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';
import { create } from 'zustand';

import { useTheme } from '../theme';
import { Glass } from './Glass';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type MenuItem = {
  title: string;
  /** Символ справа — как в `UIMenu`, где иконка стоит после подписи. */
  icon?: SFSymbol;
  /** Галочка слева от символа: пункт — текущее значение. */
  checked?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** Прямоугольник вызвавшего элемента в координатах окна. */
export type MenuAnchor = LayoutRectangle;

type MenuRequest = {
  items: MenuItem[];
  anchor: MenuAnchor;
  title?: string;
};

type MenuState = {
  request: MenuRequest | null;
  open: (request: MenuRequest) => void;
  close: () => void;
};

const useMenuState = create<MenuState>()((set) => ({
  request: null,
  open: (request) => set({ request }),
  close: () => set({ request: null }),
}));

/**
 * Показать меню, привязанное к элементу.
 *
 * Прямоугольник берётся у того, что меню вызвало, — за него отвечает
 * `MenuButton`, который умеет себя измерить. Ручной вызов нужен там, где
 * триггер не кнопка: строка списка, карточка.
 */
export const showMenu = (items: MenuItem[], anchor: MenuAnchor, title?: string) =>
  useMenuState.getState().open({ items, anchor, title });

const MENU_WIDTH = 260;
const GAP = 8;
const SCREEN_MARGIN = 12;

/**
 * Выпадающее меню, выезжающее из точки нажатия.
 *
 * Своё, а не системное, и это исключение записано осознанно. Системное меню
 * с якорем к кнопке — `UIMenu` внутри `UIButton`; отдать его в JS может только
 * нативный модуль, которого в Expo Go нет. `UIAlertController`, доступный
 * через `ActionSheetIOS`, на iPhone всегда приезжает от нижнего края: меню
 * сортировки открывалось через весь экран от кнопки, которая его вызвала,
 * и связь между нажатием и списком терялась.
 *
 * Поэтому меню собрано из системных частей: капсула настоящего жидкого стекла
 * (`Glass`), символы SF, системная типографика и метрики `UIMenu` — ширина
 * 260, строка 44, скругление 14, разделитель в полпикселя. Появляется оно
 * из угла, ближайшего к вызвавшей кнопке: `transformOrigin` ставится по той
 * стороне, к которой меню прижалось.
 *
 * «Уменьшение движения» отменяет рост из точки: остаётся только проявление.
 */
export const MenuHost = () => {
  const theme = useTheme();
  const { request, close } = useMenuState();
  const enter = useRef(new Animated.Value(0)).current;
  // Состоянием, а не ссылкой: ответ приходит асинхронно, и без перерисовки
  // первое меню за запуск открылось бы с анимацией даже при выключенном
  // движении — то есть ровно там, где это заметнее всего.
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!request) return;

    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 320,
      damping: 28,
      mass: 0.8,
    }).start();
  }, [request, enter]);

  if (!request) return null;

  const { items, anchor, title } = request;
  const screen = Dimensions.get('window');

  // Меню прижимается к той стороне якоря, которая ближе к краю экрана: так
  // оно не уезжает за кромку и не перекрывает соседние кнопки.
  const alignRight = anchor.x + anchor.width / 2 > screen.width / 2;
  const left = Math.min(
    Math.max(
      SCREEN_MARGIN,
      alignRight ? anchor.x + anchor.width - MENU_WIDTH : anchor.x,
    ),
    Math.max(SCREEN_MARGIN, screen.width - MENU_WIDTH - SCREEN_MARGIN),
  );

  // Ниже якоря, если под ним есть место; иначе — выше. Высота считается по
  // числу строк, а не измеряется: меню должно встать сразу, без кадра, в
  // котором оно стоит не там.
  const height =
    items.length * theme.controlHeight.row + (title ? theme.controlHeight.row : 0);
  const below = anchor.y + anchor.height + GAP;
  const dropsDown = below + height < screen.height - SCREEN_MARGIN;
  const top = dropsDown ? below : Math.max(SCREEN_MARGIN, anchor.y - GAP - height);

  const origin = `${dropsDown ? 'top' : 'bottom'} ${alignRight ? 'right' : 'left'}`;

  const run = (item: MenuItem) => {
    close();
    // Действие после закрытия: половина пунктов открывает шит, а шит поверх
    // ещё не убранной модалки на iOS не поднимается.
    requestAnimationFrame(item.onPress);
  };

  return (
    <Modal transparent animationType="none" visible onRequestClose={close}>
      {/* Нажатие мимо закрывает меню — так ведёт себя системное. Затемнения
          нет: `UIMenu` фон не гасит, он просто лежит поверх. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Закрыть меню" />

      <Animated.View
        style={[
          styles.card,
          styles.shadow,
          {
            top,
            left,
            width: MENU_WIDTH,
            borderRadius: 14,
            opacity: enter,
            transformOrigin: origin,
            transform: reduceMotion
              ? undefined
              : [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }],
          },
        ]}
      >
        <Glass material="chrome" variant="regular" radius={14} style={styles.fill}>
          {title ? (
            <View
              style={[
                styles.title,
                { height: theme.controlHeight.row, paddingHorizontal: theme.spacing.lg },
              ]}
            >
              <Text variant="footnote" color="secondaryLabel" numberOfLines={1}>
                {title}
              </Text>
            </View>
          ) : null}

          {items.map((item, index) => (
            <React.Fragment key={`${item.title}-${index}`}>
              {index > 0 || title ? (
                <View
                  style={{
                    height: theme.metrics.hairline,
                    backgroundColor: theme.colors.separator,
                  }}
                />
              ) : null}

              <Pressable
                accessibilityRole="menuitem"
                accessibilityState={{ disabled: item.disabled, selected: item.checked }}
                disabled={item.disabled}
                onPress={() => run(item)}
                style={({ pressed }) => [
                  styles.item,
                  {
                    height: theme.controlHeight.row,
                    paddingHorizontal: theme.spacing.lg,
                    gap: theme.spacing.md,
                    opacity: item.disabled ? 0.35 : 1,
                    backgroundColor: pressed ? theme.colors.systemFill : 'transparent',
                  },
                ]}
              >
                <Text
                  variant="body"
                  color={item.destructive ? 'systemRed' : 'label'}
                  numberOfLines={1}
                  style={styles.grow}
                >
                  {item.title}
                </Text>

                {item.checked ? (
                  <Symbol
                    name="checkmark"
                    size={15}
                    color={theme.colors.accent}
                    weight="semibold"
                  />
                ) : null}

                {item.icon ? (
                  <Symbol
                    name={item.icon}
                    size={18}
                    color={item.destructive ? theme.colors.systemRed : theme.colors.label}
                  />
                ) : null}
              </Pressable>
            </React.Fragment>
          ))}
        </Glass>
      </Animated.View>
    </Modal>
  );
};

export type MenuButtonProps = {
  /** Что показать. Считается в момент нажатия — значения успевают обновиться. */
  items: () => MenuItem[];
  title?: string;
  children: React.ReactNode;
  accessibilityLabel: string;
  /** Стиль обёртки: кнопка сама решает, как выглядит. */
  style?: React.ComponentProps<typeof Pressable>['style'];
};

/**
 * Кнопка, открывающая меню под собой.
 *
 * Измеряет себя в координатах окна и отдаёт прямоугольник хосту — иначе меню
 * не знает, из какой точки ему расти.
 */
export const MenuButton = ({
  items,
  title,
  children,
  accessibilityLabel,
  style,
}: MenuButtonProps) => {
  const ref = useRef<View>(null);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Откроет меню"
      onPress={() =>
        ref.current?.measureInWindow((x, y, width, height) =>
          showMenu(items(), { x, y, width, height }, title),
        )
      }
      style={style}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { position: 'absolute', borderCurve: 'continuous' },
  fill: { overflow: 'hidden' },
  grow: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center' },
  title: { justifyContent: 'center' },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
});
