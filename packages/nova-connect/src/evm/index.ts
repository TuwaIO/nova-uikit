// Export utils with dynamic initialization
export * from './utils';

// Export types only, not implementations
export type { Chain } from 'viem/chains';

// Dynamic exports that will be loaded at runtime
export async function getEvmExports() {
  try {
    const satelliteReactEvm = await import('@tuwaio/satellite-react/evm');
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
