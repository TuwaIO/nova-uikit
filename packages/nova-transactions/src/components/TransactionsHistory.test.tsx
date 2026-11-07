import { OrbitAdapter } from '@tuwaio/orbit-core';
import type { EvmTransaction, TxAdapter, TxInMemoryPagination } from '@tuwaio/pulsar-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';
import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return {
    ...(await importOriginal<typeof import('react')>()),
    ...hooks,
    // The sentinel of the list: the one ref of the component that starts empty
    useRef: (initial: unknown) => {
      const ref = hooks.useRef(initial) as { current: unknown };
      if (initial === null && ref.current === null) ref.current = {};
      return ref;
    },
  };
});

vi.mock('../providers', () => ({ useLabels: () => defaultLabels }));
vi.mock('./TransactionDetails', () => ({ TransactionDetails: () => null }));
vi.mock('./TransactionHistoryItem', () => ({ TransactionHistoryItem: () => null }));

import { TransactionsHistory } from './TransactionsHistory';

const WALLET = '0x1234567890123456789012345678901234567890';
const pool = {
  '0x1': { txKey: '0x1', adapter: OrbitAdapter.EVM, from: WALLET, localTimestamp: 1 } as unknown as EvmTransaction,
};

type Observer = { callback: IntersectionObserverCallback; disconnected: boolean };
let observers: Observer[] = [];

const showSentinel = (observer: Observer) =>
  observer.callback(
    [{ isIntersecting: true } as IntersectionObserverEntry],
    undefined as unknown as IntersectionObserver,
  );

const pagination = (fields: Partial<TxInMemoryPagination> = {}) =>
  ({
    hasMore: true,
    isLoading: false,
    isError: false,
    currentPage: 1,
    fetchNextPage: vi.fn().mockResolvedValue(undefined),
    ...fields,
  }) as unknown as TxInMemoryPagination;

const renderList = (page: TxInMemoryPagination) =>
  render(TransactionsHistory, {
    adapter: { key: OrbitAdapter.EVM } as unknown as TxAdapter<EvmTransaction>,
    transactionsPool: pool,
    connectedWalletAddress: WALLET,
    pagination: page,
  });

describe('the pages of TransactionsHistory', () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        private readonly self: Observer;
        constructor(callback: IntersectionObserverCallback) {
          this.self = { callback, disconnected: false };
          observers.push(this.self);
        }
        observe() {}
        disconnect() {
          this.self.disconnected = true;
        }
      },
    );
  });

  afterEach(() => {
    unmount();
    vi.unstubAllGlobals();
  });

  it('asks for the next page when the end of the list is in view', () => {
    const page = pagination();
    renderList(page);

    showSentinel(observers[0]);

    expect(page.fetchNextPage).toHaveBeenCalledWith(WALLET);
  });

  // A new observer reports the sentinel in view at once: a 5xx was asked again and again while the end of the list was on
  // screen, with a request per render
  it('builds no new observer when a page fails', () => {
    const fetchNextPage = vi.fn().mockResolvedValue(undefined);
    renderList(pagination({ fetchNextPage }));
    renderList(pagination({ fetchNextPage, isLoading: true }));
    renderList(pagination({ fetchNextPage, isError: true }));

    expect(observers).toHaveLength(1);
  });

  it('tries again when the end of the list enters the view again', () => {
    const fetchNextPage = vi.fn().mockResolvedValue(undefined);
    renderList(pagination({ fetchNextPage, isError: true }));

    showSentinel(observers[0]);

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('goes on with a new observer after a page has loaded', () => {
    const fetchNextPage = vi.fn().mockResolvedValue(undefined);
    renderList(pagination({ fetchNextPage }));
    renderList(pagination({ fetchNextPage, currentPage: 2 }));

    expect(observers).toHaveLength(2);
    expect(observers[0].disconnected).toBe(true);
  });

  it('asks nothing while a page is on its way', () => {
    const fetchNextPage = vi.fn().mockResolvedValue(undefined);
    renderList(pagination({ fetchNextPage, isLoading: true }));

    showSentinel(observers[0]);

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  // The screen reader text of a row is `absolute`: it escaped the list and stretched the wallet window, with a second scroll
  // and an empty band under its footer
  it('keeps what is positioned in the rows inside the list', () => {
    const tree = JSON.stringify(renderList(pagination()));

    expect(tree).toMatch(/NovaCustomScroll novatx:relative/);
  });
});
