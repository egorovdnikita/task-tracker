import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '../theme';
import { Button } from './Button';
import { Symbol } from './Symbol';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: SFSymbol;
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
    <View style={[styles.root, { padding: theme.spacing.xxxl, gap: theme.spacing.md }, style]}>
      {icon ? <Symbol name={icon} size={52} color={theme.colors.quaternaryLabel} /> : null}

      <Text variant="title3" weight="semibold" style={styles.center}>
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
          variant="tinted"
          onPress={onAction}
          style={{ marginTop: theme.spacing.sm }}
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
