/**
 * Determines if the current chain is a Solana development or test network.
 *
 * It strictly checks if the ID is a string containing 'solana' AND
 * indicates a non-production environment ('devnet' or 'testnet').
 *
 * @param chainId - The chain identifier (e.g., "solana:devnet", 1, "ethereum").
 * @returns {boolean} True only if it is a Solana dev/test chain.
 */
export function isSolanaDev(chainId: number | string): boolean {
  if (typeof chainId !== 'string') return false;
  const normalizedId = chainId.toLowerCase();
  return normalizedId.includes('solana') && (normalizedId.includes('devnet') || normalizedId.includes('testnet'));
}
