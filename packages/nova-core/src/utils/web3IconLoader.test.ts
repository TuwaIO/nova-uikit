import { networks } from '@web3icons/common/metadata/networks';
import { wallets } from '@web3icons/common/metadata/wallets';
import dynamicIconImports from '@web3icons/react/dynamicIconImports';
import { describe, expect, it } from 'vitest';

import { getWeb3IconKey, loadWeb3Icon } from '../utils/web3IconLoader';

describe('getWeb3IconKey', () => {
  it('builds the component name of @web3icons/react from a metadata file path', () => {
    expect(getWeb3IconKey('network:ethereum')).toBe('NetworkEthereum');
    expect(getWeb3IconKey('network:arbitrum-one')).toBe('NetworkArbitrumOne');
    expect(getWeb3IconKey('wallet:wallet-connect')).toBe('WalletWalletConnect');
    expect(getWeb3IconKey('token:SHIB')).toBe('TokenSHIB');
  });

  it('finds an icon for every network and wallet listed in @web3icons/common', () => {
    const missing = [...networks, ...wallets]
      .map((item) => item.filePath)
      .filter((filePath): filePath is string => !!filePath)
      .filter((filePath) => !(getWeb3IconKey(filePath) in dynamicIconImports));

    expect(missing).toEqual([]);
  });
});

describe('loadWeb3Icon', () => {
  it('loads an icon component once and reuses it', async () => {
    const first = loadWeb3Icon('network:ethereum');

    expect(loadWeb3Icon('network:ethereum')).toBe(first);
    expect(await first).toBeTruthy();
  });

  it('resolves to null for a file path without an icon', async () => {
    expect(await loadWeb3Icon('network:not-a-network')).toBeNull();
  });
});
