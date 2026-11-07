import { getAdapterFromConnectorType } from '@tuwaio/orbit-core';
import { useCallback, useContext, useEffect, useSyncExternalStore } from 'react';

import { SatelliteStoreContext, useSatelliteConnectStore } from '../satellite';
import { balanceCacheOf, NO_BALANCE } from './walletBalanceCache';

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

/**
 * Options of {@link useWalletNativeBalance}.
 */
export interface UseWalletNativeBalanceOptions {
  /**
   * Whether this caller needs the balance (default: `true`). When `false` it sends no request of its own, and `refetch`
   * only forgets the balance, so that the next caller that needs it asks for the new one.
   */
  enabled?: boolean;
}

/**
 * Result of {@link useWalletNativeBalance}.
 */
export interface UseWalletNativeBalanceData {
  /** The balance, or `null` without a wallet, without `getBalance`, before it resolves or after a failed request */
  balance: UseWalletNativeBalanceState;
  /** Whether the balance is being requested */
  isLoading: boolean;
  /** Whether the last request failed, which tells a balance that cannot be read from one that is not known yet */
  isError: boolean;
  /** Requests the balance again (a failed refresh clears the kept balance) */
  refetch: () => void;
}

/**
 * Returns the native balance of the active wallet on its chain, from `getBalance` of its Satellite adapter (an RPC
 * request). All the callers on a Satellite store share one balance and one request. It is kept in memory for the address
 * and chain while something on the page reads it, so switching back does not request it again; `refetch` requests it
 * again. A request that fails is not repeated until `refetch`, or until the address or chain changes.
 *
 * @param options - See {@link UseWalletNativeBalanceOptions}.
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
export function useWalletNativeBalance({
  enabled = true,
}: UseWalletNativeBalanceOptions = {}): UseWalletNativeBalanceData {
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);
  const store = useContext(SatelliteStoreContext);
  const cache = balanceCacheOf(store as object);

  const address = activeConnection?.address;
  const chainId = activeConnection?.chainId;
  const connectorType = activeConnection?.connectorType;
  const foundAdapter = connectorType ? getAdapter(getAdapterFromConnectorType(connectorType)) : null;

  // What identifies a balance, when it can be read at all
  const cacheKey =
    address && chainId && foundAdapter && typeof foundAdapter.getBalance === 'function'
      ? `${address}-${chainId}`
      : null;

  const entry = useSyncExternalStore(
    cache.subscribe,
    () => (cacheKey ? cache.read(cacheKey) : NO_BALANCE),
    () => NO_BALANCE,
  );

  const load = useCallback(
    (force: boolean) => {
      if (cacheKey) cache.load(cacheKey, () => foundAdapter!.getBalance(address!, chainId!), force);
    },
    [cache, cacheKey, foundAdapter, address, chainId],
  );

  // Asks when nothing is known of it: at the start, and after a caller without need of it has forgotten it
  useEffect(() => {
    if (enabled && entry === NO_BALANCE) load(false);
  }, [enabled, entry, load]);

  const refetch = useCallback(() => {
    if (enabled) load(true);
    else if (cacheKey) cache.forget(cacheKey);
  }, [enabled, load, cache, cacheKey]);

  return { balance: entry.balance, isLoading: entry.isLoading, isError: entry.isError, refetch };
}
