import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith('.tsx') ? [join(dir, entry.name)] : []);
test('маршруты Expo Go не включают управление статус-баром через native screens', () => {
  for (const file of files('app')) {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if (ts.isPropertyAssignment(node) || ts.isJsxAttribute(node)) {
        assert.ok(!['statusBarStyle', 'statusBarHidden', 'statusBarAnimation'].includes(node.name.getText(source).replace(/['"]/g, '')), `${file}: native screens требует UIViewControllerBasedStatusBarAppearance=YES, недоступный в Expo Go`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  assert.match(readFileSync('app/_layout.tsx', 'utf8'), /<StatusBar style="light"\s*\/>/);
});
