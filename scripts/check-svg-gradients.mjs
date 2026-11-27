import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// react-native-svg/extractGradient.ts: строка без ведущей цифры превращается в 0.
const nativeNumber = /^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?%?$/;
export function checkSvgGradients(source, file = 'screen.tsx') {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const errors = [];
  function visit(node) {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(tree) === 'Stop') {
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr) || !['offset', 'stopOpacity'].includes(attr.name.text)) continue;
        if (attr.initializer && ts.isStringLiteral(attr.initializer) && !nativeNumber.test(attr.initializer.text)) {
          errors.push(`${file}:${tree.getLineAndCharacterOfPosition(attr.pos).line + 1}: ${attr.name.text}="${attr.initializer.text}" не принимает нативный SVG`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return errors;
}
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(f => f.isDirectory() ? walk(`${dir}/${f.name}`) : [`${dir}/${f.name}`]);
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = [...walk('src'), ...walk('app')].filter(f => f.endsWith('.tsx')).flatMap(f => checkSvgGradients(readFileSync(f, 'utf8'), f));
  if (errors.length) throw Error(errors.join('\n'));
  console.log('SVG: числовые строки остановок совместимы с react-native-svg');
}
