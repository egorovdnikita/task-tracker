/** Координаты рисунка сохраняются в исходном документе при изменении полей UI. */
export const sketchViewport = (viewport: { width: number; height: number }, document?: { width: number; height: number } | null) => {
  const width = Math.max(1, document?.width || viewport.width);
  const height = Math.max(1, document?.height || viewport.height);
  const scale = Math.min(Math.max(1, viewport.width) / width, Math.max(1, viewport.height) / height);
  return {
    width, height,
    point: (x: number, y: number) => ({ x: Math.max(0, Math.min(width, x / scale)), y: Math.max(0, Math.min(height, y / scale)) }),
  };
};
