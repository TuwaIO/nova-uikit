// Genesis-hash references (CAIP-30) of the Solana dev clusters, the same IDs as `SOLANA_CHAIN_IDS` of
// `@tuwaio/orbit-core`. nova-core has no Web3 dependencies, so the network names keep their own copy.
const DEV_CLUSTER_BY_GENESIS_REFERENCE: Readonly<Record<string, 'devnet' | 'testnet'>> = {
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1: 'devnet',
  '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'testnet',
  // Testnet before its genesis reset, still listed by WalletConnect and Reown
  '4uhcVJyU9pJkvQyS88uRfhDSfZSm8DoR': 'testnet',
};

/**
 * Returns the Solana dev cluster of a chain identifier: a genesis-hash chain ID
 * (`solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`) or a cluster name (`solana:devnet`, case-insensitive).
 *
 * @param chainId - The chain identifier.
 * @returns `devnet` or `testnet`, or `undefined` for mainnet and other chains.
 * @internal
 */
export function getSolanaDevCluster(chainId: number | string): 'devnet' | 'testnet' | undefined {
  if (typeof chainId !== 'string') return undefined;
  const normalizedId = chainId.toLowerCase();
  if (!normalizedId.includes('solana')) return undefined;
  const reference = chainId.split(':')[1] ?? '';
  if (Object.hasOwn(DEV_CLUSTER_BY_GENESIS_REFERENCE, reference)) return DEV_CLUSTER_BY_GENESIS_REFERENCE[reference];
  if (normalizedId.includes('devnet')) return 'devnet';
  if (normalizedId.includes('testnet')) return 'testnet';
  return undefined;
}
