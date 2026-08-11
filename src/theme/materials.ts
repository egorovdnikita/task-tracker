import type { BlurTint } from 'expo-blur';
import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ColorScheme } from './colors';

/**
 * Материалы iOS — от самого прозрачного к самому плотному.
 *
 * Материал выбирается не по красоте, а по тому, сколько контента должно
 * читаться сквозь него. Чем меньше слой перекрывает, тем тоньше материал:
 * `ultraThin` — над фотографией, `chrome` — под панелью навигации, где сквозь
 * стекло должен угадываться только факт, что там что-то есть.
 */
export const materials = {
  ultraThin: 'systemUltraThinMaterial',
  thin: 'systemThinMaterial',
  regular: 'systemMaterial',
  thick: 'systemThickMaterial',
  chrome: 'systemChromeMaterial',
} as const satisfies Record<string, BlurTint>;

export type MaterialName = keyof typeof materials;

export const materialNames = Object.keys(materials) as MaterialName[];

/**
 * Тинт `BlurView` под материал и схему.
 *
 * Схема указывается явно, а не оставляется на `system…Material`: если в
 * настройках приложения выбрана светлая тема при тёмной системной, системный
 * вариант возьмёт системную — и одна поверхность на экране окажется из другой
 * схемы. Вариант с суффиксом Light/Dark такого не делает.
 */
export const blurTint = (material: MaterialName, scheme: ColorScheme): BlurTint =>
  `${materials[material]}${scheme === 'dark' ? 'Dark' : 'Light'}` as BlurTint;

/** Плотность размытия под материал: чем толще материал, тем выше. */
export const blurIntensity: Record<MaterialName, number> = {
  ultraThin: 24,
  thin: 40,
  regular: 60,
  thick: 80,
  chrome: 92,
};

/**
 * Запасная заливка на случай, когда размытия нет вовсе: веб-витрина, Android
 * без экспериментального блюра, режим «Уменьшение прозрачности».
 *
 * Она не пытается изобразить стекло — она честно делает поверхность плотной.
 * Полупрозрачный серый без размытия выглядит грязным пятном, а не материалом.
 */
export const materialFallback: Record<MaterialName, { light: string; dark: string }> = {
  ultraThin: { light: 'rgba(255,255,255,0.68)', dark: 'rgba(30,30,32,0.68)' },
  thin: { light: 'rgba(255,255,255,0.78)', dark: 'rgba(30,30,32,0.78)' },
  regular: { light: 'rgba(249,249,251,0.86)', dark: 'rgba(28,28,30,0.86)' },
  thick: { light: 'rgba(247,247,249,0.94)', dark: 'rgba(24,24,26,0.94)' },
  chrome: { light: 'rgba(246,246,248,0.97)', dark: 'rgba(20,20,22,0.97)' },
};

/**
 * Варианты жидкого стекла.
 *
 * `regular` подмешивает подложке собственный тон и годится там, где стекло
 * лежит поверх чего угодно. `clear` тона не добавляет — стекло становится
 * по-настоящему прозрачным, и класть его можно только на заведомо контрастный
 * фон, иначе подпись на нём перестаёт читаться.
 */
export type GlassVariant = 'regular' | 'clear';

/**
 * Есть ли на устройстве жидкое стекло.
 *
 * Две проверки, а не одна: `isLiquidGlassAvailable` отвечает за версию
 * системы, `isGlassEffectAPIAvailable` — за то, что API действительно есть
 * в рантайме. На части сборок iOS 26 первое верно, а второго нет, и вызов
 * роняет приложение.
 */
export const supportsLiquidGlass = (): boolean =>
  isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
