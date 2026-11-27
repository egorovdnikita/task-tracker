import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const script = resolve('scripts/sync-box-tokens.mjs');
test('синхронизация воспроизводима и обнаруживает дрейф, повреждение и неизвестный синтаксис', () => {
  const root = mkdtempSync(join(tmpdir(), 'task-tokens-'));
  try {
    const source = join(root, 'box');
    mkdirSync(join(source, 'tokens/figma'), { recursive: true });
    mkdirSync(join(root, 'docs'));
    writeFileSync(join(source, 'tokens/figma/prim-color.txt'), 'color/alpha/black/100=#000000\ncolor/alpha/white/100=#ffffff\n');
    for (const kind of ['spacing', 'rounding', 'size']) writeFileSync(join(source, `tokens/figma/prim-${kind}.txt`), `# modes: Value\n${kind}/4=4\n`);
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, env: { ...process.env, BOX_UI_DIR: source }, encoding: 'utf8' });
    assert.equal(run().status, 0);
    assert.equal(run('--check').status, 0);
    const generated = join(root, 'src/vendor/box-ui/primitives.ts');
    const original = readFileSync(generated, 'utf8');
    writeFileSync(generated, original.replace('"4": 4', '"4": 8'));
    assert.notEqual(run('--check').status, 0);
    assert.equal(run().status, 0);
    writeFileSync(join(source, 'tokens/figma/prim-spacing.txt'), 'spacing/4=8\n');
    assert.notEqual(run('--check').status, 0);
    writeFileSync(join(source, 'tokens/figma/prim-spacing.txt'), 'spacing/4=@other:value\n');
    assert.notEqual(run().status, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
