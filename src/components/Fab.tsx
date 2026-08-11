import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { GlassSurface } from './GlassSurface';
import { Icon, type IconName } from './Icon';

export type FabProps = {
  onPress?: () => void;
  icon?: IconName;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
};

/** Круг «+» из референса: сплошной меш лайм → аква, иконка тёмная. */
export const Fab = ({
  onPress,
  icon = 'plus',
  accessibilityLabel = 'Новая заметка',
  style,
  testID,
}: FabProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const size = theme.sizes.fab;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        // Отступ снизу — из safe area: под нативной панелью вкладок он уже
        // включает её высоту, поэтому кнопка садится над ней сама.
        { bottom: insets.bottom + theme.spacing.lg },
        { width: size, height: size, transform: [{ scale: pressed ? 0.94 : 1 }] },
        style,
      ]}
    >
      <GlassSurface
        mesh="fab"
        radius={size / 2}
        tint={theme.colors.accentLime}
        style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name={icon} size={28} tone="inverse" strokeWidth={2.2} />
      </GlassSurface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: 20,
    borderRadius: 32,
    shadowColor: '#DCFEAA',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
