/**
 * @file Headless SIWX sign-in of NovaConnect: a wallet counts as connected only after it has signed in.
 */

import type { MinimalSatelliteConnection, SatelliteSiwxFieldOptions, UseSiwxSignInOptions } from '@tuwaio/siwx-react';
import { getSatelliteSiwxFields, isSessionMatchingConnection, useSiwx, useSiwxSessionStore } from '@tuwaio/siwx-react';
import { useContext, useEffect, useEffectEvent, useRef } from 'react';

import { NovaConnectProviderContext } from '../hooks/useNovaConnect';
import { SatelliteStoreContext, useSatelliteConnectStore } from '../satellite';
import { accountKey, isSessionForAccount } from '../utils/siwxAccount';

/** How long a person who waits for a connection waits for a backend that could not answer, one try after each. */
const SERVICE_RETRIES_WHILE_CONNECTING_MS = [5_000, 15_000];

/** How long a connected wallet waits for a backend that could not answer before the signature is sent again. */
const SERVICE_RETRY_MS = 15_000;

/** A sign-in that stopped as another one started, which then has the session store to itself. */
class SupersededSignInError extends Error {}

/**
 * Thrown by `getNonce` or `verifier` when your backend could not answer (a 5xx, the network): it says nothing of the wallet
 * or the person. The call is tried again with what the wallet has signed, so the wallet is not asked again. While a wallet
 * connects, after a few tries the connection fails with a Try again, and no session ends. A wallet already connected stays
 * connected and it goes on trying, with `onError` called once however long that lasts. Anything else they throw counts as
 * a failed sign-in.
 */
export class NovaSiwxServiceError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NovaSiwxServiceError';
  }
}

/** Key of a wallet connection: its connector type and address. */
const walletKey = (connectorType: string, address: string) => `${connectorType} ${address}`;

/**
 * What a SIWX session belongs to: `'chain'`, the account on the chain it was signed on, or `'account'`, the account on
 * every chain of its namespace (an EVM address on every EVM chain, a Solana address on every cluster).
 */
export type NovaSiwxSessionScope = 'chain' | 'account';

/**
 * Props of {@link NovaSiwxWatcher} (the `siwx` prop of `NovaConnectProvider`): the sign-in callbacks and the SIWX
 * message fields of `getSatelliteSiwxFields` from `@tuwaio/siwx-react` (`domain`, `uri`, `statement`, and so on).
 */
export interface NovaSiwxWatcherProps extends SatelliteSiwxFieldOptions {
  /** Whether to ask connected wallets to sign in (default: `true`) */
  enabled?: boolean;
  /**
   * What the session belongs to (default: `'chain'`).
   *
   * - `'chain'`: the account on the chain it was signed on. A network or cluster switch asks the wallet to sign in
   *   again, and a rejection disconnects it.
   * - `'account'`: the account on every chain of its namespace. A network or cluster switch of the same account keeps
   *   the session and asks nothing; another account, another wallet or another namespace asks to sign in as with
   *   `'chain'`, and a rejection still disconnects. Use it when your server binds a session to the address only (as
   *   with Nova Payments, whose checkout switches the wallet to the network of the payment); keep `'chain'` when your
   *   server ties permissions to the chain the session was signed on.
   *
   * A wallet that rejects the sign-in does not connect. A connected wallet that moves to an account or network its session
   * does not cover is disconnected if it rejects. When the session belongs to another account (another address or namespace;
   * with `'chain'`, also the same address on another chain), the session is kept, so the wallet of the session stays or
   * Satellite Connect falls back to it without asking it again (a second wallet connected for a payment, say). For the
   * account of the session, or without a session, the session is cleared as well, and `destroyer` called.
   */
  sessionScope?: NovaSiwxSessionScope;
  /**
   * Whether only the disconnect of a wallet clears the session (default: `false`).
   *
   * - `false`: the session is cleared, and `destroyer` called, whenever no wallet is connected after Satellite Connect
   *   has finished reconnecting, also on a page that has had no wallet.
   * - `true`: the session is cleared, and `destroyer` called, only when no wallet is connected after a wallet that this
   *   page connected or restored has been disconnected. A page that has had no wallet keeps the session: a new tab
   *   whose last connection is in the `sessionStorage` of another tab (a wallet that is not remembered), or whose wallet
   *   Satellite Connect does not restore after a page load. A wallet of another address than the session's that is
   *   disconnected after a rejected sign-in does not count. Use it when the session is shared by the tabs of the app
   *   (`@tuwaio/siwx-react` keeps it in `localStorage`) and your server keeps it until a sign-out. When your app ends
   *   the server session itself (a sign-out, a session guard of its own), clear this session too (`signOut` of
   *   `useNovaSiwx`, or `reset` of `useSiwxSessionStore` from `@tuwaio/siwx-react`): a kept session counts as signed in
   *   for a wallet of its account connected later, which is then not asked to sign in, and `onSuccess` is not called.
   */
  endSessionOnlyAfterDisconnect?: boolean;
  /** Fetches the nonce of the SIWX message from your backend. Throw {@link NovaSiwxServiceError} when it cannot answer. */
  getNonce?: () => Promise<string>;
  /**
   * Verifies the signed message on your backend (required for the sign-in). Throw {@link NovaSiwxServiceError} when it cannot
   * answer: `null`, or any other error, says the signature was refused and disconnects the wallet.
   */
  verifier?: UseSiwxSignInOptions['verifier'];
  /**
   * Optional callback triggered when the wallet disconnects or when `signOut` is called.
   * Useful for hitting a `/logout` endpoint to clear the backend cookie.
   */
  destroyer?: () => Promise<void>;
  /** Optional callback triggered immediately after successful SIWX authentication */
  onSuccess?: UseSiwxSignInOptions['onSuccess'];
  /** Optional callback triggered if SIWX signing or verification fails */
  onError?: UseSiwxSignInOptions['onError'];
}

/**
 * Signs wallets in with SIWX. `NovaConnectProvider` renders it with its `siwx` prop, so apps do not render it themselves. It
 * renders nothing.
 *
 * - A wallet counts as connected only after it has signed in: this sets the connection gate of the Satellite store
 *   (`setConnectionGate`), so `connect` asks the wallet to sign a SIWX message (`signIn` of `useSiwx` from `@tuwaio/siwx-react`:
 *   a wallet prompt, then `getNonce` and `verifier` requests to your backend) before `activeConnection` holds it, and
 *   `connecting` stays `true` meanwhile. A rejection leaves the store as it was, with the error in `connectionError`, and
 *   calls `onError`. A wallet whose session is valid is asked nothing. Without `verifier` it logs a warning and asks nothing.
 * - After a page load nobody is asked anything: Satellite Connect restores the wallet only if the session restored by
 *   `@tuwaio/siwx-react` covers it. Otherwise the page shows Connect, and the signature comes after the click.
 * - A connected wallet that moves to another account (with the default `sessionScope` `'chain'`, also another network) is asked
 *   to sign in, and disconnected if it rejects. With `'account'`, a network switch of the same account asks nothing.
 * - When the session of the connected wallet ends, as with `signOut` of `useNovaSiwx` or `reset` of `useSiwxSessionStore`, the
 *   wallet is disconnected: connected means signed in. It is not asked to sign again.
 * - A backend that could not answer ({@link NovaSiwxServiceError}) is no failed sign-in: see there.
 * - When no wallet is connected, it clears the SIWX session and calls `destroyer`. After a page load it waits until Satellite
 *   Connect has finished reconnecting (`isAutoConnectFinished`), so the session restored by `@tuwaio/siwx-react` is kept. With
 *   `endSessionOnlyAfterDisconnect`, it does so only once a wallet that this page connected or restored has been disconnected.
 *
 * @param props - See {@link NovaSiwxWatcherProps}.
 * @returns `null`.
 */
export function NovaSiwxWatcher(props: NovaSiwxWatcherProps) {
  const {
    enabled = true,
    sessionScope = 'chain',
    endSessionOnlyAfterDisconnect = false,
    getNonce,
    verifier,
    destroyer,
    domain,
    uri,
    statement,
    expirationTime,
    expirationSeconds,
    notBefore,
    requestId,
    resources,
    onSuccess,
    onError,
  } = props;
  const activeConnection = useSatelliteConnectStore((s) => s.activeConnection);
  const disconnect = useSatelliteConnectStore((s) => s.disconnect);
  const isConnecting = useSatelliteConnectStore((s) => s.connecting);
  // `undefined` with `@tuwaio/satellite-core` before 0.6.1, which has no such flag
  const isAutoConnectFinished = useSatelliteConnectStore((s) => s.isAutoConnectFinished);
  const satelliteStore = useContext(SatelliteStoreContext);
  const setIsWaitingForSignature = useContext(NovaConnectProviderContext)?.setIsWaitingForSignature;
  const { signIn } = useSiwx();
  const session = useSiwxSessionStore((s) => s.session);
  const status = useSiwxSessionStore((s) => s.status);
  const resetSession = useSiwxSessionStore((s) => s.reset);

  const lastPromptedAddress = useRef<string | null>(null);
  // The latest sign-in, and what stops it: a wallet that never answers must not hold up the next one
  const signInRun = useRef(0);
  const stopSignIn = useRef<((reason: Error) => void) | null>(null);
  // Wallets at the connection gate. The session of such a wallet is written before Satellite shows the wallet, and until
  // then it may look as if the active wallet had lost its session
  const walletsAtGate = useRef(0);
  // The account a sign-in is asking while it runs, and the one that last had a session, to tell a session that ended from
  // a wallet that moved
  const askedAccount = useRef<string | null>(null);
  const signedInAccount = useRef<string | null>(null);
  // The wallets (connector and address) that this page has had connected or restored, for
  // `endSessionOnlyAfterDisconnect`; a wallet of another account disconnected after a rejected sign-in is left out
  const pageWallets = useRef<Set<string>>(new Set());
  // That wallet while it is still the active connection: Satellite removes it only after the wallet has disconnected,
  // and the renders before (the session status given back) must not add it to `pageWallets` again
  const rejectedWallet = useRef<string | null>(null);

  // Callbacks and message fields are read through Effect Events: the `siwx` prop is often a new object on every render,
  // which must not re-run the effects
  const destroySession = useEffectEvent(() => {
    resetSession();
    if (destroyer) {
      destroyer().catch((err) => {
        console.warn('[NovaSiwxWatcher] Failed to execute session destroyer:', err);
      });
    }
  });

  useEffect(() => {
    const activeWallet =
      activeConnection?.isConnected && activeConnection.address
        ? walletKey(activeConnection.connectorType, activeConnection.address)
        : null;
    // Once the rejected wallet is no longer the active connection, connecting it again counts
    if (rejectedWallet.current !== activeWallet) rejectedWallet.current = null;
    if (activeWallet) {
      if (activeWallet !== rejectedWallet.current) pageWallets.current.add(activeWallet);
      return;
    }
    lastPromptedAddress.current = null;
    signedInAccount.current = null;
    // A wallet is on its way: the session it has just signed for is written before the store shows the wallet
    if (isConnecting) return;
    // After a page load, `@tuwaio/siwx-react` restores the saved session before Satellite reconnects the wallet:
    // keep the session until auto-connect has finished
    if (isAutoConnectFinished === false) return;
    // A page that has had no wallet (a new tab, a wallet that Satellite does not restore) keeps the shared session
    if (endSessionOnlyAfterDisconnect && pageWallets.current.size === 0) return;
    if (status === 'authenticated' || session) {
      destroySession();
    }
  }, [
    activeConnection?.isConnected,
    activeConnection?.address,
    activeConnection?.connectorType,
    isConnecting,
    isAutoConnectFinished,
    status,
    session,
    endSessionOnlyAfterDisconnect,
  ]);

  // Reads the active connection of the latest render, after an asynchronous sign-in
  const isActiveConnection = useEffectEvent(
    (connectorType: string, address: string) =>
      activeConnection?.connectorType === connectorType && activeConnection.address === address,
  );

  const fieldsOf = useEffectEvent((connection: MinimalSatelliteConnection) =>
    getSatelliteSiwxFields(connection, {
      domain,
      uri,
      statement,
      expirationTime,
      expirationSeconds,
      notBefore,
      requestId,
      resources,
    }),
  );

  // Whether a session covers the account: the same namespace and address with 'account', and also the same chain with 'chain'
  // (a Solana session signed for `solana:devnet` before the switch to genesis-hash chain IDs still matches)
  const isSessionOf = useEffectEvent(
    (candidate: typeof session, connection: MinimalSatelliteConnection, address: string) =>
      sessionScope === 'account'
        ? isSessionForAccount(candidate, address)
        : isSessionMatchingConnection(candidate, connection),
  );

  /**
   * Asks a wallet to sign in, and stops the sign-in before it, whose wallet may never answer. Resolves when the session is
   * written, and rejects with what stopped it, after the session store has been put right.
   */
  const askToSign = useEffectEvent(
    (
      connection: MinimalSatelliteConnection,
      fields: ReturnType<typeof getSatelliteSiwxFields>,
      signMessage: UseSiwxSignInOptions['signer'],
      isConnectingWallet: boolean,
    ) => {
      signInRun.current += 1;
      const run = signInRun.current;
      const isCurrent = () => run === signInRun.current;
      stopSignIn.current?.(new SupersededSignInError('Another wallet is signing in'));
      setIsWaitingForSignature?.(isConnectingWallet);

      const sessionBefore = useSiwxSessionStore.getState().session;
      // A sign-in that was stopped goes no further: a result of its own would write over the session of the one after it
      const never = () => new Promise<never>(() => undefined);
      const whileCurrent =
        <A extends unknown[], R>(call: (...args: A) => Promise<R> | R) =>
        async (...args: A): Promise<R> => {
          if (!isCurrent()) return never();
          try {
            const result = await call(...args);
            return isCurrent() ? result : never();
          } catch (error) {
            if (!isCurrent()) return never();
            throw error;
          }
        };
      let isServiceDown = false;
      let isServiceDownTold = false;
      // The same call again, so that the wallet is not asked for a new signature: a wallet that rejected one of those disconnected
      const throughServiceFailures =
        <A extends unknown[], R>(call: (...args: A) => Promise<R> | R) =>
        async (...args: A): Promise<R> => {
          for (let attempt = 0; ; attempt += 1) {
            try {
              const result = await call(...args);
              isServiceDown = false;
              return result;
            } catch (error) {
              // By name: two copies of this package in an app would not share the class
              if ((error as Error | null)?.name !== 'NovaSiwxServiceError') throw error;
              isServiceDown = true;
              const wait = isConnectingWallet ? SERVICE_RETRIES_WHILE_CONNECTING_MS[attempt] : SERVICE_RETRY_MS;
              if (wait === undefined) throw error;
              console.warn('[NovaSiwxWatcher] The SIWX backend could not answer, trying again later:', error);
              if (!isConnectingWallet && !isServiceDownTold) {
                isServiceDownTold = true;
                onError?.(error instanceof Error ? error.message : String(error));
              }
              await new Promise((resolve) => setTimeout(resolve, wait));
              // Gone, or another sign-in started: nothing is sent for a wallet that nobody is asking any more
              if (!isCurrent()) return never();
            }
          }
        };

      return new Promise<void>((resolve, reject) => {
        stopSignIn.current = reject;
        signIn({
          signer: whileCurrent(signMessage),
          verifier: whileCurrent(throughServiceFailures(verifier!)),
          getNonce: getNonce && whileCurrent(throughServiceFailures(getNonce)),
          fields,
          onSuccess: (signedIn) => {
            resolve();
            // An error of the app says nothing of the signature, which has passed
            try {
              onSuccess?.(signedIn);
            } catch (error) {
              console.warn('[NovaSiwxWatcher] onSuccess failed:', error);
            }
          },
          // In the same tick as the error `signIn` has left in the store: a render in between took the session as ended
          onError: (message) => {
            const keptSession =
              !!sessionBefore && (isServiceDown || !isSessionOf(sessionBefore, connection, fields.address));
            if (keptSession) {
              useSiwxSessionStore.setState({ status: 'authenticated', session: sessionBefore, error: null });
            } else if (sessionBefore) {
              destroySession();
            } else {
              resetSession();
            }
            console.warn('[NovaSiwxWatcher] SIWX authentication rejected or failed:', message);
            onError?.(message);
            reject(new Error(message));
          },
        }).catch(reject);
      }).finally(() => {
        if (!isCurrent()) return;
        stopSignIn.current = null;
        setIsWaitingForSignature?.(false);
      });
    },
  );

  // What a wallet has to pass before Satellite shows it as connected
  const authorizeConnection = useEffectEvent(
    async (
      connection: {
        address: string;
        chainId: string | number;
        isConnected?: boolean;
        signMessage?: UseSiwxSignInOptions['signer'];
      },
      { isRestore }: { isRestore: boolean },
    ) => {
      if (!verifier) {
        console.warn('[NovaSiwxWatcher] Verifier not provided, skipping SIWX auto-authentication.');
        return;
      }
      const signMessage = connection.signMessage;
      const minimalConnection: MinimalSatelliteConnection = {
        address: String(connection.address),
        chainId: connection.chainId,
        signMessage: signMessage as MinimalSatelliteConnection['signMessage'],
        isConnected: connection.isConnected,
      };
      const fields = fieldsOf(minimalConnection);
      const current = useSiwxSessionStore.getState();
      if (current.status === 'authenticated' && isSessionOf(current.session, minimalConnection, fields.address)) return;
      // Nobody asked for this wallet on a page load: a popup nobody expects is the last thing it should open
      if (isRestore) throw new Error('No session for this wallet');
      if (!signMessage) throw new Error('This wallet cannot sign a message.');

      walletsAtGate.current += 1;
      try {
        await askToSign(minimalConnection, fields, signMessage, true);
      } finally {
        // On the next task: Satellite shows the wallet in the microtasks after the gate, and the render before that is covered
        setTimeout(() => {
          walletsAtGate.current -= 1;
        });
      }
    },
  );

  useEffect(() => {
    const store = satelliteStore?.getState();
    if (!enabled || !store) return;
    store.setConnectionGate((connection, context) =>
      authorizeConnection(connection as Parameters<typeof authorizeConnection>[0], context),
    );
    return () => store.setConnectionGate(undefined);
  }, [enabled, satelliteStore]);

  // Nothing answers into a watcher that is gone, and nothing stays waiting for it: Satellite would stay `connecting`
  useEffect(
    () => () => {
      signInRun.current += 1;
      stopSignIn.current?.(new SupersededSignInError('The sign-in was stopped'));
      stopSignIn.current = null;
      setIsWaitingForSignature?.(false);
    },
    [setIsWaitingForSignature],
  );

  // A wallet that is already connected: it moved to an account or a network its session does not cover, or its session ended
  const checkActiveConnection = useEffectEvent(() => {
    if (!activeConnection?.isConnected || !activeConnection.address) return;

    try {
      const minimalConnection: MinimalSatelliteConnection = {
        address: String(activeConnection.address),
        chainId: activeConnection.chainId,
        signMessage: activeConnection.signMessage as MinimalSatelliteConnection['signMessage'],
        isConnected: activeConnection.isConnected,
      };
      const fields = fieldsOf(minimalConnection);
      const promptKey = sessionScope === 'account' ? accountKey(fields.address) : fields.address;

      const isCovered = isSessionOf(session, minimalConnection, fields.address);
      if (isCovered && status === 'authenticated') {
        signedInAccount.current = promptKey;
        // A wallet that was asked before (and disconnected after a rejection) is asked again when it connects again
        lastPromptedAddress.current = null;
        return;
      }
      // The wallet came back to the account of its session during a prompt for another one, which has nothing left to ask
      if (isCovered && askedAccount.current !== null && askedAccount.current !== promptKey) {
        signInRun.current += 1;
        stopSignIn.current?.(new SupersededSignInError('The wallet came back to its session'));
        askedAccount.current = null;
        lastPromptedAddress.current = null;
        useSiwxSessionStore.setState({ status: 'authenticated', session, error: null });
        return;
      }

      const { connectorType, address } = activeConnection;

      // Its session ended, as with a sign-out: connected means signed in, and nobody asked to sign again
      if (status === 'idle' && !session && signedInAccount.current === promptKey) {
        signedInAccount.current = null;
        disconnect(connectorType);
        return;
      }

      // Another wallet passed the gate, and Satellite is about to show it
      if (walletsAtGate.current > 0) return;
      // Already being asked, or asked in this session lifecycle: no second prompt, and no loop after a rejection
      if (askedAccount.current === promptKey || lastPromptedAddress.current === promptKey) return;
      // Before the key: a verifier that comes later still asks this wallet
      if (!verifier) {
        console.warn('[NovaSiwxWatcher] Verifier not provided, skipping SIWX auto-authentication.');
        return;
      }
      lastPromptedAddress.current = promptKey;

      if (!activeConnection.signMessage) {
        onError?.('This wallet cannot sign a message.');
        disconnect(connectorType);
        return;
      }

      const sessionBefore = session;
      askedAccount.current = promptKey;
      askToSign(minimalConnection, fields, activeConnection.signMessage, false)
        .catch((error: unknown) => {
          if (error instanceof SupersededSignInError) return;
          // Only while it is still the active one: the person may have switched the account or the wallet during the prompt
          if (!isActiveConnection(connectorType, address)) return;
          // A wallet of another address than the session's leaves no session behind, so with `endSessionOnlyAfterDisconnect`
          // its disconnect does not end the session
          if (sessionBefore && !isSessionForAccount(sessionBefore, fields.address)) {
            const rejected = walletKey(connectorType, address);
            pageWallets.current.delete(rejected);
            rejectedWallet.current = rejected;
          }
          disconnect(connectorType);
        })
        .finally(() => {
          if (askedAccount.current === promptKey) askedAccount.current = null;
        });
    } catch (err) {
      console.warn('[NovaSiwxWatcher] Failed to build SIWX fields:', err);
    }
  });

  useEffect(() => {
    if (!enabled || !activeConnection?.isConnected || !activeConnection?.address || !activeConnection?.chainId) {
      return;
    }
    // A prompt at a time: a wallet that moved while another one connects is looked at after it
    if (isConnecting) return;
    // A sign-in that is not this one's, as with `signIn` of `useNovaSiwx`, answers for itself. This one's goes on to the
    // check: the wallet may have moved again during the prompt
    const isSigningIn = status === 'building' || status === 'signing' || status === 'verifying';
    if (isSigningIn && askedAccount.current === null) return;

    checkActiveConnection();
  }, [
    activeConnection?.isConnected,
    activeConnection?.address,
    activeConnection?.chainId,
    activeConnection?.signMessage,
    activeConnection?.connectorType,
    enabled,
    isConnecting,
    status,
    session?.address,
    Boolean(verifier),
  ]);

  return null;
}
