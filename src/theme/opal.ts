/**
 * Визуальный слой Opal: меши, обводки, подложки стекла и подсветка экранов.
 *
 * Значения сняты со скриншотов эталона и подобраны по RMSE против них —
 * руками их не подкручивать: расхождение с эталоном видно сразу, а причину
 * найти трудно.
 */

/** Эллипс меша. Координаты и радиусы — в долях от размера поверхности. */
export type MeshBlob = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: string;
  opacity?: number;
};

/**
 * Меши — набор мягких эллипсов вместо линейного градиента. У CTA источник
 * света снизу, заливка идёт оливковым → бирюзовым.
 */
export const meshes = {
  cta: [
    { x: 0.368, y: 1.51, rx: 0.882, ry: 1.74, color: '#E0FEB5', opacity: 0.42 },
    { x: 0.832, y: 1.54, rx: 1.062, ry: 1.54, color: '#8CFEFD', opacity: 0.28 },
    { x: 0.572, y: 1.95, rx: 1.012, ry: 2.24, color: '#DFFFE5', opacity: 0.16 },
  ],
  fab: [
    { x: 0.28, y: 0.1, rx: 1.15, ry: 1.15, color: '#DCFEAA', opacity: 1 },
    { x: 0.88, y: 1.0, rx: 1.05, ry: 1.05, color: '#BBFBE7', opacity: 1 },
  ],
  card: [
    { x: 0.92, y: -0.18, rx: 0.7, ry: 1.0, color: '#DCFEAA', opacity: 0.035 },
    { x: 0.05, y: 1.18, rx: 0.6, ry: 0.9, color: '#BBFBE7', opacity: 0.025 },
  ],
  /** Разрушающая кнопка: тот же профиль света, что у CTA, но по красной оси. */
  danger: [
    { x: 0.3, y: 1.5, rx: 0.9, ry: 1.7, color: '#FF577A', opacity: 0.5 },
    { x: 0.85, y: 1.5, rx: 1.0, ry: 1.5, color: '#FF8A5B', opacity: 0.3 },
  ],
} as const satisfies Record<string, readonly MeshBlob[]>;

export type MeshName = keyof typeof meshes;

/**
 * Подсветка фона экрана — источник света над всем содержимым.
 *
 * Без неё стекло не читается: полупрозрачная подложка поверх чистого чёрного
 * даёт просто серый прямоугольник. Свет только сверху, как в эталоне: один
 * источник над экраном, дальше затухание в чёрный.
 */
export const backdrops = {
  /** Списки: тёплое ядро слева, холодный край справа — один широкий источник. */
  notes: [
    { x: 0.2, y: -0.02, rx: 0.95, ry: 0.3, color: '#DCFEAA', opacity: 0.24 },
    { x: 0.92, y: 0.02, rx: 0.7, ry: 0.22, color: '#BBFBE7', opacity: 0.18 },
  ],
  /** Редактор и захват: слабее и уже — под текстом свет не спорит с буквами. */
  editor: [{ x: 0.6, y: -0.02, rx: 0.95, ry: 0.24, color: '#BBFBE7', opacity: 0.18 }],
  /** Папки и шиты: холодное пятно над первой группой строк. */
  folders: [{ x: 0.45, y: -0.01, rx: 1.05, ry: 0.24, color: '#BBFBE7', opacity: 0.24 }],
  /** Настройки: тёплый свет над первой группой строк. */
  settings: [
    { x: 0.3, y: -0.02, rx: 0.95, ry: 0.28, color: '#DCFEAA', opacity: 0.22 },
    { x: 1.0, y: 0.04, rx: 0.65, ry: 0.2, color: '#BBFBE7', opacity: 0.16 },
  ],
} as const satisfies Record<string, readonly MeshBlob[]>;

export type BackdropName = keyof typeof backdrops;

/** Обводка — вертикальный градиент, подхватывающий свет меша. */
export const strokes = {
  cta: { from: 'rgba(255,255,255,0.10)', to: 'rgba(255,255,255,0.42)' },
  danger: { from: 'rgba(255,180,190,0.16)', to: 'rgba(255,180,190,0.46)' },
  card: { from: 'rgba(255,255,255,0.12)', to: 'rgba(255,255,255,0.03)' },
  glass: { from: 'rgba(255,255,255,0.18)', to: 'rgba(255,255,255,0.05)' },
  subtle: { from: 'rgba(255,255,255,0.07)', to: 'rgba(255,255,255,0.02)' },
} as const;

export type StrokeName = keyof typeof strokes;

/** Подложки стеклянных поверхностей. */
export const tints = {
  cta: 'rgba(255,255,255,0.14)',
  card: 'rgba(255,255,255,0.045)',
  control: 'rgba(255,255,255,0.07)',
  /** Шиты и плавающие панели: прозрачнее карточек — под ними виден экран. */
  glass: 'rgba(20,20,22,0.42)',
} as const;

export type TintName = keyof typeof tints;

/** Свечение заметки — цвет метки, едва проступающий в углу карточки. */
export const NOTE_GLOW_OPACITY = 0.07;
