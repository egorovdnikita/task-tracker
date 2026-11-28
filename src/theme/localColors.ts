import { boxPrimitives } from '../vendor/box-ui/primitives';
/** Локальные цвета утверждённого Finch/iOS; роли Box UI не подменяются. См. docs/TOKEN_SYNC.md. */
export const localColors = {
  "ink": "#1A1A1A",
  "muted": "#6B6B73",
  "soft": "#F2F2F3",
  "black": boxPrimitives.achromatic.black,
  "white": boxPrimitives.achromatic.white,
  "switchOn": "#30D158",
  "accent": "#C4FB6F",
  "accentAqua": "#C4FB6F",
  "chartTrack": "#F2F2F3",
  "sheet": "#FFFFFF",
  "creationScrim": "rgba(0,0,0,0.3)",
  "folderBorder": "rgba(26,26,26,0.12)",
  "scanGuide": "rgba(255,255,255,0.7)",
  "dangerTint": "rgba(255,87,122,0.16)"
} as const;
