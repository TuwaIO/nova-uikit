// Export utils with dynamic initialization
export * from './utils';

// Export types only, not implementations
export type { SolanaClusterMoniker } from 'gill';

// Dynamic exports that will be loaded at runtime
export async function getSolanaExports() {
  try {
    // Use a more indirect approach to prevent bundlers from resolving imports at build time
    // This creates a function that will be called at runtime
    const importSolanaModule = new Function(
      'return import("@tuwaio/satellite-react/solana").catch(error => { console.warn("Failed to load Solana exports:", error); return null; })'
    );

    const satelliteReactSolana = await importSolanaModule();

    if (!satelliteReactSolana) {
      return {
        available: false,
        error: 'Failed to load Solana exports',
      };
    }

    return {
      ...satelliteReactSolana,
      available: true,
    };
  } catch (error) {
    console.warn('Failed to load Solana exports:', error);
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error loading Solana exports',
    };
  }
}

// Extend the main interface with Solana-specific config
// This will override the default `any` type with specific SolanaClusterMoniker typing
// eslint-disable-next-line
// @ts-ignore - Need for declaration merging
declare module '@tuwaio/nova-connect' {
  interface AllChainConfigs {
    /**
     * Solana RPC URLs configuration - enhanced from default any type
     * @override Replaces default `any` with specific SolanaClusterMoniker typing when gill is available
     */
    // eslint-disable-next-line
    // @ts-ignore - Need for declaration merging
    solanaRPCUrls?: Partial<Record<SolanaClusterMoniker, string>>;
  }
}
