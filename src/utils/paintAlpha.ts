/** SVG на iOS требует отдельной альфы даже у transparent. */
const RGBA = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

export const splitAlpha = (value: string): { color: string; opacity: number } => {
  if (value.trim().toLowerCase() === 'transparent') return { color: 'rgb(0, 0, 0)', opacity: 0 };
  const m = value.match(RGBA);
  if (!m) return { color: value, opacity: 1 };
  return {
    color: `rgb(${m[1]}, ${m[2]}, ${m[3]})`,
    opacity: m[4] === undefined ? 1 : Number(m[4]),
  };
};

