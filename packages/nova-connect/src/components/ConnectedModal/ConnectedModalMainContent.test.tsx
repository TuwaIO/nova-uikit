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

// The wallets of the store, and the listeners its `watchConnectors` received
const wallets: { evm: { name: string }[]; solana: { name: string }[] } = { evm: [], solana: [] };
const listeners = new Set<() => void>();
const storeState = {
  activeConnection: { address, connectorType: 'evm:metamask', chainId: 1, isConnected: true },
  getConnectors: () => ({ evm: [...wallets.evm], solana: [...wallets.solana] }),
  watchConnectors: (onChange: () => void) => {
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  },
};

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState),
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

type Element = { props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const connectorsCount = (tree: unknown) =>
  elements(tree).find((element) => 'connectorsCount' in element.props)?.props.connectorsCount;

describe('ConnectedModalMainContent', () => {
  afterEach(() => {
    unmount();
    wallets.evm = [];
    wallets.solana = [];
  });

  it('counts the wallets added after the modal opened, and stops following them when it closes', () => {
    wallets.solana = [{ name: 'Phantom' }];
    expect(connectorsCount(renderMainContent({}))).toBe(1);
    expect(listeners.size).toBe(1);

    // wagmi adds the installed EIP-6963 wallets once the config is hydrated
    wallets.evm = [{ name: 'MetaMask' }, { name: 'Rabby' }];
    listeners.forEach((onChange) => onChange());
    expect(connectorsCount(renderMainContent({}))).toBe(3);

    unmount();
    expect(listeners.size).toBe(0);
  });

  // The icon stood outside the button with nothing saying what it meant, and in it the button would look busy
  it('says under the button how many transactions are open, and nothing when none is', () => {
    const open = { txKey: '0x1', from: address, pending: true } as unknown as Transaction;
    const done = { txKey: '0x2', from: address, pending: false } as unknown as Transaction;

    const section = (pool: Record<string, Transaction>) => {
      type Node = { type?: unknown; props?: { children?: unknown; hasPendingTransactions?: boolean } };
      const find = (node: unknown): Node | undefined => {
        if (Array.isArray(node)) return node.map(find).find(Boolean);
        const element = node as Node | null;
        if (element?.props?.hasPendingTransactions !== undefined) return element;
        return element?.props ? find(element.props.children) : undefined;
      };
      const found = find(renderMainContent({ transactionPool: pool }));
      return JSON.stringify((found!.type as (props: unknown) => unknown)(found!.props));
    };

    const withOpen = section({ '0x1': open, '0x2': done });
    expect(withOpen).toContain('pending-transactions-indicator');
    expect(withOpen).toContain('Transactions pending: 1');

    const withNone = section({ '0x2': done });
    expect(withNone).not.toContain('pending-transactions-indicator');
    expect(withNone).toContain('view-transactions-button');
  });

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
