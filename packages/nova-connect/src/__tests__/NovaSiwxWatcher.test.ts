import { describe, expect, it, vi } from 'vitest';

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
  useSatelliteConnectStore: vi.fn((selector) =>
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
  useSiwxSessionStore: vi.fn((selector) =>
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

import { NovaSiwxWatcher } from '../watchers/NovaSiwxWatcher';

describe('NovaSiwxWatcher', () => {
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
});
