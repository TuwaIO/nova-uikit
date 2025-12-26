// Use type import only to avoid direct dependency
import type { Chain } from 'viem/chains';

// Define a local type for Chain to avoid direct dependency
type ChainType = {
  id: number;
  name: string;
  [key: string]: any;
};

/**
 * Initializes EVM utilities by dynamically loading dependencies.
 * This function should be called before using any EVM-specific functionality.
 * 
 * @returns Promise resolving to true if initialization was successful
 */
export async function initializeEvmUtils(): Promise<boolean> {
  try {
    // For EVM, we don't need to load any specific utilities at initialization time
    // This function exists for symmetry with the Solana module
    return true;
  } catch (error) {
    console.warn('Failed to initialize EVM utilities:', error);
    return false;
  }
}

/**
 * Type guard to check if a value is a valid EVM chain ID
 */
function isValidEvmChainId(id: unknown): id is number {
  return id !== undefined && id !== null && typeof id === 'number' && id > 0;
}

/**
 * Get EVM chain IDs from app chains configuration
 */
export async function getEvmChains(appChains?: readonly [Chain, ...Chain[]] | readonly [ChainType, ...ChainType[]]): Promise<number[]> {
  // Initialize EVM utilities first
  await initializeEvmUtils();

  if (!appChains || appChains.length === 0) {
    return [];
  }

  return appChains.map((chain) => chain.id).filter(isValidEvmChainId);
}

/**
 * Type guard to check if a chain list contains EVM chain IDs
 */
export function isEvmChainList(chains: (string | number)[]): chains is number[] {
  return chains.length > 0 && chains.every((chain) => typeof chain === 'number');
}
