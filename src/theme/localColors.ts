import { boxPrimitives } from '../vendor/box-ui/primitives';
/** Локальные цвета Opal/iOS; роли Box UI не подменяются. См. docs/TOKEN_SYNC.md. */
export const localColors = {
  "black": boxPrimitives.achromatic.black,
  "white": boxPrimitives.achromatic.white,
  "accent": "#DCFEAA",
  "accentAqua": "#BBFBE7",
  "chartTrack": "#2B2F2C",
  "sheet": "#1F1F1F",
  "creationScrim": "rgba(0,0,0,0.3)",
  "folderBorder": "rgba(255,255,255,0.12)",
  "scanGuide": "rgba(255,255,255,0.7)",
  "dangerTint": "rgba(255,87,122,0.16)"
} as const;
