import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { hasSymlinkComponent } from './path-safety.mjs';

test('rejects symlinked artifacts, symlinked directories and repository escapes', () => {
  const root = mkdtempSync(join(tmpdir(), 'mbk-overlay-'));
  const external = mkdtempSync(join(tmpdir(), 'mbk-external-'));
  try {
    mkdirSync(join(root, 'schemas'));
    writeFileSync(join(root, 'schemas', 'good.json'), '{}');
    writeFileSync(join(external, 'outside.json'), '{}');
    symlinkSync(join(external, 'outside.json'), join(root, 'schemas', 'alias.json'));
    symlinkSync(external, join(root, 'linked-directory'));
    assert.equal(hasSymlinkComponent(root, join(root, 'schemas', 'good.json')), false);
    assert.equal(hasSymlinkComponent(root, join(root, 'schemas', 'alias.json')), true);
    assert.equal(hasSymlinkComponent(root, join(root, 'linked-directory', 'outside.json')), true);
    assert.equal(hasSymlinkComponent(root, join(root, 'schemas', 'missing.json')), false);
    assert.throws(() => hasSymlinkComponent(root, join(external, 'outside.json')), /escapes/);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(external, { recursive: true, force: true });
  }
});
