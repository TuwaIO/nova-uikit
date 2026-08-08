/**
 * @fileoverview Headless SIWX auto-authentication watcher for NovaConnect.
 * Monitors active wallet connections and automatically triggers SIWX signing prompts.
 */

import type { MinimalSatelliteConnection, SatelliteSiwxFieldOptions, UseSiwxSignInOptions } from '@tuwaio/siwx-react';
import { getSatelliteSiwxFields, useSiwx, useSiwxSessionStore } from '@tuwaio/siwx-react';
import { useEffect, useRef } from 'react';

import { useSatelliteConnectStore } from '../satellite';

/**
 * Props for NovaSiwxWatcher component.
 */
export interface NovaSiwxWatcherProps extends SatelliteSiwxFieldOptions {
  /** Enables or disables automatic SIWX authentication prompt (defaults to true) */
  enabled?: boolean;
  /** Optional backend verification callback function */
  verifier?: UseSiwxSignInOptions['verifier'];
  /** Optional callback triggered immediately after successful SIWX authentication */
  onSuccess?: UseSiwxSignInOptions['onSuccess'];
  /** Optional callback triggered if SIWX signing or verification fails */
  onError?: UseSiwxSignInOptions['onError'];
}

/**
 * Headless React component rendered inside `NovaConnectProvider`.
 * Automatically prompts the user for SIWX authentication whenever a new wallet connects.
 * Uses a `lastPromptedAddress` ref lock to prevent infinite retry loops on prompt rejection.
 */
export function NovaSiwxWatcher(props: NovaSiwxWatcherProps) {
  const { enabled = true, verifier, domain, uri, statement, onSuccess, onError } = props;
  const activeConnection = useSatelliteConnectStore((s) => s.activeConnection);
  const disconnect = useSatelliteConnectStore((s) => s.disconnect);
  const { signIn } = useSiwx();
  const session = useSiwxSessionStore((s) => s.session);
  const status = useSiwxSessionStore((s) => s.status);
  const resetSession = useSiwxSessionStore((s) => s.reset);

  const lastPromptedAddress = useRef<string | null>(null);

  useEffect(() => {
    if (!activeConnection?.isConnected || !activeConnection?.address) {
      lastPromptedAddress.current = null;
    }
  }, [activeConnection?.isConnected, activeConnection?.address]);

  useEffect(() => {
    if (!enabled || !activeConnection?.isConnected || !activeConnection?.address || !activeConnection?.chainId) {
      return;
    }

    if (!activeConnection.signMessage) {
      return;
    }

    if (status === 'building' || status === 'signing' || status === 'verifying') {
      return;
    }

    try {
      const minimalConnection: MinimalSatelliteConnection = {
        address: String(activeConnection.address),
        chainId: activeConnection.chainId,
        signMessage: activeConnection.signMessage,
        isConnected: activeConnection.isConnected,
      };

      const fields = getSatelliteSiwxFields(minimalConnection, { domain, uri, statement });

      // If already authenticated for this exact CAIP-10 address, skip prompt
      if (status === 'authenticated' && session?.address === fields.address) {
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

      const handleFailure = (err: unknown) => {
        const errMessage = err instanceof Error ? err.message : String(err);
        console.warn('[NovaSiwxWatcher] SIWX authentication rejected or failed:', errMessage);
        if (activeConnection.connectorType) {
          disconnect(activeConnection.connectorType);
        }
        resetSession();
        onError?.(errMessage);
      };

      signIn({
        signer: activeConnection.signMessage,
        verifier,
        fields,
        onSuccess,
        onError: handleFailure,
      }).catch(handleFailure);
    } catch (err) {
      console.warn('[NovaSiwxWatcher] Failed to build SIWX fields:', err);
    }
  }, [
    activeConnection?.isConnected,
    activeConnection?.address,
    activeConnection?.chainId,
    activeConnection?.signMessage,
    activeConnection?.connectorType,
    disconnect,
    enabled,
    status,
    session?.address,
    verifier,
    domain,
    uri,
    statement,
    signIn,
    resetSession,
    onError,
  ]);

  return null;
}
