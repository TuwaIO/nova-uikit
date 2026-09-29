import { getSolanaClusters, isSolanaChainList, type SolanaClusterMoniker } from '@tuwaio/orbit-solana';

import type { ChainAdapter } from '../utils/adapters/types';

/**
 * Solana chain helpers from `@tuwaio/orbit-solana`, registered when `@tuwaio/nova-connect/solana` is imported.
 *
 * @internal
 */
export const solanaChainAdapter: ChainAdapter = {
  // With this entry point imported, `solanaRPCUrls` is typed with the cluster monikers for the app (see the module
  // augmentation in `./index.ts`); inside this package it keeps the structural type of the root entry point
  getChains: ({ solanaRPCUrls }, chains) =>
    getSolanaClusters(solanaRPCUrls as Partial<Record<SolanaClusterMoniker, string>> | undefined, chains),
  isChainList: isSolanaChainList,
};
