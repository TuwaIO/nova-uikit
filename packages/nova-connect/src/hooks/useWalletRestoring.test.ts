import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, renderOnServer, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const store = vi.hoisted(() => ({ isAutoConnectFinished: false }));
const stored = vi.hoisted(() => ({ last: undefined as unknown }));

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: typeof store) => unknown) => selector(store),
}));
vi.mock('@tuwaio/orbit-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/orbit-core')>()),
  lastConnectedConnectorHelpers: { getLastConnectedConnector: () => stored.last },
}));

import { useWalletRestoring, WALLET_RESTORE_WAIT_MS } from './useWalletRestoring';

const Probe = (props: { isConnected: boolean }) => useWalletRestoring(props.isConnected);
const restoring = (isConnected = false) => render(Probe, { isConnected }) as boolean;

// The owner's pass of the Quasar stand: after a reload the connect button said "Connect Wallet" while Satellite
// restored the last wallet (300 ms and its `reconnect`), then the connected wallet replaced it: a flash of the wrong state
describe('useWalletRestoring', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    store.isAutoConnectFinished = false;
    stored.last = undefined;
  });
  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  it('is neutral on the server and while hydrating, then waits only for a stored wallet', () => {
    stored.last = { connectorType: 'evm:metamask', chainId: 1 };
    // The server has no storage of the browser, and the hydration renders what the server did
    expect(renderOnServer(Probe, { isConnected: false })).toBe(true);
    unmount();
    expect(restoring()).toBe(true);
    expect(restoring()).toBe(true);
    store.isAutoConnectFinished = true;
    expect(restoring()).toBe(false);
  });

  it('says "connect" in the browser when no wallet is stored', () => {
    expect(renderOnServer(Probe, { isConnected: false })).toBe(true);
    unmount();
    expect(restoring()).toBe(false);
  });

  it('never waits longer than its limit: an app that restores nothing is not stuck', () => {
    stored.last = { connectorType: 'evm:metamask', chainId: 1 };
    restoring();
    vi.advanceTimersByTime(WALLET_RESTORE_WAIT_MS);
    expect(restoring()).toBe(false);
  });

  it('is never restoring a wallet that is connected', () => {
    stored.last = { connectorType: 'evm:metamask', chainId: 1 };
    expect(restoring(true)).toBe(false);
  });
});
