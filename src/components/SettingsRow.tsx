import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Icon } from './Icon';

export type SettingsRowProps = {
  title: string;
  description?: string;
  /** switch — toggle; select — check mark; link — chevron; danger — destructive link */
  type?: 'switch' | 'select' | 'link' | 'danger';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
};

export const SettingsRow = ({
  title,
  description,
  type = 'link',
  value = false,
  onPress,
  onValueChange,
}: SettingsRowProps) => {
  const theme = useTheme();
  const isSwitch = type === 'switch';

  return (
    <Pressable
      accessibilityRole={isSwitch ? 'switch' : 'button'}
      accessibilityState={isSwitch ? { checked: value } : { selected: type === 'select' && value }}
      onPress={isSwitch ? () => onValueChange?.(!value) : onPress}
      style={({ pressed }) => [
        styles.root,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface,
        },
      ]}
    >
      <View style={styles.texts}>
        <AppText variant="body" tone={type === 'danger' ? 'danger' : 'default'}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>

      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
          thumbColor={theme.colors.surface}
        />
      ) : type === 'select' ? (
        value ? <Icon name="check" size={18} /> : <View style={styles.spacer} />
      ) : (
        <Icon name="chevron" size={22} tone={type === 'danger' ? 'danger' : 'muted'} />
      )}
    </Pressable>
  );
};

export const SettingsSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const items = React.Children.toArray(children);

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="label" tone="muted" style={{ paddingHorizontal: theme.spacing.lg }}>
        {title.toUpperCase()}
      </AppText>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          marginHorizontal: theme.spacing.lg,
          overflow: 'hidden',
        }}
      >
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginLeft: theme.spacing.lg }} />
            ) : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  texts: { flex: 1, gap: 2 },
  spacer: { width: 18 },
});
