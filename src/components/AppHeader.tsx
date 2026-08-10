import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import type { IconName } from './Icon';

export type HeaderAction = {
  name: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  tone?: 'default' | 'muted' | 'danger';
  active?: boolean;
};

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: HeaderAction[];
};

/** Top bar shared by every screen (S1–S4 in the wireframe). */
export const AppHeader = ({ title, subtitle, onBack, actions = [] }: AppHeaderProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: onBack ? theme.spacing.sm : theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
      ]}
    >
      {onBack ? (
        <IconButton name="back" size={28} accessibilityLabel="Назад" onPress={onBack} />
      ) : null}

      <View style={styles.titles}>
        <AppText variant={onBack ? 'subtitle' : 'title'} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={styles.actions}>
        {actions.map((action) => (
          <IconButton
            key={action.name + action.accessibilityLabel}
            name={action.name}
            tone={action.tone}
            active={action.active}
            accessibilityLabel={action.accessibilityLabel}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titles: { flex: 1, justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
