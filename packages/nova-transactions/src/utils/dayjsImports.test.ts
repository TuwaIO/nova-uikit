import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourcesIn = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourcesIn(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });

describe('dayjs plugins', () => {
  it('are imported with the extension: dayjs has no exports map, and an ESM consumer cannot resolve the path without it', () => {
    const bare = sourcesIn(join(__dirname, '..')).filter((path) =>
      /from 'dayjs\/plugin\/[^']*(?<!\.js)'/.test(readFileSync(path, 'utf8')),
    );
    expect(bare).toEqual([]);
  });
});
