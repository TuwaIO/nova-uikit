import { describe, expect, it, vi } from 'vitest';

vi.mock('react', () => ({
  useCallback: (fn: unknown) => fn,
  useEffect: (fn: () => void | (() => void)) => fn(),
  useRef: (val: unknown) => ({ current: val }),
}));

// Mock dependencies
vi.mock('../satellite', () => ({
  useSatelliteConnectStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      activeConnection: {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        isConnected: true,
        signMessage: vi.fn().mockResolvedValue('0xsignature'),
      },
    }),
  ),
}));

const { siwxSignIn } = vi.hoisted(() => ({ siwxSignIn: vi.fn() }));

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({
    signIn: siwxSignIn.mockResolvedValue({ success: true }),
    signOut: vi.fn(),
  }),
  getSatelliteSiwxFields: vi.fn().mockReturnValue({
    domain: 'test.tuwa.io',
    address: 'eip155:1:0x1234567890123456789012345678901234567890',
    uri: 'https://test.tuwa.io',
    chainId: 'eip155:1',
    statement: 'Sign in to TUWA.',
  }),
}));

import { useNovaSiwx } from './useNovaSiwx';

describe('useNovaSiwx', () => {
  it('exposes signIn and signOut functions', () => {
    const { signIn, signOut } = useNovaSiwx({ verifier: vi.fn() });
    expect(typeof signIn).toBe('function');
    expect(typeof signOut).toBe('function');
  });

  it('triggers signIn with resolved satellite connection', async () => {
    const mockVerifier = vi.fn().mockResolvedValue({ address: '0x123' });
    const { signIn } = useNovaSiwx({ verifier: mockVerifier });

    const result = await signIn();
    expect(result).toEqual({ success: true });
  });

  // The nonce was made in the browser, so a backend that issues nonces refused a signature the person had already given
  it('passes getNonce and the callbacks on to the sign-in', async () => {
    const getNonce = vi.fn().mockResolvedValue('nonce');
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { signIn } = useNovaSiwx({ verifier: vi.fn(), getNonce, onSuccess, onError });

    await signIn();

    expect(siwxSignIn).toHaveBeenLastCalledWith(expect.objectContaining({ getNonce, onSuccess, onError }));
  });

  it('triggers destroyer callback on signOut', async () => {
    const mockDestroyer = vi.fn().mockResolvedValue(undefined);
    const { signOut } = useNovaSiwx({ destroyer: mockDestroyer });

    await signOut();
    expect(mockDestroyer).toHaveBeenCalled();
  });
});
