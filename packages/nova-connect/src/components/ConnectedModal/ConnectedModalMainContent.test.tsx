import { Transaction } from '@tuwaio/pulsar-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const address = '0x1234567890123456789012345678901234567890';

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => defaultLabels,
  useNovaConnect: () => ({
    setConnectedModalContentType: vi.fn(),
    setIsConnectedModalOpen: vi.fn(),
    setIsConnectModalOpen: vi.fn(),
  }),
}));

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      activeConnection: { address, connectorType: 'evm:metamask', chainId: 1, isConnected: true },
      getConnectors: () => ({}),
    }),
}));

import { ConnectedModalMainContent, type ConnectedModalMainContentProps } from './ConnectedModalMainContent';

const renderMainContent = (props: Partial<ConnectedModalMainContentProps>) =>
  render((ConnectedModalMainContent as unknown as { render: (p: ConnectedModalMainContentProps) => unknown }).render, {
    chainsList: [],
    avatarIsLoading: false,
    balanceLoading: false,
    refetch: vi.fn(),
    ...props,
  } as ConnectedModalMainContentProps);

describe('ConnectedModalMainContent', () => {
  afterEach(() => unmount());

  it('calls onTransactionsUpdate when the transactions change, not after every render', () => {
    const tx = { txKey: '0x1', from: address, pending: true } as unknown as Transaction;
    const pool = { '0x1': tx };
    const onTransactionsUpdate = vi.fn();
    const onLoadingStateChange = vi.fn();
    const renderWithNewHandlers = (transactionPool: Record<string, Transaction>) =>
      renderMainContent({
        transactionPool,
        customization: {
          config: { disableAnimation: true },
          handlers: {
            onTransactionsUpdate: (transactions, count) => onTransactionsUpdate(transactions, count),
            onLoadingStateChange: (loading) => onLoadingStateChange(loading),
          },
        },
      });

    renderWithNewHandlers(pool);
    renderWithNewHandlers(pool);
    renderWithNewHandlers(pool);
    expect(onTransactionsUpdate).toHaveBeenCalledTimes(1);
    expect(onTransactionsUpdate).toHaveBeenCalledWith([tx], 1);
    expect(onLoadingStateChange).toHaveBeenCalledTimes(1);

    const doneTx = { ...tx, pending: false } as Transaction;
    renderWithNewHandlers({ '0x1': doneTx });
    expect(onTransactionsUpdate).toHaveBeenCalledTimes(2);
    expect(onTransactionsUpdate).toHaveBeenLastCalledWith([doneTx], 0);
  });
});
