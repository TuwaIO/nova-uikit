/**
 * The EVM watcher of Satellite Connect and the EVM types, imported from `@tuwaio/nova-connect/evm`. Import this entry
 * point in an app with EVM wallets; the root entry point never imports the EVM packages. Importing it:
 *
 * - registers the EVM chain helpers of `@tuwaio/orbit-evm` for the chain lists of Nova Connect;
 * - types `appChains` of `NovaConnectProvider` as the viem chains of your wagmi config (`readonly [Chain, ...Chain[]]`);
 * - adds `EVMConnection` and `ConnectorEVM` from `@tuwaio/satellite-evm` to `AllConnections` and `AllConnectors` of
 *   `@tuwaio/satellite-react`.
 *
 * @module evm
 */

export type { Chain } from 'viem/chains';

import { OrbitAdapter } from '@tuwaio/orbit-core';
import { ConnectorEVM, EVMConnection } from '@tuwaio/satellite-evm';
import { EVMConnectorsWatcher } from '@tuwaio/satellite-react/evm';
import type { Chain } from 'viem/chains';

import { registerChainAdapter } from '../utils/adapters/registry';
import { evmChainAdapter } from './chainAdapter';

export type { ConnectorEVM, EVMConnection };

export { EVMConnectorsWatcher };

registerChainAdapter(OrbitAdapter.EVM, evmChainAdapter);

// Types `appChains` of the root entry point
// eslint-disable-next-line
// @ts-ignore - Need for declaration merging
declare module '@tuwaio/nova-connect' {
  export interface NovaConnectChainConfigTypes {
    appChains: readonly [Chain, ...Chain[]];
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
