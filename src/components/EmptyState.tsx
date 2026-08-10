import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon = 'note',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.root, { padding: theme.spacing.xl, gap: theme.spacing.md }]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <Icon name={icon} size={32} tone="muted" />
      </View>
      <AppText variant="subtitle" style={styles.center}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" tone="muted" style={styles.center}>
          {description}
        </AppText>
      ) : null}
      {actionLabel ? (
        <Button label={actionLabel} icon="plus" onPress={onAction} style={{ marginTop: theme.spacing.sm }} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconBox: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  center: { textAlign: 'center' },
});
