// Export types only, not implementations
export type { Chain } from 'viem/chains';

// Import types from satellite-react/evm
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { ConnectorEVM, EVMConnection } from '@tuwaio/satellite-evm';
import { EVMConnectorsWatcher } from '@tuwaio/satellite-react/evm';

// Re-export the types
export type { ConnectorEVM, EVMConnection };

// Re-export the component
export { EVMConnectorsWatcher };

// Dynamic exports that will be loaded at runtime
export async function getEvmExports() {
  try {
    // Use a more indirect approach to prevent bundlers from resolving imports at build time
    // This creates a function that will be called at runtime
    const importEvmModule = new Function(
      'return import("@tuwaio/satellite-react/evm").catch(error => { console.warn("Failed to load EVM exports:", error); return null; })',
    );

    const satelliteReactEvm = await importEvmModule();

    if (!satelliteReactEvm) {
      return {
        available: false,
        error: 'Failed to load EVM exports',
      };
    }

    // Instead of trying to modify exports directly, we'll return the actual component
    // implementation and let the consumer handle the assignment
    const actualEVMConnectorsWatcher = satelliteReactEvm.EVMConnectorsWatcher;

    return {
      ...satelliteReactEvm,
      available: true,
      EVMConnectorsWatcher: actualEVMConnectorsWatcher,
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

// Extend the satellite-react interfaces with EVM-specific types
// eslint-disable-next-line
// @ts-ignore - Need for declaration merging
declare module '@tuwaio/satellite-react' {
  export interface AllConnections {
    [OrbitAdapter.EVM]: EVMConnection;
  }
  export interface AllConnectors {
    [OrbitAdapter.EVM]: ConnectorEVM;
  }
}
