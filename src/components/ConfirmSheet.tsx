import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';
import { GlassSurface } from './GlassSurface';
import { Icon, type IconName } from './Icon';

export type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Знак действия в круге над заголовком. */
  icon?: IconName;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Рендер без Modal — для сторис. */
  inline?: boolean;
};

/**
 * Нижний шит подтверждения, собранный по эталону:
 *
 *  - знак действия в кольце — до текста понятно, что произойдёт;
 *  - заголовок и описание по центру;
 *  - разрушающее действие — залитая пилюля, отмена — простой текст.
 *
 * Порядок важен: раньше «Удалить» было красной ссылкой, а «Отмена» — крупной
 * кнопкой. Вес спорил со смыслом: подтверждение выглядело как второстепенное,
 * а отказ — как основное действие.
 */
export const ConfirmSheet = ({
  visible,
  title,
  description,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  destructive = true,
  icon = 'trash',
  onConfirm,
  onCancel,
  inline = false,
}: ConfirmSheetProps) => {
  const theme = useTheme();
  if (!visible) return null;

  const accent = destructive ? theme.colors.danger : theme.colors.accentLime;

  const sheet = (
    <View style={styles.overlay}>
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
        accessibilityLabel="Закрыть"
        onPress={onCancel}
      />

      <GlassSurface
        blurIntensity={60}
        mesh={destructive ? 'sheetDanger' : 'card'}
        stroke="glass"
        tint={theme.tints.glass}
        radius={theme.radius.xl}
        style={{
          width: '100%',
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xxxl,
          alignItems: 'center',
          gap: theme.spacing.md,
        }}
      >
        <View style={[styles.grabber, { backgroundColor: theme.colors.borderStrong }]} />

        {/*
          Кольцо нейтральное и еле заметное, как в эталоне: цвет несёт сам
          знак внутри. Красная обводка дублировала его и превращала бейдж
          в третий по яркости объект шита после кнопки и заголовка.
        */}
        <View style={[styles.badge, { borderColor: theme.colors.border }]}>
          <Icon name={icon} size={26} color={accent} />
        </View>

        <AppText variant="title" style={styles.center}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="subtle" tone="secondary" style={styles.center}>
            {description}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            fullWidth
            onPress={onConfirm}
          />
          <Button label={cancelLabel} variant="ghost" fullWidth onPress={onCancel} />
        </View>
      </GlassSurface>
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
  grabber: { width: 40, height: 4, borderRadius: 2, marginBottom: 12 },
  // Кольцо, а не залитый круг: залитый спорил бы по весу с кнопкой ниже.
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: 4, marginTop: 8 },
});
