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

// The wallet that answers when the test says so
let answerWallet: Record<string, (error: Error) => void> = {};
const connection = (address: string): Connection => ({
  connectorType: 'evm:metamask',
  address,
  chainId: 1,
  isConnected: true,
  signMessage: () =>
    new Promise((_, reject) => {
      answerWallet[address] = reject;
    }),
});

let activeConnection: Connection;
const disconnect = vi.fn();
const reset = vi.fn();
// As `signIn` of `@tuwaio/siwx-react`: it asks the wallet, and what it catches reaches `onError` as text
const signIn = vi.fn(async (options: { signer: () => Promise<string>; onError?: (message: string) => void }) => {
  try {
    await options.signer();
  } catch (error) {
    options.onError?.((error as Error).message);
  }
});

vi.mock('../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, disconnect, isAutoConnectFinished: true }),
}));

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({ signIn }),
  useSiwxSessionStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => selector({ session: null, status: 'idle', reset }),
    { getState: () => ({ session: null, status: 'idle' }) },
  ),
  isSessionMatchingConnection: () => false,
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
    answerWallet = {};
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

    await flush();
    answerWallet['0xaaaa'](new Error('User rejected'));
    await flush();
    expect(disconnect).toHaveBeenCalledWith('evm:metamask');
    expect(reset).toHaveBeenCalled();
  });

  it('keeps the wallet connected when the user switched the account during the prompt', async () => {
    activeConnection = connection('0xaaaa');
    render(NovaSiwxWatcher, props);

    await flush();
    activeConnection = connection('0xbbbb');
    render(NovaSiwxWatcher, props);
    await flush();

    // The answer of the account that is gone: the prompt of the new one is what counts now
    answerWallet['0xaaaa'](new Error('User rejected'));
    await flush();
    expect(disconnect).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
  });
});
