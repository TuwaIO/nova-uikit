import { readdirSync } from 'node:fs';

import { defineConfig } from 'tsup';

import pkg from './package.json';

// Every icon is an entry of its own, so that an app takes only the icons it imports: `package.json` lists the package as
// free of side effects (but for its stylesheet), and the bundler of an app leaves out the rest
const icons = (variant: string) =>
  Object.fromEntries(
    readdirSync(`./src/${variant}`)
      .filter((file) => /\.ts$/.test(file))
      .map((file) => [`${variant}/${file.replace(/\.ts$/, '')}`, `./src/${variant}/${file}`]),
  );

// The import paths of Heroicons: `24/outline` and `24/solid` (where `20/solid` and `16/solid` lead too, see `exports`),
// and `tuwa` for the icons of TUWA's own
const barrels = {
  index: './src/index.ts',
  '24/outline/index': './src/outline.ts',
  '24/solid/index': './src/solid.ts',
  'tuwa/index': './src/tuwa.ts',
};

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    entry: { ...barrels, ...icons('outline'), ...icons('solid'), ...icons('tuwa') },
    treeshake: true,
    sourcemap: false,
    minify: true,
    clean: true,
    dts: { entry: barrels },
    splitting: true,
    outExtension({ format }) {
      return {
        js: `.${format === 'esm' ? 'js' : 'cjs'}`,
      };
    },
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  },
]);
