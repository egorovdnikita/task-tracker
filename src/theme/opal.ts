import { localColors } from './localColors';
/** Совместимые имена материалов. С Finch меши карточек и кнопок сняты. */
export type MeshBlob = { x: number; y: number; rx: number; ry: number; color: string; opacity?: number };
const empty: readonly MeshBlob[] = [];
export const meshes = { cta: empty, fab: empty, card: empty, danger: empty };
export type MeshName = keyof typeof meshes;
export const backdrops = { root: empty };
export type BackdropName = keyof typeof backdrops;
const clear = { from: 'transparent', to: 'transparent' };
const glass = { from: 'rgba(255,255,255,0.35)', to: 'rgba(255,255,255,0.25)' };
export const strokes = { cta: clear, danger: clear, card: clear, glass, rim: glass, subtle: clear };
export type StrokeName = keyof typeof strokes;
export const tints = {
  cta: localColors.accent, card: localColors.white,
  control: localColors.soft, glass: 'rgba(255,255,255,0.22)',
  header: 'rgba(255,255,255,0.22)',
};
export type TintName = keyof typeof tints;
export const surfaces = {
  group: localColors.white, groupInSheet: localColors.white,
  separator: localColors.soft, separatorInSheet: localColors.soft,
  white: localColors.accent, danger: '#FFF0F2', dangerLabel: '#D93650',
  disabled: localColors.soft, disabledRim: localColors.soft,
  switchOn: localColors.accent,
};
export const NOTE_GLOW_OPACITY = 0;
