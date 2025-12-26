import { OrbitAdapter } from '@tuwaio/orbit-core';

// Re-export core modules
export * from './providers';
export * from './types';
export * from './utils';

// Export satellite module separately to avoid bundling issues
export * from './satellite';

// ========================================
// Modern Conditional Export System
// ========================================

/**
 * @internal
 * Flag to indicate if we're in a bundler environment that doesn't support dynamic imports properly
 * This is used to prevent bundlers from trying to resolve dynamic imports at build time
 */
const IS_BUNDLER_ENV = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

/**
 * Information about available blockchain-specific utilities and their status.
 *
 * @interface BlockchainUtilities
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const utilities = await getBlockchainUtilities();
 *
 * if (utilities.hasEvmUtils) {
 *   console.log('EVM utilities are available');
 * }
 *
 * console.log('Adapter statuses:', utilities.adaptersStatus);
 * ```
 */
export interface BlockchainUtilities {
  /** Whether EVM utilities are available and loaded */
  hasEvmUtils: boolean;
  /** Whether Solana utilities are available and loaded */
  hasSolanaUtils: boolean;
  /** Current loading status of all registered adapters */
  adaptersStatus: Record<string, string>;
}

/**
 * Gets comprehensive information about available blockchain utilities and their loading status.
 * This function dynamically checks which blockchain adapters are available and their current state.
 *
 * @returns Promise resolving to blockchain utilities information
 *
 * @example
 * ```typescript
 * // Check what's available in your current setup
 * const info = await getBlockchainUtilities();
 *
 * if (info.hasEvmUtils && info.hasSolanaUtils) {
 *   console.log('Full multi-chain support available');
 * } else {
 *   console.log('Limited blockchain support:', info.adaptersStatus);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function getBlockchainUtilities(): Promise<BlockchainUtilities> {
  const { getAllAdaptersStatus } = await import('./utils/getChainsListByConnectorType');

  return {
    hasEvmUtils: await checkEvmUtils(),
    hasSolanaUtils: await checkSolanaUtils(),
    adaptersStatus: getAllAdaptersStatus(),
  };
}

/**
 * Checks if EVM utilities are available by testing actual package imports.
 * This function performs a dynamic import to determine availability without throwing errors.
 *
 * @internal
 * @returns Promise resolving to true if EVM utilities can be imported
 *
 * @since 1.0.0
 */
async function checkEvmUtils(): Promise<boolean> {
  // In bundler environments, we can't reliably use dynamic imports
  // as they might be resolved at build time
  if (IS_BUNDLER_ENV) {
    try {
      // Use a more indirect approach that won't be resolved at build time
      // This creates a function that will be called at runtime
      const checkImport = new Function(
        'try { return Boolean(require("@tuwaio/orbit-evm") && require("viem")); } catch { return false; }'
      );
      return checkImport();
    } catch {
      return false;
    }
  }

  try {
    // Check if actual EVM packages are available
    await import('viem');
    await import('@tuwaio/orbit-evm');
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if Solana utilities are available by testing actual package imports.
 * This function performs a dynamic import to determine availability without throwing errors.
 *
 * @internal
 * @returns Promise resolving to true if Solana utilities can be imported
 *
 * @since 1.0.0
 */
async function checkSolanaUtils(): Promise<boolean> {
  // In bundler environments, we can't reliably use dynamic imports
  // as they might be resolved at build time
  if (IS_BUNDLER_ENV) {
    try {
      // Use a more indirect approach that won't be resolved at build time
      // This creates a function that will be called at runtime
      const checkImport = new Function(
        'try { return Boolean(require("@tuwaio/orbit-solana") && require("gill")); } catch { return false; }'
      );
      return checkImport();
    } catch {
      return false;
    }
  }

  try {
    // Check if actual Solana packages are available
    await import('gill');
    await import('@tuwaio/orbit-solana');
    return true;
  } catch {
    return false;
  }
}

// ========================================
// Blockchain-Specific Utility Exports
// ========================================

/**
 * Result type for blockchain utility loading operations.
 *
 * @template T The type of utilities being loaded
 *
 * @since 1.0.0
 */
export type BlockchainUtilityResult<T = any> = ({ available: true } & T) | { available: false; error: string };

/**
 * Dynamically loads EVM utilities if available in the current environment.
 * Returns the utilities along with their availability status.
 *
 * @returns Promise resolving to EVM utilities or error information
 *
 * @example
 * ```typescript
 * const evmUtils = await getEvmUtils();
 *
 * if (evmUtils.available) {
 *   // Use EVM-specific functions
 *   const chains = evmUtils.getEvmChains(appChains);
 *   console.log('Available EVM chains:', chains);
 * } else {
 *   console.warn('EVM not supported:', evmUtils.error);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function getEvmUtils(): Promise<BlockchainUtilityResult> {
  try {
    // First check if EVM packages are available
    const hasEvmPackages = await checkEvmUtils();
    if (!hasEvmPackages) {
      return {
        available: false,
        error: 'EVM packages (viem, @tuwaio/orbit-evm) not available',
      };
    }

    // In bundler environments, we need to handle imports differently
    if (IS_BUNDLER_ENV) {
      try {
        // Use a more indirect approach that won't be resolved at build time
        const getEvmModule = new Function(
          'try { return require("./evm"); } catch { return null; }'
        );
        const evmModule = getEvmModule();

        if (!evmModule) {
          return {
            available: false,
            error: 'Failed to load EVM module',
          };
        }

        // Call getEvmExports to dynamically load EVM exports
        // We need to use a Promise here because we can't use await in new Function
        return new Promise((resolve) => {
          if (typeof evmModule.getEvmExports !== 'function') {
            resolve({
              available: false,
              error: 'EVM module does not have getEvmExports function',
            });
            return;
          }

          evmModule.getEvmExports()
            .then((evmExports: { available: boolean; error?: string; [key: string]: any }) => {
              if (!evmExports.available) {
                resolve({
                  available: false,
                  error: evmExports.error || 'Failed to load EVM exports',
                });
                return;
              }

              resolve({
                ...evmModule, // Include utility functions
                ...evmExports, // Include dynamically loaded exports
              });
            })
            .catch((error: unknown) => {
              resolve({
                available: false,
                error: error instanceof Error ? error.message : 'Failed to load EVM exports',
              });
            });
        });
      } catch (error) {
        return {
          available: false,
          error: error instanceof Error ? error.message : 'Failed to load EVM module',
        };
      }
    }

    // Only import our utilities if packages are available
    const evmModule = await import('./evm');

    // Use the new getEvmExports function to dynamically load EVM exports
    const evmExports = await evmModule.getEvmExports();

    if (!evmExports.available) {
      return {
        available: false,
        error: evmExports.error || 'Failed to load EVM exports',
      };
    }

    return {
      ...evmModule, // Include utility functions
      ...evmExports, // Include dynamically loaded exports
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'EVM utilities not available',
    };
  }
}

/**
 * Dynamically loads Solana utilities if available in the current environment.
 * Returns the utilities along with their availability status.
 *
 * @returns Promise resolving to Solana utilities or error information
 *
 * @example
 * ```typescript
 * const solanaUtils = await getSolanaUtils();
 *
 * if (solanaUtils.available) {
 *   // Use Solana-specific functions
 *   const clusters = solanaUtils.getSolanaClusters(rpcUrls);
 *   console.log('Available Solana clusters:', clusters);
 * } else {
 *   console.warn('Solana not supported:', solanaUtils.error);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function getSolanaUtils(): Promise<BlockchainUtilityResult> {
  try {
    // First check if Solana packages are available
    const hasSolanaPackages = await checkSolanaUtils();
    if (!hasSolanaPackages) {
      return {
        available: false,
        error: 'Solana packages (gill, @tuwaio/orbit-solana) not available',
      };
    }

    // In bundler environments, we need to handle imports differently
    if (IS_BUNDLER_ENV) {
      try {
        // Use a more indirect approach that won't be resolved at build time
        const getSolanaModule = new Function(
          'try { return require("./solana"); } catch { return null; }'
        );
        const solanaModule = getSolanaModule();

        if (!solanaModule) {
          return {
            available: false,
            error: 'Failed to load Solana module',
          };
        }

        // Call getSolanaExports to dynamically load Solana exports
        // We need to use a Promise here because we can't use await in new Function
        return new Promise((resolve) => {
          if (typeof solanaModule.getSolanaExports !== 'function') {
            resolve({
              available: false,
              error: 'Solana module does not have getSolanaExports function',
            });
            return;
          }

          solanaModule.getSolanaExports()
            .then((solanaExports: { available: boolean; error?: string; [key: string]: any }) => {
              if (!solanaExports.available) {
                resolve({
                  available: false,
                  error: solanaExports.error || 'Failed to load Solana exports',
                });
                return;
              }

              resolve({
                ...solanaModule, // Include utility functions
                ...solanaExports, // Include dynamically loaded exports
              });
            })
            .catch((error: unknown) => {
              resolve({
                available: false,
                error: error instanceof Error ? error.message : 'Failed to load Solana exports',
              });
            });
        });
      } catch (error) {
        return {
          available: false,
          error: error instanceof Error ? error.message : 'Failed to load Solana module',
        };
      }
    }

    // Only import our utilities if packages are available
    const solanaModule = await import('./solana');

    // Use the new getSolanaExports function to dynamically load Solana exports
    const solanaExports = await solanaModule.getSolanaExports();

    if (!solanaExports.available) {
      return {
        available: false,
        error: solanaExports.error || 'Failed to load Solana exports',
      };
    }

    return {
      ...solanaModule, // Include utility functions
      ...solanaExports, // Include dynamically loaded exports
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Solana utilities not available',
    };
  }
}

// ========================================
// Initialization and Preloading
// ========================================

/**
 * Result of blockchain support initialization.
 *
 * @interface InitializationResult
 * @since 1.0.0
 */
export interface InitializationResult {
  /** Whether EVM support was successfully initialized */
  evm: boolean;
  /** Whether Solana support was successfully initialized */
  solana: boolean;
  /** Array of error messages encountered during initialization */
  errors: string[];
}

/**
 * Preloads and initializes all available blockchain adapters.
 * This function should be called during application startup for optimal performance.
 * It attempts to load both EVM and Solana adapters and reports which ones are available.
 *
 * @returns Promise resolving to initialization results
 *
 * @example
 * ```typescript
 * // Call during app initialization
 * const initResult = await initializeBlockchainSupport();
 *
 * if (initResult.evm && initResult.solana) {
 *   console.log('Full blockchain support initialized');
 * } else {
 *   console.log('Partial support:', initResult);
 *   if (initResult.errors.length > 0) {
 *     console.warn('Initialization errors:', initResult.errors);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function initializeBlockchainSupport(): Promise<InitializationResult> {
  const results: InitializationResult = {
    evm: false,
    solana: false,
    errors: [],
  };

  try {
    // Check what packages are actually available
    const evmAvailable = await checkEvmUtils();
    const solanaAvailable = await checkSolanaUtils();

    // Only load adapter management if we have at least one blockchain available
    if (evmAvailable || solanaAvailable) {
      // In bundler environments, we need to handle imports differently
      if (IS_BUNDLER_ENV) {
        try {
          // Use a more indirect approach that won't be resolved at build time
          const getUtilsModule = new Function(
            'try { return require("./utils/getChainsListByConnectorType"); } catch { return null; }'
          );
          const utilsModule = getUtilsModule();

          if (!utilsModule) {
            results.errors.push('Failed to load chain adapter utilities');
            return results;
          }

          const adaptersToPreload: OrbitAdapter[] = [];
          if (evmAvailable) adaptersToPreload.push(OrbitAdapter.EVM);
          if (solanaAvailable) adaptersToPreload.push(OrbitAdapter.SOLANA);

          await utilsModule.preloadChainAdapters(adaptersToPreload);

          // Set results based on successful package availability
          results.evm = evmAvailable;
          results.solana = solanaAvailable;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to initialize chain adapters';
          results.errors.push(errorMsg);
        }
      } else {
        // Standard dynamic import approach for non-bundler environments
        const { preloadChainAdapters } = await import('./utils/getChainsListByConnectorType');

        const adaptersToPreload: OrbitAdapter[] = [];
        if (evmAvailable) adaptersToPreload.push(OrbitAdapter.EVM);
        if (solanaAvailable) adaptersToPreload.push(OrbitAdapter.SOLANA);

        await preloadChainAdapters(adaptersToPreload);

        // Set results based on successful package availability
        results.evm = evmAvailable;
        results.solana = solanaAvailable;
      }
    } else {
      results.errors.push('No blockchain packages available for initialization');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown initialization error';
    results.errors.push(errorMsg);
  }

  return results;
}

// ========================================
// Adapter Support Utilities
// ========================================

/**
 * Checks whether a specific blockchain adapter is supported in the current environment.
 * This function performs runtime checks to determine adapter availability.
 *
 * @param adapter The blockchain adapter to check for support
 * @returns Promise resolving to true if the adapter is supported
 *
 * @example
 * ```typescript
 * // Check individual adapter support
 * const evmSupported = await isAdapterSupported(OrbitAdapter.EVM);
 * const solanaSupported = await isAdapterSupported(OrbitAdapter.SOLANA);
 * const starknetSupported = await isAdapterSupported(OrbitAdapter.Starknet);
 *
 * console.log('Adapter support:', {
 *   evm: evmSupported,
 *   solana: solanaSupported,
 *   starknet: starknetSupported, // Currently always false
 * });
 * ```
 *
 * @since 1.0.0
 */
export async function isAdapterSupported(adapter: OrbitAdapter): Promise<boolean> {
  // For Starknet and unknown adapters, we can return immediately
  if (adapter === OrbitAdapter.Starknet || 
      (adapter !== OrbitAdapter.EVM && adapter !== OrbitAdapter.SOLANA)) {
    return false;
  }

  // For EVM and Solana, use the appropriate check function
  if (adapter === OrbitAdapter.EVM) {
    return checkEvmUtils();
  } else {
    return checkSolanaUtils();
  }
}

// ========================================
// Type Exports
// ========================================

/**
 * Re-export all blockchain-specific configuration types.
 * These types are enhanced through module augmentation when specific packages are installed.
 *
 * @since 1.0.0
 */
export type { AllChainConfigs, ChainIdentifierArray, InitialChains } from './types';
