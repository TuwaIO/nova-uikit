import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SatelliteStoreContext } from '../satellite';
import { provideContext, render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const ADDRESS = '0x1234567890123456789012345678901234567890';

type Options = {
  signer: (message: string) => Promise<string>;
  verifier: (payload: object) => Promise<unknown>;
  getNonce: () => Promise<string>;
  onSuccess?: (session: unknown) => void;
  onError?: (message: string) => void;
};

const setState = vi.fn();
const reset = vi.fn();
const disconnect = vi.fn();
let session: { address: string; chainId?: string } | null = null;
let activeConnection: Record<string, unknown> | undefined;
let connecting = false;

// In the order of `signIn` of `@tuwaio/siwx-react`: what it catches reaches `onError` as text
const signIn = vi.fn(async ({ signer, verifier, getNonce, onSuccess, onError }: Options) => {
  try {
    await getNonce();
    const signature = await signer('message');
    const verified = await verifier({ signature });
    onSuccess?.(verified);
  } catch (error) {
    onError?.((error as Error).message);
  }
});

vi.mock('../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, connecting, disconnect, isAutoConnectFinished: true }),
}));

vi.mock('@tuwaio/siwx-react', () => ({
  useSiwx: () => ({ signIn }),
  useSiwxSessionStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => selector({ session, status: 'idle', reset }),
    { getState: () => ({ session, status: 'idle' }), setState: (state: unknown) => setState(state) },
  ),
  isSessionMatchingConnection: () => false,
  getSatelliteSiwxFields: () => ({ domain: 'app.tuwa.io', address: `eip155:1:${ADDRESS}`, chainId: 'eip155:1' }),
}));

const { NovaSiwxServiceError, NovaSiwxWatcher } = await import('./NovaSiwxWatcher');

const wallet = (signMessage = vi.fn(async () => 'signature')) => ({
  connectorType: 'evm:metamask',
  address: ADDRESS,
  chainId: 1,
  isConnected: true,
  signMessage,
});
const away = () => Promise.reject(new NovaSiwxServiceError('The service is away'));

// A Redis away behind the sign-in said nothing of the wallet or the person, yet the wallet was disconnected, and with it went
// what the page showed of it: live on the dashboard, `verify` answering for a store that was down
describe('NovaSiwxWatcher when the backend of the sign-in cannot answer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    session = null;
    activeConnection = undefined;
    connecting = false;
  });
  afterEach(() => {
    unmount();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('while a wallet connects', () => {
    type Gate = (connection: unknown, context: { isRestore: boolean }) => Promise<void>;
    let gate: Gate;
    const mount = (props: Parameters<typeof NovaSiwxWatcher>[0]) => {
      provideContext(SatelliteStoreContext as object, {
        getState: () => ({
          setConnectionGate: (next: Gate) => {
            gate = next;
          },
        }),
      });
      render(NovaSiwxWatcher, props);
    };

    it('tries the same signature again a few times, then fails with no second prompt', async () => {
      const signMessage = vi.fn(async () => 'signature');
      const verifier = vi.fn(away);
      const onError = vi.fn();
      mount({ verifier: verifier as never, getNonce: async () => 'nonce', onError });

      let refusal: string | undefined;
      void gate(wallet(signMessage), { isRestore: false }).catch((error: Error) => {
        refusal = error.message;
      });
      await vi.advanceTimersByTimeAsync(0);
      expect(verifier).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(5_000);
      expect(verifier).toHaveBeenCalledTimes(2);
      expect(refusal).toBeUndefined();

      await vi.advanceTimersByTimeAsync(15_000);
      expect(verifier).toHaveBeenCalledTimes(3);
      expect(refusal).toBe('The service is away');

      expect(signMessage).toHaveBeenCalledOnce();
      expect(signIn).toHaveBeenCalledOnce();
      expect(onError).toHaveBeenCalledOnce();
    });

    it('goes on when the backend answers again', async () => {
      const verifier = vi
        .fn()
        .mockImplementationOnce(away)
        .mockResolvedValueOnce({ address: `eip155:1:${ADDRESS}` });
      mount({ verifier, getNonce: async () => 'nonce' });

      let isPassed = false;
      void gate(wallet(), { isRestore: false }).then(() => {
        isPassed = true;
      });
      await vi.advanceTimersByTimeAsync(5_000);

      expect(isPassed).toBe(true);
    });

    it('ends no session that was there before', async () => {
      const destroyer = vi.fn(async () => undefined);
      session = { address: `eip155:1:${ADDRESS}` };
      connecting = true;
      mount({ verifier: vi.fn(away) as never, getNonce: async () => 'nonce', destroyer });

      void gate(wallet(), { isRestore: false }).catch(() => undefined);
      await vi.advanceTimersByTimeAsync(20_000);

      expect(setState).toHaveBeenCalledWith({ status: 'authenticated', session, error: null });
      expect(reset).not.toHaveBeenCalled();
      expect(destroyer).not.toHaveBeenCalled();
    });
  });

  describe('with a wallet already connected', () => {
    it('keeps the wallet and goes on trying, and says so once however long it lasts', async () => {
      const signMessage = vi.fn(async () => 'signature');
      const verifier = vi.fn(away);
      const onError = vi.fn();
      activeConnection = wallet(signMessage);
      render(NovaSiwxWatcher, { verifier: verifier as never, getNonce: async () => 'nonce', onError });

      await vi.advanceTimersByTimeAsync(0);
      expect(verifier).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(45_000);
      expect(verifier).toHaveBeenCalledTimes(4);

      expect(signIn).toHaveBeenCalledOnce();
      expect(signMessage).toHaveBeenCalledOnce();
      expect(onError).toHaveBeenCalledOnce();
      expect(disconnect).not.toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    });

    it('stops trying once the backend has answered', async () => {
      const verifier = vi
        .fn()
        .mockImplementationOnce(away)
        .mockResolvedValue({ address: `eip155:1:${ADDRESS}` });
      activeConnection = wallet();
      render(NovaSiwxWatcher, { verifier, getNonce: async () => 'nonce' });

      await vi.advanceTimersByTimeAsync(15_000);
      expect(verifier).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(60_000);
      expect(verifier).toHaveBeenCalledTimes(2);
    });

    it('stops trying for a watcher that is gone', async () => {
      const verifier = vi.fn(away);
      activeConnection = wallet();
      render(NovaSiwxWatcher, { verifier: verifier as never, getNonce: async () => 'nonce' });
      await vi.advanceTimersByTimeAsync(0);
      expect(verifier).toHaveBeenCalledTimes(1);

      unmount();
      await vi.advanceTimersByTimeAsync(60_000);
      expect(verifier).toHaveBeenCalledTimes(1);
    });

    it('still disconnects for anything else: the person said no, or the signature is wrong', async () => {
      activeConnection = wallet(vi.fn(async () => Promise.reject(new Error('User rejected the request'))));
      render(NovaSiwxWatcher, { verifier: vi.fn(away) as never, getNonce: async () => 'nonce' });
      await vi.advanceTimersByTimeAsync(0);

      expect(disconnect).toHaveBeenCalledWith('evm:metamask');
      await vi.advanceTimersByTimeAsync(60_000);
      expect(signIn).toHaveBeenCalledOnce();
    });
  });
});
