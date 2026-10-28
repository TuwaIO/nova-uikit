/**
 * @file Headless SIWX auto-authentication watcher for NovaConnect.
 * Monitors active wallet connections and automatically triggers SIWX signing prompts.
 */

import type { MinimalSatelliteConnection, SatelliteSiwxFieldOptions, UseSiwxSignInOptions } from '@tuwaio/siwx-react';
import { getSatelliteSiwxFields, isSessionMatchingConnection, useSiwx, useSiwxSessionStore } from '@tuwaio/siwx-react';
import { useEffect, useEffectEvent, useRef } from 'react';

import { useSatelliteConnectStore } from '../satellite';
import { accountKey, isSessionForAccount } from '../utils/siwxAccount';

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
   * A rejected sign-in disconnects the wallet that was asked. When the session belongs to another account (another
   * address or namespace; with `'chain'`, also the same address on another chain), the session is kept, so Satellite
   * Connect falls back to the wallet of the session without asking it again (a second wallet connected for a payment,
   * say). For the account of the session, or without a session, the session is cleared as well. With `'chain'`, when
   * the wallet of the session rejects the sign-in on another network, that wallet is disconnected and the session ends
   * as soon as no wallet is connected.
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
  /** Fetches the nonce of the SIWX message from your backend */
  getNonce?: () => Promise<string>;
  /** Verifies the signed message on your backend (required for the sign-in) */
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
 * Signs the connected wallet in with SIWX. `NovaConnectProvider` renders it with its `siwx` prop, so apps do not
 * render it themselves. It renders nothing.
 *
 * - When a wallet connects (or the account changes), it asks the wallet to sign a SIWX message once per address
 *   (`signIn` of `useSiwx` from `@tuwaio/siwx-react`: a wallet prompt, then `getNonce` and `verifier` requests to your
 *   backend). A rejected or failed sign-in disconnects that wallet (if it is still the active one) and calls
 *   `onError`. It also clears the SIWX session, unless the session belongs to another account (see `sessionScope`):
 *   then the session keeps its `authenticated` status (which `@tuwaio/siwx-react` saves to `localStorage` again) and
 *   Satellite Connect falls back to another wallet, such as the one of the session, which is not asked again. Without
 *   `verifier` it logs a warning and does not sign in.
 * - With the default `sessionScope` (`'chain'`), a network or cluster switch also asks the wallet to sign in again;
 *   with `'account'`, a switch of the same account keeps the session and asks nothing.
 * - When no wallet is connected, it clears the SIWX session and calls `destroyer`. After a page load it waits until
 *   Satellite Connect has finished reconnecting (`isAutoConnectFinished`), so the session restored by
 *   `@tuwaio/siwx-react` is kept. With `endSessionOnlyAfterDisconnect`, it does so only once a wallet that this page
 *   connected or restored has been disconnected.
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
  // `undefined` with `@tuwaio/satellite-core` before 0.6.1, which has no such flag
  const isAutoConnectFinished = useSatelliteConnectStore((s) => s.isAutoConnectFinished);
  const { signIn } = useSiwx();
  const session = useSiwxSessionStore((s) => s.session);
  const status = useSiwxSessionStore((s) => s.status);
  const resetSession = useSiwxSessionStore((s) => s.reset);

  const lastPromptedAddress = useRef<string | null>(null);
  const isSigningLock = useRef<boolean>(false);
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

  // The session of the latest render: `signIn` keeps it while it asks another wallet
  const getSession = useEffectEvent(() => session);

  const signInActiveConnection = useEffectEvent(() => {
    if (!activeConnection?.isConnected || !activeConnection.address || !activeConnection.signMessage) return;

    try {
      const minimalConnection: MinimalSatelliteConnection = {
        address: String(activeConnection.address),
        chainId: activeConnection.chainId,
        signMessage: activeConnection.signMessage,
        isConnected: activeConnection.isConnected,
      };

      const fields = getSatelliteSiwxFields(minimalConnection, {
        domain,
        uri,
        statement,
        expirationTime,
        expirationSeconds,
        notBefore,
        requestId,
        resources,
      });

      const byAccount = sessionScope === 'account';
      // Whether a session belongs to the account asked to sign in: the same namespace and address with 'account', and
      // also the same chain with 'chain' (a Solana session signed for `solana:devnet` before the switch to
      // genesis-hash chain IDs still matches)
      const isSessionOfConnection = (candidate: typeof session) =>
        byAccount
          ? isSessionForAccount(candidate, fields.address)
          : isSessionMatchingConnection(candidate, minimalConnection);

      // If already authenticated for this account (and chain, unless the session belongs to the account), skip prompt
      if (status === 'authenticated' && isSessionOfConnection(session)) {
        // A wallet that was asked before (and disconnected after a rejection) is asked again when it connects again
        lastPromptedAddress.current = null;
        return;
      }

      // If already prompted for this exact address (or account) in this session lifecycle, skip prompt
      const promptKey = byAccount ? accountKey(fields.address) : fields.address;
      if (lastPromptedAddress.current === promptKey) {
        return;
      }

      // Lock prompt for this address to prevent loops on user rejection
      lastPromptedAddress.current = promptKey;

      if (!verifier) {
        console.warn('[NovaSiwxWatcher] Verifier not provided, skipping SIWX auto-authentication.');
        return;
      }

      const { connectorType, address } = activeConnection;
      const handleFailure = (err: unknown) => {
        const errMessage = err instanceof Error ? err.message : String(err);
        console.warn('[NovaSiwxWatcher] SIWX authentication rejected or failed:', errMessage);

        // The session of another account (with 'chain', also the account on another chain) stays: Satellite falls back
        // to another wallet, such as the one of the session, which is not asked again
        const currentSession = getSession();
        const keepSession = !!currentSession && !isSessionOfConnection(currentSession);

        // Disconnect the wallet that was asked to sign in only while it is still the active one (the user may have
        // switched the account or the wallet during the prompt)
        if (connectorType && isActiveConnection(connectorType, address)) {
          // A wallet of another address than the session's leaves no session behind, so with
          // `endSessionOnlyAfterDisconnect` its disconnect does not end the session
          if (keepSession && !isSessionForAccount(currentSession, fields.address)) {
            const rejected = walletKey(connectorType, address);
            pageWallets.current.delete(rejected);
            rejectedWallet.current = rejected;
          }
          disconnect(connectorType);
        }

        if (keepSession) {
          // `signIn` has left the store in `error`, which would ask the wallet of the session again and drop the saved
          // session, so the session gets its `authenticated` status back
          useSiwxSessionStore.setState({ status: 'authenticated', session: currentSession, error: null });
        } else {
          resetSession();
        }
        onError?.(errMessage);
      };

      isSigningLock.current = true;

      signIn({
        signer: activeConnection.signMessage,
        verifier,
        getNonce,
        fields,
        onSuccess,
        onError: handleFailure,
      })
        .catch(handleFailure)
        .finally(() => {
          isSigningLock.current = false;
        });
    } catch (err) {
      console.warn('[NovaSiwxWatcher] Failed to build SIWX fields:', err);
    }
  });

  useEffect(() => {
    if (!enabled || !activeConnection?.isConnected || !activeConnection?.address || !activeConnection?.chainId) {
      return;
    }

    if (!activeConnection.signMessage) {
      return;
    }

    if (isSigningLock.current) {
      return;
    }

    if (status === 'building' || status === 'signing' || status === 'verifying') {
      return;
    }

    signInActiveConnection();
  }, [
    activeConnection?.isConnected,
    activeConnection?.address,
    activeConnection?.chainId,
    activeConnection?.signMessage,
    activeConnection?.connectorType,
    enabled,
    status,
    session?.address,
  ]);

  return null;
}
