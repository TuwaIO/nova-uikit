import { getEvmChains, isEvmChainList } from '@tuwaio/orbit-evm';
import type { Chain } from 'viem/chains';

import type { ChainAdapter } from '../utils/adapters/types';

/**
 * EVM chain helpers from `@tuwaio/orbit-evm`, registered when `@tuwaio/nova-connect/evm` is imported.
 *
 * @internal
 */
export const evmChainAdapter: ChainAdapter = {
  // With this entry point imported, `appChains` is typed `readonly [Chain, ...Chain[]]` for the app (see the module
  // augmentation in `./index.ts`); inside this package it keeps the structural type of the root entry point
  getChains: ({ appChains }) => getEvmChains(appChains as readonly [Chain, ...Chain[]] | undefined),
  isChainList: isEvmChainList,
};
