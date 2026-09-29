import type { ChainIdentifierArray } from '@tuwaio/orbit-core';

import type { AllChainConfigs } from '../../types';

/**
 * Chain helpers of a network, registered by `@tuwaio/nova-connect/evm` and `@tuwaio/nova-connect/solana` when they are
 * imported (see `registerChainAdapter`).
 *
 * @internal
 */
export interface ChainAdapter {
  /**
   * Returns the chains of the app for this network.
   *
   * @param config - The chain configuration of the app.
   * @param chains - Chain identifiers of the connected wallet, when known (for example `solana:devnet`).
   * @returns The chain IDs (EVM) or the cluster monikers (Solana).
   */
  getChains(config: AllChainConfigs, chains?: ChainIdentifierArray): (string | number)[];

  /**
   * Checks whether a chain list belongs to this network.
   *
   * @param chains - Chain identifiers.
   * @returns `true` when the list is not empty and has only identifiers of this network.
   */
  isChainList(chains: (string | number)[]): boolean;
}
