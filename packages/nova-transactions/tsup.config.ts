import { defineConfig } from 'tsup';

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts', './src/providers/index.ts'],
    treeshake: true,
    sourcemap: true,
    minify: true,
    clean: true,
    dts: true,
    splitting: false,
    outExtension({ format }) {
      return {
        js: `.${format === 'esm' ? 'js' : 'cjs'}`,
      };
    },
    external: [
      '@bgd-labs/react-web3-icons',
      '@heroicons/react',
      '@radix-ui/react-dialog',
      'framer-motion',
      'react',
      'react-toastify',
      '@tuwaio/pulsar-core',
      '@tuwaio/nova-core',
      '@tuwaio/orbit-core',
      'dayjs',
      'ethereum-blockies-base64',
    ],
  },
]);
