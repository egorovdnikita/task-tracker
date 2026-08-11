import { Platform } from 'react-native';

/**
 * SF Pro — системный шрифт iOS. Его не грузят файлом: на устройстве он
 * берётся по имени `System`, в вебе — из стека `-apple-system`.
 *
 * Отличие от прежнего Rubik принципиальное: у системного шрифта начертание
 * задаётся весом (`fontWeight`), а не отдельным семейством. Поэтому токены
 * типографики ниже несут пару «семейство + вес», а не одно имя файла, —
 * иначе iOS нарисует синтетический жир вместо настоящего SF Pro Medium.
 *
 * Веса: Medium (500) на заголовки и подписи контролов, Regular (400) на
 * пояснения и наборный текст.
 */
export const fonts = {
  /**
   * На iOS `System` резолвится в SF Pro и подхватывает оптические размеры
   * (SF Pro Text до 20pt, Display выше) — сам, по кеглю.
   */
  system: Platform.select({
    ios: 'System',
    default:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  }),
} as const;

export const weights = {
  regular: '400',
  medium: '500',
} as const;
