import { OrbitAdapter } from '@tuwaio/orbit-core';

import { Connector } from '../satellite';
import { getGroupedConnectors, GroupedConnector } from './getGroupedConnectors';

/**
 * Parameters of {@link getFilteredConnectors}.
 */
export interface GetFilteredConnectorsParams {
  /** Connectors by adapter, as `getConnectors()` of the Satellite store returns them */
  connectors: Partial<Record<OrbitAdapter, Connector[]>>;
  /** Keeps only the wallets (and their connectors) of this adapter */
  selectedAdapter?: OrbitAdapter;
}

/**
 * Type for connector with adapter information
 */
type ConnectorWithAdapter = Connector & { adapter: OrbitAdapter };

/**
 * Helper function to safely access connector adapter property
 */
function getConnectorAdapter(connector: unknown): OrbitAdapter | undefined {
  try {
    if (connector && typeof connector === 'object' && 'adapter' in connector) {
      return (connector as { adapter: OrbitAdapter }).adapter;
    }
  } catch {
    // Silently handle any errors in property access
  }
  return undefined;
}

/**
 * Helper function to check if connector matches the selected adapter
 */
function connectorMatchesAdapter(connector: unknown, selectedAdapter: OrbitAdapter): boolean {
  const connectorAdapter = getConnectorAdapter(connector);
  return connectorAdapter === selectedAdapter;
}

/**
 * Groups the connectors by wallet with {@link getGroupedConnectors} (without the generic `injected` connector) and
 * keeps the wallets of the selected adapter, with only the connectors of that adapter.
 *
 * @param params - See {@link GetFilteredConnectorsParams}.
 * @returns The wallets sorted by name (all of them when `selectedAdapter` is not set).
 */
export function getFilteredConnectors({
  connectors,
  selectedAdapter,
}: GetFilteredConnectorsParams): GroupedConnector[] {
  // Input validation
  if (!connectors || Object.keys(connectors).length === 0) {
    return [];
  }

  const groupedConnectors = getGroupedConnectors({ connectors });

  // Return all connectors if no filter is applied
  if (!selectedAdapter) {
    return groupedConnectors;
  }

  // Filter and transform connector groups
  return groupedConnectors
    .filter((group) => {
      // Only include groups that support the selected adapter
      return (
        group.adapters.includes(selectedAdapter) &&
        group.connectors.some((connector) => connectorMatchesAdapter(connector, selectedAdapter))
      );
    })
    .map((group) => {
      // Create new group with filtered connectors
      const filteredConnectors = group.connectors.filter((connector) =>
        connectorMatchesAdapter(connector, selectedAdapter),
      );

      return {
        ...group,
        // Narrow down to only the selected adapter
        adapters: [selectedAdapter],
        // Cast to proper type since we know these connectors have the adapter property
        connectors: filteredConnectors as ConnectorWithAdapter[],
      };
    })
    .filter((group) => group.connectors.length > 0); // Remove empty groups
}

/**
 * Checks whether an adapter has at least one connector.
 *
 * @param connectors - Connectors by adapter.
 * @param adapter - The adapter to check.
 * @returns `true` when `connectors[adapter]` is a non-empty array.
 */
export function hasConnectorsForAdapter(
  connectors: Partial<Record<OrbitAdapter, Connector[]>>,
  adapter: OrbitAdapter,
): boolean {
  const adapterConnectors = connectors[adapter];
  return Array.isArray(adapterConnectors) && adapterConnectors.length > 0;
}
