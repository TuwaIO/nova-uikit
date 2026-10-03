import { ChainIdentifierArray, ConnectorType, getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';

import { AllChainConfigs, InitialChains } from '../types';
import { getChainAdapter } from './adapters/registry';

/**
 * Parameters of {@link getChainsListByConnectorType}.
 */
export interface GetChainsListByConnectorTypeParams extends InitialChains {
  /** Connector type whose network is used, for example `evm:metamask` */
  connectorType: ConnectorType;
  /**
   * Solana only: keeps the clusters of these chain identifiers (Wallet Standard chains such as `solana:devnet`, or
   * CAIP-2 chain IDs with the genesis hash)
   */
  chains?: ChainIdentifierArray;
}

// Reads the chain configuration without the helpers of a network (its entry point has not been imported)
function getFallbackChains(adapterType: OrbitAdapter, config: AllChainConfigs): (string | number)[] {
  switch (adapterType) {
    case OrbitAdapter.EVM:
      return (config.appChains ?? []).map((chain) => chain.id).filter((id) => typeof id === 'number');
    case OrbitAdapter.SOLANA:
      return config.solanaRPCUrls ? Object.keys(config.solanaRPCUrls) : [];
    default:
      return [];
  }
}

/**
 * Returns the chains of the app for the network of a connector type.
 *
 * - EVM: the IDs of `appChains` (`getEvmChains` of `@tuwaio/orbit-evm` when `@tuwaio/nova-connect/evm` is imported).
 * - Solana: when `@tuwaio/nova-connect/solana` is imported, `getSolanaClusters` of `@tuwaio/orbit-solana`: the cluster
 *   monikers of `solanaRPCUrls` (every cluster with a public RPC URL without it), filtered by `chains` when set.
 *   Otherwise the keys of `solanaRPCUrls`.
 *
 * @param params - See {@link GetChainsListByConnectorTypeParams}.
 * @returns The chain IDs or cluster monikers (empty without `connectorType`, with a warning).
 *
 * @example
 * ```ts
 * import { getChainsListByConnectorType } from '@tuwaio/nova-connect';
 * import { mainnet, polygon } from 'viem/chains';
 *
 * getChainsListByConnectorType({ connectorType: 'evm:metamask', appChains: [mainnet, polygon] }); // [1, 137]
 * getChainsListByConnectorType({
 *   connectorType: 'solana:phantom',
 *   solanaRPCUrls: { devnet: 'https://api.devnet.solana.com' },
 * }); // ['devnet']
 * ```
 */
export function getChainsListByConnectorType(params: GetChainsListByConnectorTypeParams): (string | number)[] {
  const { connectorType, chains, ...config } = params;

  if (!connectorType) {
    console.warn('getChainsListByConnectorType: connectorType is required');
    return [];
  }

  const adapterType = getAdapterFromConnectorType(connectorType);
  const adapter = getChainAdapter(adapterType);

  if (adapter) {
    try {
      return adapter.getChains(config, chains);
    } catch (error) {
      console.warn(`getChainsListByConnectorType: the ${adapterType} chain helpers failed:`, error);
    }
  }

  return getFallbackChains(adapterType, config);
}

/**
 * Checks whether a chain list has only EVM chain IDs (numbers), with `isEvmChainList` of `@tuwaio/orbit-evm` when
 * `@tuwaio/nova-connect/evm` is imported.
 *
 * @param chains - Chain identifiers.
 * @returns `true` when the list is not empty and has only numbers.
 */
export function isEvmChainList(chains: (string | number)[]): boolean {
  const adapter = getChainAdapter(OrbitAdapter.EVM);
  return adapter
    ? adapter.isChainList(chains)
    : chains.length > 0 && chains.every((chain) => typeof chain === 'number');
}

/**
 * Checks whether a chain list has only Solana cluster monikers (strings), with `isSolanaChainList` of
 * `@tuwaio/orbit-solana` when `@tuwaio/nova-connect/solana` is imported.
 *
 * @param chains - Chain identifiers.
 * @returns `true` when the list is not empty and has only strings.
 */
export function isSolanaChainList(chains: (string | number)[]): boolean {
  const adapter = getChainAdapter(OrbitAdapter.SOLANA);
  return adapter
    ? adapter.isChainList(chains)
    : chains.length > 0 && chains.every((chain) => typeof chain === 'string');
}

/**
 * Reads `connectedWallet.chains` of a connection (the Wallet Standard wallet of a Solana connection). Wallets name
 * their clusters in the Wallet Standard form (`solana:devnet`), not with the genesis hash.
 *
 * @param connection - A connection, or any other value.
 * @returns The chains, or `undefined` when the value has no such array.
 *
 * @example
 * ```ts
 * import { getWalletChains } from '@tuwaio/nova-connect';
 *
 * getWalletChains({ connectedWallet: { chains: ['solana:mainnet', 'solana:devnet'] } });
 * // ['solana:mainnet', 'solana:devnet']
 * getWalletChains({}); // undefined
 * ```
 */
export function getWalletChains(connection: unknown): ChainIdentifierArray | undefined {
  if (!connection || typeof connection !== 'object' || !('connectedWallet' in connection)) return undefined;
  const { connectedWallet } = connection;
  if (!connectedWallet || typeof connectedWallet !== 'object' || !('chains' in connectedWallet)) return undefined;
  const { chains } = connectedWallet;
  if (!Array.isArray(chains)) return undefined;
  return chains.filter((chain): chain is string | number => typeof chain === 'string' || typeof chain === 'number');
}
