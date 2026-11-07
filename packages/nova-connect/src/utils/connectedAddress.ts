import { isSameAddress, OrbitAdapter } from '@tuwaio/orbit-core';

/**
 * Whether a transaction was sent by the connected wallet: an EVM address in any case, a Solana address exactly, as base58
 * in another case is another account.
 *
 * @param tx - The transaction, with its adapter and sender.
 * @param tx.adapter - The adapter of the transaction.
 * @param tx.from - The sender of the transaction.
 * @param address - The address of the wallet.
 * @returns `true` when it is the sender.
 * @internal
 */
export function isSameWallet(tx: { adapter: OrbitAdapter; from: string }, address: string): boolean {
  return isSameAddress(tx.adapter === OrbitAdapter.EVM ? 'eip155' : tx.adapter, tx.from, address);
}
