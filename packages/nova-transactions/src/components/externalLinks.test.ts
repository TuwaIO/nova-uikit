import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourcesOf = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourcesOf(path);
    return name.endsWith('.tsx') && !name.includes('.test.') ? [path] : [];
  });

// The sound of a link to another site is played for the links with this mark: one without it would stay silent
describe('the links of Nova Transactions that open a new tab', () => {
  it.each(sourcesOf(__dirname).filter((path) => readFileSync(path, 'utf8').includes('target="_blank"')))(
    '%s',
    (path) => {
      const source = readFileSync(path, 'utf8');
      expect(source.match(/target="_blank"/g)?.length).toBe(source.match(/data-nova-external-link/g)?.length);
    },
  );
});
