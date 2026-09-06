import { OrbitAdapter } from '@tuwaio/orbit-core';
import { describe, expect, it } from 'vitest';

import { Connector } from '../satellite';
import { getFilteredConnectors, hasConnectorsForAdapter } from './getFilteredConnectors';

describe('getFilteredConnectors & hasConnectorsForAdapter', () => {
  const mockEvmConnector = {
    id: 'metaMask',
    name: 'MetaMask',
    icon: 'metamask-icon',
  } as unknown as Connector;

  const mockSolanaConnector = {
    id: 'phantom',
    name: 'Phantom',
    icon: 'phantom-icon',
  } as unknown as Connector;

  it('returns empty array when connectors object is empty', () => {
    expect(getFilteredConnectors({ connectors: {} })).toEqual([]);
  });

  it('returns all grouped connectors if no selectedAdapter is provided', () => {
    const connectors = {
      [OrbitAdapter.EVM]: [mockEvmConnector],
      [OrbitAdapter.SOLANA]: [mockSolanaConnector],
    };

    const result = getFilteredConnectors({ connectors });
    expect(result.length).toBe(2);
    expect(result.map((g) => g.name)).toEqual(['MetaMask', 'Phantom']);
  });

  it('filters connectors by selected EVM adapter', () => {
    const connectors = {
      [OrbitAdapter.EVM]: [mockEvmConnector],
      [OrbitAdapter.SOLANA]: [mockSolanaConnector],
    };

    const result = getFilteredConnectors({
      connectors,
      selectedAdapter: OrbitAdapter.EVM,
    });

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('MetaMask');
    expect(result[0].adapters).toEqual([OrbitAdapter.EVM]);
  });

  it('filters connectors by selected Solana adapter', () => {
    const connectors = {
      [OrbitAdapter.EVM]: [mockEvmConnector],
      [OrbitAdapter.SOLANA]: [mockSolanaConnector],
    };

    const result = getFilteredConnectors({
      connectors,
      selectedAdapter: OrbitAdapter.SOLANA,
    });

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Phantom');
    expect(result[0].adapters).toEqual([OrbitAdapter.SOLANA]);
  });

  it('hasConnectorsForAdapter accurately checks existence', () => {
    const connectors = {
      [OrbitAdapter.EVM]: [mockEvmConnector],
    };

    expect(hasConnectorsForAdapter(connectors, OrbitAdapter.EVM)).toBe(true);
    expect(hasConnectorsForAdapter(connectors, OrbitAdapter.SOLANA)).toBe(false);
  });
});
