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

const EVM = '0x1234567890AbcdEF1234567890aBcdef12345678';
const OTHER_EVM = '0x9999999999999999999999999999999999999999';
const SOLANA = '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZAMdL4VZHirAn';
const SOLANA_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';

const signMessage = vi.fn(async () => 'signature');
const evm = (chainId: number, address = EVM): Connection => ({
  connectorType: 'evm:metamask',
  address,
  chainId,
  isConnected: true,
  signMessage,
});
const solana = (chainId: string): Connection => ({
  connectorType: 'solana:phantom',
  address: SOLANA,
  chainId,
  isConnected: true,
  signMessage,
});

let activeConnection: Connection;
let session: { address: string; chainId: string; domain: string; issuedAt: string } | null = null;
let status = 'idle';
const disconnect = vi.fn();
const reset = vi.fn();
let rejectSignIn: (error: Error) => void = () => undefined;
const signIn = vi.fn(
  () =>
    new Promise((_, reject) => {
      rejectSignIn = reject;
    }),
);

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, disconnect, isAutoConnectFinished: true }),
}));

// The real field builders and session matching of @tuwaio/siwx-react; only the hooks are replaced
vi.mock('@tuwaio/siwx-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/siwx-react')>()),
  useSiwx: () => ({ signIn }),
  useSiwxSessionStore: (selector: (state: Record<string, unknown>) => unknown) => selector({ session, status, reset }),
}));

const { NovaSiwxWatcher } = await import('./NovaSiwxWatcher');

const signedIn = (address: string, chainId: string) => {
  session = { address: `${chainId}:${address}`, chainId, domain: 'app.tuwa.io', issuedAt: new Date().toISOString() };
  status = 'authenticated';
};
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('NovaSiwxWatcher sessionScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    session = null;
    status = 'idle';
  });
  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  describe("'account'", () => {
    const props = { verifier: vi.fn(), sessionScope: 'account' as const };

    it('keeps the session of an EVM account through a network switch, in any letter case', () => {
      signedIn(EVM.toLowerCase(), 'eip155:1');
      activeConnection = evm(1);
      render(NovaSiwxWatcher, props);
      activeConnection = evm(8453);
      render(NovaSiwxWatcher, props);
      activeConnection = evm(42161);
      render(NovaSiwxWatcher, props);

      expect(signIn).not.toHaveBeenCalled();
      expect(disconnect).not.toHaveBeenCalled();
    });

    it('keeps the session of a Solana account through a cluster switch', () => {
      signedIn(SOLANA, SOLANA_MAINNET);
      activeConnection = solana('mainnet');
      render(NovaSiwxWatcher, props);
      activeConnection = solana('devnet');
      render(NovaSiwxWatcher, props);

      expect(signIn).not.toHaveBeenCalled();
      expect(disconnect).not.toHaveBeenCalled();
    });

    it('asks the same account once, whatever network it moves to', async () => {
      // The prompt ends without a session (the verifier answered nothing)
      signIn.mockImplementationOnce(async () => undefined);
      activeConnection = evm(1);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
      await flush();

      activeConnection = evm(8453);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
    });

    it('asks another account to sign in, and disconnects it on a rejection', async () => {
      signedIn(EVM, 'eip155:1');
      activeConnection = evm(1);
      render(NovaSiwxWatcher, props);
      activeConnection = evm(8453, OTHER_EVM);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith(
        expect.objectContaining({ fields: expect.objectContaining({ address: `eip155:8453:${OTHER_EVM}` }) }),
      );

      rejectSignIn(new Error('User rejected'));
      await flush();
      expect(disconnect).toHaveBeenCalledWith('evm:metamask');
    });

    it('asks a wallet of another namespace to sign in', () => {
      signedIn(EVM, 'eip155:1');
      activeConnection = solana('devnet');
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
    });
  });

  describe("'chain' (the default)", () => {
    const props = { verifier: vi.fn() };

    it('asks the wallet to sign in again on another network', () => {
      signedIn(EVM, 'eip155:1');
      activeConnection = evm(1);
      render(NovaSiwxWatcher, props);
      expect(signIn).not.toHaveBeenCalled();

      activeConnection = evm(8453);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith(
        expect.objectContaining({ fields: expect.objectContaining({ chainId: 'eip155:8453' }) }),
      );
    });

    it('asks again on another network after a prompt that ended without a session', async () => {
      signIn.mockImplementationOnce(async () => undefined);
      activeConnection = evm(1);
      render(NovaSiwxWatcher, props);
      await flush();
      activeConnection = evm(8453);
      render(NovaSiwxWatcher, props);
      expect(signIn).toHaveBeenCalledTimes(2);
    });
  });
});
