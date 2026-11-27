import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compiled = ts.transpileModule(readFileSync('src/utils/paintAlpha.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { splitAlpha } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('прозрачный кант CTA и медиа не становится чёрным в native SVG', () => {
  assert.equal(splitAlpha('transparent').opacity, 0);
  assert.equal(splitAlpha(' Transparent ').opacity, 0);
  assert.deepEqual(splitAlpha('rgba(255,255,255,0.25)'), { color: 'rgb(255, 255, 255)', opacity: 0.25 });
  assert.equal(splitAlpha('#C4FB6F').opacity, 1);
});
