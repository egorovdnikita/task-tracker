import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { ThinkingOrb, type OrbState } from './ThinkingOrb';

export type EmptyStateProps = {
  icon?: IconName;
  /**
   * Точечный орб вместо иконки — без подложки, прямо на фоне экрана.
   * `composing` — колышущаяся лента: движение есть, центра внимания нет.
   * `null` возвращает иконку в стеклянном круге.
   */
  orb?: OrbState | null;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon = 'note',
  orb = 'composing',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.root, { padding: theme.spacing.xxxl, gap: theme.spacing.md }]}>
      {orb ? (
        // Без стеклянного круга: подложка спорила с самим орбом — два
        // округлых силуэта один в другом, и точки читались как шум внутри.
        <ThinkingOrb
          state={orb}
          size={64}
          accessibilityLabel={title}
          style={{ marginBottom: theme.spacing.sm }}
        />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: theme.tints.control }]}>
          <Icon name={icon} size={30} tone="secondary" />
        </View>
      )}

      <AppText variant="title" style={styles.center}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="subtle" tone="secondary" style={styles.center}>
          {description}
        </AppText>
      ) : null}
      {actionLabel ? (
        <Button
          label={actionLabel}
          icon="plus"
          onPress={onAction}
          // Button по умолчанию прижат влево (`alignSelf: flex-start`),
          // и `alignItems` родителя его не перебивает — центруем явно.
          style={{ marginTop: theme.spacing.md, alignSelf: 'center' }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
