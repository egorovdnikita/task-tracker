import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { Button } from './Button';
import { Text } from './Text';
import { ThinkingOrb, type OrbState } from './ThinkingOrb';

export type EmptyStateProps = {
  /**
   * Символ ситуации. Сам он не рисуется — по нему выбирается движение орба:
   * у поиска орб ищет, у остальных пустых списков колышется лентой.
   */
  icon?: SFSymbol;
  /** Явно задать движение орба поверх выбора по символу. */
  orb?: OrbState;
  title: string;
  /** Что делать дальше. Не извинение за пустоту, а следующий шаг. */
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

/**
 * Пустое состояние.
 *
 * Из него всегда есть выход: у каждого списка свой текст и своё действие.
 * Пустой экран без следующего шага — тупик, и чаще всего именно на нём человек
 * закрывает приложение.
 *
 * Вместо иконки — точечный орб Opal, без подложки, прямо на подсветке фона.
 * Стеклянный круг под ним спорил бы с самим орбом: два округлых силуэта один
 * в другом, и точки читались бы как шум внутри.
 */
const orbFor = (icon?: SFSymbol): OrbState =>
  icon === 'magnifyingglass' || icon === 'line.3.horizontal.decrease.circle'
    ? 'searching'
    : 'composing';

export const EmptyState = ({
  icon,
  orb,
  title,
  description,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.root, { padding: theme.spacing.xxxl, gap: theme.spacing.md }, style]}>
      <ThinkingOrb
        state={orb ?? orbFor(icon)}
        size={64}
        accessibilityLabel={title}
        style={{ marginBottom: theme.spacing.sm }}
      />

      <Text variant="title3" weight="medium" style={styles.center}>
        {title}
      </Text>

      {description ? (
        <Text variant="subheadline" color="secondaryLabel" style={[styles.center, styles.measure]}>
          {description}
        </Text>
      ) : null}

      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          variant="filled"
          onPress={onAction}
          style={{ marginTop: theme.spacing.sm, alignSelf: 'center' }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  measure: { maxWidth: 280 },
});
