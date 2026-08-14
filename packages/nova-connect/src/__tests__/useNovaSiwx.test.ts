import { describe, expect, it, vi } from 'vitest';

vi.mock('react', () => ({
  useCallback: (fn: any) => fn,
  useEffect: (fn: any) => fn(),
  useRef: (val: any) => ({ current: val }),
}));

// Mock dependencies
vi.mock('../satellite', () => ({
  useSatelliteConnectStore: vi.fn((selector) =>
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

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({
    signIn: vi.fn().mockResolvedValue({ success: true }),
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

import { useNovaSiwx } from '../hooks/useNovaSiwx';

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

  it('triggers destroyer callback on signOut', async () => {
    const mockDestroyer = vi.fn().mockResolvedValue(undefined);
    const { signOut } = useNovaSiwx({ destroyer: mockDestroyer });

    await signOut();
    expect(mockDestroyer).toHaveBeenCalled();
  });
});
