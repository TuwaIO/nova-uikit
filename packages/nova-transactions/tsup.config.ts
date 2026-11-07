import { readdirSync } from 'node:fs';

import { defineConfig } from 'tsup';

import pkg from './package.json';

// Every component is an entry of its own, so that a page takes only what it imports: with the entry points alone everything they
// share went into one chunk, and importing `HashLink` evaluated the imports of the rest. `package.json` lists these files as free of
// side effects, and the bundler of an app leaves out what is not used.
const modulesIn = (directory: string): string[] =>
  readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.tsx?$/.test(file) && !/\.(test|stories)\.|\.d\.ts$|(^|\/)testing\//.test(file))
    .map((file) => `${directory}/${file}`);

const publicEntries = ['./src/index.ts', './src/providers/index.ts', './src/i18n/index.ts'];

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    entry: [...publicEntries, ...modulesIn('./src/components'), ...modulesIn('./src/providers')],
    treeshake: true,
    sourcemap: false,
    minify: true,
    clean: true,
    dts: { entry: publicEntries },
    splitting: true,
    outExtension({ format }) {
      return {
        js: `.${format === 'esm' ? 'js' : 'cjs'}`,
      };
    },
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  },
]);
