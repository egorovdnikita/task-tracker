import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export type FabProps = {
  onPress?: () => void;
  icon?: IconName;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
};

/** Floating action button anchored bottom-right on S1. */
export const Fab = ({
  onPress,
  icon = 'plus',
  accessibilityLabel = 'Новая заметка',
  style,
  testID,
}: FabProps) => {
  const theme = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        {
          backgroundColor: theme.colors.accent,
          shadowColor: '#000',
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        style,
      ]}
    >
      <Icon name={icon} size={24} tone="inverse" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
