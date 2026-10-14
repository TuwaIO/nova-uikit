import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// The icons of `@web3icons/react` load through `web3IconImports`, a map of about 300 `import()` calls that a bundler
// compiles in full wherever the loader is reachable. They are reached only through the `web3-icons` entry, which is a
// client module ('use client', added by tsup.config.ts): an app that imports `cn` or `getChainName` on its server then
// stops at that client boundary instead of compiling every icon for each server layer. The `utils` entry
// (`@tuwaio/nova-core/utils`) does not reach the loader at all, so apps that need only the helpers compile no icon.
const src = path.resolve(__dirname);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const file = path.join(dir, entry);
    if (statSync(file).isDirectory()) return sourceFiles(file);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [file] : [];
  });
}

/** The source files that a module reaches through relative imports, and the packages they import. */
function reach(entry: string, files = new Set<string>(), packages = new Set<string>()) {
  if (files.has(entry)) return { files, packages };
  files.add(entry);
  for (const [, specifier] of readFileSync(entry, 'utf8').matchAll(/(?:from|import\()\s*'([^']+)'/g)) {
    if (!specifier.startsWith('.')) {
      packages.add(specifier);
      continue;
    }
    const base = path.resolve(path.dirname(entry), specifier);
    const file = [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find((candidate) => existsSync(candidate));
    if (file) reach(file, files, packages);
  }
  return { files, packages };
}

describe('client boundary of the web3icons loader', () => {
  it('lets only the web3-icons entry import Web3IconLazy, the loader and the icon map', () => {
    const allowed = [
      path.join('src', 'web3-icons.ts'),
      path.join('components', 'Web3IconLazy.tsx'),
      path.join('utils', 'web3IconLoader.ts'),
    ];
    const offenders = sourceFiles(src)
      .filter((file) => !allowed.some((allowedFile) => file.endsWith(allowedFile)))
      .filter((file) =>
        /from '\.{1,2}\/(?:components\/|\.\.\/components\/)?Web3IconLazy'|web3IconLoader'|web3IconImports'/.test(
          readFileSync(file, 'utf8'),
        ),
      )
      .map((file) => path.relative(src, file));

    expect(offenders).toEqual([]);
  });

  it('imports the icon map only from the loader', () => {
    const importers = sourceFiles(src)
      .filter((file) => readFileSync(file, 'utf8').includes("web3IconImports'"))
      .map((file) => path.relative(src, file));

    expect(importers).toEqual([path.join('utils', 'web3IconLoader.ts')]);
  });

  it('renders the lazy icons of NetworkIcon and WalletIcon through the web3-icons entry', () => {
    for (const component of ['NetworkIcon.tsx', 'WalletIcon.tsx']) {
      expect(readFileSync(path.join(src, 'components', component), 'utf8')).toContain("from '../web3-icons'");
    }
  });

  it('keeps the loader out of the main entry', () => {
    expect(readFileSync(path.join(src, 'index.ts'), 'utf8')).not.toMatch(
      /web3-icons|Web3IconLazy|web3IconLoader|web3IconImports/,
    );
  });
});

describe('utils entry', () => {
  it('is published as @tuwaio/nova-core/utils', () => {
    const { exports } = JSON.parse(readFileSync(path.join(src, '..', 'package.json'), 'utf8'));

    expect(exports['./utils']).toEqual({
      types: './dist/utils.d.ts',
      import: './dist/utils.js',
      require: './dist/utils.cjs',
    });
  });

  it('reaches no component, no icon loader, no @web3icons/react and no React', () => {
    const { files, packages } = reach(path.join(src, 'utils', 'index.ts'));

    expect(
      [...files].map((file) => path.relative(src, file)).filter((file) => /^components|web3-icons|web3Icon/.test(file)),
    ).toEqual([]);
    expect([...packages].filter((name) => name.startsWith('@web3icons/react') || name === 'react')).toEqual([]);
  });
});
