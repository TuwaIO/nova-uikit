import { OrbitAdapter } from '@tuwaio/orbit-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const { refetch, useWalletNativeBalance } = vi.hoisted(() => {
  const refetchMock = vi.fn();
  return {
    refetch: refetchMock,
    useWalletNativeBalance: vi.fn(() => ({ balance: { value: '1.5', symbol: 'ETH' }, refetch: refetchMock })),
  };
});

vi.mock('../../hooks', () => ({
  useNovaConnect: () => ({
    isConnectedModalOpen: false,
    setConnectedButtonStatus: vi.fn(),
    connectedButtonStatus: 'idle',
  }),
  useGetWalletNameAndAvatar: () => ({ ensAvatar: null, ensNameAbbreviated: '0x1…0001' }),
  useWalletNativeBalance,
  useNovaConnectLabels: () => ({ walletAddress: 'Wallet address', walletBalance: 'Balance' }),
}));

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection: { address: '0xabc', isConnected: true, connectorType: 'evm:metamask', chainId: 1 } }),
}));

import { ConnectedContent } from './ConnectedContent';

const renderButton = (props: Record<string, unknown>) =>
  render((ConnectedContent as unknown as { render: (p: unknown, ref?: null) => unknown }).render, props);

const pool = (status?: string) => ({
  '0x1': { txKey: '0x1', adapter: OrbitAdapter.EVM, from: '0xABC', pending: !status, status },
});

describe('the balance on the connect button', () => {
  afterEach(() => {
    unmount();
    vi.clearAllMocks();
  });

  // A wallet holding 1.5 ETH paid 1 ETH: the button showed the result and went back to `1.500`
  it.each(['Success', 'Failed'])('is read again when a transaction of the wallet ends as %s', (status) => {
    renderButton({ transactionPool: pool(), withBalance: true });
    expect(refetch).not.toHaveBeenCalled();

    renderButton({ transactionPool: pool(status), withBalance: true });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('is not read again while a transaction stays pending', () => {
    renderButton({ transactionPool: pool(), withBalance: true });
    renderButton({ transactionPool: pool(), withBalance: true });

    expect(refetch).not.toHaveBeenCalled();
  });

  // An app without `withBalance` paid for a balance nothing showed
  it('is asked for only with `withBalance`', () => {
    renderButton({ transactionPool: {} });
    expect(useWalletNativeBalance).toHaveBeenLastCalledWith({ enabled: false });

    unmount();
    renderButton({ transactionPool: {}, withBalance: true });
    expect(useWalletNativeBalance).toHaveBeenLastCalledWith({ enabled: true });
  });
});
