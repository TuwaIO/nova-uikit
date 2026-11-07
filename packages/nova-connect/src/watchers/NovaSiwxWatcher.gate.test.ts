import { useSiwxSessionStore } from '@tuwaio/siwx-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NovaConnectProviderContext } from '../hooks/useNovaConnect';
import { SatelliteStoreContext } from '../satellite';
import { provideContext, render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

type Options = {
  signer: (message: string) => Promise<string>;
  verifier: (payload: { message: string; signature: string }) => Promise<unknown>;
  getNonce?: () => Promise<string>;
  fields: { address: string };
  onSuccess?: (session: unknown) => void;
  onError?: (message: string) => void;
};

const signIn = vi.hoisted(() => vi.fn());

// The real session store and field builders. `signIn` is `useSiwx` from `@tuwaio/siwx-react`, whose hook needs React, with
// its writes in the same order: what the watcher answers depends on what they leave behind
vi.mock('@tuwaio/siwx-react', async (importOriginal) => {
  const real = await importOriginal<typeof import('@tuwaio/siwx-react')>();
  const store = real.useSiwxSessionStore;
  signIn.mockImplementation(async ({ signer, verifier, getNonce, fields, onSuccess, onError }: Options) => {
    const actions = store.getState();
    try {
      actions.setBuilding();
      const nonce = getNonce ? await getNonce() : 'nonce';
      const message = `${fields.address} ${nonce}`;
      actions.setSigning();
      const signature = await signer(message);
      actions.setVerifying();
      const session = (await verifier({ message, signature })) as {
        address: string;
        chainId: string;
        domain: string;
        issuedAt: string;
      } | null;
      if (!session) {
        const refused = 'Backend verification failed. No session returned.';
        actions.setError(refused);
        onError?.(refused);
        return;
      }
      actions.setAuthenticated({ ...session, uri: 'https://app.tuwa.io', version: '1', nonce } as never);
      onSuccess?.(session);
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      actions.setError(text);
      onError?.(text);
    }
  });
  return {
    ...real,
    useSiwx: () => ({ signIn }),
    useSiwxSessionStore: Object.assign(
      (selector: (state: ReturnType<typeof store.getState>) => unknown) => selector(store.getState()),
      store,
    ),
  };
});

const disconnect = vi.fn();
const disconnectAll = vi.fn(async () => undefined);
let activeConnection: Record<string, unknown> | undefined;
let connecting = false;

vi.mock('../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection, connecting, disconnect, disconnectAll, isAutoConnectFinished: true }),
}));

const { NovaSiwxWatcher } = await import('./NovaSiwxWatcher');

const FIRST = '0x1111111111111111111111111111111111111111';
const SECOND = '0x2222222222222222222222222222222222222222';

type Gate = (connection: unknown, context: { isRestore: boolean }) => Promise<void>;
let gate: Gate | undefined;
const setConnectionGate = vi.fn((next: Gate | undefined) => {
  gate = next;
});
const setIsWaitingForSignature = vi.fn();

const walletOf = (address: string, signMessage: unknown = vi.fn(async () => 'signature')) => ({
  connectorType: address === FIRST ? 'evm:metamask' : 'evm:rabby',
  address,
  chainId: 1,
  isConnected: true,
  signMessage,
});
const sessionOf = (address: string) => ({
  address: `eip155:1:${address}`,
  chainId: 'eip155:1',
  domain: 'app.tuwa.io',
  issuedAt: new Date().toISOString(),
});
const signedInAs = (address: string) =>
  useSiwxSessionStore.setState({ status: 'authenticated', session: sessionOf(address), error: null });
const verifier = vi.fn(async ({ message }: { message: string }) => sessionOf(message.split(' ')[0].split(':')[2]));
const flush = () => new Promise((resolve) => setTimeout(resolve));
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const refusalOf = (promise: Promise<void>) =>
  promise.then(
    () => 'passed',
    (error: Error) => error.message,
  );

const mount = (props: Parameters<typeof NovaSiwxWatcher>[0] = { verifier: verifier as never }) => {
  provideContext(SatelliteStoreContext as object, { getState: () => ({ setConnectionGate }) });
  provideContext(NovaConnectProviderContext as object, { setIsWaitingForSignature });
  render(NovaSiwxWatcher, props);
};

describe('NovaSiwxWatcher at the connection gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    useSiwxSessionStore.setState({ status: 'idle', session: null, error: null });
    activeConnection = undefined;
    connecting = false;
    gate = undefined;
  });
  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  it('sets the gate of the store, and takes it away when it is turned off or gone', () => {
    mount();
    expect(gate).toBeTypeOf('function');

    render(NovaSiwxWatcher, { enabled: false, verifier: verifier as never });
    expect(gate).toBeUndefined();

    render(NovaSiwxWatcher, { verifier: verifier as never });
    expect(gate).toBeTypeOf('function');

    unmount();
    expect(gate).toBeUndefined();
  });

  // The wallet used to connect first and go away after a rejected signature
  it('holds the wallet at the gate until the session is written', async () => {
    const signature = deferred<string>();
    mount();
    let passed = false;
    const passing = gate!(
      walletOf(FIRST, () => signature.promise),
      { isRestore: false },
    ).then(() => {
      passed = true;
    });

    await flush();
    expect(signIn).toHaveBeenCalledOnce();
    expect(passed).toBe(false);
    expect(useSiwxSessionStore.getState().status).toBe('signing');

    signature.resolve('signature');
    await passing;
    expect(useSiwxSessionStore.getState().status).toBe('authenticated');
    expect(useSiwxSessionStore.getState().session?.address).toBe(`eip155:1:${FIRST}`);
  });

  it('asks nothing of a wallet that its session covers', async () => {
    signedInAs(FIRST);
    connecting = true;
    mount();

    await gate!(walletOf(FIRST), { isRestore: false });

    expect(signIn).not.toHaveBeenCalled();
  });

  it('refuses a wallet that rejects, and says so once', async () => {
    const onError = vi.fn();
    mount({ verifier: verifier as never, onError });

    const refusal = await refusalOf(
      gate!(
        walletOf(FIRST, async () => Promise.reject(new Error('User rejected'))),
        { isRestore: false },
      ),
    );

    expect(refusal).toBe('User rejected');
    expect(onError).toHaveBeenCalledOnce();
    expect(useSiwxSessionStore.getState()).toMatchObject({ status: 'idle', session: null, error: null });
    // What a refused wallet leaves behind is the job of Satellite, which has not shown it
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('keeps the session of the active wallet when another wallet rejects', async () => {
    const destroyer = vi.fn(async () => undefined);
    signedInAs(FIRST);
    activeConnection = walletOf(FIRST);
    mount({ verifier: verifier as never, destroyer });

    const refusal = await refusalOf(
      gate!(
        walletOf(SECOND, async () => Promise.reject(new Error('No'))),
        { isRestore: false },
      ),
    );

    expect(refusal).toBe('No');
    expect(useSiwxSessionStore.getState().status).toBe('authenticated');
    expect(useSiwxSessionStore.getState().session?.address).toBe(`eip155:1:${FIRST}`);
    expect(destroyer).not.toHaveBeenCalled();
  });

  describe('after a page load', () => {
    // A wallet popup on load, which nobody asked for
    it('asks nobody: a restored wallet without a session is refused with no prompt', async () => {
      const signMessage = vi.fn(async () => 'signature');
      mount();

      const refusal = await refusalOf(gate!(walletOf(FIRST, signMessage), { isRestore: true }));

      expect(refusal).not.toBe('passed');
      expect(signIn).not.toHaveBeenCalled();
      expect(signMessage).not.toHaveBeenCalled();
    });

    it('lets through a restored wallet that its session covers', async () => {
      signedInAs(FIRST);
      connecting = true;
      mount();

      await expect(gate!(walletOf(FIRST), { isRestore: true })).resolves.toBeUndefined();
    });
  });

  it('refuses a wallet that cannot sign', async () => {
    mount();

    expect(await refusalOf(gate!(walletOf(FIRST, null), { isRestore: false }))).toBe(
      'This wallet cannot sign a message.',
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it('warns and lets the wallet through without a verifier', async () => {
    mount({});

    await expect(gate!(walletOf(FIRST), { isRestore: false })).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  // A wallet that never answers used to hold up every wallet after it
  it('lets a later wallet stop the prompt of the earlier one, whose late answer goes nowhere', async () => {
    const onError = vi.fn();
    const late = deferred<string>();
    mount({ verifier: verifier as never, onError });
    const first = refusalOf(
      gate!(
        walletOf(FIRST, () => late.promise),
        { isRestore: false },
      ),
    );
    await flush();

    const second = deferred<string>();
    const passing = gate!(
      walletOf(SECOND, () => second.promise),
      { isRestore: false },
    );
    expect(await first).toBe('Another wallet is signing in');

    late.resolve('late signature');
    await flush();
    expect(verifier).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    second.resolve('signature');
    await passing;
    expect(useSiwxSessionStore.getState().session?.address).toBe(`eip155:1:${SECOND}`);
    expect(verifier).toHaveBeenCalledOnce();
  });

  it('asks no wallet for a sign-in stopped while it waited for the nonce', async () => {
    const nonce = deferred<string>();
    const firstSigner = vi.fn(async () => 'signature');
    mount({ verifier: verifier as never, getNonce: () => nonce.promise });
    const first = refusalOf(gate!(walletOf(FIRST, firstSigner), { isRestore: false }));
    await flush();
    const second = refusalOf(
      gate!(
        walletOf(SECOND, () => new Promise(() => undefined)),
        { isRestore: false },
      ),
    );
    expect(await first).toBe('Another wallet is signing in');

    nonce.resolve('nonce');
    await flush();
    expect(firstSigner).not.toHaveBeenCalled();
    void second;
  });

  it('lets go of the wallet when the watcher goes away: Satellite would stay connecting', async () => {
    mount();
    const waiting = refusalOf(
      gate!(
        walletOf(FIRST, () => new Promise(() => undefined)),
        { isRestore: false },
      ),
    );
    await flush();

    unmount();

    expect(await waiting).toBe('The sign-in was stopped');
  });

  it('says the wallet is being asked for as long as the latest one is', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    mount();
    const stopped = refusalOf(
      gate!(
        walletOf(FIRST, () => first.promise),
        { isRestore: false },
      ),
    );
    await flush();
    expect(setIsWaitingForSignature).toHaveBeenLastCalledWith(true);

    const passing = gate!(
      walletOf(SECOND, () => second.promise),
      { isRestore: false },
    );
    await stopped;
    await flush();
    // The stopped wallet does not take the words away from the one being asked
    expect(setIsWaitingForSignature).toHaveBeenLastCalledWith(true);

    second.resolve('signature');
    await passing;
    expect(setIsWaitingForSignature).toHaveBeenLastCalledWith(false);
  });

  // The session is written a moment before the store shows the wallet: with no wallet in between, it was taken as ended
  it('keeps the session that a connecting wallet has just signed for', async () => {
    const destroyer = vi.fn(async () => undefined);
    const props = { verifier: verifier as never, destroyer };
    connecting = true;
    mount(props);

    await gate!(walletOf(FIRST), { isRestore: false });
    render(NovaSiwxWatcher, props);
    expect(useSiwxSessionStore.getState().status).toBe('authenticated');
    expect(destroyer).not.toHaveBeenCalled();

    activeConnection = walletOf(FIRST);
    connecting = false;
    render(NovaSiwxWatcher, props);
    expect(useSiwxSessionStore.getState().session?.address).toBe(`eip155:1:${FIRST}`);
    expect(signIn).toHaveBeenCalledOnce();
  });

  // `switchConnection` runs the gate with `connecting` off: the new session and the old wallet meet in one render
  it('does not ask the active wallet again while another wallet takes over from it', async () => {
    const props = { verifier: verifier as never };
    signedInAs(FIRST);
    activeConnection = walletOf(FIRST);
    mount(props);

    await gate!(walletOf(SECOND), { isRestore: false });
    render(NovaSiwxWatcher, props);
    expect(signIn).toHaveBeenCalledOnce();

    activeConnection = walletOf(SECOND);
    render(NovaSiwxWatcher, props);
    await flush();
    render(NovaSiwxWatcher, props);
    expect(signIn).toHaveBeenCalledOnce();
    expect(disconnect).not.toHaveBeenCalled();
  });
});

describe('NovaSiwxWatcher with a wallet that is already connected', () => {
  const props = { verifier: verifier as never };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    useSiwxSessionStore.setState({ status: 'idle', session: null, error: null });
    connecting = false;
    gate = undefined;
  });
  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  // Connected means signed in. A sign-out used to do one thing or another, by how the session had started. All of the wallets:
  // with one disconnected, the next would take over and be asked to sign in right after the person has signed out
  it('disconnects every wallet when the session ended, with no prompt', () => {
    signedInAs(FIRST);
    activeConnection = walletOf(FIRST);
    mount(props);
    expect(disconnectAll).not.toHaveBeenCalled();

    useSiwxSessionStore.getState().reset();
    render(NovaSiwxWatcher, props);

    expect(disconnectAll).toHaveBeenCalledOnce();
    expect(disconnect).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  // The wallets go one by one, and what wagmi reports of those left re-runs the check with no session: live, a prompt for the
  // wallet that was just signing out
  it('asks nobody while the wallets of a session that ended are going', async () => {
    const going = deferred<undefined>();
    disconnectAll.mockReturnValueOnce(going.promise);
    signedInAs(SECOND);
    activeConnection = walletOf(SECOND);
    mount(props);

    useSiwxSessionStore.getState().reset();
    render(NovaSiwxWatcher, props);
    activeConnection = walletOf(SECOND);
    render(NovaSiwxWatcher, props);
    activeConnection = walletOf(FIRST);
    render(NovaSiwxWatcher, props);

    expect(signIn).not.toHaveBeenCalled();
    expect(disconnectAll).toHaveBeenCalledOnce();

    going.resolve(undefined);
    activeConnection = undefined;
    await flush();
    render(NovaSiwxWatcher, props);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('does not ask a wallet while another one connects, and looks at it after', () => {
    signedInAs(FIRST);
    activeConnection = walletOf(FIRST);
    mount(props);

    connecting = true;
    activeConnection = { ...walletOf(FIRST), address: SECOND };
    render(NovaSiwxWatcher, props);
    expect(signIn).not.toHaveBeenCalled();

    connecting = false;
    render(NovaSiwxWatcher, props);
    expect(signIn).toHaveBeenCalledOnce();
  });

  // A prompt in flight used to lock out the account the wallet moved to
  it('asks the account that the wallet moved to during a prompt, and the late rejection changes nothing', async () => {
    const earlier = deferred<string>();
    signedInAs(FIRST);
    activeConnection = walletOf(SECOND, () => earlier.promise);
    mount(props);
    await flush();
    expect(signIn).toHaveBeenCalledTimes(1);

    const THIRD = '0x3333333333333333333333333333333333333333';
    activeConnection = walletOf(THIRD, () => new Promise(() => undefined));
    render(NovaSiwxWatcher, props);
    expect(signIn).toHaveBeenCalledTimes(2);

    earlier.reject(new Error('User rejected'));
    await flush();
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('gives the session back when the wallet comes back to its account during a prompt', async () => {
    signedInAs(FIRST);
    activeConnection = walletOf(SECOND, () => new Promise(() => undefined));
    mount(props);
    await flush();
    render(NovaSiwxWatcher, props);
    expect(useSiwxSessionStore.getState().status).toBe('signing');

    activeConnection = walletOf(FIRST);
    render(NovaSiwxWatcher, props);

    expect(useSiwxSessionStore.getState().status).toBe('authenticated');
    expect(useSiwxSessionStore.getState().session?.address).toBe(`eip155:1:${FIRST}`);
    expect(signIn).toHaveBeenCalledOnce();
    expect(disconnect).not.toHaveBeenCalled();
  });

  // The key used to be taken before the check: a verifier that came later never asked the wallet
  it('asks the wallet once a verifier that came later is there', () => {
    activeConnection = walletOf(FIRST);
    mount({});
    expect(signIn).not.toHaveBeenCalled();

    render(NovaSiwxWatcher, props);
    expect(signIn).toHaveBeenCalledOnce();
  });
});
