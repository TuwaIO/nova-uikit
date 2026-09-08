import { OrbitAdapter } from '@tuwaio/orbit-core';
import { describe, expect, it } from 'vitest';

import { Connector } from '../satellite';
import { getGroupedConnectors, hasAvailableConnectors } from './getGroupedConnectors';

describe('getGroupedConnectors & hasAvailableConnectors', () => {
  const metamaskEvm = {
    id: 'metaMask',
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,123',
  } as unknown as Connector;

  const phantomSolana = {
    id: 'phantom',
    name: 'Phantom',
    icon: 'phantom.svg',
  } as unknown as Connector;

  const phantomEvm = {
    id: 'phantom-evm',
    name: 'Phantom',
    icon: 'phantom.svg',
  } as unknown as Connector;

  const injected = {
    id: 'injected',
    name: 'Injected',
  } as unknown as Connector;

  it('groups multi-chain wallets supporting both EVM and Solana under the same entry', () => {
    const connectors = {
      [OrbitAdapter.EVM]: [metamaskEvm, phantomEvm],
      [OrbitAdapter.SOLANA]: [phantomSolana],
    };

    const grouped = getGroupedConnectors({ connectors });
    expect(grouped.length).toBe(2);

    const phantomGroup = grouped.find((g) => g.name === 'Phantom');
    expect(phantomGroup).toBeDefined();
    expect(phantomGroup?.adapters).toContain(OrbitAdapter.EVM);
    expect(phantomGroup?.adapters).toContain(OrbitAdapter.SOLANA);
    expect(phantomGroup?.connectors.length).toBe(2);
  });

  it('excludes injected connector by default', () => {
    const connectors = {
      [OrbitAdapter.EVM]: [injected, metamaskEvm],
    };

    const grouped = getGroupedConnectors({ connectors });
    expect(grouped.length).toBe(1);
    expect(grouped[0].name).toBe('MetaMask');
  });

  it('sorts grouped connectors alphabetically by name', () => {
    const connectors = {
      [OrbitAdapter.EVM]: [phantomEvm, metamaskEvm],
    };

    const grouped = getGroupedConnectors({ connectors });
    expect(grouped.map((g) => g.name)).toEqual(['MetaMask', 'Phantom']);
  });

  it('hasAvailableConnectors correctly returns boolean', () => {
    expect(hasAvailableConnectors({})).toBe(false);
    expect(
      hasAvailableConnectors({
        [OrbitAdapter.EVM]: [metamaskEvm],
      }),
    ).toBe(true);
  });
});
