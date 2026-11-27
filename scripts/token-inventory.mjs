import ts from 'typescript';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`]);
const files = [...walk('app'), ...walk('src'), ...walk('.storybook')].filter(f => /\.[cm]?[tj]sx?$/.test(f) && !f.includes('/vendor/') && !f.endsWith('/Symbol.tsx')).sort();
const rows = [];
// Inventory expressions as well as literals: dynamic dimensions must remain dynamic.
const styleKey = /^(color|.*Color|background|opacity|.*Opacity|font.*|lineHeight|letterSpacing|textShadow.*|shadow.*|elevation|border.*|padding.*|margin.*|gap|rowGap|columnGap|width|height|minWidth|maxWidth|minHeight|maxHeight|top|bottom|left|right|inset.*|transform|tintColor|stopColor|stroke|strokeWidth|fill|size|intensity)$/;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isPropertyAssignment(node) || ts.isJsxAttribute(node)) {
      const key = node.name.getText(tree).replace(/^['"]|['"]$/g, '');
      if (node.initializer && (styleKey.test(key) || file.startsWith('src/theme/'))) {
        const value = node.initializer.getText(tree);
        rows.push({ file, key, value });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
}
const result = JSON.stringify({ files: files.length, entries: rows }, null, 2) + '\n';
const target = 'docs/token-inventory.json';
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== result) throw Error('Изменились дизайн-значения: проверьте роли и обновите npm run tokens:inventory');
} else writeFileSync(target, result);
console.log(`Реестр: ${files.length} файлов, ${rows.length} выражений`);
