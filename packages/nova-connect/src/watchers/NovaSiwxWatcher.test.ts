import { useSiwxSessionStore } from '@tuwaio/siwx-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSatelliteConnectStore } from '../satellite';
import { NovaSiwxWatcher } from './NovaSiwxWatcher';

vi.mock('react', () => ({
  useEffect: (fn: () => void | (() => void)) => {
    fn();
  },
  useRef: (initial: unknown) => ({ current: initial }),
  useCallback: (fn: unknown) => fn,
}));

const mockDisconnect = vi.fn();
const mockResetSession = vi.fn();
const mockSignIn = vi.fn().mockResolvedValue({ success: true });

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      activeConnection: {
        connectorType: 'evm:metamask',
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        isConnected: true,
        signMessage: vi.fn().mockResolvedValue('0xsignature'),
      },
      disconnect: mockDisconnect,
    }),
  ),
}));

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({
    signIn: mockSignIn,
    signOut: vi.fn(),
  }),
  useSiwxSessionStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      session: null,
      status: 'idle',
      reset: mockResetSession,
    }),
  ),
  getSatelliteSiwxFields: vi.fn().mockReturnValue({
    domain: 'app.tuwa.io',
    address: 'eip155:1:0x1234567890123456789012345678901234567890',
    uri: 'https://app.tuwa.io',
    chainId: 'eip155:1',
    statement: 'Sign in to TUWA.',
  }),
}));

describe('NovaSiwxWatcher', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(useSatelliteConnectStore).mockImplementation((selector) =>
      selector({
        activeConnection: {
          connectorType: 'evm:metamask',
          address: '0x1234567890123456789012345678901234567890',
          chainId: 1,
          isConnected: true,
          signMessage: vi.fn().mockResolvedValue('0xsignature'),
        },
        disconnect: mockDisconnect,
      } as never),
    );

    vi.mocked(useSiwxSessionStore).mockImplementation((selector) =>
      selector({
        session: null,
        status: 'idle',
        reset: mockResetSession,
      } as never),
    );
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('triggers SIWX signIn on active connection', async () => {
    const mockVerifier = vi.fn().mockResolvedValue({ address: '0x1234567890123456789012345678901234567890' });
    const mockSuccess = vi.fn();

    NovaSiwxWatcher({
      enabled: true,
      verifier: mockVerifier,
      onSuccess: mockSuccess,
    });

    expect(mockSignIn).toHaveBeenCalled();
  });

  it('handles verification failure by disconnecting wallet and resetting session', async () => {
    const mockError = vi.fn();
    const failingSignIn = vi.fn().mockImplementation(({ onError }: { onError: (err: Error) => void }) => {
      onError(new Error('User rejected signature'));
      return Promise.reject(new Error('User rejected signature'));
    });

    const mockVerifier = vi.fn();

    mockSignIn.mockImplementationOnce(failingSignIn);

    NovaSiwxWatcher({
      enabled: true,
      verifier: mockVerifier,
      onError: mockError,
    });

    expect(mockDisconnect).toHaveBeenCalledWith('evm:metamask');
    expect(mockResetSession).toHaveBeenCalled();
    expect(mockError).toHaveBeenCalledWith('User rejected signature');
  });

  it('triggers destroyer when active connection becomes disconnected', () => {
    const mockDestroyer = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useSatelliteConnectStore).mockImplementation((selector) =>
      selector({
        activeConnection: null,
        disconnect: mockDisconnect,
      } as never),
    );

    vi.mocked(useSiwxSessionStore).mockImplementation((selector) =>
      selector({
        session: { address: 'eip155:1:0x1234567890123456789012345678901234567890' },
        status: 'authenticated',
        reset: mockResetSession,
      } as never),
    );

    NovaSiwxWatcher({
      enabled: true,
      destroyer: mockDestroyer,
    });

    expect(mockResetSession).toHaveBeenCalled();
    expect(mockDestroyer).toHaveBeenCalled();
  });
});
