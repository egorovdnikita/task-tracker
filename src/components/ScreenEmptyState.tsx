import React from 'react';
import { ScrollView } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { EmptyState, type EmptyStateProps } from './EmptyState';

/** Полноэкранное пустое состояние: карточка не перекрывает прозрачную шапку. */
export const ScreenEmptyState = (props: EmptyStateProps & { tabbed?: boolean }) => {
  const { tabbed = false, ...empty } = props;
  const theme = useTheme();
  const header = useHeaderHeight();
  const insets = useSafeAreaInsets();
  return <ScrollView style={{ flex: 1 }} contentInsetAdjustmentBehavior="never" contentContainerStyle={{
    flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.lg,
    paddingTop: header + theme.spacing.md,
    paddingBottom: insets.bottom + (tabbed ? theme.metrics.tabBar : 0) + theme.spacing.lg,
  }}><EmptyState {...empty} style={{ marginVertical: 0, ...empty.style }} /></ScrollView>;
};
