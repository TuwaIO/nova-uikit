import type { OrbitAdapter } from '@tuwaio/orbit-core';
import { useMemo, useSyncExternalStore } from 'react';

import { type Connector, useSatelliteConnectStore } from '../satellite';

/**
 * Options of {@link useWalletConnectors}.
 */
export interface UseWalletConnectorsParams {
  /** Whether to read and follow the wallets (default `true`); `false` returns `undefined` and subscribes to nothing */
  enabled?: boolean;
}

type WalletConnectors = Partial<Record<OrbitAdapter, Connector[]>>;

// `watchConnectors` of the Satellite store: `@tuwaio/satellite-core` versions without it are still supported
type WatchConnectors = (onChange: () => void) => () => void;

const noSubscription = () => undefined;

// Ids of the wallet objects: the store returns a new record and new arrays on every `getConnectors()` call, but the same
// wagmi connectors and Wallet Standard wallets while nothing changes
const walletIds = new WeakMap<object, number>();
let lastWalletId = 0;

const walletId = (wallet: unknown): string => {
  if (wallet === null || (typeof wallet !== 'object' && typeof wallet !== 'function')) return `=${String(wallet)}`;
  let id = walletIds.get(wallet);
  if (id === undefined) {
    id = ++lastWalletId;
    walletIds.set(wallet, id);
  }
  return String(id);
};

// The wallet objects by adapter, so a wallet replaced under the same name (new accounts, a new wagmi config) is seen
const signatureOf = (connectors: WalletConnectors): string =>
  Object.entries(connectors ?? {})
    .map(([adapter, list]) => `${adapter}:${Array.isArray(list) ? list.map(walletId).join(',') : ''}`)
    .join(';');

/**
 * The external store of `useSyncExternalStore`. The list is read again on every render, after a reported change and
 * after subscribing (for a change between the render and the subscription), but not between React's checks of one
 * render, so the snapshot stays the same object there even when an adapter returns new wallet objects on every call,
 * and a render never loops. Reading on every render keeps the wallets of adapters that report nothing (an adapter
 * without `watchConnectors`, or a store without it) as current as Nova Connect showed them before `watchConnectors`.
 * The record stays the same object while the wallet objects are the same.
 */
function createWalletConnectorsSource(
  enabled: boolean,
  getConnectors: () => WalletConnectors,
  watchConnectors: WatchConnectors | undefined,
) {
  let version = 0;
  let readVersion = -1;
  let cached: { signature: string; connectors: WalletConnectors } | undefined;

  return {
    render: () => {
      version += 1;
    },
    subscribe: (onStoreChange: () => void) => {
      if (!enabled || !watchConnectors) return noSubscription;
      version += 1;
      return watchConnectors(() => {
        version += 1;
        onStoreChange();
      });
    },
    getSnapshot: (): WalletConnectors | undefined => {
      if (!enabled) return undefined;
      if (cached && readVersion === version) return cached.connectors;
      readVersion = version;
      const connectors = getConnectors();
      const signature = signatureOf(connectors);
      if (cached?.signature !== signature) cached = { signature, connectors };
      return cached.connectors;
    },
  };
}

const getServerSnapshot = () => undefined;

/**
 * The wallets of the Satellite Connect store by adapter (`getConnectors()` of the store), read again whenever the store
 * reports that the wallets of an adapter changed (`watchConnectors` of `@tuwaio/satellite-core`). A list shown before
 * wagmi added the installed EIP-6963 wallets, or before a Wallet Standard wallet registered, fills in by itself. The
 * connect modal and the connected modal list their wallets with it.
 *
 * The list is also read again on every render of the component: the wallets of an adapter that reports no changes (an
 * adapter without `watchConnectors`, such as an older `@tuwaio/satellite-solana` or a custom adapter, or a
 * `@tuwaio/satellite-core` without `watchConnectors`) appear at the next render.
 *
 * Side effects: while `enabled`, a subscription to the wallet list of the store (`watchConnectors`, which follows wagmi's
 * connectors and the Wallet Standard registry), from the commit until `enabled` turns `false` or the component unmounts.
 * Nothing is read or subscribed on the server.
 *
 * @param params - Options. See {@link UseWalletConnectorsParams}.
 * @param params.enabled - Whether to read and follow the wallets (default `true`).
 * @returns The wallets by adapter key, or `undefined` while disabled and on the server. The record stays the same object
 * while the store returns the same wallet objects, so it can be a dependency of memos and effects.
 * @throws {Error} `useSatelliteConnectStore must be used within a SatelliteConnectProvider` outside the provider.
 *
 * @example
 * ```tsx
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 * import { useWalletConnectors } from '@tuwaio/nova-connect/hooks';
 *
 * export function EvmWalletCount() {
 *   const connectors = useWalletConnectors();
 *   return <span>{connectors?.[OrbitAdapter.EVM]?.length ?? 0} EVM wallets</span>;
 * }
 * ```
 */
export function useWalletConnectors({ enabled = true }: UseWalletConnectorsParams = {}):
  Partial<Record<OrbitAdapter, Connector[]>> | undefined {
  const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);
  const watchConnectors = useSatelliteConnectStore(
    (store) => (store as { watchConnectors?: WatchConnectors }).watchConnectors,
  );
  const source = useMemo(
    () => createWalletConnectorsSource(enabled, getConnectors, watchConnectors),
    [enabled, getConnectors, watchConnectors],
  );
  source.render();
  return useSyncExternalStore(source.subscribe, source.getSnapshot, getServerSnapshot);
}
