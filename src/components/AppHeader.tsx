import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import type { IconName, IconTone } from './Icon';

export type HeaderAction = {
  name: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  tone?: IconTone;
  active?: boolean;
};

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  /** Заголовок по центру — как во всех внутренних экранах референса. */
  align?: 'center' | 'left';
  onBack?: () => void;
  onClose?: () => void;
  actions?: HeaderAction[];
};

/**
 * Шапка референса: прозрачный фон без разделителя, заголовок по центру,
 * круглые стеклянные кнопки по краям. Боковые слоты равной ширины —
 * иначе центр уезжает при разном числе действий слева и справа.
 */
export const AppHeader = ({
  title,
  subtitle,
  align = 'center',
  onBack,
  onClose,
  actions = [],
}: AppHeaderProps) => {
  const theme = useTheme();
  const slot = theme.sizes.iconButton + theme.spacing.sm;
  const sideWidth = Math.max(actions.length, onBack || onClose ? 1 : 0) * slot;

  return (
    <View
      style={[
        styles.root,
        {
          minHeight: theme.sizes.header,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
        },
      ]}
    >
      <View style={[styles.side, align === 'center' && { width: sideWidth }]}>
        {onBack ? (
          <IconButton name="back" accessibilityLabel="Назад" onPress={onBack} />
        ) : onClose ? (
          <IconButton name="close" accessibilityLabel="Закрыть" onPress={onClose} />
        ) : null}
      </View>

      <View style={[styles.titles, align === 'center' && styles.centered]}>
        <AppText variant="heading" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View
        style={[styles.side, styles.trailing, align === 'center' && { width: sideWidth }]}
      >
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
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  side: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trailing: { justifyContent: 'flex-end' },
  titles: { flex: 1, justifyContent: 'center' },
  centered: { alignItems: 'center' },
});
