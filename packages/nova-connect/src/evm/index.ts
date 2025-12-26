// Export utils with dynamic initialization
export * from './utils';

// Export types only, not implementations
export type { Chain } from 'viem/chains';

// Export components directly to satisfy static imports
export { EVMConnectorsWatcher } from '@tuwaio/satellite-react/evm';

// Dynamic exports that will be loaded at runtime
export async function getEvmExports() {
  try {
    // Use a more indirect approach to prevent bundlers from resolving imports at build time
    // This creates a function that will be called at runtime
    const importEvmModule = new Function(
      'return import("@tuwaio/satellite-react/evm").catch(error => { console.warn("Failed to load EVM exports:", error); return null; })'
    );

    const satelliteReactEvm = await importEvmModule();

    if (!satelliteReactEvm) {
      return {
        available: false,
        error: 'Failed to load EVM exports',
      };
    }

    return {
      ...satelliteReactEvm,
      available: true,
    };
  } catch (error) {
    console.warn('Failed to load EVM exports:', error);
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error loading EVM exports',
    };
  }
}

// Extend the main interface with EVM-specific config
// This will override the default `any` type with specific Chain[] typing
// eslint-disable-next-line
// @ts-ignore - Need for declaration merging
declare module '@tuwaio/nova-connect' {
  interface AllChainConfigs {
    /**
     * EVM chains configuration - enhanced from default any type
     * @override Replaces default `any` with specific Chain typing when viem is available
     */
    // eslint-disable-next-line
    // @ts-ignore - Need for declaration merging
    appChains?: readonly [Chain, ...Chain[]];
  }
}
