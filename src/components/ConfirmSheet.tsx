import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';

export type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Renders inline instead of inside a Modal — used by Storybook stories. */
  inline?: boolean;
};

/** Bottom sheet from S5 (delete confirmation / note actions). */
export const ConfirmSheet = ({
  visible,
  title,
  description,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  destructive = true,
  onConfirm,
  onCancel,
  inline = false,
}: ConfirmSheetProps) => {
  const theme = useTheme();
  if (!visible) return null;

  const sheet = (
    <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Закрыть" onPress={onCancel} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          },
        ]}
      >
        <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
        <AppText variant="subtitle">{title}</AppText>
        {description ? (
          <AppText variant="body" tone="muted">
            {description}
          </AppText>
        ) : null}
        <Button
          label={confirmLabel}
          variant={destructive ? 'danger' : 'primary'}
          fullWidth
          size="lg"
          onPress={onConfirm}
        />
        <Button label={cancelLabel} variant="secondary" fullWidth size="lg" onPress={onCancel} />
      </View>
    </View>
  );

  if (inline) return sheet;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onCancel}>
      {sheet}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  sheet: { width: '100%', paddingBottom: 28 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
});
