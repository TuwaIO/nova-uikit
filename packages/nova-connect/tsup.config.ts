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
    dts: true,
    splitting: true,
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  },
]);
