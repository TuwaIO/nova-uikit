import { lastConnectedConnectorHelpers } from '@tuwaio/orbit-core';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { useSatelliteConnectStore } from '../satellite';

/**
 * How long, in milliseconds, {@link useWalletRestoring} waits at most for Satellite Connect to restore the last
 * wallet. The restore waits 300 ms, then up to 1.5 s for the wallet to be listed, then reconnects it silently; an app
 * that never restores (no `initializeAutoConnect`) is not left waiting longer than this.
 */
export const WALLET_RESTORE_WAIT_MS = 5000;

// Nothing to subscribe to: the storage is read when the component renders, and the store renders it again when the
// restore ends
const subscribeToNothing = () => () => undefined;
const readIsLastConnectionStored = () => lastConnectedConnectorHelpers.getLastConnectedConnector() !== undefined;
// The server has no storage, and the hydration of the browser renders what the server did: not known there
const unknownOnServer = () => null;

/**
 * Whether Satellite Connect may still be restoring the last wallet after a page load, so that the interface shows a
 * neutral state instead of the connect prompt, which the restored wallet would replace a moment later.
 *
 * It is `true` on the server and during hydration (the storage of the browser is not read there), then only while a
 * last connection is stored (`orbit-core:lastConnectedConnector`, in `sessionStorage` or `localStorage`) and the
 * restore has not finished (`isAutoConnectFinished` of the Satellite Connect store), for at most
 * {@link WALLET_RESTORE_WAIT_MS} after mounting. It is never `true` with a connected wallet.
 *
 * Side effects: reads the last connection from the storage of the browser when it renders (through
 * `lastConnectedConnectorHelpers` of `@tuwaio/orbit-core`, which writes nothing) and starts one timer after mounting.
 *
 * @param isConnected - Whether a wallet is connected.
 * @returns `true` while the last wallet may still be restored.
 *
 * @example
 * ```tsx
 * import { useWalletRestoring } from '@tuwaio/nova-connect/hooks';
 * import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
 *
 * function WalletStatus() {
 *   const isConnected = useSatelliteConnectStore((store) => Boolean(store.activeConnection?.isConnected));
 *   const isRestoring = useWalletRestoring(isConnected);
 *   return <span>{isRestoring ? 'Restoring…' : isConnected ? 'Connected' : 'Not connected'}</span>;
 * }
 * ```
 */
export function useWalletRestoring(isConnected: boolean): boolean {
  const isAutoConnectFinished = useSatelliteConnectStore((store) => store.isAutoConnectFinished);
  const isLastConnectionStored = useSyncExternalStore(subscribeToNothing, readIsLastConnectionStored, unknownOnServer);
  const [isWaitOver, setIsWaitOver] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsWaitOver(true), WALLET_RESTORE_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isConnected || isAutoConnectFinished || isWaitOver) return false;
  return isLastConnectionStored !== false;
}
