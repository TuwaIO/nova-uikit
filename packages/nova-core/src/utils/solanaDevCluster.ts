import { getSolanaCluster } from '@tuwaio/orbit-core';

/**
 * Returns the Solana dev cluster of a chain identifier: a genesis-hash chain ID
 * (`solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`) or a cluster name (`solana:devnet`, case-insensitive). The cluster table
 * is the one of `getSolanaCluster` from `@tuwaio/orbit-core`.
 *
 * @param chainId - The chain identifier.
 * @returns `devnet` or `testnet`, or `undefined` for mainnet and other chains.
 * @internal
 */
export function getSolanaDevCluster(chainId: number | string): 'devnet' | 'testnet' | undefined {
  if (typeof chainId !== 'string') return undefined;
  const separator = chainId.indexOf(':');
  if (separator < 0 || chainId.slice(0, separator).toLowerCase() !== 'solana') return undefined;
  // Genesis hashes are case-sensitive; cluster names may come in any case
  const reference = chainId.slice(separator + 1);
  const cluster = getSolanaCluster(reference) ?? getSolanaCluster(reference.toLowerCase());
  return cluster === 'devnet' || cluster === 'testnet' ? cluster : undefined;
}
