import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

// The last snapshot functions given to `useSyncExternalStore`, to call them the way React does outside a render
const { captured } = vi.hoisted(() => ({
  captured: {} as { getSnapshot?: () => unknown; getServerSnapshot?: () => unknown },
}));

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return {
    ...(await importOriginal<typeof import('react')>()),
    ...hooks,
    useSyncExternalStore: (
      subscribe: (onStoreChange: () => void) => () => void,
      getSnapshot: () => unknown,
      getServerSnapshot?: () => unknown,
    ) => {
      captured.getSnapshot = getSnapshot;
      captured.getServerSnapshot = getServerSnapshot;
      return hooks.useSyncExternalStore(subscribe, getSnapshot);
    },
  };
});

let storeState: Record<string, unknown> = {};

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState),
}));

import { useWalletConnectors, type UseWalletConnectorsParams } from './useWalletConnectors';

type Wallet = { name: string };
type Record_ = Partial<Record<'evm' | 'solana', Wallet[]>> | undefined;

const metaMask = { name: 'MetaMask' };
const rabby = { name: 'Rabby' };
const phantom = { name: 'Phantom' };

// The wallets of a store: the adapters return the same wallet objects in new arrays on every call, as wagmi and the
// Wallet Standard registry do
let wallets: { evm: Wallet[]; solana: Wallet[] };
const listeners = new Set<() => void>();
const getConnectors = vi.fn(() => ({ evm: [...wallets.evm], solana: [...wallets.solana] }));
const watchConnectors = vi.fn((onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
});
const notify = () => listeners.forEach((onChange) => onChange());

const renderHook = (params?: UseWalletConnectorsParams) =>
  render((props: UseWalletConnectorsParams | undefined) => useWalletConnectors(props), params) as Record_;

const names = (connectors: Record_) => ({
  evm: connectors?.evm?.map((wallet) => wallet.name),
  solana: connectors?.solana?.map((wallet) => wallet.name),
});

describe('useWalletConnectors', () => {
  beforeEach(() => {
    wallets = { evm: [], solana: [phantom] };
    listeners.clear();
    getConnectors.mockClear();
    watchConnectors.mockClear();
    captured.getSnapshot = undefined;
    captured.getServerSnapshot = undefined;
    storeState = { getConnectors, watchConnectors };
  });
  afterEach(() => unmount());

  it('reads and follows nothing while disabled', () => {
    expect(renderHook({ enabled: false })).toBeUndefined();
    expect(renderHook({ enabled: false })).toBeUndefined();

    expect(getConnectors).not.toHaveBeenCalled();
    expect(watchConnectors).not.toHaveBeenCalled();
  });

  it('subscribes once and returns the same record while the wallets stay the same', () => {
    const first = renderHook();
    const second = renderHook();
    const third = renderHook();

    expect(names(first)).toEqual({ evm: [], solana: ['Phantom'] });
    expect(second).toBe(first);
    expect(third).toBe(first);
    expect(watchConnectors).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(1);
  });

  it('shows a wallet added after the list was read, once the store reports the change', () => {
    // The modal opened with the Solana wallets only, before wagmi added the installed EVM wallets
    const before = renderHook();
    expect(names(before).evm).toEqual([]);

    wallets.evm = [metaMask, rabby];
    notify();
    const after = renderHook();

    expect(after).not.toBe(before);
    expect(names(after)).toEqual({ evm: ['MetaMask', 'Rabby'], solana: ['Phantom'] });
    expect(renderHook()).toBe(after);
  });

  it('keeps the record when the store reports a change but the wallets are the same objects', () => {
    wallets.evm = [metaMask];
    const before = renderHook();

    // wagmi's `hydrate` sets a new connectors array even when it adds nothing
    notify();

    expect(renderHook()).toBe(before);
  });

  it('returns a new record when a wallet object is replaced under the same name', () => {
    wallets.evm = [metaMask];
    const before = renderHook();

    // For example a Wallet Standard wallet whose accounts changed, or the connectors of a new wagmi config
    wallets.evm = [{ name: 'MetaMask' }];
    notify();
    const after = renderHook();

    expect(after).not.toBe(before);
    expect(after?.evm?.[0]).toBe(wallets.evm[0]);
  });

  it('unsubscribes when disabled and when unmounted', () => {
    renderHook();
    expect(listeners.size).toBe(1);

    expect(renderHook({ enabled: false })).toBeUndefined();
    expect(listeners.size).toBe(0);

    // Opened again: the list is read again
    wallets.evm = [metaMask];
    expect(names(renderHook({ enabled: true })).evm).toEqual(['MetaMask']);
    expect(listeners.size).toBe(1);

    unmount();
    expect(listeners.size).toBe(0);
  });

  it('shows a wallet at the next render when watchConnectors does not report the change of an adapter', () => {
    // A newer `@tuwaio/satellite-core` with an adapter that has no `watchConnectors` (an older
    // `@tuwaio/satellite-solana`, a custom adapter): the store has `watchConnectors`, but it never hears of this wallet
    const before = renderHook();
    expect(names(before).evm).toEqual([]);
    // Rendered again after the subscription, as the open modal is
    expect(renderHook()).toBe(before);

    wallets.evm = [metaMask];
    const after = renderHook();

    expect(after).not.toBe(before);
    expect(names(after)).toEqual({ evm: ['MetaMask'], solana: ['Phantom'] });
    expect(renderHook()).toBe(after);
    expect(watchConnectors).toHaveBeenCalledTimes(1);
  });

  it('reads the list on every render with a store that has no watchConnectors', () => {
    storeState = { getConnectors };

    const before = renderHook();
    expect(names(before).evm).toEqual([]);
    expect(renderHook()).toBe(before);

    wallets.evm = [metaMask];
    expect(names(renderHook()).evm).toEqual(['MetaMask']);
  });

  it.each([
    ['with', true],
    ['without', false],
  ])('never loops %s watchConnectors: the snapshot stays the same object between renders', (_, watches) => {
    // An adapter that returns new wallet objects on every call
    const unstable = vi.fn(() => ({ evm: [{ name: 'MetaMask' }] }));
    storeState = watches ? { getConnectors: unstable, watchConnectors } : { getConnectors: unstable };

    const rendered = renderHook();
    const reads = unstable.mock.calls.length;

    // React reads the snapshot again after the render and after subscribing: it must not see a change each time
    const again = captured.getSnapshot?.();
    expect(captured.getSnapshot?.()).toBe(again);
    expect(captured.getSnapshot?.()).toBe(again);
    // Without watchConnectors nothing can change between renders; with it, one read after subscribing at most
    expect(again === rendered).toBe(!watches || unstable.mock.calls.length === reads);
    expect(unstable.mock.calls.length).toBeLessThanOrEqual(reads + 1);
  });

  it('reads nothing on the server', () => {
    renderHook();
    getConnectors.mockClear();

    expect(captured.getServerSnapshot?.()).toBeUndefined();
    expect(getConnectors).not.toHaveBeenCalled();
  });
});
