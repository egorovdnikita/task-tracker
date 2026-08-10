/**
 * Design tokens for Task Tracker Notes.
 * Values map 1:1 to the wireframe: 8pt spacing grid, 3 radii, 2 palettes.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subtitle: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const;

export type TypographyVariant = keyof typeof typography;

const lightPalette = {
  background: '#F6F6F4',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEFEC',
  border: '#E2E2DD',
  text: '#1A1A18',
  textMuted: '#6E6E68',
  textInverse: '#FFFFFF',
  accent: '#1A1A18',
  accentText: '#FFFFFF',
  danger: '#C0392B',
  overlay: 'rgba(20,20,18,0.45)',
};

const darkPalette: typeof lightPalette = {
  background: '#131313',
  surface: '#1E1E1D',
  surfaceAlt: '#272725',
  border: '#343432',
  text: '#F3F3F0',
  textMuted: '#9A9A93',
  textInverse: '#131313',
  accent: '#F3F3F0',
  accentText: '#131313',
  danger: '#E06C5B',
  overlay: 'rgba(0,0,0,0.6)',
};

/** Note accent colours offered in the editor (S2 → "Цвет"). */
export const noteColors = {
  default: 'transparent',
  yellow: '#F2D492',
  green: '#A8C7A1',
  blue: '#9EB8D9',
  pink: '#D9A8B8',
} as const;

export type NoteColor = keyof typeof noteColors;

export const palettes = { light: lightPalette, dark: darkPalette };

export type ColorScheme = keyof typeof palettes;
export type Palette = typeof lightPalette;

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export const buildTheme = (scheme: ColorScheme): Theme => ({
  scheme,
  colors: palettes[scheme],
  spacing,
  radius,
  typography,
});
