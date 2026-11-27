// Structural proof: inline token references and compare TypeScript ASTs to a git base.
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const base = process.argv[2];
if (!base) throw Error('Usage: node scripts/verify-token-values.mjs <git-base>');
const primitiveText = readFileSync('src/vendor/box-ui/primitives.ts', 'utf8');
const primitives = JSON.parse(primitiveText.match(/= ([\s\S]*) as const/)[1]);
const colors = JSON.parse(readFileSync('src/theme/localColors.ts', 'utf8').match(/= ([\s\S]*) as const/)[1].replace(/boxPrimitives\.achromatic\.(black|white)/g, (_, key) => JSON.stringify(primitives.achromatic[key])));
const files = execFileSync('git', ['diff', '--name-only', '--diff-filter=M', base], { encoding: 'utf8' }).trim().split('\n').filter(f => /\.[tj]sx?$/.test(f) && /^(src|app)\//.test(f));
function normalized(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const transformed = ts.transform(source, [context => root => {
    function visit(node) {
      if (ts.isImportDeclaration(node) && /\/(primitives|localColors)['"]$/.test(node.moduleSpecifier.getText(source))) return undefined;
      if (ts.isElementAccessExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(source) === 'boxPrimitives') {
        const value = primitives[node.expression.name.text][node.argumentExpression.text];
        assert.equal(typeof value, 'number');
        return ts.factory.createNumericLiteral(value);
      }
      if (ts.isPropertyAccessExpression(node) && node.expression.getText(source) === 'localColors') {
        assert.ok(Object.hasOwn(colors, node.name.text));
        return visit(ts.factory.createStringLiteral(colors[node.name.text]));
      }
      node = ts.visitEachChild(node, visit, context);
      if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) return node.expression;
      if (ts.isStringLiteral(node)) {
        let value = node.text;
        if (/^#[\da-f]{3,8}$/i.test(value)) {
          value = value.toLowerCase();
          if (value.length === 4) value = '#' + [...value.slice(1)].map(c => c + c).join('');
        }
        return ts.factory.createStringLiteral(value);
      }
      return node;
    }
    return ts.visitNode(root, visit);
  }]);
  const output = ts.createPrinter({ removeComments: true }).printFile(transformed.transformed[0]);
  transformed.dispose();
  return output;
}
for (const file of files) {
  const before = execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' });
  assert.equal(normalized(file, readFileSync(file, 'utf8')), normalized(file, before), `${file}: changed beyond equivalent tokens`);
}
console.log(`Неизменность AST после раскрытия токенов: ${files.length} файлов`);
