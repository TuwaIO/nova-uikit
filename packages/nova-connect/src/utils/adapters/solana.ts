import type { ChainAdapter } from './types';

/**
 * Solana utilities module interface for dynamic imports.
 *
 * @internal
 * @since 1.0.0
 */
interface SolanaUtilsModule {
  getSolanaClusters?: (solanaRPCUrls: any, chains?: any) => string[];
  isSolanaChainList?: (chains: (string | number)[]) => boolean;
  getAvailableSolanaClusters?: () => string[];
  isValidSolanaCluster?: (cluster: string) => boolean;
}

/**
 * Dynamically imports and checks availability of Solana utilities.
 * This function attempts to load Solana-specific utilities without throwing errors
 * if the Solana package is not installed in the current environment.
 *
 * @internal
 * @returns Promise resolving to Solana utilities module or null if not available
 *
 * @example
 * ```typescript
 * const solanaUtils = await getSolanaUtils();
 * if (solanaUtils?.getSolanaClusters) {
 *   const clusters = solanaUtils.getSolanaClusters(rpcUrls);
 * }
 * ```
 *
 * @since 1.0.0
 */
async function getSolanaUtils(): Promise<SolanaUtilsModule | null> {
  try {
    const { getSolanaClusters, isSolanaChainList, getAvailableSolanaClusters, isValidSolanaCluster } =
      await import('@tuwaio/orbit-solana');
    return { getSolanaClusters, isSolanaChainList, getAvailableSolanaClusters, isValidSolanaCluster };
  } catch (error) {
    console.warn('Solana utilities not available:', error);
    return null;
  }
}

/**
 * Creates a Solana chain adapter with dynamic loading and fallback support.
 *
 * This adapter provides Solana-specific functionality while gracefully handling
 * environments where Solana utilities are not available. It includes Solana-specific
 * methods like cluster management that are unique to the Solana blockchain architecture.
 *
 * @returns Promise resolving to a configured Solana ChainAdapter
 *
 * @example
 * ```typescript
 * const adapter = await createSolanaAdapter();
 *
 * // Get Solana cluster names from RPC configuration
 * const clusters = adapter.getChains({
 *   'mainnet-beta': 'https://api.mainnet-beta.solana.com',
 *   devnet: 'https://api.devnet.solana.com'
 * });
 * console.log(clusters); // ['mainnet-beta', 'devnet']
 *
 * // Validate cluster list format
 * const isValid = adapter.isChainList(['mainnet-beta', 'devnet']);
 * console.log(isValid); // true (string identifiers are valid for Solana)
 *
 * // Get available clusters
 * const availableClusters = adapter.getAvailableClusters?.();
 * console.log(availableClusters); // All configured cluster names
 * ```
 *
 * @since 1.0.0
 */
export async function createSolanaAdapter(): Promise<ChainAdapter> {
  const solanaUtils = await getSolanaUtils();

  return {
    /**
     * Extracts cluster names from Solana RPC URL configuration.
     *
     * @param solanaRPCUrls Object mapping cluster names to RPC URLs
     * @param chains Optional array of specific chains to filter
     * @returns Array of cluster names (strings)
     */
    getChains(solanaRPCUrls: any, chains?: any): (string | number)[] {
      // Use imported Solana utilities if available
      if (solanaUtils?.getSolanaClusters) {
        return solanaUtils.getSolanaClusters(solanaRPCUrls, chains);
      }

      // Fallback implementation for basic cluster extraction
      if (solanaRPCUrls && typeof solanaRPCUrls === 'object') {
        return Object.keys(solanaRPCUrls);
      }
      return [];
    },

    /**
     * Validates whether the provided chains list conforms to Solana cluster format.
     * Solana clusters are typically identified by string names like 'mainnet-beta', 'devnet'.
     *
     * @param chains Array of chain identifiers to validate
     * @returns True if the chain list is valid for Solana
     */
    isChainList(chains: (string | number)[]): boolean {
      if (solanaUtils?.isSolanaChainList) {
        return solanaUtils.isSolanaChainList(chains);
      }

      // Fallback validation: Solana clusters should be strings
      return chains.length > 0 && chains.every((chain) => typeof chain === 'string');
    },

    /**
     * Gets all available Solana clusters from the current configuration.
     * This is a Solana-specific method that returns cluster names that can be used.
     *
     * @returns Array of available cluster names
     *
     * @example
     * ```typescript
     * const clusters = await adapter.getAvailableClusters?.();
     * // Might return: ['mainnet-beta', 'devnet', 'testnet']
     * ```
     */
    getAvailableClusters(): string[] {
      if (solanaUtils?.getAvailableSolanaClusters) {
        return solanaUtils.getAvailableSolanaClusters();
      }
      return [];
    },

    /**
     * Validates whether a cluster name is valid for Solana.
     * Checks against known Solana cluster monikers and custom configurations.
     *
     * @param cluster Cluster name to validate
     * @returns True if the cluster name is valid
     *
     * @example
     * ```typescript
     * const isValid = await adapter.isValidCluster?.('mainnet-beta');
     * console.log(isValid); // true
     *
     * const isInvalid = await adapter.isValidCluster?.('invalid-cluster');
     * console.log(isInvalid); // false
     * ```
     */
    isValidCluster(cluster: string): boolean {
      if (solanaUtils?.isValidSolanaCluster) {
        return solanaUtils.isValidSolanaCluster(cluster);
      }
      return false;
    },
  };
}
