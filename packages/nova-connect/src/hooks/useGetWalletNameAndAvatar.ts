import { getAdapterFromConnectorType, shortAddress } from '@tuwaio/orbit-core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSatelliteConnectStore } from '../satellite';

const MAX_AUTO_RETRIES = 5;

type NameLookup = { name: string | null; avatar: string | null };
type NameResolver = {
  getName?: (address: string) => Promise<string | null | undefined>;
  getAvatar?: (name: string) => Promise<string | null | undefined>;
};

// One lookup per wallet of an adapter, whichever of the button, the window and the list of wallets asks: each paid for its
// own, on every page load and with the window closed. A name is kept for the life of the page, a failure is not
const nameLookups = new WeakMap<object, Map<string, Promise<NameLookup>>>();

const lookUpName = (adapter: NameResolver, address: string): Promise<NameLookup> => {
  let lookups = nameLookups.get(adapter);
  if (!lookups) {
    lookups = new Map();
    nameLookups.set(adapter, lookups);
  }
  const known = lookups.get(address);
  if (known) return known;

  const lookup = (async () => {
    const name = (await adapter.getName?.(address)) ?? null;
    if (!name) return { name: null, avatar: null };
    try {
      return { name, avatar: (await adapter.getAvatar?.(name)) ?? null };
    } catch (avatarError) {
      // The name is there, which is what counts
      console.warn('Failed to fetch avatar:', avatarError);
      return { name, avatar: null };
    }
  })();
  lookups.set(address, lookup);
  lookup.catch(() => lookups.delete(address));
  return lookup;
};

/**
 * Result of {@link useGetWalletNameAndAvatar}.
 */
export interface WalletNameAndAvatarData {
  /** The resolved name from the Name Service (e.g., ENS, like "alice.eth"), or null if not found. */
  ensName: string | null;
  /** The URL of the avatar associated with the name, or null if not found. */
  ensAvatar: string | null;
  /** True while the name service data is being fetched. */
  isLoading: boolean;
  /** A truncated version of the name for display, or the abbreviated address if no name. */
  ensNameAbbreviated: string | undefined;
  /** Error message if the name resolution failed. */
  error: string | null;
  /** Function to retry the name resolution manually. */
  retry: () => void;
}

/**
 * Options of {@link useGetWalletNameAndAvatar}.
 */
export interface UseGetWalletNameAndAvatarOptions {
  /** Number of characters to show on each side when abbreviating (default: 12) */
  abbreviateSymbols?: number;
  /** Maximum length before abbreviation is applied (default: 30) */
  maxNameLength?: number;
  /** Whether to automatically retry on failure, up to 5 times (default: false) */
  autoRetry?: boolean;
  /** Delay of the first retry in milliseconds, which doubles with each one (default: 3000) */
  retryDelay?: number;
}

/**
 * Resolves the name (ENS on EVM, SNS on Solana) and its avatar for the active wallet with `getName` and `getAvatar`
 * of its Satellite adapter, which send requests to the name service. All the callers share one lookup per wallet, kept
 * for the life of the page; a failed one is not kept. It reads again when the address or the adapter changes, and drops
 * the previous answer. Without a name it returns the shortened address.
 *
 * @param options - See {@link UseGetWalletNameAndAvatarOptions}.
 * @returns See {@link WalletNameAndAvatarData}.
 *
 * @example
 * ```tsx
 * import { useGetWalletNameAndAvatar } from '@tuwaio/nova-connect/hooks';
 *
 * export function WalletInfo() {
 *   const { ensAvatar, ensNameAbbreviated, isLoading, error, retry } = useGetWalletNameAndAvatar({});
 *
 *   if (isLoading) return <p>Resolving name...</p>;
 *   if (error) return <button onClick={retry}>Retry</button>;
 *
 *   return (
 *     <p>
 *       {ensAvatar && <img src={ensAvatar} alt="" width={24} height={24} />}
 *       {ensNameAbbreviated}
 *     </p>
 *   );
 * }
 * ```
 */
export function useGetWalletNameAndAvatar(options: UseGetWalletNameAndAvatarOptions): WalletNameAndAvatarData {
  const { abbreviateSymbols = 12, maxNameLength = 30, autoRetry = false, retryDelay = 3000 } = options;

  // Store state selectors - memoized for performance
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);

  // Derived values
  const walletAddress = activeConnection?.address;
  const connectorType = activeConnection?.connectorType;

  const foundAdapter = connectorType ? getAdapter(getAdapterFromConnectorType(connectorType)) : null;

  // State variables
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and retry functionality
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const retriesRef = useRef(0);

  // Adapter capabilities
  // We use simpler derivation here. If foundAdapter changes, these booleans update.
  // Since they are primitives, they are stable for dependency arrays.
  const hasNameResolver = !!(foundAdapter && 'getName' in foundAdapter && typeof foundAdapter.getName === 'function');

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current !== null) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Main fetch function
  const fetchNameData = useCallback(
    async function fetchNameDataInner() {
      cleanup();

      // Exit conditions
      if (!walletAddress || !foundAdapter || !hasNameResolver) {
        setEnsName(null);
        setEnsAvatar(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // Start loading
      setIsLoading(true);
      setError(null);
      setEnsName(null);
      setEnsAvatar(null);

      try {
        // Check if request was aborted
        if (signal.aborted) return;

        const { name, avatar } = await lookUpName(foundAdapter, walletAddress);

        if (signal.aborted) return;

        setEnsName(name);
        setEnsAvatar(avatar);
      } catch (error) {
        if (signal.aborted) return;

        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch name service data';
        console.error('Failed to fetch name service data:', error);

        setError(errorMessage);
        setEnsName(null);
        setEnsAvatar(null);

        // Auto retry if enabled, a few times and ever later: a name service that stays down cost 1200 lookups an hour
        if (autoRetry && retriesRef.current < MAX_AUTO_RETRIES) {
          const wait = retryDelay * 2 ** retriesRef.current;
          retriesRef.current += 1;
          retryTimeoutRef.current = setTimeout(() => {
            fetchNameDataInner();
          }, wait) as unknown as number;
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [walletAddress, foundAdapter, hasNameResolver, autoRetry, retryDelay, cleanup],
  );

  // Manual retry function
  const retry = useCallback(() => {
    setError(null);
    retriesRef.current = 0;
    fetchNameData();
  }, [fetchNameData]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    retriesRef.current = 0;
    fetchNameData();
    return cleanup;
  }, [fetchNameData, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const ensNameAbbreviated = ensName
    ? ensName.length > maxNameLength
      ? shortAddress(ensName, abbreviateSymbols, abbreviateSymbols)
      : ensName
    : walletAddress
      ? shortAddress(walletAddress, abbreviateSymbols, abbreviateSymbols)
      : undefined;

  return {
    ensName,
    ensAvatar,
    isLoading,
    ensNameAbbreviated,
    error,
    retry,
  };
}
