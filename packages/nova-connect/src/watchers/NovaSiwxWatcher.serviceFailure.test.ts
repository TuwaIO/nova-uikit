import { useSiwxSessionStore } from '@tuwaio/siwx-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSatelliteConnectStore } from '../satellite';
import { NovaSiwxServiceError, NovaSiwxWatcher } from './NovaSiwxWatcher';

vi.mock('react', () => ({
  useEffect: (fn: () => void | (() => void)) => {
    fn();
  },
  useRef: (initial: unknown) => ({ current: initial }),
  useCallback: (fn: unknown) => fn,
  useEffectEvent: (fn: unknown) => fn,
}));

const mockDisconnect = vi.fn();
const mockResetSession = vi.fn();
const mockSetState = vi.fn();
const mockSignIn = vi.fn();

vi.mock('../satellite', () => ({ useSatelliteConnectStore: vi.fn() }));

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({ signIn: mockSignIn, signOut: vi.fn() }),
  useSiwxSessionStore: Object.assign(vi.fn(), { setState: (state: unknown) => mockSetState(state) }),
  isSessionMatchingConnection: vi.fn(() => false),
  getSatelliteSiwxFields: vi.fn().mockReturnValue({
    domain: 'app.tuwa.io',
    address: 'eip155:1:0x1234567890123456789012345678901234567890',
    uri: 'https://app.tuwa.io',
    chainId: 'eip155:1',
    statement: 'Sign in to TUWA.',
  }),
}));

const ADDRESS = '0x1234567890123456789012345678901234567890';

// A Redis away behind the sign-in said nothing of the wallet or the person, yet the wallet was disconnected, and with it went
// what the page showed of it: live on the dashboard, `verify` answering for a store that was down
describe('NovaSiwxWatcher when the backend of the sign-in cannot answer', () => {
  const session = { address: `eip155:1:${ADDRESS}` };
  const signInAs = (failing: 'getNonce' | 'verifier') =>
    mockSignIn.mockImplementationOnce(
      async ({
        getNonce,
        verifier,
        onError,
      }: {
        getNonce: () => Promise<string>;
        verifier: (payload: object) => Promise<unknown>;
        onError: (error: string) => void;
      }) => {
        // As `signIn` of `@tuwaio/siwx-react`: what it catches reaches `onError` as text
        try {
          if (failing === 'getNonce') await getNonce();
          else await verifier({});
        } catch (error) {
          onError((error as Error).message);
        }
      },
    );
  const failed = () => Promise.reject(new NovaSiwxServiceError('The service is away'));
  const withStore = (current: unknown) =>
    vi
      .mocked(useSiwxSessionStore)
      .mockImplementation((selector: (state: never) => unknown) =>
        selector({ session: current, status: 'idle', reset: mockResetSession } as never),
      );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(useSatelliteConnectStore).mockImplementation((selector: (state: never) => unknown) =>
      selector({
        activeConnection: {
          connectorType: 'evm:metamask',
          address: ADDRESS,
          chainId: 1,
          isConnected: true,
          signMessage: vi.fn(),
        },
        disconnect: mockDisconnect,
      } as never),
    );
    withStore(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(['getNonce', 'verifier'] as const)('keeps the wallet and ends no session when %s fails', async (failing) => {
    withStore(session);
    signInAs(failing);
    NovaSiwxWatcher({ getNonce: failed, verifier: failed });
    await vi.advanceTimersByTimeAsync(0);

    expect(mockDisconnect).not.toHaveBeenCalled();
    expect(mockResetSession).not.toHaveBeenCalled();
    expect(mockSetState).toHaveBeenCalledWith({ status: 'authenticated', session, error: null });
  });

  it('goes back to no session at all when there was none, without clearing anything', async () => {
    signInAs('getNonce');
    NovaSiwxWatcher({ getNonce: failed, verifier: failed });
    await vi.advanceTimersByTimeAsync(0);

    expect(mockResetSession).not.toHaveBeenCalled();
    expect(mockSetState).toHaveBeenCalledWith({ status: 'idle', session: null, error: null });
  });

  it('tries again later, and says so once however long the service is away', async () => {
    const onError = vi.fn();
    signInAs('getNonce');
    NovaSiwxWatcher({ getNonce: failed, verifier: failed, onError });
    await vi.advanceTimersByTimeAsync(0);
    expect(mockSignIn).toHaveBeenCalledTimes(1);

    signInAs('getNonce');
    await vi.advanceTimersByTimeAsync(15_000);
    expect(mockSignIn).toHaveBeenCalledTimes(2);

    signInAs('getNonce');
    await vi.advanceTimersByTimeAsync(15_000);
    expect(mockSignIn).toHaveBeenCalledTimes(3);

    expect(onError).toHaveBeenCalledOnce();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('stops trying once a sign-in went through', async () => {
    signInAs('getNonce');
    NovaSiwxWatcher({ getNonce: failed, verifier: failed });
    await vi.advanceTimersByTimeAsync(0);

    mockSignIn.mockResolvedValueOnce(undefined);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(mockSignIn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(mockSignIn).toHaveBeenCalledTimes(2);
  });

  it('still disconnects for anything else: the person said no, or the signature is wrong', async () => {
    mockSignIn.mockImplementationOnce(async ({ onError }: { onError: (error: string) => void }) => {
      onError('User rejected the request');
    });
    NovaSiwxWatcher({ getNonce: failed, verifier: failed });
    await vi.advanceTimersByTimeAsync(0);

    expect(mockDisconnect).toHaveBeenCalledWith('evm:metamask');
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mockSignIn).toHaveBeenCalledOnce();
  });
});
