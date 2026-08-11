/**
 * Собирает контактные листы из превью эталонных скриншотов,
 * чтобы просмотреть все 211 экранов за несколько заходов, а не по одному.
 *
 *   node tools/contact-sheet.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

const THUMBS = path.join(__dirname, 'out/thumbs');
const OUT = path.join(__dirname, 'out');
const COLS = 6;
const ROWS = 6;
const LABEL_H = 16;

const files = fs
  .readdirSync(THUMBS)
  .filter((f) => f.endsWith('.png'))
  .sort((a, b) => {
    const n = (s) => parseInt(s.match(/(\d+)\.png$/)[1], 10);
    return n(a) - n(b);
  });

// Цифры 3×5 — подписываем номер экрана прямо на листе, иначе не сослаться.
const DIGITS = {
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111'],
};

const drawText = (png, text, x0, y0, scale = 2) => {
  [...text].forEach((ch, i) => {
    const glyph = DIGITS[ch];
    if (!glyph) return;
    glyph.forEach((row, ry) => {
      [...row].forEach((on, rx) => {
        if (on !== '1') return;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const x = x0 + i * (4 * scale) + rx * scale + sx;
            const y = y0 + ry * scale + sy;
            if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
            const idx = (png.width * y + x) << 2;
            png.data[idx] = 255;
            png.data[idx + 1] = 220;
            png.data[idx + 2] = 90;
            png.data[idx + 3] = 255;
          }
        }
      });
    });
  });
};

const first = PNG.sync.read(fs.readFileSync(path.join(THUMBS, files[0])));
const cw = first.width;
const ch = first.height + LABEL_H;

const perSheet = COLS * ROWS;
const sheets = Math.ceil(files.length / perSheet);

for (let s = 0; s < sheets; s++) {
  const slice = files.slice(s * perSheet, (s + 1) * perSheet);
  const rows = Math.ceil(slice.length / COLS);
  const sheet = new PNG({ width: COLS * cw, height: rows * ch });
  sheet.data.fill(0);

  slice.forEach((file, i) => {
    const img = PNG.sync.read(fs.readFileSync(path.join(THUMBS, file)));
    const ox = (i % COLS) * cw;
    const oy = Math.floor(i / COLS) * ch + LABEL_H;
    PNG.bitblt(img, sheet, 0, 0, Math.min(img.width, cw), Math.min(img.height, ch - LABEL_H), ox, oy);
    const num = file.match(/(\d+)\.png$/)[1];
    drawText(sheet, num, ox + 4, (Math.floor(i / COLS)) * ch + 3);
  });

  const out = path.join(OUT, `sheet-${s + 1}.png`);
  fs.writeFileSync(out, PNG.sync.write(sheet));
  console.log(`${out}  ${slice.length} экранов`);
}
