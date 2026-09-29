import { OrbitAdapter } from '@tuwaio/orbit-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NovaConnectAppChains } from '../types';
import { getChainAdapter, registerChainAdapter } from './adapters/registry';
import {
  getChainsListByConnectorType,
  getWalletChains,
  isEvmChainList,
  isSolanaChainList,
} from './getChainsListByConnectorType';

const REGISTRY_SYMBOL = Symbol.for('tuwaio.nova-connect.chainAdapters');

// Chains with only an id (viem chains when `/evm` is imported)
const chainsWithIds = (...ids: number[]) => ids.map((id) => ({ id })) as unknown as NovaConnectAppChains;

describe('getChainsListByConnectorType', () => {
  beforeEach(() => {
    delete (globalThis as Record<symbol, unknown>)[REGISTRY_SYMBOL];
  });

  it('reads the chain configuration itself when no network entry point is imported', () => {
    expect(getChainsListByConnectorType({ connectorType: 'evm:metamask', appChains: chainsWithIds(1, 137) })).toEqual([
      1, 137,
    ]);
    expect(
      getChainsListByConnectorType({
        connectorType: 'solana:phantom',
        solanaRPCUrls: { devnet: 'https://devnet.example' },
        chains: ['solana:mainnet'],
      }),
    ).toEqual(['devnet']);
    expect(getChainsListByConnectorType({ connectorType: 'solana:phantom' })).toEqual([]);
    expect(isEvmChainList([1])).toBe(true);
    expect(isEvmChainList([])).toBe(false);
    expect(isSolanaChainList(['devnet'])).toBe(true);
  });

  it('uses the registered chain helpers of the network, and falls back when they throw', () => {
    const getChains = vi.fn(() => ['devnet']);
    registerChainAdapter(OrbitAdapter.SOLANA, { getChains, isChainList: () => true });

    const params = { solanaRPCUrls: { devnet: 'https://devnet.example' }, chains: ['solana:devnet'] };
    expect(getChainsListByConnectorType({ connectorType: 'solana:phantom', ...params })).toEqual(['devnet']);
    expect(getChains).toHaveBeenCalledWith({ solanaRPCUrls: params.solanaRPCUrls }, params.chains);
    expect(isSolanaChainList([])).toBe(true);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerChainAdapter(OrbitAdapter.EVM, {
      getChains: () => {
        throw new Error('broken');
      },
      isChainList: () => false,
    });
    expect(getChainsListByConnectorType({ connectorType: 'evm:metamask', appChains: chainsWithIds(10) })).toEqual([10]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('shares the registry between copies of the module (separate entry point bundles)', async () => {
    const adapter = { getChains: () => [1], isChainList: () => true };
    registerChainAdapter(OrbitAdapter.EVM, adapter);

    vi.resetModules();
    const copy = await import('./adapters/registry');
    expect(copy.getChainAdapter).not.toBe(getChainAdapter);
    expect(copy.getChainAdapter(OrbitAdapter.EVM)).toBe(adapter);
  });
});

describe('getWalletChains', () => {
  it('reads the chains of the Wallet Standard wallet of a connection', () => {
    expect(getWalletChains({ connectedWallet: { chains: ['solana:mainnet', 1, null] } })).toEqual([
      'solana:mainnet',
      1,
    ]);
    expect(getWalletChains({ connectedWallet: {} })).toBeUndefined();
    expect(getWalletChains(undefined)).toBeUndefined();
  });
});
