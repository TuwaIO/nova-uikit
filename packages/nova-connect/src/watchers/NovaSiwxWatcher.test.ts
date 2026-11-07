import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const ADDRESS = '0x1234567890123456789012345678901234567890';

const disconnect = vi.fn();
const reset = vi.fn();
const signIn = vi.fn<(options: { onError?: (message: string) => void }) => Promise<void>>(async () => undefined);

let activeConnection: Record<string, unknown> | null | undefined;
let isAutoConnectFinished: boolean | undefined;
let session: { address: string } | null;
let status: string;

const wallet = () => ({
  connectorType: 'evm:metamask',
  address: ADDRESS,
  chainId: 1,
  isConnected: true,
  signMessage: vi.fn(async () => '0xsignature'),
});

vi.mock('../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, isAutoConnectFinished, disconnect }),
}));

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({ signIn }),
  useSiwxSessionStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => selector({ session, status, reset }),
    { getState: () => ({ session, status }), setState: vi.fn() },
  ),
  isSessionMatchingConnection: () => false,
  getSatelliteSiwxFields: () => ({
    domain: 'app.tuwa.io',
    address: `eip155:1:${ADDRESS}`,
    uri: 'https://app.tuwa.io',
    chainId: 'eip155:1',
    statement: 'Sign in to TUWA.',
  }),
}));

const { NovaSiwxWatcher } = await import('./NovaSiwxWatcher');

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('NovaSiwxWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    activeConnection = wallet();
    isAutoConnectFinished = undefined;
    session = null;
    status = 'idle';
  });
  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  it('asks a connected wallet that has no session', () => {
    render(NovaSiwxWatcher, { verifier: vi.fn() });

    expect(signIn).toHaveBeenCalledOnce();
  });

  it('disconnects the wallet and clears the session when it rejects', async () => {
    const onError = vi.fn();
    signIn.mockImplementationOnce(async (options) => options.onError?.('User rejected signature'));

    render(NovaSiwxWatcher, { verifier: vi.fn(), onError });
    await flush();

    expect(disconnect).toHaveBeenCalledWith('evm:metamask');
    expect(reset).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('User rejected signature');
  });

  it('keeps a restored session while Satellite auto-connect is still running', () => {
    const destroyer = vi.fn(async () => undefined);
    activeConnection = undefined;
    isAutoConnectFinished = false;
    session = { address: `eip155:1:${ADDRESS}` };
    status = 'authenticated';

    render(NovaSiwxWatcher, { destroyer });

    expect(reset).not.toHaveBeenCalled();
    expect(destroyer).not.toHaveBeenCalled();
  });

  it('resets a restored session when Satellite auto-connect finishes without a wallet', () => {
    const destroyer = vi.fn(async () => undefined);
    activeConnection = undefined;
    isAutoConnectFinished = true;
    session = { address: `eip155:1:${ADDRESS}` };
    status = 'authenticated';

    render(NovaSiwxWatcher, { destroyer });

    expect(reset).toHaveBeenCalled();
    expect(destroyer).toHaveBeenCalled();
  });

  it('calls the destroyer when the active connection is gone', () => {
    const destroyer = vi.fn(async () => undefined);
    activeConnection = null;
    session = { address: `eip155:1:${ADDRESS}` };
    status = 'authenticated';

    render(NovaSiwxWatcher, { destroyer });

    expect(reset).toHaveBeenCalled();
    expect(destroyer).toHaveBeenCalled();
  });
});
