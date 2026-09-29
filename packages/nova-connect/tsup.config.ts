import { defineConfig } from 'tsup';

import pkg from './package.json';

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    entry: [
      './src/index.ts',
      './src/components/index.ts',
      './src/satellite/index.ts',
      './src/hooks/index.ts',
      './src/i18n/index.ts',
      './src/evm/index.ts',
      './src/solana/index.ts',
    ],
    treeshake: true,
    sourcemap: false,
    minify: true,
    clean: true,
    // Types of `process.env.NODE_ENV` (the root entry imports no package that references the Node.js types)
    dts: { compilerOptions: { types: ['node'] } },
    splitting: true,
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  },
]);
