import type { SolanaClusterMoniker } from 'gill';

import { ChainIdentifierArray } from '../index';

// Use a local type definition to avoid direct imports
type SolanaRPCUrlsType = {
  rpcUrls: Partial<Record<string, string>>;
};

// Default values that will be populated at runtime if the package is available
let defaultRpcUrlsByMoniker: Record<string, string> = {};

/**
 * Initializes Solana utilities by dynamically loading dependencies.
 * This function should be called before using any Solana-specific functionality.
 *
 * @returns Promise resolving to true if initialization was successful
 */
export async function initializeSolanaUtils(): Promise<boolean> {
  try {
    // Only try to load if not already initialized
    if (Object.keys(defaultRpcUrlsByMoniker).length === 0) {
      // Use a more indirect approach to prevent bundlers from resolving imports at build time
      // This creates a function that will be called at runtime
      const importSolanaModule = new Function(
        'return import("@tuwaio/orbit-solana").catch(error => { console.warn("Failed to load Solana dependencies:", error); return null; })',
      );

      const orbitSolana = await importSolanaModule();

      if (!orbitSolana) {
        return false;
      }

      // Populate default values
      defaultRpcUrlsByMoniker = orbitSolana.defaultRpcUrlsByMoniker;
    }
    return true;
  } catch (error) {
    console.warn('Failed to initialize Solana utilities:', error);
    return false;
  }
}

/**
 * Extracts Solana cluster from chain identifier
 */
function extractSolanaCluster(chainId: string): SolanaClusterMoniker | null {
  const parts = chainId.split(':');
  if (parts.length < 2) return null;

  let cluster = parts[1];
  // Map mainnet-beta to mainnet to match orbit-solana keys
  if (cluster === 'mainnet-beta') {
    cluster = 'mainnet';
  }

  const moniker = cluster as SolanaClusterMoniker;
  // Validate that it's a known cluster
  return moniker in defaultRpcUrlsByMoniker ? moniker : null;
}

/**
 * Builds available Solana RPC URLs from chain identifiers
 */
function buildSolanaRpcUrls(
  chains: ChainIdentifierArray,
  solanaRPCUrls?: SolanaRPCUrlsType['rpcUrls'],
): SolanaRPCUrlsType['rpcUrls'] {
  const availableRpcUrls: SolanaRPCUrlsType['rpcUrls'] = {};

  // If config is provided, we only consider clusters defined in it.
  // If not provided, we consider all default clusters.
  const allowedClusters = solanaRPCUrls ? Object.keys(solanaRPCUrls) : Object.keys(defaultRpcUrlsByMoniker);

  for (const chainId of chains) {
    if (typeof chainId !== 'string') continue;

    const cluster = extractSolanaCluster(chainId);
    if (!cluster) continue;

    // Check if this cluster is allowed by app config
    if (!allowedClusters.includes(cluster)) continue;

    // Get RPC URL with fallback to default
    const rpcUrl = solanaRPCUrls?.[cluster] ?? defaultRpcUrlsByMoniker[cluster];

    if (rpcUrl) {
      availableRpcUrls[cluster] = rpcUrl;
    }
  }

  return availableRpcUrls;
}

/**
 * Get Solana clusters from configuration
 */
export async function getSolanaClusters(
  solanaRPCUrls?: Partial<Record<SolanaClusterMoniker, string>>,
  chains?: ChainIdentifierArray,
): Promise<string[]> {
  // Initialize Solana utilities first
  await initializeSolanaUtils();

  if (chains && chains.length > 0) {
    // For Solana, build RPC URLs and return cluster names
    const availableRpcUrls = buildSolanaRpcUrls(chains, solanaRPCUrls);
    return Object.keys(availableRpcUrls);
  }

  // Return configured clusters or defaults
  return Object.keys(solanaRPCUrls || defaultRpcUrlsByMoniker);
}

/**
 * Type guard to check if a chain list contains Solana cluster names
 */
export function isSolanaChainList(chains: (string | number)[]): chains is string[] {
  return chains.length > 0 && chains.every((chain) => typeof chain === 'string');
}

/**
 * Gets available Solana clusters from the default configuration
 */
export async function getAvailableSolanaClusters(): Promise<SolanaClusterMoniker[]> {
  // Initialize Solana utilities first
  await initializeSolanaUtils();
  return Object.keys(defaultRpcUrlsByMoniker) as SolanaClusterMoniker[];
}

/**
 * Validates if a string is a valid Solana cluster moniker
 */
export async function isValidSolanaCluster(cluster: string): Promise<boolean> {
  // Initialize Solana utilities first
  await initializeSolanaUtils();
  return cluster in defaultRpcUrlsByMoniker;
}
