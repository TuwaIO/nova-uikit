/**
 * @file Headless SIWX auto-authentication watcher for NovaConnect.
 * Monitors active wallet connections and automatically triggers SIWX signing prompts.
 */

import type { MinimalSatelliteConnection, SatelliteSiwxFieldOptions, UseSiwxSignInOptions } from '@tuwaio/siwx-react';
import { getSatelliteSiwxFields, isSessionMatchingConnection, useSiwx, useSiwxSessionStore } from '@tuwaio/siwx-react';
import { useEffect, useEffectEvent, useRef } from 'react';

import { useSatelliteConnectStore } from '../satellite';

/** How long a sign-in waits for a backend that could not answer before it tries again. */
const SERVICE_RETRY_MS = 15_000;

/**
 * Thrown by `getNonce` or `verifier` when your backend could not answer (a 5xx, the network): it says nothing of the wallet
 * or the person, so the wallet stays connected, no session ends, and the sign-in is tried again a little later, with
 * `onError` called once however long that lasts. Anything else they throw counts as a failed sign-in.
 */
export class NovaSiwxServiceError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NovaSiwxServiceError';
  }
}

/**
 * Props of {@link NovaSiwxWatcher} (the `siwx` prop of `NovaConnectProvider`): the sign-in callbacks and the SIWX
 * message fields of `getSatelliteSiwxFields` from `@tuwaio/siwx-react` (`domain`, `uri`, `statement`, and so on).
 */
export interface NovaSiwxWatcherProps extends SatelliteSiwxFieldOptions {
  /** Whether to ask connected wallets to sign in (default: `true`) */
  enabled?: boolean;
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
 * Signs the connected wallet in with SIWX. `NovaConnectProvider` renders it with its `siwx` prop, so apps do not
 * render it themselves. It renders nothing.
 *
 * - When a wallet connects (or the account changes), it asks the wallet to sign a SIWX message once per address
 *   (`signIn` of `useSiwx` from `@tuwaio/siwx-react`: a wallet prompt, then `getNonce` and `verifier` requests to your
 *   backend). A rejected or failed sign-in disconnects that wallet (if it is still the active one) and calls
 *   `onError`. Without `verifier` it logs a warning and does not sign in. A backend that could not answer
 *   ({@link NovaSiwxServiceError}) is no failed sign-in: the wallet stays, no session ends, and it tries again every 15 seconds.
 * - When no wallet is connected, it clears the SIWX session and calls `destroyer`. After a page load it waits until
 *   Satellite Connect has finished reconnecting (`isAutoConnectFinished`), so the session restored by
 *   `@tuwaio/siwx-react` is kept.
 *
 * @param props - See {@link NovaSiwxWatcherProps}.
 * @returns `null`.
 */
export function NovaSiwxWatcher(props: NovaSiwxWatcherProps) {
  const {
    enabled = true,
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
  // `signIn` turns what `getNonce` and `verifier` throw into text: this says what it was
  const serviceFailed = useRef<boolean>(false);
  const serviceFailureTold = useRef<boolean>(false);
  const serviceRetry = useRef<ReturnType<typeof setTimeout> | null>(null);
  const askAgain = useRef<() => void>(() => undefined);

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
    if (!activeConnection?.isConnected || !activeConnection?.address) {
      lastPromptedAddress.current = null;
      // After a page load, `@tuwaio/siwx-react` restores the saved session before Satellite reconnects the wallet:
      // keep the session until auto-connect has finished
      if (isAutoConnectFinished === false) return;
      if (status === 'authenticated' || session) {
        destroySession();
      }
    }
  }, [activeConnection?.isConnected, activeConnection?.address, isAutoConnectFinished, status, session]);

  // Reads the active connection of the latest render, after an asynchronous sign-in
  const isActiveConnection = useEffectEvent(
    (connectorType: string, address: string) =>
      activeConnection?.connectorType === connectorType && activeConnection.address === address,
  );

  // The session of the latest render: `signIn` keeps it while it asks
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

      // If already authenticated for this account and chain, skip prompt (a Solana session signed for `solana:devnet`
      // before the switch to genesis-hash chain IDs still matches)
      if (status === 'authenticated' && isSessionMatchingConnection(session, minimalConnection)) {
        return;
      }

      // If already prompted for this exact address in this session lifecycle, skip prompt
      if (lastPromptedAddress.current === fields.address) {
        return;
      }

      // Lock prompt for this address to prevent loops on user rejection
      lastPromptedAddress.current = fields.address;

      if (!verifier) {
        console.warn('[NovaSiwxWatcher] Verifier not provided, skipping SIWX auto-authentication.');
        return;
      }

      const { connectorType, address } = activeConnection;
      const noteServiceFailure =
        <A extends unknown[], R>(call: (...args: A) => Promise<R>) =>
        async (...args: A): Promise<R> => {
          try {
            return await call(...args);
          } catch (error) {
            // By name: two copies of this package in an app would not share the class
            if ((error as Error | null)?.name === 'NovaSiwxServiceError') serviceFailed.current = true;
            throw error;
          }
        };
      const handleFailure = (err: unknown) => {
        const errMessage = err instanceof Error ? err.message : String(err);

        // A Redis away behind the sign-in said nothing of this wallet, yet it was disconnected, and with it went all the page
        // showed of it. `signIn` has left the store in `error`: the session, or no session, gets its status back
        if (serviceFailed.current) {
          const currentSession = getSession();
          console.warn('[NovaSiwxWatcher] The SIWX backend could not answer, trying again later:', errMessage);
          useSiwxSessionStore.setState({
            status: currentSession ? 'authenticated' : 'idle',
            session: currentSession ?? null,
            error: null,
          });
          if (!serviceFailureTold.current) {
            serviceFailureTold.current = true;
            onError?.(errMessage);
          }
          if (serviceRetry.current) clearTimeout(serviceRetry.current);
          serviceRetry.current = setTimeout(() => {
            serviceRetry.current = null;
            lastPromptedAddress.current = null;
            if (!isSigningLock.current) askAgain.current();
          }, SERVICE_RETRY_MS);
          return;
        }
        serviceFailureTold.current = false;
        console.warn('[NovaSiwxWatcher] SIWX authentication rejected or failed:', errMessage);

        // Disconnect the wallet that was asked to sign in only while it is still the active one (the user may have
        // switched the account or the wallet during the prompt)
        if (connectorType && isActiveConnection(connectorType, address)) {
          disconnect(connectorType);
        }
        resetSession();
        onError?.(errMessage);
      };

      isSigningLock.current = true;
      serviceFailed.current = false;

      signIn({
        signer: activeConnection.signMessage,
        verifier: noteServiceFailure(verifier),
        getNonce: getNonce && noteServiceFailure(getNonce),
        fields,
        onSuccess: (signedIn) => {
          serviceFailureTold.current = false;
          return onSuccess?.(signedIn);
        },
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
    // Through a ref, as an Effect Event cannot name itself. It reads the props of the latest render whenever the timer fires
    askAgain.current = () => signInActiveConnection();
    return () => {
      if (serviceRetry.current) clearTimeout(serviceRetry.current);
    };
  }, []);

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
