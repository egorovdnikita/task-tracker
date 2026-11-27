import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compiled = ts.transpileModule(readFileSync('src/utils/noteSections.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { noteSections } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('две закреплённые заметки не делят строку сетки, остальные не теряются', () => {
  const notes = [true, true, false, false, false].map((pinned, id) => ({ pinned, id }));
  const sections = noteSections(notes, 2);
  assert.deepEqual(sections.map(s => s.data.map(row => row.map(n => n.id))), [[[0], [1]], [[2, 3], [4]]]);
  assert.deepEqual(sections.flatMap(s => s.data.flat()).map(n => n.id), notes.map(n => n.id));
});
test('пустой список остаётся пустым для EmptyState; список сохраняет одиночные строки', () => {
  assert.deepEqual(noteSections([], 2), []);
  assert.deepEqual(noteSections([{ pinned: false, id: 1 }, { pinned: false, id: 2 }], 1)[0].data.map(row => row.length), [1, 1]);
});
