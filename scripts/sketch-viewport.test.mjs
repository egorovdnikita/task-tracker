import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compiled = ts.transpileModule(readFileSync('src/utils/sketchViewport.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { sketchViewport } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('поля Finch не меняют документ и координаты дорисовки старого скетча', () => {
  const fit = sketchViewport({ width: 358, height: 595 }, { width: 390, height: 844 });
  assert.equal(fit.width, 390);
  assert.equal(fit.height, 844);
  const p = fit.point(100 * 595 / 844, 200 * 595 / 844);
  assert.ok(Math.abs(p.x - 100) < 1e-8);
  assert.ok(Math.abs(p.y - 200) < 1e-8);
  assert.deepEqual(fit.point(10000, -10), { x: 390, y: 0 });
});
test('новый рисунок использует размер холста, до измерения нет деления на ноль', () => {
  assert.deepEqual(sketchViewport({ width: 358, height: 595 }).point(40, 50), { x: 40, y: 50 });
  assert.deepEqual(sketchViewport({ width: 0, height: 0 }).point(0, 0), { x: 0, y: 0 });
});
