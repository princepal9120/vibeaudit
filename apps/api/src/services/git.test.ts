import assert from 'node:assert/strict';
import test from 'node:test';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const tempRoot = join(tmpdir(), `shipsafe-git-tests-${Date.now()}`);

process.env.TEMP_DIR = tempRoot;

const { cloneRepository, cleanupRepository } = await import('./git.ts');

test.after(async () => {
  await rm(tempRoot, { recursive: true, force: true });
});

test('cloneRepository creates the temp root and clones the default branch when branch is omitted', async () => {
  const repoPath = await cloneRepository('https://github.com/expressjs/express');

  try {
    assert.match(repoPath, new RegExp(`^${tempRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  } finally {
    await cleanupRepository(repoPath);
  }
});

test('cloneRepository returns a branch-specific error for an invalid explicit branch', async () => {
  await assert.rejects(
    () => cloneRepository('https://github.com/expressjs/express', 'does-not-exist'),
    /Branch "does-not-exist" not found/
  );
});
