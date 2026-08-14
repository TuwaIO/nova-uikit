/**
 * @fileoverview Custom React hook exposing manual SIWX sign-in and sign-out functionality.
 */

import type { MinimalSatelliteConnection, SatelliteSiwxFieldOptions, UseSiwxSignInOptions } from '@tuwaio/siwx-react';
import { getSatelliteSiwxFields, useSiwx } from '@tuwaio/siwx-react';
import { useCallback } from 'react';

import { useSatelliteConnectStore } from '../satellite';

/**
 * Options for the `useNovaSiwx` hook.
 */
export interface UseNovaSiwxOptions extends SatelliteSiwxFieldOptions {
  /** Optional backend verification callback */
  verifier?: UseSiwxSignInOptions['verifier'];
  /**
   * Optional callback triggered when `signOut` is called.
   * Useful for hitting a `/logout` endpoint to clear the backend cookie.
   */
  destroyer?: () => Promise<void>;
}

/**
 * React hook that exposes SIWX authentication controls within NovaConnect applications.
 *
 * @param options - Default SIWX field options and verifier callback.
 * @returns Object containing `signIn` and `signOut` handlers.
 *
 * @example
 * ```tsx
 * const { signIn, signOut } = useNovaSiwx({ verifier: myVerifier, destroyer: myDestroyer });
 * await signIn();
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
