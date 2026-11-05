import { mainnet, polygon } from 'viem/chains';
import { describe, expect, it } from 'vitest';

import { getChainsListByConnectorType, isEvmChainList } from '../utils';

describe('@tuwaio/nova-connect/evm', () => {
  // A dynamic import of a whole entry point: on a busy machine it takes longer than the default limit of a test
  it('registers the EVM chain helpers of @tuwaio/orbit-evm when imported', { timeout: 30_000 }, async () => {
    const entry = await import('./index');
    expect(entry.EVMConnectorsWatcher).toBeDefined();

    expect(getChainsListByConnectorType({ connectorType: 'evm:metamask', appChains: [mainnet, polygon] })).toEqual([
      1, 137,
    ]);
    expect(isEvmChainList([1, 137])).toBe(true);
    expect(isEvmChainList(['mainnet'])).toBe(false);
  });
});
