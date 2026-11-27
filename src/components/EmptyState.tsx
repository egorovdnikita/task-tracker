import { Symbol } from './Symbol';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { Button } from './Button';
import { Text } from './Text';
import type { OrbState } from './ThinkingOrb';

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
export const EmptyState = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.hex.secondarySystemBackground, borderRadius: theme.radius.xl, paddingVertical: theme.spacing.xxxl, paddingHorizontal: theme.spacing.xl, gap: theme.spacing.lg }, style]}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.hex.systemFill, alignItems: 'center', justifyContent: 'center' }}>
        <Symbol name={icon ?? 'note.text'} size={34} color={theme.colors.label} />
      </View>

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
          size="large"
          fullWidth
          onPress={onAction}
          style={{ alignSelf: 'stretch' }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flexGrow: 0, alignItems: 'center', justifyContent: 'center', marginVertical: 32 },
  center: { textAlign: 'center' },
  measure: { maxWidth: 286 },
});
