/**
 * The Solana watcher of Satellite Connect and the Solana types, imported from `@tuwaio/nova-connect/solana`. Import this
 * entry point in an app with Solana wallets; the root entry point never imports the Solana packages. Importing it:
 *
 * - registers the Solana chain helpers of `@tuwaio/orbit-solana` for the chain lists of Nova Connect (without it, the
 *   lists have only the clusters of `solanaRPCUrls`);
 * - types `solanaRPCUrls` of `NovaConnectProvider` with the cluster monikers of `@tuwaio/orbit-solana`;
 * - adds `SolanaConnection` and `ConnectorSolana` from `@tuwaio/satellite-solana` to `AllConnections` and
 *   `AllConnectors` of `@tuwaio/satellite-react`.
 *
 * @module solana
 */

export type { SolanaClusterMoniker } from '@tuwaio/orbit-solana';

import { OrbitAdapter } from '@tuwaio/orbit-core';
import type { SolanaClusterMoniker } from '@tuwaio/orbit-solana';
import { SolanaConnectorsWatcher } from '@tuwaio/satellite-react/solana';
import { ConnectorSolana, SolanaConnection } from '@tuwaio/satellite-solana';

import { registerChainAdapter } from '../utils/adapters/registry';
import { solanaChainAdapter } from './chainAdapter';

export type { ConnectorSolana, SolanaConnection };

export { SolanaConnectorsWatcher };

registerChainAdapter(OrbitAdapter.SOLANA, solanaChainAdapter);

// Types `solanaRPCUrls` of the root entry point
// eslint-disable-next-line
// @ts-ignore - Need for declaration merging
declare module '@tuwaio/nova-connect' {
  export interface NovaConnectChainConfigTypes {
    solanaRPCUrls: Partial<Record<SolanaClusterMoniker, string>>;
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
