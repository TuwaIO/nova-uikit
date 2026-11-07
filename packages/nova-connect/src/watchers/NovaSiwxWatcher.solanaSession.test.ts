import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const signIn = vi.fn(async () => undefined);
let activeConnection: Record<string, unknown>;
let session: { address: string; chainId: string; domain: string; issuedAt: string } | null;

vi.mock('../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, isAutoConnectFinished: true, disconnect: vi.fn() }),
}));

// The real field builders and session matching of @tuwaio/siwx-react; only the hooks are replaced
vi.mock('@tuwaio/siwx-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/siwx-react')>()),
  useSiwx: () => ({ signIn }),
  useSiwxSessionStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({ session, status: 'authenticated', reset: vi.fn() }),
    { getState: () => ({ session, status: 'authenticated' }) },
  ),
}));

const { NovaSiwxWatcher } = await import('./NovaSiwxWatcher');

const ACCOUNT = '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZAMdL4VZHirAn';

const connectSolana = (address: string) => {
  activeConnection = {
    connectorType: 'solana:phantom',
    address,
    chainId: 'devnet',
    isConnected: true,
    signMessage: vi.fn(async () => 'signature'),
  };
};
const restoreSession = (address: string, chainId: string) => {
  session = { address, chainId, domain: 'app.tuwa.io', issuedAt: new Date().toISOString() };
};

describe('NovaSiwxWatcher with Solana sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  it('keeps a session signed for solana:devnet before the switch to genesis-hash chain IDs', () => {
    connectSolana(ACCOUNT);
    restoreSession(`solana:devnet:${ACCOUNT}`, 'solana:devnet');

    render(NovaSiwxWatcher, { verifier: vi.fn() });

    expect(signIn).not.toHaveBeenCalled();
  });

  it('keeps a session signed for the genesis-hash chain ID of the cluster', () => {
    const chainId = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';
    connectSolana(ACCOUNT);
    restoreSession(`${chainId}:${ACCOUNT}`, chainId);

    render(NovaSiwxWatcher, { verifier: vi.fn() });

    expect(signIn).not.toHaveBeenCalled();
  });

  it('signs in again when the session belongs to another account', () => {
    connectSolana(ACCOUNT);
    restoreSession('solana:devnet:Another1111111111111111111111111111111111111', 'solana:devnet');

    render(NovaSiwxWatcher, { verifier: vi.fn() });

    expect(signIn).toHaveBeenCalledOnce();
  });
});
