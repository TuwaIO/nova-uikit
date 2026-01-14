import { networks } from '@web3icons/common/metadata';

import { isSolanaDev } from './isSolanaDev';

/**
 * Fallback string when a network name cannot be resolved.
 */
const UNKNOWN_NETWORK = 'Unknown';

/**
 * Retrieves the human-readable name of a blockchain network based on its Chain ID.
 *
 * Supports both:
 * - Numeric IDs (EVM): e.g., `1` -> "Ethereum"
 * - String IDs (Non-EVM): e.g., `"solana:devnet"` -> "Solana Devnet"
 *
 * For formatted string IDs (like "solana:devnet"), it capitalizes the suffix
 * if the network is identified as a development environment.
 *
 * @param chainId - The unique identifier of the chain (number for EVM, string for others).
 * @returns The formatted network name or 'Unknown'.
 */
export function getChainName(chainId: number | string): string {
  // 1. Handle Numeric IDs (EVM standard)
  if (typeof chainId === 'number') {
    return networks.find((network) => network.chainId === chainId)?.name ?? UNKNOWN_NETWORK;
  }

  // 2. Handle String IDs (Tuwa/Web3Icons standard, e.g., "solana:devnet")
  const [baseId, variant] = chainId.split(':');
  const networkDef = networks.find((network) => network.id === baseId);

  if (!networkDef) {
    return UNKNOWN_NETWORK;
  }

  // 3. Special formatting for Dev/Test networks (e.g., "Solana Devnet")
  // We only append the variant if it exists and it's a known dev environment
  if (variant && isSolanaDev(chainId)) {
    const formattedVariant = variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase();
    return `${networkDef.name} ${formattedVariant}`;
  }

  return networkDef.name;
}
