/**
 * Численная сверка компонентов с эталоном Opal.
 *
 *   node tools/design-check.js            все проверки
 *   node tools/design-check.js cta        одна проверка
 *   node tools/design-check.js cta --dump выгрузить пары PNG для глаз
 *
 * Идея: `GlassSurface` — детерминированная композиция (подложка + эллипсы
 * с радиальным затуханием + градиентная обводка). Та же математика
 * воспроизводится здесь на pngjs, результат сравнивается с вырезкой из
 * эталонного скриншота по RMSE и по профилям яркости. Проверяется то, что
 * определяет вид — токены и геометрия, — без скриншотинга браузером.
 *
 * Токены читаются из src/theme/tokens.ts, поэтому расхождение модели
 * и компонента невозможно: источник значений один.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { PNG } = require('pngjs');

const ROOT = path.join(__dirname, '..');
const REF_DIR = '/Users/egorov_d_nikita/Downloads/Opal ios Aug 2026';
const OUT = path.join(__dirname, 'out');
const SCALE = 3; // плотность эталонных скриншотов

// ─── токены из исходника ──────────────────────────────────────────────────
const loadTokens = () => {
  const esbuild = require(path.join(ROOT, 'node_modules/esbuild'));
  const res = esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'src/theme/tokens.ts')],
    bundle: true,
    format: 'cjs',
    write: false,
    platform: 'node',
  });
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', res.outputFiles[0].text)(mod, mod.exports, require);
  return mod.exports;
};

// ─── работа с изображением ────────────────────────────────────────────────
const readRef = (n) => PNG.sync.read(fs.readFileSync(path.join(REF_DIR, `Opal ios Aug 2026 ${n}.png`)));

const crop = (png, x, y, w, h) => {
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, x, y, w, h, 0, 0);
  return out;
};

const lum = (png, x, y) => {
  const i = (png.width * y + x) << 2;
  return (png.data[i] * 0.299 + png.data[i + 1] * 0.587 + png.data[i + 2] * 0.114);
};

/**
 * Находит светящуюся пилюлю: сканирует строки, считая «зелёные светлые»
 * пиксели (G заметно выше R и B), берёт самую насыщенную строку и
 * расширяется от неё, пока признак держится. Координаты вырезки руками
 * задавать нельзя — они всё равно окажутся неточными.
 */
const findGlowPill = (png, sx, sy, sw, sh) => {
  const isGlow = (x, y) => {
    const i = (png.width * y + x) << 2;
    const [r, g, b] = [png.data[i], png.data[i + 1], png.data[i + 2]];
    return g > 42 && g - b > 4 && g >= r - 6;
  };
  const rowCount = (y) => {
    let n = 0;
    for (let x = sx; x < sx + sw; x++) if (isGlow(x, y)) n++;
    return n;
  };

  let bestY = sy, bestN = -1;
  for (let y = sy; y < sy + sh; y++) {
    const n = rowCount(y);
    if (n > bestN) { bestN = n; bestY = y; }
  }
  if (bestN < sw * 0.3) throw new Error('светящаяся пилюля не найдена в области поиска');

  const minRow = bestN * 0.28;
  let top = bestY, bottom = bestY;
  while (top > sy && rowCount(top - 1) >= minRow) top--;
  while (bottom < sy + sh - 1 && rowCount(bottom + 1) >= minRow) bottom++;

  // Свечение не доходит до торцов, поэтому по горизонтали идём от центра
  // наружу по кромке: пилюля кончается там, где яркость садится до фона.
  const midY = Math.round((top + bottom) / 2);
  const bg = Math.min(lum(png, sx, midY), lum(png, sx + sw - 1, midY));
  const cx0 = Math.round(sx + sw / 2);
  let left = cx0, right = cx0;
  const solid = (x) => lum(png, x, midY) > bg + 5;
  while (left > sx && solid(left - 1)) left--;
  while (right < sx + sw - 1 && solid(right + 1)) right++;

  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
};

/** Фон вокруг элемента: кнопка на шите лежит не на чёрном, и это видно в RMSE. */
const bgAround = (png, b) => {
  const pad = 8, ys = [b.y - pad, b.y + b.h + pad];
  let r = 0, g = 0, bl = 0, n = 0;
  for (const y of ys) {
    if (y < 0 || y >= png.height) continue;
    for (let x = b.x; x < b.x + b.w; x += 4) {
      const i = (png.width * y + x) << 2;
      r += png.data[i]; g += png.data[i + 1]; bl += png.data[i + 2]; n++;
    }
  }
  return n ? '#' + [r / n, g / n, bl / n].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') : '#000000';
};

// ─── модель GlassSurface ──────────────────────────────────────────────────
/** Тот же профиль затухания, что в src/components/GlassSurface.tsx. */
const FALLOFF = [[0, 1], [0.2, 0.92], [0.4, 0.72], [0.58, 0.48], [0.74, 0.26], [0.88, 0.09], [1, 0]];

const falloffAt = (t) => {
  if (t >= 1) return 0;
  for (let i = 1; i < FALLOFF.length; i++) {
    const [o1, k1] = FALLOFF[i];
    const [o0, k0] = FALLOFF[i - 1];
    if (t <= o1) return k0 + ((k1 - k0) * (t - o0)) / (o1 - o0);
  }
  return 0;
};

const parseColor = (c) => {
  if (c.startsWith('#')) {
    const h = c.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  const p = m[1].split(',').map((v) => parseFloat(v.trim()));
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
};

const over = (dst, src, a) => {
  dst[0] = src[0] * a + dst[0] * (1 - a);
  dst[1] = src[1] * a + dst[1] * (1 - a);
  dst[2] = src[2] * a + dst[2] * (1 - a);
};

/** Скруглённый прямоугольник: расстояние до края в пикселях (>0 внутри). */
const roundRectSDF = (x, y, w, h, r) => {
  const dx = Math.max(r - x, x - (w - r), 0);
  const dy = Math.max(r - y, y - (h - r), 0);
  const corner = Math.hypot(dx, dy);
  const inset = Math.min(x, y, w - x, h - y);
  return dx > 0 && dy > 0 ? r - corner : inset;
};

const renderModel = ({ mesh, stroke, strokeWidth = 1, tint, radius, base = '#000000' }, w, h) => {
  const png = new PNG({ width: w, height: h });
  const baseRGB = parseColor(base);
  const tintRGB = tint ? parseColor(tint) : null;
  const blobs = (mesh ?? []).map((b) => ({ ...b, rgb: parseColor(b.color) }));
  const edge = stroke ? { from: parseColor(stroke.from), to: parseColor(stroke.to) } : null;
  const r = Math.min(radius, w / 2, h / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = [baseRGB[0], baseRGB[1], baseRGB[2]];
      const inside = roundRectSDF(x + 0.5, y + 0.5, w, h, r) > 0;

      if (inside) {
        if (tintRGB) over(px, tintRGB, tintRGB[3]);
        for (const b of blobs) {
          const cx = b.x * w, cy = b.y * h, rx = b.rx * w, ry = b.ry * h;
          const t = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
          const a = falloffAt(t) * (b.opacity ?? 1) * b.rgb[3];
          if (a > 0) over(px, b.rgb, a);
        }
        if (edge) {
          const d = roundRectSDF(x + 0.5, y + 0.5, w, h, r);
          if (d <= strokeWidth) {
            const k = y / (h - 1);
            const c = [
              edge.from[0] + (edge.to[0] - edge.from[0]) * k,
              edge.from[1] + (edge.to[1] - edge.from[1]) * k,
              edge.from[2] + (edge.to[2] - edge.from[2]) * k,
            ];
            const alpha = (edge.from[3] + (edge.to[3] - edge.from[3]) * k) * Math.min(1, strokeWidth - d + 1);
            over(px, c, alpha);
          }
        }
      }

      const i = (w * y + x) << 2;
      png.data[i] = Math.round(px[0]);
      png.data[i + 1] = Math.round(px[1]);
      png.data[i + 2] = Math.round(px[2]);
      png.data[i + 3] = 255;
    }
  }
  return png;
};

// ─── метрики ──────────────────────────────────────────────────────────────
/** Маска текста: яркие пиксели эталона, которых нет в модели, — это подпись. */
const rmse = (a, b, ignoreTextAbove = 999) => {
  let sum = 0, n = 0;
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (a.width * y + x) << 2;
      if (lum(a, x, y) > ignoreTextAbove) continue; // пропускаем глифы текста
      for (let c = 0; c < 3; c++) {
        const d = a.data[i + c] - b.data[i + c];
        sum += d * d;
        n++;
      }
    }
  }
  return Math.sqrt(sum / n);
};

const vProfile = (png, samples = 9) => {
  const out = [];
  for (let s = 0; s < samples; s++) {
    const y = Math.round(((s + 0.5) / samples) * (png.height - 1));
    let r = 0, g = 0, b = 0, n = 0;
    for (let x = Math.round(png.width * 0.1); x < png.width * 0.9; x++) {
      const i = (png.width * y + x) << 2;
      r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++;
    }
    out.push([r / n, g / n, b / n].map(Math.round));
  }
  return out;
};

const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();

// ─── набор проверок ───────────────────────────────────────────────────────
const T = loadTokens();

const CHECKS = [
  {
    id: 'cta',
    title: 'Главная кнопка (CTA)',
    ref: { screen: 95, search: [60, 2050, 1060, 320] },
    // Подпись «Done» белая — исключаем её из RMSE, иначе метрика мерит текст.
    ignoreTextAbove: 175,
    model: () => ({
      mesh: T.meshes.cta,
      stroke: T.strokes.cta,
      strokeWidth: SCALE,
      tint: 'rgba(255,255,255,0.04)',
      radius: 999,
    }),
  },
  {
    id: 'cta-start',
    title: 'Кнопка Start (таймер)',
    ref: { screen: 119, search: [60, 900, 1060, 900] },
    ignoreTextAbove: 175,
    model: () => ({
      mesh: T.meshes.cta,
      stroke: T.strokes.cta,
      strokeWidth: SCALE,
      tint: 'rgba(255,255,255,0.04)',
      radius: 999,
    }),
  },
];

// ─── запуск ───────────────────────────────────────────────────────────────
const only = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const dump = process.argv.includes('--dump');
fs.mkdirSync(OUT, { recursive: true });

let worst = 0;
for (const check of CHECKS) {
  if (only && check.id !== only) continue;

  const ref = readRef(check.ref.screen);
  const b = findGlowPill(ref, ...check.ref.search);
  const refCrop = crop(ref, b.x, b.y, b.w, b.h);

  const spec = check.model();
  const model = renderModel(
    { ...spec, base: bgAround(ref, b), radius: spec.radius === 999 ? b.h / 2 : spec.radius * SCALE },
    b.w,
    b.h,
  );

  const err = rmse(refCrop, model, check.ignoreTextAbove);
  worst = Math.max(worst, err);

  const pr = vProfile(refCrop);
  const pm = vProfile(model);

  console.log(`\n▸ ${check.title}  [${check.id}]`);
  console.log(`  эталон: экран ${check.ref.screen}, найден ${b.w}×${b.h}px = ${(b.w / SCALE).toFixed(0)}×${(b.h / SCALE).toFixed(0)}pt`);
  console.log(`  RMSE: ${err.toFixed(1)} / 255`);
  console.log('  профиль сверху вниз   эталон → модель');
  pr.forEach((c, i) => {
    const d = Math.round(Math.abs(c[0] - pm[i][0]) + Math.abs(c[1] - pm[i][1]) + Math.abs(c[2] - pm[i][2]) / 3);
    console.log(`    ${String(i + 1).padStart(2)}  ${hex(c)} → ${hex(pm[i])}   Δ${d}`);
  });

  if (dump) {
    fs.writeFileSync(path.join(OUT, `${check.id}-ref.png`), PNG.sync.write(refCrop));
    fs.writeFileSync(path.join(OUT, `${check.id}-model.png`), PNG.sync.write(model));
    console.log(`  выгружено: tools/out/${check.id}-{ref,model}.png`);
  }
}

console.log(`\nхудший RMSE: ${worst.toFixed(1)} / 255`);

// ─── автоподбор меша ──────────────────────────────────────────────────────
// Координатный спуск по параметрам эллипсов: машина минимизирует RMSE,
// чтобы значения в токенах не подбирались на глаз.
if (process.argv.includes('--fit')) {
  const check = CHECKS.find((c) => c.id === (only ?? 'cta'));
  const ref = readRef(check.ref.screen);
  const b = findGlowPill(ref, ...check.ref.search);
  const refCrop = crop(ref, b.x, b.y, b.w, b.h);
  const base = check.model();

  const bg = bgAround(ref, b);
  const score = (mesh, tintA) =>
    rmse(
      refCrop,
      renderModel({ ...base, mesh, base: bg, tint: `rgba(255,255,255,${tintA})`, radius: b.h / 2 }, b.w, b.h),
      check.ignoreTextAbove,
    );
  console.log(`  фон вокруг эталона: ${bg}`);

  let mesh = base.mesh.map((m) => ({ ...m }));
  let tintA = 0.04;
  let best = score(mesh, tintA);
  const KEYS = ['x', 'y', 'rx', 'ry', 'opacity'];
  const CH = [0, 1, 2]; // цвет тоже подбираем: на глаз он всегда оказывается пересвеченным

  for (let pass = 0; pass < 6; pass++) {
    const step = 0.24 / (pass + 1);
    for (let i = 0; i < mesh.length; i++) {
      for (const k of KEYS) {
        for (const dir of [1, -1]) {
          const trial = mesh.map((m) => ({ ...m }));
          const v = (trial[i][k] ?? 1) + dir * step;
          if (k === 'opacity' && (v <= 0.02 || v > 1)) continue;
          if ((k === 'rx' || k === 'ry') && v <= 0.05) continue;
          trial[i][k] = +v.toFixed(4);
          const e = score(trial, tintA);
          if (e < best - 0.02) { best = e; mesh = trial; }
        }
      }
    }
    // подгонка цвета источников
    for (let i = 0; i < mesh.length; i++) {
      for (const ch of CH) {
        for (const dir of [1, -1]) {
          const trial = mesh.map((m) => ({ ...m }));
          const rgb = parseColor(trial[i].color);
          rgb[ch] = Math.max(0, Math.min(255, rgb[ch] + dir * Math.round(step * 90)));
          trial[i].color = '#' + rgb.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
          const e = score(trial, tintA);
          if (e < best - 0.02) { best = e; mesh = trial; }
        }
      }
    }
    for (const dir of [1, -1]) {
      const t = +(tintA + dir * step * 0.25).toFixed(4);
      if (t < 0 || t > 0.3) continue;
      const e = score(mesh, t);
      if (e < best - 0.02) { best = e; tintA = t; }
    }
    console.log(`  проход ${pass + 1}: RMSE ${best.toFixed(2)}`);
  }

  console.log(`\n▸ подобрано для ${check.id}: RMSE ${best.toFixed(2)} / 255`);
  console.log(`  tint: rgba(255,255,255,${tintA})`);
  console.log('  mesh:');
  mesh.forEach((m) =>
    console.log(`    { x: ${m.x}, y: ${m.y}, rx: ${m.rx}, ry: ${m.ry}, color: '${m.color}', opacity: ${m.opacity} },`),
  );
}

process.exitCode = worst > 14 ? 1 : 0;
