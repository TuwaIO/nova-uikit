import { globalSingleton, type OrbitAdapter } from '@tuwaio/orbit-core';

import type { ChainAdapter } from './types';

// One registry for every entry point of this package (the CommonJS build inlines this module into each of them), so that
// `@tuwaio/nova-connect/evm` and `/solana` fill the one the root entry point reads. The name must never change
const getRegistry = () =>
  globalSingleton<Map<OrbitAdapter, ChainAdapter>>('tuwaio.nova-connect.chainAdapters', () => new Map());

/**
 * Registers the chain helpers of a network. `@tuwaio/nova-connect/evm` and `@tuwaio/nova-connect/solana` call it when
 * they are imported, so the root entry point never imports the packages of a network.
 *
 * @internal
 * @param type - The network.
 * @param adapter - Its chain helpers.
 */
export function registerChainAdapter(type: OrbitAdapter, adapter: ChainAdapter): void {
  getRegistry().set(type, adapter);
}

/**
 * Returns the registered chain helpers of a network.
 *
 * @internal
 * @param type - The network.
 * @returns The helpers, or `undefined` when the entry point of the network has not been imported.
 */
export function getChainAdapter(type: OrbitAdapter): ChainAdapter | undefined {
  return getRegistry().get(type);
}
