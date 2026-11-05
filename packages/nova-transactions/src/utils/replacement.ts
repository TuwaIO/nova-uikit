/**
 * @file What the interface needs to know about a replaced transaction: which record goes on after it, what the replacement
 * was, and whether speed-up and cancel can be offered.
 */

import { EvmTransaction, Transaction, TransactionPool, TransactionStatus, TxAdapter } from '@tuwaio/pulsar-core';

const asEvm = (tx: Transaction) => tx as unknown as EvmTransaction;

/**
 * The record that goes on after a replaced one: Pulsar adds one for a speed-up, under the new hash. A cancel adds none, as it
 * is not the same operation, so a record the wallet happens to have under that hash does not continue it.
 *
 * @param tx - The replaced transaction.
 * @param pool - The transaction pool.
 * @returns The record of the new hash, or `undefined` when nothing goes on after this one.
 */
export function successorOf<T extends Transaction>(tx: T, pool: TransactionPool<T>): T | undefined {
  const { replacedTxHash, replacedReason } = asEvm(tx);
  if (tx.status !== TransactionStatus.Replaced || !replacedTxHash || replacedReason === 'cancelled') return undefined;
  return pool[replacedTxHash];
}

/**
 * Whether speed-up and cancel can be offered: the transaction is pending and not yet in a block, it is a standard EVM
 * transaction sent with MetaMask, the adapter has both actions, the tracker has read the nonce and fees they need, and the
 * connected account is the one that sent it. From another account the action is refused, as the same transfer would simply
 * be sent again.
 *
 * @param tx - The transaction.
 * @param adapter - The adapter of its chain family.
 * @param connectedWalletAddress - The connected account.
 * @returns `true` when both actions can be offered.
 */
export function canReplaceTx<T extends Transaction>(
  tx: T | undefined,
  adapter: TxAdapter<T> | undefined,
  connectedWalletAddress: string | undefined,
): boolean {
  if (!tx || !adapter?.speedUpTxAction || !adapter.cancelTxAction || !connectedWalletAddress) return false;
  const { nonce, maxFeePerGas, maxPriorityFeePerGas, sender } = asEvm(tx);
  return (
    tx.pending &&
    (!tx.confirmations || Number(tx.confirmations) < 1) &&
    tx.tracker === 'ethereum' &&
    tx.connectorType?.split(':')[1] === 'metamask' &&
    nonce !== undefined &&
    !!maxFeePerGas &&
    !!maxPriorityFeePerGas &&
    (sender ?? tx.from).toLowerCase() === connectedWalletAddress.toLowerCase()
  );
}

/** A person pressing "reject" in the wallet needs no message about it. */
export function isUserRejection(error: unknown): boolean {
  for (let current = error; current instanceof Error; current = current.cause) {
    const { name, message, code } = current as Error & { code?: number };
    if (name === 'UserRejectedRequestError' || code === 4001 || /user rejected|user denied/i.test(message)) return true;
  }
  return false;
}

/**
 * Runs speed-up or cancel, whose error nothing else would show: a replacement refused as underpriced, or a nonce already
 * spent, would otherwise look like a button that does nothing.
 *
 * @param action - `speedUpTxAction` or `cancelTxAction` of the adapter.
 * @param tx - The transaction to replace.
 * @param report - Shows an error to the person.
 * @returns A promise that resolves when the wallet has answered. It never rejects.
 */
export async function runReplacement<T extends Transaction>(
  action: (tx: T) => Promise<string>,
  tx: T,
  report: (error: unknown) => void,
): Promise<void> {
  try {
    await action(tx);
  } catch (error) {
    if (!isUserRejection(error)) report(error);
  }
}

/**
 * The explorer link of one hash of a transaction. The adapter's `getExplorerTxUrl` links to the newest hash, which on a
 * replaced record is not the hash shown next to the link.
 *
 * @param adapter - The adapter of its chain family.
 * @param tx - The transaction.
 * @param hash - The hash to link to.
 * @returns The URL, or `undefined` when there is none.
 */
export function explorerUrlOfHash<T extends Transaction>(
  adapter: TxAdapter<T> | undefined,
  tx: T,
  hash: string,
): string | undefined {
  return adapter?.getExplorerTxUrl?.({ ...tx, hash, replacedTxHash: undefined }) || undefined;
}

/** What {@link trackedButtonStep} tells a button to do. */
export type TrackedButtonStep =
  { kind: 'wait' } | { kind: 'follow'; txKey: string } | { kind: 'show'; status: 'succeed' | 'failed' | 'replaced' };

/**
 * What a button following a transaction should do. On a speed-up it goes on with the new record, and stays busy: saying
 * "Replaced" and unlocking while the operation is still running invites sending it twice.
 *
 * @param tx - The transaction the button follows.
 * @param pool - The transaction pool.
 * @returns The next step.
 */
export function trackedButtonStep<T extends Transaction>(tx: T, pool: TransactionPool<T>): TrackedButtonStep {
  switch (tx.status) {
    case TransactionStatus.Success:
      return { kind: 'show', status: 'succeed' };
    case TransactionStatus.Failed:
      return { kind: 'show', status: 'failed' };
    case TransactionStatus.Replaced: {
      const next = successorOf(tx, pool);
      return next ? { kind: 'follow', txKey: next.txKey } : { kind: 'show', status: 'replaced' };
    }
    default:
      return { kind: 'wait' };
  }
}

/** What {@link toastStepFor} tells the provider to do. */
export type ToastStep = { kind: 'skip' } | { kind: 'show' } | { kind: 'move'; from: string };

/**
 * What to do with the toast of a transaction when the pool changes. One toast carries one operation: on a speed-up the toast
 * of the old record becomes the toast of the new one, rather than two toasts telling one action apart.
 *
 * @param tx - The transaction as it is now.
 * @param prevTx - The transaction as it was, if it was in the pool.
 * @param pool - The transaction pool.
 * @param isToastActive - Whether a toast with this key is on screen.
 * @returns The next step.
 */
export function toastStepFor<T extends Transaction>(
  tx: T,
  prevTx: T | undefined,
  pool: TransactionPool<T>,
  isToastActive: (txKey: string) => boolean,
): ToastStep {
  // Its toast moves to the new record, and must not come back for it
  if (successorOf(tx, pool)) return { kind: 'skip' };
  const { replaces } = asEvm(tx);
  if (replaces && isToastActive(replaces)) return { kind: 'move', from: replaces };
  if (!prevTx) return tx.pending ? { kind: 'show' } : { kind: 'skip' };
  return JSON.stringify(prevTx) === JSON.stringify(tx) ? { kind: 'skip' } : { kind: 'show' };
}

/**
 * How long a pending transaction stays without a way to stop tracking it, in seconds. A transaction that waits for
 * minutes is normal on a busy network; one that waits this long may never end, as the store no longer gives up by itself.
 */
export const STOP_TRACKING_AFTER_SECONDS = 10 * 60;

/**
 * In how many seconds a transaction may be offered to stop tracking it.
 *
 * @param tx The transaction.
 * @param nowSeconds The current time, in seconds.
 * @returns The seconds left, zero or less once it is due, and `NaN` if the transaction has no time of sending.
 */
export function stopTrackingDueIn(tx: Transaction, nowSeconds: number): number {
  return STOP_TRACKING_AFTER_SECONDS - (nowSeconds - Number(tx.localTimestamp));
}
