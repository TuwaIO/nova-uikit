import { readdir, readFile, writeFile } from 'node:fs/promises';

import { defineConfig, type Options } from 'tsup';

import pkg from './package.json';

// The icons of @web3icons/react load through `web3IconImports`, a map of about 300 `import()` calls that the bundler of
// an app compiles in full wherever the loader is reachable. The loader lives in its own entry, `dist/web3-icons.*`, which
// starts with 'use client', and the main entry imports that file instead of bundling it: an app that uses `cn` or
// `getChainName` on its server stops at the client boundary instead of compiling every icon for each server layer (RSC,
// route handlers).

/** Keeps the import of `../web3-icons` as an import of the built `web3-icons` file next to the importing chunk. */
const web3IconsExternal: NonNullable<Options['esbuildPlugins']>[number] = {
  name: 'web3-icons-external',
  setup(build) {
    // tsup builds the CJS output with splitting as ESM and converts it afterwards, so `format` is `esm` in both builds.
    const file = `./web3-icons${build.initialOptions.outExtension?.['.js'] ?? '.js'}`;
    build.onResolve({ filter: /^\.{1,2}\/(?:.*\/)?web3-icons$/ }, (args) =>
      args.kind === 'entry-point' ? undefined : { path: file, external: true },
    );
  },
};

/** Marks the web3-icons entry as a client module and checks that the loader is nowhere else. */
async function markClientEntry() {
  for (const file of ['dist/web3-icons.js', 'dist/web3-icons.cjs']) {
    const code = await readFile(file, 'utf8');
    if (!code.startsWith("'use client'")) await writeFile(file, `'use client';\n${code}`);
  }
  const imports = { js: false, cjs: false };
  for (const file of await readdir('dist')) {
    if (!/\.c?js$/.test(file) || file.startsWith('web3-icons.')) continue;
    const code = await readFile(`dist/${file}`, 'utf8');
    if (code.includes('@web3icons/react/icons/') || code.includes('dynamicIconImports')) {
      throw new Error(`dist/${file} contains the web3icons loader: it must stay in dist/web3-icons.*`);
    }
    if (file.endsWith('.cjs')) imports.cjs ||= code.includes('./web3-icons.cjs');
    else imports.js ||= code.includes('./web3-icons.js');
  }
  if (!imports.js || !imports.cjs) throw new Error('The main entry does not import dist/web3-icons.*');

  // `@tuwaio/nova-core/utils` and the chunks it loads must not reach the icons, React or the components
  for (const entry of ['utils.js', 'utils.cjs']) {
    const seen = new Set<string>();
    const visit = async (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);
      const code = await readFile(`dist/${file}`, 'utf8');
      if (/web3-icons|@web3icons\/react|from\s*["']react["']|require\(["']react["']\)/.test(code)) {
        throw new Error(`dist/${file}, loaded by dist/${entry}, reaches the icons or React`);
      }
      for (const [, chunk] of code.matchAll(/["']\.\/(chunk-[\w-]+\.c?js)["']/g)) await visit(chunk);
    };
    await visit(entry);
  }
}

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    entry: { index: './src/index.ts', 'web3-icons': './src/web3-icons.ts', utils: './src/utils/index.ts' },
    treeshake: true,
    sourcemap: false,
    splitting: true,
    minify: true,
    clean: true,
    dts: true,
    outExtension({ format }) {
      return {
        js: `.${format === 'esm' ? 'js' : 'cjs'}`,
      };
    },
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.devDependencies || {})],
    esbuildPlugins: [web3IconsExternal],
    onSuccess: markClientEntry,
  },
]);
