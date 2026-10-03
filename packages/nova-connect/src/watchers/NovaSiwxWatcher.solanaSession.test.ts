import { useSiwxSessionStore } from '@tuwaio/siwx-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSatelliteConnectStore } from '../satellite';
import { NovaSiwxWatcher } from './NovaSiwxWatcher';

vi.mock('react', () => ({
  useEffect: (fn: () => void | (() => void)) => {
    fn();
  },
  useRef: (initial: unknown) => ({ current: initial }),
  useCallback: (fn: unknown) => fn,
  useEffectEvent: (fn: unknown) => fn,
}));

const mockSignIn = vi.fn().mockResolvedValue({ success: true });

vi.mock('../satellite', () => ({ useSatelliteConnectStore: vi.fn() }));

// The real field builders and session matching of @tuwaio/siwx-react; only the hooks are replaced
vi.mock('@tuwaio/siwx-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/siwx-react')>()),
  useSiwx: () => ({ signIn: mockSignIn, signOut: vi.fn() }),
  useSiwxSessionStore: vi.fn(),
}));

const ACCOUNT = '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZAMdL4VZHirAn';

function connectSolana(address: string) {
  vi.mocked(useSatelliteConnectStore).mockImplementation((selector) =>
    selector({
      activeConnection: {
        connectorType: 'solana:phantom',
        address,
        chainId: 'devnet',
        isConnected: true,
        signMessage: vi.fn().mockResolvedValue('signature'),
      },
      isAutoConnectFinished: true,
      disconnect: vi.fn(),
    } as never),
  );
}

function restoreSession(address: string, chainId: string) {
  vi.mocked(useSiwxSessionStore).mockImplementation((selector) =>
    selector({
      session: { address, chainId, domain: 'app.tuwa.io', issuedAt: new Date().toISOString() },
      status: 'authenticated',
      reset: vi.fn(),
    } as never),
  );
}

describe('NovaSiwxWatcher with Solana sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps a session signed for solana:devnet before the switch to genesis-hash chain IDs', () => {
    connectSolana(ACCOUNT);
    restoreSession(`solana:devnet:${ACCOUNT}`, 'solana:devnet');

    NovaSiwxWatcher({ enabled: true, verifier: vi.fn() });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('keeps a session signed for the genesis-hash chain ID of the cluster', () => {
    const devnet = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';
    connectSolana(ACCOUNT);
    restoreSession(`${devnet}:${ACCOUNT}`, devnet);

    NovaSiwxWatcher({ enabled: true, verifier: vi.fn() });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('signs in again when the session belongs to another account', () => {
    connectSolana('7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV');
    restoreSession(`solana:devnet:${ACCOUNT}`, 'solana:devnet');

    NovaSiwxWatcher({ enabled: true, verifier: vi.fn() });

    expect(mockSignIn).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.objectContaining({ chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1' }),
      }),
    );
  });
});
