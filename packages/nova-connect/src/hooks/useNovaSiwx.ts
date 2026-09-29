/**
 * @file Custom React hook exposing manual SIWX sign-in and sign-out functionality.
 */

import type { MinimalSatelliteConnection, SatelliteSiwxFieldOptions, UseSiwxSignInOptions } from '@tuwaio/siwx-react';
import { getSatelliteSiwxFields, useSiwx } from '@tuwaio/siwx-react';
import { useCallback } from 'react';

import { useSatelliteConnectStore } from '../satellite';

/**
 * Options of {@link useNovaSiwx}: the verifier, the destroyer and the SIWX message fields of `getSatelliteSiwxFields`
 * from `@tuwaio/siwx-react` (`domain`, `uri`, `statement`, and so on).
 */
export interface UseNovaSiwxOptions extends SatelliteSiwxFieldOptions {
  /** Sends the signed message to your backend for verification (required unless passed to `signIn`) */
  verifier?: UseSiwxSignInOptions['verifier'];
  /** Called by `signOut` after the session is cleared, for example to call a `/logout` endpoint of your backend */
  destroyer?: () => Promise<void>;
}

/**
 * Signs the active wallet in and out with SIWX on demand (for a "Sign in" button; `NovaConnectProvider` with `siwx`
 * does it automatically on connect).
 *
 * - `signIn(connection?, verifier?)` builds the SIWX message for the active connection (or `connection`), asks the
 *   wallet to sign it and sends it to `verifier` (the argument, or `options.verifier`), through `signIn` of `useSiwx`
 *   from `@tuwaio/siwx-react`. It rejects without a connection, without `signMessage` or without a verifier.
 * - `signOut()` clears the SIWX session and then calls `options.destroyer` (a failure is logged).
 *
 * @param options - See {@link UseNovaSiwxOptions}.
 * @returns The `signIn` and `signOut` actions.
 *
 * @example
 * ```tsx
 * import { useNovaSiwx, type UseNovaSiwxOptions } from '@tuwaio/nova-connect/hooks';
 *
 * export function SignInButtons({ verifier }: Pick<UseNovaSiwxOptions, 'verifier'>) {
 *   const { signIn, signOut } = useNovaSiwx({ verifier, statement: 'Sign in to the app.' });
 *
 *   return (
 *     <>
 *       <button onClick={() => signIn()}>Sign in</button>
 *       <button onClick={() => signOut()}>Sign out</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useNovaSiwx(options?: UseNovaSiwxOptions) {
  const activeConnection = useSatelliteConnectStore((s) => s.activeConnection);
  const { signIn, signOut: _signOut } = useSiwx();

  const handleSignIn = useCallback(
    async (overrideConnection?: typeof activeConnection, customVerifier?: UseSiwxSignInOptions['verifier']) => {
      const connection = overrideConnection ?? activeConnection;
      if (!connection?.address || !connection?.chainId) {
        throw new Error('[useNovaSiwx] No active connection available.');
      }
      if (!connection.signMessage) {
        throw new Error('[useNovaSiwx] Connection missing signMessage capability.');
      }

      const verifier = customVerifier ?? options?.verifier;
      if (!verifier) {
        throw new Error('[useNovaSiwx] Verifier callback required to complete SIWX sign in.');
      }

      const minimalConnection: MinimalSatelliteConnection = {
        address: String(connection.address),
        chainId: connection.chainId,
        signMessage: connection.signMessage,
        isConnected: connection.isConnected,
      };

      const fields = getSatelliteSiwxFields(minimalConnection, options);

      return signIn({
        signer: connection.signMessage,
        verifier,
        fields,
      });
    },
    [activeConnection, signIn, options],
  );

  const destroyer = options?.destroyer;

  const signOut = useCallback(async () => {
    _signOut();
    if (destroyer) {
      try {
        await destroyer();
      } catch (err) {
        console.warn('[useNovaSiwx] Failed to execute session destroyer on signOut:', err);
      }
    }
  }, [_signOut, destroyer]);

  return {
    signIn: handleSignIn,
    signOut,
  };
}
