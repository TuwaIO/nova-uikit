import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx$/.test(entry.name) && !/\.(test|stories)\.tsx$/.test(entry.name) ? [path] : [];
  });

// `main`, `banner` and `contentinfo` are of a page, one of each: a window that had its own gave the host's page a second main, which
// a screen reader offers as the content of the page
describe('the landmarks of a page', () => {
  it('are the host’s alone', () => {
    const found = sources(__dirname).flatMap((path) =>
      (readFileSync(path, 'utf8').match(/<(?:main|footer)\b|role(?:="|: ')(?:main|contentinfo|banner)\b/g) ?? []).map(
        (landmark) => `${relative(__dirname, path)}: ${landmark}`,
      ),
    );
    expect(found).toEqual([]);
  });
});
