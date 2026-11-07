import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourcesOf = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourcesOf(path);
    return name.endsWith('.tsx') && !name.includes('.test.') ? [path] : [];
  });

// Owner, 2026-11-07: importing `HashLink` reached the provider, react-toastify and the history through this barrel, for a page that
// uses none of them
describe('the components of Nova Transactions', () => {
  it.each(sourcesOf(__dirname))('%s imports what it needs, not the barrel of the providers', (path) => {
    expect(readFileSync(path, 'utf8')).not.toMatch(/from '(\.\.\/)+providers'/);
  });

  it.each(sourcesOf(__dirname))('%s takes the props of the provider as a type', (path) => {
    expect(readFileSync(path, 'utf8')).not.toMatch(
      /^import \{[^}]*\} from '(\.\.\/)+providers\/NovaTransactionsProvider'/m,
    );
  });

  it('declares that its modules can be left out', () => {
    const manifest = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8')) as {
      sideEffects: unknown;
    };
    expect(manifest.sideEffects).toEqual(['*.css']);
  });
});
