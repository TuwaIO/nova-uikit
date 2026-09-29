import { describe, expect, it } from 'vitest';

import { getChainsListByConnectorType, isSolanaChainList } from '../utils';

describe('@tuwaio/nova-connect/solana', () => {
  it('registers the Solana chain helpers of @tuwaio/orbit-solana when imported', async () => {
    const entry = await import('./index');
    expect(entry.SolanaConnectorsWatcher).toBeDefined();

    // Without `solanaRPCUrls`, every cluster with a public RPC URL (the root fallback returns none)
    expect(getChainsListByConnectorType({ connectorType: 'solana:phantom' })).toEqual(['mainnet', 'devnet', 'testnet']);
    // Only the clusters of the wallet that have an RPC URL
    expect(
      getChainsListByConnectorType({
        connectorType: 'solana:phantom',
        solanaRPCUrls: { mainnet: 'https://rpc.example', devnet: 'https://devnet.example' },
        chains: ['solana:devnet'],
      }),
    ).toEqual(['devnet']);
    expect(isSolanaChainList([])).toBe(false);
    expect(isSolanaChainList(['mainnet'])).toBe(true);
  });
});
