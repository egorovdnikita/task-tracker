import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSvgGradients } from './check-svg-gradients.mjs';

test('ловит остановки Finch, которые браузер принимает, а нативный SVG превращает в ноль', () => {
  assert.equal(checkSvgGradients('<Stop offset=".16" stopOpacity=".6" />').length, 2);
  assert.equal(checkSvgGradients('<Stop offset="0.16" stopOpacity="0.6" />').length, 0);
  assert.equal(checkSvgGradients('<Stop offset={0.16} stopOpacity={0.6} />').length, 0);
  assert.equal(checkSvgGradients('<Stop offset="16%" />').length, 0);
});
