import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

type Connection = {
  connectorType: string;
  address: string;
  chainId: number | string;
  isConnected: boolean;
  signMessage: () => Promise<string>;
};
type Session = { address: string; chainId: string; domain: string; issuedAt: string };

const EVM = '0x1234567890AbcdEF1234567890aBcdef12345678';
const SOLANA = '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZAMdL4VZHirAn';

const signMessage = vi.fn(async () => 'signature');
const metamask = (chainId = 1): Connection => ({
  connectorType: 'evm:metamask',
  address: EVM,
  chainId,
  isConnected: true,
  signMessage,
});
// The same EVM account in another wallet (the same recovery phrase in Rabby, say)
const rabby = (chainId: number): Connection => ({
  connectorType: 'evm:rabby',
  address: EVM,
  chainId,
  isConnected: true,
  signMessage,
});
const phantom = (): Connection => ({
  connectorType: 'solana:phantom',
  address: SOLANA,
  chainId: 'devnet',
  isConnected: true,
  signMessage,
});

let activeConnection: Connection | undefined;
let isAutoConnectFinished = true;
let session: Session | null = null;
let status = 'idle';

const disconnect = vi.fn();
const reset = vi.fn(() => {
  session = null;
  status = 'idle';
});
const setState = vi.fn((state: { session?: Session | null; status?: string }) => {
  if ('session' in state) session = state.session ?? null;
  if (state.status) status = state.status;
});

// `signIn` of `@tuwaio/siwx-react` on a rejection: `setError` (the store keeps the session), then `onError`; on a
// success: the new session with the `authenticated` status
let failSignIn: (message: string) => void = () => undefined;
let succeedSignIn: (next: Session) => void = () => undefined;
const signIn = vi.fn(
  (options: { onError?: (message: string) => void }) =>
    new Promise<void>((resolve) => {
      status = 'signing';
      failSignIn = (message) => {
        status = 'error';
        options.onError?.(message);
        resolve();
      };
      succeedSignIn = (next) => {
        session = next;
        status = 'authenticated';
        resolve();
      };
    }),
);

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, disconnect, isAutoConnectFinished }),
}));

// The real field builders and session matching of @tuwaio/siwx-react; only the hooks are replaced
vi.mock('@tuwaio/siwx-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/siwx-react')>()),
  useSiwx: () => ({ signIn }),
  useSiwxSessionStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => selector({ session, status, reset }),
    { setState },
  ),
}));

const { NovaSiwxWatcher } = await import('./NovaSiwxWatcher');

const signedIn = (address: string, chainId: string) => {
  session = { address: `${chainId}:${address}`, chainId, domain: 'app.tuwa.io', issuedAt: new Date().toISOString() };
  status = 'authenticated';
};
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('NovaSiwxWatcher', () => {
  const destroyer = vi.fn(async () => undefined);
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    activeConnection = undefined;
    isAutoConnectFinished = true;
    session = null;
    status = 'idle';
  });
  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  describe('a rejected sign-in of another account', () => {
    for (const sessionScope of ['account', 'chain'] as const) {
      it(`keeps the session and disconnects only the new wallet ('${sessionScope}')`, async () => {
        const props = { verifier: vi.fn(), destroyer, onError, sessionScope };
        signedIn(EVM, 'eip155:1');
        activeConnection = metamask();
        render(NovaSiwxWatcher, props);
        expect(signIn).not.toHaveBeenCalled();

        // A second wallet, of another account and namespace, is asked to sign in and the user cancels
        activeConnection = phantom();
        render(NovaSiwxWatcher, props);
        expect(signIn).toHaveBeenCalledTimes(1);
        failSignIn('User rejected');
        await flush();

        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(disconnect).toHaveBeenCalledWith('solana:phantom');
        expect(reset).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith('User rejected');
        expect(status).toBe('authenticated');
        expect(session?.address).toBe(`eip155:1:${EVM}`);

        // Satellite Connect falls back to the wallet of the session, which is not asked again
        activeConnection = metamask();
        render(NovaSiwxWatcher, props);
        expect(signIn).toHaveBeenCalledTimes(1);
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(reset).not.toHaveBeenCalled();
        expect(destroyer).not.toHaveBeenCalled();
      });
    }

    it('asks the new wallet again when it is connected again', async () => {
      const props = { verifier: vi.fn(), sessionScope: 'account' as const };
      signedIn(EVM, 'eip155:1');
      activeConnection = metamask();
      render(NovaSiwxWatcher, props);
      activeConnection = phantom();
      render(NovaSiwxWatcher, props);
      failSignIn('User rejected');
      await flush();
      activeConnection = metamask();
      render(NovaSiwxWatcher, props);

      activeConnection = phantom();
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(2);
    });

    it("'chain': keeps the session when its address rejects in another wallet on another network", async () => {
      const props = { verifier: vi.fn(), destroyer };
      signedIn(EVM, 'eip155:1');
      activeConnection = metamask(1);
      render(NovaSiwxWatcher, props);

      // With 'chain' the account on Base is not the account of the session, which was signed on Ethereum
      activeConnection = rabby(8453);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
      failSignIn('User rejected');
      await flush();

      expect(disconnect).toHaveBeenCalledWith('evm:rabby');
      expect(reset).not.toHaveBeenCalled();
      expect(status).toBe('authenticated');

      activeConnection = metamask(1);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(destroyer).not.toHaveBeenCalled();
    });

    for (const endSessionOnlyAfterDisconnect of [false, true]) {
      it(`'chain': disconnects the wallet of the session that rejects a new network, and the session ends with it (endSessionOnlyAfterDisconnect: ${endSessionOnlyAfterDisconnect})`, async () => {
        const props = { verifier: vi.fn(), destroyer, onError, endSessionOnlyAfterDisconnect };
        signedIn(EVM, 'eip155:1');
        activeConnection = metamask(1);
        render(NovaSiwxWatcher, props);
        activeConnection = metamask(8453);
        render(NovaSiwxWatcher, props);
        expect(signIn).toHaveBeenCalledTimes(1);

        failSignIn('User rejected');
        await flush();
        expect(disconnect).toHaveBeenCalledWith('evm:metamask');
        expect(onError).toHaveBeenCalledWith('User rejected');

        // No wallet is left: the session ends as on any disconnect
        activeConnection = undefined;
        render(NovaSiwxWatcher, props);
        expect(reset).toHaveBeenCalled();
        expect(destroyer).toHaveBeenCalled();
        expect(session).toBeNull();
      });
    }
  });

  describe("a rejected sign-in of the session's own account", () => {
    // A failed sign-in (of `useNovaSiwx`, or a verifier that answered nothing) leaves the store in `error` with the
    // session, so the watcher asks the wallet of the session again
    it("'account': ends the session, on any network and in any letter case", async () => {
      const props = { verifier: vi.fn(), sessionScope: 'account' as const };
      signedIn(EVM.toLowerCase(), 'eip155:1');
      status = 'error';
      activeConnection = metamask(8453);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);

      failSignIn('User rejected');
      await flush();
      expect(disconnect).toHaveBeenCalledWith('evm:metamask');
      expect(reset).toHaveBeenCalled();
      expect(setState).not.toHaveBeenCalled();
    });

    it("'chain': ends the session on the network it was signed on", async () => {
      const props = { verifier: vi.fn() };
      signedIn(EVM, 'eip155:1');
      status = 'error';
      activeConnection = metamask(1);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);

      failSignIn('User rejected');
      await flush();
      expect(disconnect).toHaveBeenCalledWith('evm:metamask');
      expect(reset).toHaveBeenCalled();
      expect(setState).not.toHaveBeenCalled();
    });

    it('ends the session when there is none to keep', async () => {
      const props = { verifier: vi.fn(), sessionScope: 'account' as const };
      activeConnection = phantom();
      render(NovaSiwxWatcher, props);
      failSignIn('User rejected');
      await flush();
      expect(disconnect).toHaveBeenCalledWith('solana:phantom');
      expect(reset).toHaveBeenCalled();
      expect(setState).not.toHaveBeenCalled();
    });
  });

  describe('endSessionOnlyAfterDisconnect', () => {
    it('off (the default): a page without a wallet ends the restored session after auto-connect', () => {
      signedIn(EVM, 'eip155:1');
      isAutoConnectFinished = false;
      render(NovaSiwxWatcher, { verifier: vi.fn(), destroyer });
      expect(reset).not.toHaveBeenCalled();

      isAutoConnectFinished = true;
      render(NovaSiwxWatcher, { verifier: vi.fn(), destroyer });
      expect(reset).toHaveBeenCalled();
      expect(destroyer).toHaveBeenCalled();
    });

    it('on: a page that never had a wallet keeps the session', () => {
      const props = { verifier: vi.fn(), destroyer, endSessionOnlyAfterDisconnect: true };
      signedIn(EVM, 'eip155:1');
      isAutoConnectFinished = false;
      render(NovaSiwxWatcher, props);
      isAutoConnectFinished = true;
      render(NovaSiwxWatcher, props);

      expect(reset).not.toHaveBeenCalled();
      expect(destroyer).not.toHaveBeenCalled();
      expect(session?.address).toBe(`eip155:1:${EVM}`);
    });

    it('on: disconnecting a wallet that the page restored ends the session', () => {
      const props = { verifier: vi.fn(), destroyer, endSessionOnlyAfterDisconnect: true };
      signedIn(EVM, 'eip155:1');
      isAutoConnectFinished = false;
      render(NovaSiwxWatcher, props);
      isAutoConnectFinished = true;
      activeConnection = metamask();
      render(NovaSiwxWatcher, props);
      expect(reset).not.toHaveBeenCalled();

      activeConnection = undefined;
      render(NovaSiwxWatcher, props);
      expect(reset).toHaveBeenCalled();
      expect(destroyer).toHaveBeenCalled();
    });

    it('on: disconnecting a wallet that the page connected ends the session', () => {
      const props = { verifier: vi.fn(), destroyer, endSessionOnlyAfterDisconnect: true };
      signedIn(EVM, 'eip155:1');
      render(NovaSiwxWatcher, props);
      activeConnection = metamask();
      render(NovaSiwxWatcher, props);
      activeConnection = undefined;
      render(NovaSiwxWatcher, props);

      expect(reset).toHaveBeenCalled();
      expect(destroyer).toHaveBeenCalled();
    });

    it('on: a new tab keeps the session when the only wallet it had, of another account, rejects the sign-in', async () => {
      const props = {
        verifier: vi.fn(),
        destroyer,
        endSessionOnlyAfterDisconnect: true,
        sessionScope: 'account' as const,
      };
      // The shared session of another tab, whose wallet this tab does not restore
      signedIn(EVM, 'eip155:1');
      render(NovaSiwxWatcher, props);

      // A Solana wallet connected for a payment is asked to sign in, and the user cancels
      activeConnection = phantom();
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
      failSignIn('User rejected');
      await flush();
      expect(disconnect).toHaveBeenCalledWith('solana:phantom');

      activeConnection = undefined;
      render(NovaSiwxWatcher, props);
      expect(reset).not.toHaveBeenCalled();
      expect(destroyer).not.toHaveBeenCalled();
      expect(status).toBe('authenticated');
      expect(session?.address).toBe(`eip155:1:${EVM}`);
    });

    describe('with the renders of React between the rejection and the disconnect', () => {
      const props = {
        verifier: vi.fn(),
        destroyer,
        endSessionOnlyAfterDisconnect: true,
        sessionScope: 'account' as const,
      };

      // A new tab with the shared session of another tab: Phantom is connected for a payment and rejects the sign-in.
      // React renders on every store change (`signing`, then the `authenticated` status given back), while Satellite
      // Connect removes Phantom only after the wallet has disconnected (`disconnect` is asynchronous)
      const rejectPhantomInNewTab = async () => {
        signedIn(EVM, 'eip155:1');
        render(NovaSiwxWatcher, props);
        activeConnection = phantom();
        render(NovaSiwxWatcher, props);
        expect(signIn).toHaveBeenCalledTimes(1);
        render(NovaSiwxWatcher, props);

        failSignIn('User rejected');
        await flush();
        expect(disconnect).toHaveBeenCalledWith('solana:phantom');
        expect(status).toBe('authenticated');
        render(NovaSiwxWatcher, props);

        activeConnection = undefined;
        render(NovaSiwxWatcher, props);
      };

      it('on: the new tab keeps the session', async () => {
        await rejectPhantomInNewTab();

        expect(reset).not.toHaveBeenCalled();
        expect(destroyer).not.toHaveBeenCalled();
        expect(status).toBe('authenticated');
        expect(session?.address).toBe(`eip155:1:${EVM}`);
      });

      it('on: the wallet counts again once it is connected again and signs in', async () => {
        await rejectPhantomInNewTab();

        activeConnection = phantom();
        render(NovaSiwxWatcher, props);
        expect(signIn).toHaveBeenCalledTimes(2);
        const chainId = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';
        succeedSignIn({
          address: `${chainId}:${SOLANA}`,
          chainId,
          domain: 'app.tuwa.io',
          issuedAt: new Date().toISOString(),
        });
        await flush();
        render(NovaSiwxWatcher, props);
        expect(reset).not.toHaveBeenCalled();

        activeConnection = undefined;
        render(NovaSiwxWatcher, props);
        expect(reset).toHaveBeenCalled();
        expect(destroyer).toHaveBeenCalled();
      });
    });
  });
});
