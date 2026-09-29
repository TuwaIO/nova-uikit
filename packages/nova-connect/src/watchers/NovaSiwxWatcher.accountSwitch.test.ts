import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

type Connection = {
  connectorType: string;
  address: string;
  chainId: number;
  isConnected: boolean;
  signMessage: () => void;
};

const connection = (address: string): Connection => ({
  connectorType: 'evm:metamask',
  address,
  chainId: 1,
  isConnected: true,
  signMessage: vi.fn(),
});

let activeConnection: Connection;
const disconnect = vi.fn();
const reset = vi.fn();
let rejectSignIn: (error: Error) => void;
const signIn = vi.fn(
  () =>
    new Promise((_, reject) => {
      rejectSignIn = reject;
    }),
);

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, disconnect, isAutoConnectFinished: true }),
}));

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({ signIn }),
  useSiwxSessionStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ session: null, status: 'idle', reset }),
  getSatelliteSiwxFields: (minimalConnection: { address: string }) => ({
    address: `eip155:1:${minimalConnection.address}`,
  }),
}));

import { NovaSiwxWatcher, type NovaSiwxWatcherProps } from './NovaSiwxWatcher';

const props: NovaSiwxWatcherProps = { verifier: vi.fn() };
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('NovaSiwxWatcher: a failed sign-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  it('disconnects the wallet that was asked to sign in', async () => {
    activeConnection = connection('0xaaaa');
    render(NovaSiwxWatcher, props);
    expect(signIn).toHaveBeenCalledTimes(1);

    rejectSignIn(new Error('User rejected'));
    await flush();
    expect(disconnect).toHaveBeenCalledWith('evm:metamask');
    expect(reset).toHaveBeenCalled();
  });

  it('keeps the wallet connected when the user switched the account during the prompt', async () => {
    activeConnection = connection('0xaaaa');
    render(NovaSiwxWatcher, props);

    activeConnection = connection('0xbbbb');
    render(NovaSiwxWatcher, props);

    rejectSignIn(new Error('User rejected'));
    await flush();
    expect(disconnect).not.toHaveBeenCalled();
    expect(reset).toHaveBeenCalled();
  });
});
