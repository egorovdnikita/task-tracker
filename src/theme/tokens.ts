import { fonts } from './fonts';

/**
 * Design tokens — тёмная система, вдохновлённая референсом Opal.
 *
 * Значения сняты пиксельно со скриншотов референса:
 *  - цвета   — гистограммой по площади экрана и точечными пробами по насыщенности;
 *  - радиусы — по кривизне углов в пикселях, делённой на 3 (плотность 3x);
 *  - кегли   — по высоте прописных букв, размер = cap / 0.72.
 *
 * Система dark-only: светлой схемы нет, поэтому палитра одна и без ветвлений.
 */

export const colors = {
  // Поверхности
  background: '#000000',
  /**
   * Поверхности — прозрачное белое, а не серые заливки. Глухой серый гасит
   * подсветку фона: карточка становится плоским пятном ровно там, где под ней
   * градиент. Прозрачность пропускает свет и меняет тон вместе с фоном.
   */
  surface: 'rgba(255,255,255,0.04)',
  surfaceElevated: 'rgba(255,255,255,0.08)',
  surfaceHigh: 'rgba(255,255,255,0.14)',

  // Границы
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',

  /**
   * Текст — тоже белый с альфой. Серый #A0A0A0 держался только на чистом
   * чёрном: поверх стекла и градиента он уходил в грязь и переставал читаться,
   * потому что не зависел от того, что под ним. Прозрачный белый всегда светлее
   * подложки, какой бы она ни была.
   */
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.66)',
  textTertiary: 'rgba(255,255,255,0.42)',
  textInverse: '#000000',

  // Акцент — ось lime → mint → aqua
  accentLime: '#DCFEAA',
  accentMint: '#D7FEC0',
  accentAqua: '#BBFBE7',

  // Семантика
  success: '#05D6B4',
  successDim: '#00C1A4',
  danger: '#FF577A',
  /**
   * Включённый тумблер. Системный iOS красит трек в свой зелёный, эталон —
   * в свой; берём эталонный, но насыщенность оставляем системную, иначе
   * пастельный лайм на белом бегунке не читается как «включено».
   */
  switchOn: '#4CAF13',
  switchOff: 'rgba(120,120,128,0.32)',

  overlay: 'rgba(0,0,0,0.6)',
} as const;

/** Градиентная ось акцента: FAB, CTA, круг «+», обводка аватара. */
export const gradients = {
  accent: ['#DCFEAA', '#BBFBE7'],
  accentSoft: ['rgba(220,254,170,0.14)', 'rgba(187,251,231,0.14)'],
  glowLime: ['rgba(220,254,170,0.10)', 'rgba(220,254,170,0)'],
  glowTop: ['rgba(120,180,140,0.16)', 'rgba(0,0,0,0)'],
} as const;

export type GradientName = keyof typeof gradients;

/** Цвет заметки — не полоска слева, а мягкое свечение в углу карточки. */
export const noteGlows = {
  none: null,
  lime: '#DCFEAA',
  aqua: '#BBFBE7',
  violet: '#BEAAFF',
  amber: '#FFD696',
  rose: '#FF9BB4',
} as const;

/** Прозрачность свечения заметки. В референсе акцент едва читается. */
export const NOTE_GLOW_OPACITY = 0.07;

export type NoteGlow = keyof typeof noteGlows;

/** Читаемые названия свечений — для ColorPicker и accessibility. */
export const noteGlowLabels: Record<NoteGlow, string> = {
  none: 'Без цвета',
  lime: 'Лайм',
  aqua: 'Аква',
  violet: 'Фиолетовый',
  amber: 'Янтарный',
  rose: 'Розовый',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  /** Поле экрана и внутренний паддинг карточки. */
  xl: 20,
  /** Зазор между карточками. */
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 24,
  /** Карточка-контейнер: замер дал 29–30pt. */
  lg: 28,
  xl: 32,
  pill: 999,
} as const;

/**
 * Шкала мельче прежней примерно на ступень: на 390pt строка стала длиннее,
 * а иерархия держится не кеглем, а начертанием и цветом. Light — только на
 * крупном, на мелком он рассыпается.
 */
export const typography = {
  display: { fontSize: 26, lineHeight: 32, fontFamily: fonts.light, letterSpacing: -0.5 },
  title: { fontSize: 20, lineHeight: 26, fontFamily: fonts.light, letterSpacing: -0.3 },
  heading: { fontSize: 17, lineHeight: 22, fontFamily: fonts.regular, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 20, fontFamily: fonts.regular, letterSpacing: 0 },
  /** Пояснение под заголовком строки — Light, чтобы не спорить с ним по весу. */
  subtle: { fontSize: 13, lineHeight: 18, fontFamily: fonts.light, letterSpacing: 0 },
  caption: { fontSize: 11, lineHeight: 15, fontFamily: fonts.regular, letterSpacing: 0 },
  overline: { fontSize: 11, lineHeight: 14, fontFamily: fonts.regular, letterSpacing: 0.7 },
  /** Подпись кнопки — мельче основного текста. */
  button: { fontSize: 14, lineHeight: 18, fontFamily: fonts.regular, letterSpacing: 0 },
  /** Значение в поле ввода — тоже Light: набранный текст легче подписей вокруг. */
  input: { fontSize: 15, lineHeight: 20, fontFamily: fonts.light, letterSpacing: 0 },
  /** Крупное значение в поле — заголовок заметки. */
  inputTitle: { fontSize: 17, lineHeight: 23, fontFamily: fonts.light, letterSpacing: -0.2 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Высоты контролов, снятые с референса. */
export const sizes = {
  row: 72,
  button: 48,
  buttonLarge: 52,
  iconButton: 44,
  chip: 36,
  dayCircle: 44,
  fab: 64,
  tabBar: 64,
  header: 64,
  appIcon: 44,
} as const;

/**
 * Меш-градиенты — набор мягких эллипсов вместо линейного градиента.
 * Значения подобраны по замерам референса: у CTA источник света снизу,
 * заливка идёт от #33342E сверху до #90B89B внизу со сдвигом оливковый → бирюзовый.
 */
export const meshes = {
  cta: [
    // Подобрано координатным спуском по RMSE против экрана 95 эталона
    // (tools/design-check.js --fit): 43.3 → 19.2 из 255. Руками не трогать —
    // перезапустить подбор.
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
  /** Шапка шита с необратимым действием: красное зарево сверху. */
  sheetDanger: [{ x: 0.5, y: -0.05, rx: 0.85, ry: 0.5, color: '#FF577A', opacity: 0.26 }],
  screenTop: [
    { x: 0.5, y: -0.2, rx: 1.1, ry: 0.6, color: '#8FD8A8', opacity: 0.2 },
  ],
} as const;

export type MeshName = keyof typeof meshes;

/**
 * Подсветка фона экрана — источник света под всем содержимым.
 *
 * Без неё система стекла не читается: полупрозрачная подложка карточки поверх
 * чистого чёрного даёт просто серый прямоугольник, а обводка выглядит рамкой.
 * Стекло видно только тогда, когда сквозь него просвечивает цвет.
 *
 * Свет только сверху — как в эталоне: один источник над экраном, дальше
 * затухание в чёрный. Пятна по углам и снизу читались как подсветка снизу,
 * которой в природе у телефона нет, и экран переставал иметь верх.
 *
 * Координаты и радиусы — в долях от экрана, поэтому раскладка не зависит
 * от диагонали устройства.
 */
export const backdrops = {
  /** Список: тёплое ядро слева, холодный край справа — один широкий источник. */
  notes: [
    { x: 0.2, y: -0.02, rx: 0.95, ry: 0.3, color: '#DCFEAA', opacity: 0.24 },
    { x: 0.92, y: 0.02, rx: 0.7, ry: 0.22, color: '#BBFBE7', opacity: 0.18 },
  ],
  /** Редактор: слабее и уже — под текстом свет не должен спорить с буквами. */
  editor: [{ x: 0.6, y: -0.02, rx: 0.95, ry: 0.24, color: '#BBFBE7', opacity: 0.18 }],
  /** Поиск: пятно точно над строкой ввода — она главный стеклянный элемент. */
  search: [{ x: 0.45, y: -0.01, rx: 1.05, ry: 0.24, color: '#BBFBE7', opacity: 0.24 }],
  /** Настройки: тёплый свет над первой группой строк. */
  settings: [
    { x: 0.3, y: -0.02, rx: 0.95, ry: 0.28, color: '#DCFEAA', opacity: 0.22 },
    { x: 1.0, y: 0.04, rx: 0.65, ry: 0.2, color: '#BBFBE7', opacity: 0.16 },
  ],
} as const;

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
  glass: 'rgba(24,24,24,0.62)',
} as const;

export type TintName = keyof typeof tints;

export type Theme = {
  colors: typeof colors;
  gradients: typeof gradients;
  meshes: typeof meshes;
  backdrops: typeof backdrops;
  strokes: typeof strokes;
  tints: typeof tints;
  noteGlows: typeof noteGlows;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  sizes: typeof sizes;
};

export const theme: Theme = {
  colors,
  gradients,
  meshes,
  backdrops,
  strokes,
  tints,
  noteGlows,
  spacing,
  radius,
  typography,
  sizes,
};
