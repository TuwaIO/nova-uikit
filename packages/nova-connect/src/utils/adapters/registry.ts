import type { OrbitAdapter } from '@tuwaio/orbit-core';

import type { ChainAdapter } from './types';

// The registry is stored on `globalThis` under a global symbol: every entry point of this package is a separate bundle
// (the CommonJS build inlines this module into each of them), and `@tuwaio/nova-connect/evm` must register into the
// registry that the root entry point reads.
const REGISTRY_SYMBOL = Symbol.for('tuwaio.nova-connect.chainAdapters');

interface CustomGlobal {
  [REGISTRY_SYMBOL]?: Map<OrbitAdapter, ChainAdapter>;
}

const _global = globalThis as unknown as CustomGlobal;

function getRegistry(): Map<OrbitAdapter, ChainAdapter> {
  return _global[REGISTRY_SYMBOL] || (_global[REGISTRY_SYMBOL] = new Map());
}

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
