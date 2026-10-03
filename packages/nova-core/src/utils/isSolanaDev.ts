import { getSolanaDevCluster } from './solanaDevCluster';

/**
 * Determines if the current chain is a Solana development or test network.
 *
 * It checks that the ID is a Solana chain ID (or a string containing 'solana') that names a non-production cluster:
 * the genesis-hash chain ID of devnet or testnet (CAIP-30, e.g. `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`), or
 * 'devnet' / 'testnet' in any letter case (e.g. `solana:devnet`).
 *
 * @param chainId - The chain identifier (e.g., "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", "solana:devnet", 1).
 * @returns {boolean} True only if it is a Solana dev/test chain.
 */
export function isSolanaDev(chainId: number | string): boolean {
  return getSolanaDevCluster(chainId) !== undefined;
}
