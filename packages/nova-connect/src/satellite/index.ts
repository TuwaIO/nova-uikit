// Export all types and components directly to satisfy static imports
export {
  AllConnectors,
  Connection,
  Connector,
  SatelliteConnectProvider,
  SatelliteConnectProviderProps,
  SatelliteStoreContext,
  useInitializeAutoConnect,
  useSatelliteConnectStore,
} from '@tuwaio/satellite-react';

// Dynamic exports that will be loaded at runtime
export async function getSatelliteExports() {
  try {
    // Use a more indirect approach to prevent bundlers from resolving imports at build time
    // This creates a function that will be called at runtime
    const importSatelliteModule = new Function(
      'return import("@tuwaio/satellite-react").catch(error => { console.warn("Failed to load Satellite exports:", error); return null; })'
    );

    const satelliteReact = await importSatelliteModule();

    if (!satelliteReact) {
      return {
        available: false,
        error: 'Failed to load Satellite exports',
      };
    }

    return {
      ...satelliteReact,
      available: true,
    };
  } catch (error) {
    console.warn('Failed to load Satellite exports:', error);
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error loading Satellite exports',
    };
  }
}
