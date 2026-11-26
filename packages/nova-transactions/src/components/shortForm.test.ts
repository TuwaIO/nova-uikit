import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sources = (folder: string): string[] =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });

describe('the short form of a hash and of an address', () => {
  // A person compares the ends of two: the toast and the history had 0x1234…abcd, the details 0x123456…89abcdef
  it('is the same everywhere: no component shortens to ends of its own', () => {
    const own = sources(join(import.meta.dirname, '..')).filter((path) =>
      /shortAddress\([^()]+, ?\d/.test(readFileSync(path, 'utf8')),
    );

    expect(own).toEqual([]);
  });
});
