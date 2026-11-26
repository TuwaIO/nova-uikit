import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const config = createRequire(import.meta.url)(path.join(repoRoot, 'alpha.release.config.js')) as {
  branches: (string | { name: string; prerelease: string })[];
  plugins: (string | [string, { prepareCmd?: string }])[];
};

/** The templates of the prerelease of the alpha branches, as semantic-release takes them. */
const templates = config.branches.flatMap((branch) => (typeof branch === 'string' ? [] : [branch.prerelease]));

/** The prerelease identifier semantic-release makes from a template for a branch: it fills `${...}` with `name`. */
const prereleaseOf = (template: string, name: string) => runInNewContext(`\`${template}\``, { name }) as string;

// semantic-release finds the last alpha of a branch among the tags whose prerelease has the identifier of the branch
// as ONE of its parts, and the parts are split at dots. A branch named `feat/nova-0.15` gave the tag
// `v1.0.0-feat-nova-0.15-alpha.1`, whose parts are `feat-nova-0`, `15-alpha` and `1`: the tag of the first push was
// never found again, and every later push failed on `git tag ... alpha.1` (the tag already exists)
describe('the alpha release of a branch', () => {
  const names = [
    'feat/nova-0.15',
    'fix/nova-transactions-0.15.1',
    'feat/Paper_Ink',
    'dev/a/b.c+d@e',
    'fix/toast-regions-labels',
  ];

  it('has a template for the dev, fix and feat branches', () => {
    expect(config.branches.flatMap((branch) => (typeof branch === 'string' ? [] : [branch.name]))).toEqual([
      'dev/**',
      'fix/**',
      'feat/**',
    ]);
    expect(templates).toHaveLength(3);
  });

  it('makes one prerelease identifier of any branch name', () => {
    for (const template of templates)
      for (const name of names) {
        const prerelease = prereleaseOf(template, name);
        // The characters of a semver identifier, and no dot: a dot would split it
        expect(prerelease, name).toMatch(/^[0-9a-z-]+-alpha$/);
        // What semantic-release does to find the last alpha: the parts of the prerelease of its tag hold the identifier
        expect(`${prerelease}.1`.split('.'), name).toEqual([prerelease, '1']);
      }
  });

  it('keeps the names that had no such character as they were', () => {
    for (const template of templates) {
      expect(prereleaseOf(template, 'fix/toast-regions-labels')).toBe('fix-toast-regions-labels-alpha');
      expect(prereleaseOf(template, 'feat/nova-0.15')).toBe('feat-nova-0-15-alpha');
      expect(prereleaseOf(template, 'fix/nova-transactions-0.15.1')).toBe('fix-nova-transactions-0-15-1-alpha');
    }
  });
});

// `nova-core` 1.0.0-feat-payments-alpha.3 asked for the icons in a caret range of its own version, and npm took the icons of
// an older branch, 1.0.0-fix-toast-regions-labels-alpha.1: the parts of a prerelease are compared as text, and "fix" is after
// "feat"
describe('the packages of an alpha', () => {
  const script = path.join(repoRoot, 'scripts', 'exact-workspace-ranges.mjs');

  it('take each other in the very version of that alpha, before it is published', () => {
    const prepare = config.plugins.flatMap((plugin) =>
      typeof plugin === 'string' ? [] : (plugin[1].prepareCmd ?? []),
    );
    expect(prepare.join('\n')).toContain('node scripts/exact-workspace-ranges.mjs');
  });

  it('keep every other range', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'alpha-ranges-'));
    const file = path.join(root, 'packages', 'a', 'package.json');
    mkdirSync(path.dirname(file), { recursive: true });
    const manifest = (range: string) =>
      `${JSON.stringify({ name: 'a', dependencies: { b: range, zod: '^4.0.0' }, peerDependencies: { react: '>=19' } }, null, 2)}\n`;
    writeFileSync(file, manifest('workspace:^'));
    expect(spawnSync(process.execPath, [script], { cwd: root }).status).toBe(0);
    expect(readFileSync(file, 'utf8')).toBe(manifest('workspace:*'));
    rmSync(root, { recursive: true });
  });
});
