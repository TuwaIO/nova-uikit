import { mainnet, polygon } from 'viem/chains';
import { describe, expect, it } from 'vitest';

import { getChainsListByConnectorType, isEvmChainList } from '../utils';

describe('@tuwaio/nova-connect/evm', () => {
  it('registers the EVM chain helpers of @tuwaio/orbit-evm when imported', async () => {
    const entry = await import('./index');
    expect(entry.EVMConnectorsWatcher).toBeDefined();

    expect(getChainsListByConnectorType({ connectorType: 'evm:metamask', appChains: [mainnet, polygon] })).toEqual([
      1, 137,
    ]);
    expect(isEvmChainList([1, 137])).toBe(true);
    expect(isEvmChainList(['mainnet'])).toBe(false);
  });
});
