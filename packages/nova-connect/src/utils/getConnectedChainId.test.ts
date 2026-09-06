import { OrbitAdapter } from '@tuwaio/orbit-core';
import { describe, expect, it } from 'vitest';

import { getAvailableChainIds, getConnectChainId } from './getConnectedChainId';

describe('getConnectChainId & getAvailableChainIds', () => {
  describe('getConnectChainId', () => {
    it('returns first EVM chain id if configured', () => {
      const result = getConnectChainId({
        selectedAdapter: OrbitAdapter.EVM,
        appChains: [
          { id: 10, name: 'Optimism' },
          { id: 1, name: 'Ethereum' },
        ] as unknown as Parameters<typeof getConnectChainId>[0]['appChains'],
      });
      expect(result).toBe(10);
    });

    it('falls back to EVM default 1 if appChains is empty', () => {
      const result = getConnectChainId({
        selectedAdapter: OrbitAdapter.EVM,
        appChains: [],
      });
      expect(result).toBe(1);
    });

    it('returns first Solana network moniker if solanaRPCUrls provided', () => {
      const result = getConnectChainId({
        selectedAdapter: OrbitAdapter.SOLANA,
        solanaRPCUrls: {
          devnet: 'https://api.devnet.solana.com',
          mainnet: 'https://api.mainnet-beta.solana.com',
        },
      });
      expect(result).toBe('devnet');
    });

    it('falls back to Solana default "mainnet" if no RPC URLs configured', () => {
      const result = getConnectChainId({
        selectedAdapter: OrbitAdapter.SOLANA,
      });
      expect(result).toBe('mainnet');
    });

    it('returns default Starknet chain id for Starknet adapter', () => {
      const result = getConnectChainId({
        selectedAdapter: OrbitAdapter.Starknet,
      });
      expect(result).toBe('0x534e5f4d41494e');
    });
  });

  describe('getAvailableChainIds', () => {
    it('returns all EVM chain IDs or default [1]', () => {
      const available = getAvailableChainIds({
        selectedAdapter: OrbitAdapter.EVM,
        appChains: [{ id: 1 }, { id: 137 }] as unknown as Parameters<typeof getAvailableChainIds>[0]['appChains'],
      });
      expect(available).toEqual([1, 137]);
    });

    it('returns default [1] when appChains is empty', () => {
      const available = getAvailableChainIds({
        selectedAdapter: OrbitAdapter.EVM,
        appChains: [],
      });
      expect(available).toEqual([1]);
    });

    it('returns all Solana networks or default ["mainnet"]', () => {
      const available = getAvailableChainIds({
        selectedAdapter: OrbitAdapter.SOLANA,
        solanaRPCUrls: {
          devnet: 'https://...',
          testnet: 'https://...',
        },
      });
      expect(available).toEqual(['devnet', 'testnet']);
    });
  });
});
