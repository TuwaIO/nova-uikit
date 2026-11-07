/**
 * @file The sounds of the wallet connection, from the changes of the Satellite store.
 */

import { useNovaSounds } from '@tuwaio/nova-core';
import { useEffect, useRef } from 'react';

import { useSatelliteConnectStore } from '../satellite';

/**
 * Plays the sounds of the connection: a wallet connected or disconnected, a new error of a connection or of a network switch,
 * and a change of network or of the active wallet. `NovaConnectProvider` renders it with its `sounds` prop. It renders nothing.
 *
 * A wallet restored after a page load makes no sound: nobody asked for anything.
 *
 * @returns `null`.
 */
export function NovaConnectSounds() {
  const play = useNovaSounds();
  const connectorType = useSatelliteConnectStore((store) => store.activeConnection?.connectorType);
  const chainId = useSatelliteConnectStore((store) => store.activeConnection?.chainId);
  const connectionsCount = useSatelliteConnectStore((store) => Object.keys(store.connections ?? {}).length);
  const connectionError = useSatelliteConnectStore((store) => store.connectionError);
  const switchNetworkError = useSatelliteConnectStore((store) => store.switchNetworkError);
  const isAutoConnectFinished = useSatelliteConnectStore((store) => store.isAutoConnectFinished);

  const seen = useRef<{
    connectorType: typeof connectorType;
    chainId: typeof chainId;
    connectionsCount: number;
    connectionError: typeof connectionError;
    switchNetworkError: typeof switchNetworkError;
  } | null>(null);

  useEffect(() => {
    const before = seen.current;
    seen.current = { connectorType, chainId, connectionsCount, connectionError, switchNetworkError };
    if (!before || isAutoConnectFinished === false) return;

    if (
      (connectionError && connectionError !== before.connectionError) ||
      (switchNetworkError && switchNetworkError !== before.switchNetworkError)
    ) {
      play('error');
    } else if (connectionsCount > before.connectionsCount) {
      play('connect');
    } else if (connectionsCount < before.connectionsCount) {
      play('disconnect');
    } else if (connectorType && (connectorType !== before.connectorType || chainId !== before.chainId)) {
      play('networkSwitch');
    }
  }, [connectorType, chainId, connectionsCount, connectionError, switchNetworkError, isAutoConnectFinished, play]);

  return null;
}
