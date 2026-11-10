import { readdirSync } from 'node:fs';

import { defineConfig } from 'tsup';

import pkg from './package.json';

// Every icon is an entry of its own, so that an app takes only the icons it imports: `package.json` lists the package as
// free of side effects, and the bundler of an app leaves out the rest
const icons = readdirSync('./src/icons')
  .filter((file) => /\.tsx?$/.test(file) && !/\.test\./.test(file))
  .map((file) => `./src/icons/${file}`);

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts', ...icons],
    treeshake: true,
    sourcemap: false,
    minify: true,
    clean: true,
    dts: { entry: ['./src/index.ts'] },
    splitting: true,
    outExtension({ format }) {
      return {
        js: `.${format === 'esm' ? 'js' : 'cjs'}`,
      };
    },
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  },
]);
