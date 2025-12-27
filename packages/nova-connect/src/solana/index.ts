// Export utils with dynamic initialization
export * from './utils';

// Export types only, not implementations
export type { SolanaClusterMoniker } from 'gill';

// Import types from satellite-react/solana
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { SolanaConnectorsWatcher } from '@tuwaio/satellite-react/solana';
import { ConnectorSolana, SolanaConnection } from '@tuwaio/satellite-solana';

// Re-export the types
export type { ConnectorSolana, SolanaConnection };

// Re-export the component
export { SolanaConnectorsWatcher };

// Dynamic exports that will be loaded at runtime
export async function getSolanaExports() {
  try {
    // Use a more indirect approach to prevent bundlers from resolving imports at build time
    // This creates a function that will be called at runtime
    const importSolanaModule = new Function(
      'return import("@tuwaio/satellite-react/solana").catch(error => { console.warn("Failed to load Solana exports:", error); return null; })',
    );

    const satelliteReactSolana = await importSolanaModule();

    if (!satelliteReactSolana) {
      return {
        available: false,
        error: 'Failed to load Solana exports',
      };
    }

    // Instead of trying to modify exports directly, we'll return the actual component
    // implementation and let the consumer handle the assignment
    const actualSolanaConnectorsWatcher = satelliteReactSolana.SolanaConnectorsWatcher;

    return {
      ...satelliteReactSolana,
      available: true,
      SolanaConnectorsWatcher: actualSolanaConnectorsWatcher,
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

// Extend the satellite-react interfaces with Solana-specific types
// eslint-disable-next-line
// @ts-ignore - Need for declaration merging
declare module '@tuwaio/satellite-react' {
  export interface AllConnections {
    [OrbitAdapter.SOLANA]: SolanaConnection;
  }
  export interface AllConnectors {
    [OrbitAdapter.SOLANA]: ConnectorSolana;
  }
}
