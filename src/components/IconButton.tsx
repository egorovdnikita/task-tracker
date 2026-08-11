import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { GlassSurface } from './GlassSurface';
import { Icon, type IconName, type IconTone } from './Icon';

export type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Диаметр кнопки; иконка масштабируется от него. */
  size?: number;
  tone?: IconTone;
  /** `plain` — без поверхности, для плотных списков. */
  variant?: 'glass' | 'plain';
  active?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

/** Круглая кнопка 44pt из шапок референса: тёмное стекло + мягкая обводка. */
export const IconButton = ({
  name,
  onPress,
  accessibilityLabel,
  size,
  tone = 'default',
  variant = 'glass',
  active = false,
  disabled = false,
  style,
  testID,
}: IconButtonProps) => {
  const theme = useTheme();
  const diameter = size ?? theme.sizes.iconButton;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }, style]}
    >
      <GlassSurface
        radius={diameter / 2}
        tint={
          variant === 'plain'
            ? undefined
            : active
              ? 'rgba(255,255,255,0.16)'
              : theme.tints.control
        }
        stroke={variant === 'plain' ? null : 'subtle'}
        // Круглая кнопка — ровно тот случай, под который сделан
        // `isInteractive`: стекло подсвечивается и течёт под пальцем.
        liquid={variant !== 'plain'}
        interactive={variant !== 'plain'}
        style={{
          width: diameter,
          height: diameter,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={name} size={Math.round(diameter * 0.46)} tone={tone} strokeWidth={1.8} />
      </GlassSurface>
    </Pressable>
  );
};
