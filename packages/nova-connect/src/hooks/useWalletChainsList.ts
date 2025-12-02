import { ConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
import { useEffect, useState } from 'react';

import { InitialChains } from '../types';
import { getChainsListByConnectorTypeAsync, getWalletChains } from '../utils';

/**
 * Props for the useWalletChainsList hook
 */
interface UseWalletChainsListProps extends InitialChains {
  /** The active connection object from the store */
  activeConnection: any; // Using any to avoid complex store type imports, similar to usage in components
}

/**
 * Custom hook to asynchronously fetch the list of available chains for the active wallet.
 * Handles the loading state and updates when the active connection or configuration changes.
 *
 * @param props - Hook properties
 * @returns Object containing the chains list and loading state
 */
export function useWalletChainsList({ activeConnection, appChains, solanaRPCUrls }: UseWalletChainsListProps) {
  const [chainsList, setChainsList] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchChains = async () => {
      setIsLoading(true);
      try {
        if (!activeConnection) {
          const list = await getChainsListByConnectorTypeAsync({
            connectorType: `${OrbitAdapter.EVM}:not-connected` as ConnectorType,
            appChains,
            solanaRPCUrls,
            chains: [],
          });
          if (isMounted) {
            setChainsList(list);
          }
          return;
        }

        // Safely extract wallet chains using shared utility
        const walletChains = getWalletChains(activeConnection);

        const list = await getChainsListByConnectorTypeAsync({
          connectorType: (activeConnection as { connectorType: ConnectorType }).connectorType,
          appChains,
          solanaRPCUrls,
          chains: walletChains,
        });

        if (isMounted) {
          setChainsList(list);
        }
      } catch (error) {
        console.error('Failed to fetch chains list:', error);
        if (isMounted) {
          setChainsList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchChains();

    return () => {
      isMounted = false;
    };
  }, [activeConnection, appChains, solanaRPCUrls]);

  return { chainsList, isLoading };
}
