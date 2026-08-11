import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Switch } from './Switch';
import { GlassSurface } from './GlassSurface';
import { Icon, type IconName } from './Icon';

export type SettingsRowProps = {
  title: string;
  description?: string;
  /** switch — тумблер; select — галочка; link — шеврон; danger — деструктивный переход. */
  type?: 'switch' | 'select' | 'link' | 'danger';
  icon?: IconName;
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
};

/** Строка 72pt с ведущей иконкой — эталон взят с экрана «My Account». */
export const SettingsRow = ({
  title,
  description,
  type = 'link',
  icon,
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
          minHeight: theme.sizes.row,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          gap: theme.spacing.lg,
          backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
        },
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={22}
          tone={type === 'danger' ? 'danger' : 'secondary'}
          strokeWidth={1.8}
        />
      ) : null}

      <View style={styles.texts}>
        <AppText variant="body" tone={type === 'danger' ? 'danger' : 'default'}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="subtle" tone="secondary">
            {description}
          </AppText>
        ) : null}
      </View>

      {isSwitch ? (
        // Нажатие ловит вся строка, поэтому тумблеру своё имя не нужно —
        // иначе VoiceOver прочитает заголовок дважды.
        <Switch value={value} onValueChange={onValueChange} />
      ) : type === 'select' ? (
        value ? <Icon name="check" size={20} tone="accent" /> : <View style={styles.spacer} />
      ) : (
        <Icon
          name="chevron"
          size={20}
          tone={type === 'danger' ? 'danger' : 'tertiary'}
          strokeWidth={1.8}
        />
      )}
    </Pressable>
  );
};

/**
 * Заголовок секции стоит НАД карточкой и набран крупно — в референсе это
 * «Permissions», «Advanced», «Social», а не мелкий капс внутри группы.
 */
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
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="heading" style={{ paddingHorizontal: theme.spacing.xl }}>
        {title}
      </AppText>
      <GlassSurface
        stroke="card"
        tint={theme.tints.card}
        radius={theme.radius.lg}
        style={{ marginHorizontal: theme.spacing.xl }}
      >
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? (
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: theme.colors.borderStrong,
                  marginLeft: theme.spacing.xl,
                }}
              />
            ) : null}
            {child}
          </View>
        ))}
      </GlassSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center' },
  texts: { flex: 1, gap: 2 },
  spacer: { width: 20 },
});
