import { networks } from '@web3icons/common/metadata/networks';
import { wallets } from '@web3icons/common/metadata/wallets';
import dynamicIconImports from '@web3icons/react/dynamicIconImports';
import { describe, expect, it } from 'vitest';

import { getWeb3IconKey, loadWeb3Icon } from '../utils/web3IconLoader';
import { web3IconImports } from './web3IconImports';

// The keys of the icons that NetworkIcon and WalletIcon can render: those named by the network and wallet metadata
const metadataKeys = [
  ...new Set(
    [...networks, ...wallets]
      .map((item) => item.filePath)
      .filter((filePath): filePath is string => !!filePath)
      .map(getWeb3IconKey),
  ),
];

describe('web3IconImports', () => {
  it('lists exactly the icons of @web3icons/react that the network and wallet metadata name', () => {
    // After an update of @web3icons/react or @web3icons/common, run `pnpm generate:web3-icons` in packages/nova-core
    expect(Object.keys(web3IconImports).sort()).toEqual(metadataKeys.filter((key) => key in dynamicIconImports).sort());
  });

  it('leaves out the other token and exchange icons', () => {
    expect(Object.keys(web3IconImports).length).toBeLessThan(Object.keys(dynamicIconImports).length / 5);
  });

  it('loads an icon component for every entry', async () => {
    const icons = await Promise.all(Object.values(web3IconImports).map((importIcon) => importIcon()));

    expect(icons.filter((icon) => !icon.default)).toEqual([]);
  });
});

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
      .filter((filePath) => !(getWeb3IconKey(filePath) in web3IconImports));

    expect(missing).toEqual([]);
  });
});

describe('loadWeb3Icon', () => {
  it('loads an icon component once and reuses it', async () => {
    const first = loadWeb3Icon('network:ethereum');

    expect(loadWeb3Icon('network:ethereum')).toBe(first);
    expect(await first).toBeTruthy();
  });

  it('loads wallet icons', async () => {
    expect(await loadWeb3Icon('wallet:metamask')).toBeTruthy();
  });

  it('resolves to null for a file path without an icon', async () => {
    expect(await loadWeb3Icon('network:not-a-network')).toBeNull();
  });

  it('resolves to null for token icons, which are not in the map', async () => {
    expect(await loadWeb3Icon('token:USDC')).toBeNull();
  });
});
