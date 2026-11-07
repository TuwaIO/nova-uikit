import { readdirSync } from 'node:fs';

import { defineConfig } from 'tsup';

import pkg from './package.json';

// Every component is an entry of its own, so that a page takes only what it imports: with the entry points alone everything they
// share went into one chunk, and importing `useNovaConnect` evaluated the imports of the rest. `package.json` lists these files as free of
// side effects, and the bundler of an app leaves out what is not used.
const modulesIn = (directory: string): string[] =>
  readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.tsx?$/.test(file) && !/\.(test|stories)\.|\.d\.ts$|(^|\/)testing\//.test(file))
    .map((file) => `${directory}/${file}`);

const publicEntries = [
  './src/index.ts',
  './src/components/index.ts',
  './src/satellite/index.ts',
  './src/hooks/index.ts',
  './src/i18n/index.ts',
  './src/evm/index.ts',
  './src/solana/index.ts',
];

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    entry: [
      ...publicEntries,
      ...modulesIn('./src/hooks'),
      ...modulesIn('./src/watchers'),
      ...modulesIn('./src/providers'),
    ],
    treeshake: true,
    sourcemap: false,
    minify: true,
    clean: true,
    // Types of `process.env.NODE_ENV` (the root entry imports no package that references the Node.js types)
    dts: { entry: publicEntries, compilerOptions: { types: ['node'] } },
    splitting: true,
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  },
]);
