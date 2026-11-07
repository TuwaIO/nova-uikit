import { formatConnectorName, getWalletFromConnectorType } from '@tuwaio/orbit-core';

/**
 * The name of a wallet to show: the name of its connector, which the rest of the modal shows too, and the normalized ID of the
 * connector type only when no connector matches. The ID alone reads badly: `Metamask`, `Impersonatedwallet`.
 *
 * @param connectorType - The connector type, with or without the adapter prefix.
 * @param connectors - The connectors of the store, by adapter.
 * @returns The name.
 */
export function connectorDisplayName(connectorType: string, connectors?: Record<string, unknown[]>): string {
  // Remove adapter prefix (e.g., "EVM:METAMASK" -> "METAMASK")
  const nameWithoutAdapter = getWalletFromConnectorType(connectorType) ?? connectorType;
  const id = formatConnectorName(nameWithoutAdapter);
  const match = Object.values(connectors ?? {})
    .flat()
    .find((connector) => formatConnectorName(((connector ?? {}) as { name?: string }).name ?? '') === id) as
    { name: string } | undefined;
  return match?.name ?? id.charAt(0).toUpperCase() + id.slice(1);
}
