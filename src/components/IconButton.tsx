import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  tone?: 'default' | 'muted' | 'danger' | 'inverse';
  active?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export const IconButton = ({
  name,
  onPress,
  accessibilityLabel,
  size = 22,
  tone = 'default',
  active = false,
  disabled = false,
  style,
  testID,
}: IconButtonProps) => {
  const theme = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.sm,
          backgroundColor: active ? theme.colors.surfaceAlt : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Icon name={name} size={size} tone={tone} />
    </Pressable>
  );
};
