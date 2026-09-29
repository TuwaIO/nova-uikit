import { ConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
import type { BaseConnector } from '@tuwaio/satellite-core';
import { useMemo } from 'react';

import { InitialChains } from '../types';
import { getChainsListByConnectorType, getWalletChains } from '../utils';

/**
 * Props of {@link useWalletChainsList}.
 */
export interface UseWalletChainsListProps extends InitialChains {
  /** The active connection of the Satellite store, or `undefined` when no wallet is connected */
  activeConnection: Pick<BaseConnector, 'connectorType'> | undefined;
}

/**
 * Returns the chains of the app for the network of the active connection (see `getChainsListByConnectorType`): the EVM
 * chain IDs of `appChains`, or the Solana clusters of `solanaRPCUrls` that the connected wallet supports. Without a
 * connection, the EVM chains.
 *
 * @param props - See {@link UseWalletChainsListProps}.
 * @returns `chainsList`, recomputed when the connection or the chain configuration changes.
 *
 * @example
 * ```tsx
 * import { useWalletChainsList } from '@tuwaio/nova-connect/hooks';
 * import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
 * import { mainnet, polygon } from 'viem/chains';
 *
 * const appChains = [mainnet, polygon] as const;
 *
 * export function ChainCount() {
 *   const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
 *   const { chainsList } = useWalletChainsList({ activeConnection, appChains });
 *   return <span>{chainsList.length} chains</span>;
 * }
 * ```
 */
export function useWalletChainsList({ activeConnection, appChains, solanaRPCUrls }: UseWalletChainsListProps): {
  /** Chain IDs (EVM) or cluster monikers (Solana) */
  chainsList: (string | number)[];
} {
  const chainsList = useMemo(
    () =>
      getChainsListByConnectorType({
        connectorType: activeConnection
          ? activeConnection.connectorType
          : (`${OrbitAdapter.EVM}:not-connected` as ConnectorType),
        appChains,
        solanaRPCUrls,
        chains: getWalletChains(activeConnection),
      }),
    [activeConnection, appChains, solanaRPCUrls],
  );

  return { chainsList };
}
