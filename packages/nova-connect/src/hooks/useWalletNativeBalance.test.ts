import { OrbitAdapter } from '@tuwaio/orbit-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface MockConnection {
  address: string;
  chainId: string | number;
  connectorType: string;
}

let mockStoreState = {
  activeConnection: null as MockConnection | null,
  getAdapter: vi.fn(),
};

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: vi.fn((selector: (state: typeof mockStoreState) => unknown) => selector(mockStoreState)),
}));

vi.mock('@tuwaio/orbit-core', () => ({
  getAdapterFromConnectorType: vi.fn((type: string) => {
    if (type.includes('solana') || type.includes('phantom')) return OrbitAdapter.SOLANA;
    return OrbitAdapter.EVM;
  }),
  OrbitAdapter: {
    EVM: 'evm',
    SOLANA: 'solana',
  },
}));

// Stateful React mock to simulate useState, useEffect, useCallback, useRef
let stateMap: Record<number, unknown> = {};
let stateIndex = 0;
const effectCleanupCallbacks: (() => void)[] = [];

vi.mock('react', () => ({
  useState: vi.fn((initial: unknown) => {
    const idx = stateIndex++;
    if (!(idx in stateMap)) {
      stateMap[idx] = typeof initial === 'function' ? (initial as () => unknown)() : initial;
    }
    const setter = (val: unknown) => {
      stateMap[idx] = typeof val === 'function' ? (val as (prev: unknown) => unknown)(stateMap[idx]) : val;
    };
    return [stateMap[idx], setter];
  }),
  useCallback: vi.fn((fn: unknown) => fn),
  useRef: vi.fn((initial: unknown) => ({ current: initial })),
  useEffect: vi.fn((effect: () => void | (() => void)) => {
    const cleanup = effect();
    if (typeof cleanup === 'function') {
      effectCleanupCallbacks.push(cleanup);
    }
  }),
}));

import { useWalletNativeBalance } from './useWalletNativeBalance';

describe('useWalletNativeBalance', () => {
  beforeEach(() => {
    stateMap = {};
    stateIndex = 0;
    vi.clearAllMocks();
  });

  it('returns null balance and false loading when there is no active connection', () => {
    mockStoreState = {
      activeConnection: null,
      getAdapter: vi.fn().mockReturnValue(undefined),
    };

    const result = useWalletNativeBalance();
    expect(result.balance).toBeNull();
    expect(result.isLoading).toBe(false);
    expect(typeof result.refetch).toBe('function');
  });

  it('returns null when adapter does not have getBalance function', () => {
    mockStoreState = {
      activeConnection: {
        address: 'AiNJoXtwr2p3',
        chainId: 'solana:mainnet',
        connectorType: 'phantom',
      },
      getAdapter: vi.fn().mockReturnValue({}), // no getBalance
    };

    const result = useWalletNativeBalance();
    expect(result.balance).toBeNull();
    expect(result.isLoading).toBe(false);
  });

  it('successfully fetches and caches Solana native balance', async () => {
    const mockAdapter = {
      getBalance: vi.fn().mockResolvedValue({
        value: '2.5',
        symbol: 'SOL',
      }),
    };

    mockStoreState = {
      activeConnection: {
        address: 'AiNJoXtwr2p3',
        chainId: 'solana:mainnet',
        connectorType: 'phantom',
      },
      getAdapter: vi.fn().mockReturnValue(mockAdapter),
    };

    useWalletNativeBalance();
    expect(mockAdapter.getBalance).toHaveBeenCalledWith('AiNJoXtwr2p3', 'solana:mainnet');

    // Wait for promise resolution in mock state
    await Promise.resolve();
    await Promise.resolve();

    // Re-render hook with updated cache
    stateIndex = 0;
    const updated = useWalletNativeBalance();
    expect(updated.balance).toEqual({
      value: '2.5',
      symbol: 'SOL',
    });
  });

  it('successfully fetches and caches EVM native balance', async () => {
    const mockAdapter = {
      getBalance: vi.fn().mockResolvedValue({
        value: '1.25',
        symbol: 'ETH',
      }),
    };

    mockStoreState = {
      activeConnection: {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        connectorType: 'metamask',
      },
      getAdapter: vi.fn().mockReturnValue(mockAdapter),
    };

    useWalletNativeBalance();
    expect(mockAdapter.getBalance).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890', 1);

    await Promise.resolve();
    await Promise.resolve();

    stateIndex = 0;
    const updated = useWalletNativeBalance();
    expect(updated.balance).toEqual({
      value: '1.25',
      symbol: 'ETH',
    });
  });

  it('handles getBalance error gracefully without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockAdapter = {
      getBalance: vi.fn().mockRejectedValue(new Error('RPC network timeout')),
    };

    mockStoreState = {
      activeConnection: {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        connectorType: 'metamask',
      },
      getAdapter: vi.fn().mockReturnValue(mockAdapter),
    };

    const result = useWalletNativeBalance();
    expect(result.balance).toBeNull();

    await Promise.resolve();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('forces balance refresh when refetch is called', async () => {
    const mockAdapter = {
      getBalance: vi
        .fn()
        .mockResolvedValueOnce({ value: '1.0', symbol: 'SOL' })
        .mockResolvedValueOnce({ value: '2.0', symbol: 'SOL' }),
    };

    mockStoreState = {
      activeConnection: {
        address: 'AiNJoXtwr2p3',
        chainId: 'solana:mainnet',
        connectorType: 'phantom',
      },
      getAdapter: vi.fn().mockReturnValue(mockAdapter),
    };

    const result = useWalletNativeBalance();
    expect(mockAdapter.getBalance).toHaveBeenCalledTimes(1);

    await Promise.resolve();
    await Promise.resolve();

    stateIndex = 0;
    result.refetch();
    expect(mockAdapter.getBalance).toHaveBeenCalledTimes(2);
  });
});
