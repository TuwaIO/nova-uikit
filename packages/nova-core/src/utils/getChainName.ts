import { networks } from '@web3icons/common/metadata';

import { isSolanaDev } from './isSolanaDev';

/**
 * Fallback string when a network name cannot be resolved.
 */
const UNKNOWN_NETWORK = 'Unknown';

/**
 * Result of chain name resolution.
 */
export interface ChainInfo {
  /** Human-readable network name (e.g., "Ethereum", "Solana Devnet") */
  name: string;
  /** Normalized network identifier for icon libraries (e.g., "ethereum", "solana") */
  id: string;
  /** Original chain ID as provided */
  chainId: number | string;
  /** File path for icon resolution */
  filePath: string;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Retrieves blockchain network information based on its chain ID.
 *
 * Supports both EVM and non-EVM chain identifiers:
 * - **Numeric IDs (EVM):** e.g., `1` → "Ethereum", `137` → "Polygon"
 * - **String IDs (Non-EVM):** e.g., `"solana:devnet"` → "Solana Devnet"
 *
 * For string IDs with environment suffixes (like "solana:devnet"),
 * the suffix is appended to the name if it's a known dev/test environment.
 *
 * The networks are looked up in the metadata of `@web3icons/common`.
 *
 * @param chainId - Chain identifier (number for EVM, string for non-EVM)
 * @returns The network name, id and icon file path, and the original `chainId`; `'Unknown'`/`'unknown'` when the
 * network is not listed.
 *
 * @example
 * ```ts
 * import { getChainName } from '@tuwaio/nova-core';
 *
 * getChainName(1);
 * // → { name: 'Ethereum', id: 'ethereum', filePath: 'ethereum', chainId: 1 }
 *
 * getChainName('solana:devnet');
 * // → { name: 'Solana Devnet', id: 'solana', filePath: 'solana', chainId: 'solana:devnet' }
 *
 * getChainName(999999);
 * // → { name: 'Unknown', id: 'unknown', filePath: 'unknown', chainId: 999999 }
 * ```
 */
export function getChainName(chainId: number | string): ChainInfo {
  const unknownResult: ChainInfo = {
    name: UNKNOWN_NETWORK,
    id: UNKNOWN_NETWORK.toLowerCase(),
    filePath: UNKNOWN_NETWORK.toLowerCase(),
    chainId,
  };

  // Handle numeric IDs (EVM standard)
  if (typeof chainId === 'number') {
    const network = networks.find((n) => n.chainId === chainId);

    if (!network) {
      return unknownResult;
    }

    return {
      name: network.name,
      id: network.id,
      filePath: network.filePath?.split(':')[1],
      chainId,
    };
  }

  // Handle string IDs (e.g., "solana:devnet")
  const [baseId, variant] = chainId ? chainId.split(':') : [chainId];
  const network = networks.find((n) => n.id === baseId);

  if (!network) {
    return unknownResult;
  }

  // Append variant suffix for dev/test environments
  const name = variant && isSolanaDev(chainId) ? `${network.name} ${capitalize(variant)}` : network.name;

  return {
    name,
    id: network.id,
    filePath: network.filePath?.split(':')[1],
    chainId,
  };
}
