/**
 * The provider, hooks and types of `@tuwaio/satellite-react`, re-exported from `@tuwaio/nova-connect/satellite`, so
 * an app can use the same copy of Satellite Connect as Nova Connect.
 *
 * @module satellite
 */

export type {
  AllConnections,
  AllConnectors,
  Connection,
  Connector,
  InitializeAutoConnectProps,
  SatelliteConnectProviderProps,
  SatelliteContextType,
} from '@tuwaio/satellite-react';
export {
  SatelliteConnectProvider,
  SatelliteStoreContext,
  useInitializeAutoConnect,
  useSatelliteConnectStore,
} from '@tuwaio/satellite-react';
