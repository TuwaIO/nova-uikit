import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import * as helpers from '@tuwaio/nova-core/utils';
import { describe, expect, it } from 'vitest';

// A file that needs only helpers of @tuwaio/nova-core (`cn`, `deepMerge`, `textCenterEllipsis`…) imports them from
// `@tuwaio/nova-core/utils`, which loads no React component and no icon; the main entry is for files that also use its
// components or hooks. Entry points without UI then do not pull the icon loader into the bundle of an app.
const src = path.resolve(__dirname);
const helperNames = new Set(Object.keys(helpers));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const file = path.join(dir, entry);
    if (statSync(file).isDirectory()) return sourceFiles(file);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [file] : [];
  });
}

describe('imports of @tuwaio/nova-core', () => {
  it('take the helpers from @tuwaio/nova-core/utils when a file needs nothing else from the package', () => {
    const offenders = sourceFiles(src)
      .filter((file) =>
        [...readFileSync(file, 'utf8').matchAll(/import\s*\{([^}]*)\}\s*from\s*'@tuwaio\/nova-core'/g)].some(
          ([, names]) =>
            names
              .split(',')
              .map((name) => name.trim().split(/\s+as\s+/)[0])
              .filter(Boolean)
              .every((name) => helperNames.has(name)),
        ),
      )
      .map((file) => path.relative(src, file));

    expect(offenders).toEqual([]);
  });
});
