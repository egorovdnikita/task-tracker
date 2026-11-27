import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// Only read the upstream tree. No dependency installation or upstream build.
const source = resolve(process.env.BOX_UI_DIR || '../box-ui');
const check = process.argv.includes('--check');
const collections = ['prim-spacing', 'prim-rounding', 'prim-size'];
const result = {};
for (const collection of collections) {
  const values = {};
  for (const line of readFileSync(resolve(source, `tokens/figma/${collection}.txt`), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const match = /^(?:spacing|rounding|size)\/([\w-]+)=(-?\d+(?:\.\d+)?)$/.exec(line);
    if (!match || Object.hasOwn(values, match[1])) throw Error(`Unsupported or duplicate primitive: ${collection}: ${line}`);
    values[match[1]] = Number(match[2]);
  }
  if (!Object.keys(values).length) throw Error(`Empty collection ${collection}`);
  result[collection.slice(5)] = values;
}
const colorSource = readFileSync(resolve(source, 'tokens/figma/prim-color.txt'), 'utf8');
result.achromatic = {};
for (const name of ['black', 'white']) {
  const line = colorSource.split('\n').find(line => line.startsWith(`color/alpha/${name}/100=`));
  const value = line?.split('=')[1];
  if (!/^#[a-f0-9]{6}$/i.test(value || '')) throw Error(`Invalid achromatic primitive: ${name}`);
  result.achromatic[name] = value;
}
const hashes = {};
for (const name of readdirSync(resolve(source, 'tokens/figma')).filter(n => n.endsWith('.txt') && !n.includes('icon')).sort()) {
  hashes[name] = createHash('sha256').update(readFileSync(resolve(source, 'tokens/figma', name))).digest('hex');
}
function output(path, content) {
  if (check) {
    if (readFileSync(path, 'utf8') !== content) throw Error(`${path}: расхождение с Box UI; выполните npm run tokens:sync и проверьте diff`);
  } else writeFileSync(path, content);
}
mkdirSync('src/vendor/box-ui', { recursive: true });
output('src/vendor/box-ui/primitives.ts', '// Сгенерировано scripts/sync-box-tokens.mjs; не редактировать.\n' +
  `export const boxPrimitives = ${JSON.stringify(result, null, 2)} as const;\n`);
output('docs/box-token-source.json', JSON.stringify(hashes, null, 2) + '\n');
console.log(check ? 'Box UI: снимок и примитивы актуальны' : 'Box UI: снимок и примитивы обновлены');
