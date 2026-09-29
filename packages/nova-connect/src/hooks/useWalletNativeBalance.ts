import { getAdapterFromConnectorType } from '@tuwaio/orbit-core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSatelliteConnectStore } from '../satellite';

/**
 * A native balance returned by `getBalance` of a Satellite adapter.
 */
export interface NativeBalanceResult {
  /** The balance formatted with the decimals of the token (for example `1.5`) */
  value: string;
  /** The token symbol (for example `ETH`) */
  symbol: string;
}

/**
 * The balance of {@link useWalletNativeBalance}, or `null` when it is not known.
 */
export type UseWalletNativeBalanceState = NativeBalanceResult | null;

// Type for the local cache: "walletAddress-chainId" -> { value, symbol }.
type BalanceCache = Record<string, NativeBalanceResult>;

/**
 * Result of {@link useWalletNativeBalance}.
 */
export interface UseWalletNativeBalanceData {
  /** The balance, or `null` without a wallet, without `getBalance` or before it resolves */
  balance: UseWalletNativeBalanceState;
  /** Whether the balance is being requested */
  isLoading: boolean;
  /** Requests the balance again (a failed refresh clears the kept balance) */
  refetch: () => void;
}

/**
 * Returns the native balance of the active wallet on its chain, from `getBalance` of its Satellite adapter (an RPC
 * request). Each balance is kept in memory for the address and chain while the component is mounted, so switching
 * back does not request it again; `refetch` requests it again.
 *
 * @returns See {@link UseWalletNativeBalanceData}.
 *
 * @example
 * ```tsx
 * import { useWalletNativeBalance } from '@tuwaio/nova-connect/hooks';
 *
 * export function NativeBalance() {
 *   const { balance, isLoading, refetch } = useWalletNativeBalance();
 *
 *   if (isLoading) return <p>Loading balance...</p>;
 *
 *   return (
 *     <p>
 *       {balance ? `${balance.value} ${balance.symbol}` : 'n/a'} <button onClick={refetch}>Refresh</button>
 *     </p>
 *   );
 * }
 * ```
 */
export function useWalletNativeBalance(): UseWalletNativeBalanceData {
  // --- 1. STATE & CACHE SETUP ---

  // Local cache storage. Keys combine wallet address and chain ID.
  const [balanceCache, setBalanceCache] = useState<BalanceCache>({});

  // Local loading state, managed alongside the cache check.
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Track the current fetch operation to prevent race conditions
  const fetchOperationRef = useRef<string | null>(null);

  // Store state selectors - memoized for performance
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);

  // --- 2. COMPUTED INPUTS ---

  // Create the unique key for cache lookups: "address-chainId".
  // Create the unique key for cache lookups: "address-chainId".
  const cacheKey =
    activeConnection?.chainId && activeConnection?.address
      ? `${activeConnection.address}-${activeConnection.chainId}`
      : null;

  // Find the actual adapter object from the adapter map.
  // Find the actual adapter object from the adapter map.
  const foundAdapter = activeConnection?.connectorType
    ? getAdapter(getAdapterFromConnectorType(activeConnection.connectorType))
    : null;

  // Check if the adapter has balance functionality
  // Check if the adapter has balance functionality
  const hasBalanceResolver =
    foundAdapter && 'getBalance' in foundAdapter && typeof foundAdapter.getBalance === 'function';

  // --- 3. BALANCE FETCHING LOGIC ---

  const fetchBalance = useCallback(
    async (forceRefresh = false) => {
      // Exit early if essential data is missing (not connected).
      if (
        !activeConnection?.address ||
        !foundAdapter ||
        !activeConnection?.chainId ||
        !cacheKey ||
        !hasBalanceResolver
      ) {
        setIsLoading(false);
        return;
      }

      // Set the current operation ID to prevent race conditions
      const operationId = `${cacheKey}-${Date.now()}`;
      fetchOperationRef.current = operationId;

      // Check cache unless forcing a refresh
      if (!forceRefresh) {
        const cachedBalance = balanceCache[cacheKey];
        if (cachedBalance) {
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);

      try {
        // Call the adapter's getBalance method
        const balanceResult: NativeBalanceResult = await foundAdapter.getBalance(
          activeConnection.address,
          activeConnection.chainId,
        );

        // Only update if this operation is still the latest one
        if (fetchOperationRef.current === operationId) {
          setBalanceCache((prevCache) => ({
            ...prevCache,
            [cacheKey]: balanceResult,
          }));
        }
      } catch (error) {
        console.error(`Failed to fetch native balance for ${cacheKey}:`, error);

        // Optionally clear cache entry on error (if you want to retry on next call)
        if (forceRefresh && fetchOperationRef.current === operationId) {
          setBalanceCache((prevCache) => {
            const newCache = { ...prevCache };
            delete newCache[cacheKey];
            return newCache;
          });
        }
      } finally {
        // Only update loading state if this operation is still current
        if (fetchOperationRef.current === operationId) {
          setIsLoading(false);
        }
      }
    },
    [activeConnection, foundAdapter, cacheKey, hasBalanceResolver, balanceCache],
  );

  // Memoized refetch function that forces a refresh
  const refetch = useCallback(() => {
    fetchBalance(true);
  }, [fetchBalance]);

  // --- 4. EFFECT FOR INITIAL FETCH ---

  useEffect(() => {
    // Only fetch if we have all required data and no cached result
    if (cacheKey && hasBalanceResolver && !balanceCache[cacheKey]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBalance(false);
    } else if (!cacheKey || !hasBalanceResolver) {
      // Reset loading state if we can't fetch

      setIsLoading(false);
    }
  }, [cacheKey, hasBalanceResolver, balanceCache, fetchBalance]);

  // --- 5. CLEANUP EFFECT ---

  useEffect(() => {
    return () => {
      // Cancel any ongoing operations when component unmounts
      fetchOperationRef.current = null;
    };
  }, []);

  // --- 6. RETURNED DATA ---

  // The definitive balance is always derived from the cache based on the current key.
  // The definitive balance is always derived from the cache based on the current key.
  const balance: UseWalletNativeBalanceState = cacheKey ? balanceCache[cacheKey] || null : null;

  // Return the fetched balance data and the loading status.
  return {
    balance, // { value: "1.5", symbol: "ETH" } or null
    isLoading,
    refetch,
  };
}
