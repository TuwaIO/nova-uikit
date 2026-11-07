/**
 * @file The native balances of one Satellite store, which all the callers of `useWalletNativeBalance` share. The button
 * and the window held a copy each: a refresh in one left the other with the old balance, and each paid for its own request.
 */

import type { NativeBalanceResult } from './useWalletNativeBalance';

/**
 * What is known of the balance of one wallet on one chain.
 *
 * @internal
 */
export type BalanceEntry = {
  /** The balance, or `null` when it is not known. */
  balance: NativeBalanceResult | null;
  /** Whether it is being requested. */
  isLoading: boolean;
  /** Whether the last request failed. */
  isError: boolean;
};

/**
 * The entry of a balance nobody has requested.
 *
 * @internal
 */
export const NO_BALANCE: BalanceEntry = { balance: null, isLoading: false, isError: false };

const FAILED: BalanceEntry = { balance: null, isLoading: false, isError: true };

/**
 * Creates a cache of balances by key.
 *
 * @returns The cache.
 * @internal
 */
export function createBalanceCache() {
  const entries = new Map<string, BalanceEntry>();
  const runs = new Map<string, number>();
  const listeners = new Set<() => void>();

  const write = (key: string, entry?: BalanceEntry) => {
    if (entry) entries.set(key, entry);
    else entries.delete(key);
    listeners.forEach((listener) => listener());
  };

  // Only the latest request of a key may answer: a refresh after a transaction starts while an older one is on its way
  const nextRun = (key: string) => {
    const run = (runs.get(key) ?? 0) + 1;
    runs.set(key, run);
    return run;
  };

  return {
    read: (key: string): BalanceEntry => entries.get(key) ?? NO_BALANCE,

    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        // A balance is kept while something on the page can show it, and not when it is mounted again hours later
        if (listeners.size === 0) {
          entries.clear();
          runs.clear();
        }
      };
    },

    /**
     * Requests a balance, unless the key is already known or on its way, and with `force` always. A failed request
     * clears what was known of it, and it is not repeated until the next `load` with `force`.
     */
    load: (key: string, request: () => Promise<NativeBalanceResult>, force = false) => {
      if (!force && entries.has(key)) return;
      const run = nextRun(key);
      write(key, { balance: entries.get(key)?.balance ?? null, isLoading: true, isError: false });

      const fail = (error: unknown) => {
        console.error(`Failed to fetch native balance for ${key}:`, error);
        if (runs.get(key) === run) write(key, FAILED);
      };

      new Promise<NativeBalanceResult>((resolve) => resolve(request())).then((balance) => {
        // A cached nothing would read as no entry and ask again on every render
        if (!balance) fail(new Error('getBalance returned nothing'));
        else if (runs.get(key) === run) write(key, { balance, isLoading: false, isError: false });
      }, fail);
    },

    /** Forgets a balance, so that the next reader requests it. */
    forget: (key: string) => {
      nextRun(key);
      write(key);
    },
  };
}

const caches = new WeakMap<object, ReturnType<typeof createBalanceCache>>();

/**
 * The cache of a Satellite store.
 *
 * @param store - The store, as `SatelliteStoreContext` gives it.
 * @returns Its cache.
 * @internal
 */
export function balanceCacheOf(store: object) {
  let cache = caches.get(store);
  if (!cache) {
    cache = createBalanceCache();
    caches.set(store, cache);
  }
  return cache;
}
