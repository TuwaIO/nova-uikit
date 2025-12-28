import { formatConnectorName, OrbitAdapter } from '@tuwaio/orbit-core';

import { Connector } from '../satellite';

export interface GroupedConnector {
  name: string;
  icon?: string;
  adapters: OrbitAdapter[];
  connectors: (Connector & { adapter: OrbitAdapter })[];
}

interface GetGroupedConnectorsParams {
  connectors: Partial<Record<OrbitAdapter, Connector[]>>;
  excludeConnectors?: string[];
}

/**
 * Type for a safely processed connector
 */
type ProcessedConnector = {
  name: string;
  icon?: string;
  adapter: OrbitAdapter;
  originalConnector: Connector;
};

/**
 * Safely processes a connector and extracts its properties
 */
function processConnector(connector: unknown, adapter: OrbitAdapter): ProcessedConnector | null {
  if (!connector || typeof connector !== 'object') {
    return null;
  }

  const connectorObj = connector as Record<string, Connector>;

  if (!connectorObj.name || typeof connectorObj.name !== 'string') {
    return null;
  }

  // Extract the icon property safely
  let iconValue: string | undefined = undefined;
  if ('icon' in connectorObj) {
    const icon = connectorObj.icon;
    // Check if the icon is a string
    if (typeof icon === 'string') {
      iconValue = icon;
    }
    // If it's an object with a toString method, use that
    else if (icon && typeof icon === 'object' && 'toString' in icon && typeof icon.toString === 'function') {
      try {
        iconValue = icon.toString();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignore errors in toString
      }
    }
  }

  return {
    name: connectorObj.name,
    icon: iconValue,
    adapter,
    originalConnector: connectorObj as Connector,
  };
}

/**
 * Groups wallet connectors by their formatted names across different adapters.
 * Filters out specified excluded connectors (like 'injected' wallets).
 */
export function getGroupedConnectors(
  { connectors, excludeConnectors = ['injected'] }: GetGroupedConnectorsParams = { connectors: {} },
): GroupedConnector[] {
  // Input validation
  if (!connectors || Object.keys(connectors).length === 0) {
    return [];
  }

  // Create exclusion set for efficient lookup
  const excludeSet = new Set(excludeConnectors.map((name) => formatConnectorName(name)));

  // Process and collect all valid connectors
  const processedConnectors: ProcessedConnector[] = [];

  Object.entries(connectors).forEach(([adapterKey, adapterConnectors]) => {
    if (Array.isArray(adapterConnectors)) {
      const adapter = adapterKey as OrbitAdapter;

      adapterConnectors.forEach((connector) => {
        const processed = processConnector(connector, adapter);
        if (processed) {
          const formattedName = formatConnectorName(processed.name);
          if (!excludeSet.has(formattedName)) {
            processedConnectors.push(processed);
          }
        }
      });
    }
  });

  // Group by formatted wallet name using Map for better performance
  const groupedMap = new Map<string, GroupedConnector>();

  processedConnectors.forEach((processed) => {
    const formattedName = formatConnectorName(processed.name);

    if (!groupedMap.has(formattedName)) {
      groupedMap.set(formattedName, {
        name: processed.name,
        icon: processed.icon,
        adapters: [],
        connectors: [],
      });
    }

    const group = groupedMap.get(formattedName)!;

    // Add unique adapter
    if (!group.adapters.includes(processed.adapter)) {
      group.adapters.push(processed.adapter);
    }

    // Create a new object with the connector properties and add the adapter
    const connectorWithAdapter = Object.assign({}, processed.originalConnector, {
      adapter: processed.adapter,
    }) as Connector & { adapter: OrbitAdapter };

    group.connectors.push(connectorWithAdapter);

    // Update icon if not set
    if (!group.icon && processed.icon) {
      group.icon = processed.icon;
    }
  });

  // Return sorted array for consistent ordering
  return Array.from(groupedMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
}

/**
 * Quick helper to check if connectors are available
 */
export function hasAvailableConnectors(connectors: Partial<Record<OrbitAdapter, Connector[]>>): boolean {
  return Object.values(connectors).some(
    (adapterConnectors) => Array.isArray(adapterConnectors) && adapterConnectors.length > 0,
  );
}
