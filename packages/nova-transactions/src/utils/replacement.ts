/**
 * @file What the interface needs to know about a replaced transaction: which record goes on after it, what the replacement
 * was, and whether speed-up and cancel can be offered.
 */

import {
  EvmTransaction,
  Transaction,
  TransactionPool,
  TransactionStatus,
  TransactionTracker,
  TxAdapter,
} from '@tuwaio/pulsar-core';

const asEvm = (tx: Transaction) => tx as unknown as EvmTransaction;

/**
 * The record that goes on after a replaced one: Pulsar adds one for a speed-up, under the new hash. A cancel, or another
 * transaction in the same nonce, is not the same operation, so a record the wallet happens to have under that hash does not
 * continue it. The same goes for a Safe record, whose replaced hash is the other proposal that was executed. A server row may
 * say no reason at all, and then the record of its new hash is taken to go on.
 *
 * @param tx - The replaced transaction.
 * @param pool - The transaction pool.
 * @returns The record of the new hash, or `undefined` when nothing goes on after this one.
 */
export function successorOf<T extends Transaction>(tx: T, pool: TransactionPool<T>): T | undefined {
  const { replacedTxHash, replacedReason } = asEvm(tx);
  if (tx.status !== TransactionStatus.Replaced || !replacedTxHash) return undefined;
  if (replacedReason ? replacedReason !== 'repriced' : tx.tracker === TransactionTracker.Safe) return undefined;
  const next = pool[replacedTxHash];
  // A pool that keeps results has both as replaced by each other after a reorganization: neither goes on, and both stay shown
  if (next?.status === TransactionStatus.Replaced && asEvm(next).replacedTxHash === tx.txKey) return undefined;
  return next;
}

/**
 * The record where an operation stands now, following every speed-up from the record given.
 *
 * @param tx - A record of the operation.
 * @param pool - The transaction pool.
 * @returns The newest record of the operation.
 */
export function latestRecordOf<T extends Transaction>(tx: T, pool: TransactionPool<T>): T {
  const seen = new Set([tx.txKey]);
  let latest = tx;
  for (let next = successorOf(latest, pool); next && !seen.has(next.txKey); next = successorOf(latest, pool)) {
    seen.add(next.txKey);
    latest = next;
  }
  return latest;
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

const ZERO_HASH = /^0x0+$/;
const TX_HASH = /^0x[0-9a-fA-F]{64}$/;

/**
 * The explorer link of one hash of a transaction. The adapter's `getExplorerTxUrl` links to the newest hash, which on a
 * replaced record is not the hash shown next to the link.
 *
 * @param adapter - The adapter of its chain family.
 * @param tx - The transaction.
 * @param hash - The hash to link to. Without it the link is whatever the adapter gives for the record, which is none for an
 * EIP-5792 batch without a hash: its ID is no transaction an explorer knows.
 * @returns The URL, or `undefined` when there is none.
 */
export function explorerUrlOfHash<T extends Transaction>(
  adapter: TxAdapter<T> | undefined,
  tx: T,
  hash?: string,
): string | undefined {
  if (!hash) return adapter?.getExplorerTxUrl?.(tx) || undefined;
  if (ZERO_HASH.test(hash)) return undefined;
  // A Safe link is built from the key of the record, whatever the hash, and the hash replacing a proposal is the key of another
  const isOtherProposal = tx.tracker === TransactionTracker.Safe && hash !== tx.txKey && hash !== asEvm(tx).hash;
  const target = isOtherProposal ? { ...tx, txKey: hash } : tx;
  return adapter?.getExplorerTxUrl?.({ ...target, hash, replacedTxHash: undefined }) || undefined;
}

/**
 * The explorer link of the hash a sped-up record replaced.
 *
 * @param adapter - The adapter of its chain family.
 * @param tx - The new record.
 * @param replaces - The key of the record it replaced, which is a batch or user operation ID on some trackers.
 * @returns The URL, or `undefined` for a key that is not a transaction hash.
 */
export function explorerUrlOfReplaced<T extends Transaction>(
  adapter: TxAdapter<T> | undefined,
  tx: T,
  replaces: string,
): string | undefined {
  return TX_HASH.test(replaces) ? explorerUrlOfHash(adapter, tx, replaces) : undefined;
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

/**
 * The id of the toast of a transaction: the key of the first record of the operation. One toast carries one operation, and
 * it keeps one id for that: giving it the new key on a speed-up would put it behind the other toasts of the stack, out of
 * place until the stack is laid out again. It also holds when a reorganization brings the first record back.
 *
 * @param tx - The transaction.
 * @param pool - The transaction pool.
 * @returns The id of its toast.
 */
export function toastIdOf<T extends Transaction>(tx: T, pool: TransactionPool<T>): string {
  const seen = new Set([tx.txKey]);
  let first = tx;
  for (
    let previous = pool[asEvm(first).replaces ?? ''];
    previous && !seen.has(previous.txKey);
    previous = pool[asEvm(first).replaces ?? '']
  ) {
    seen.add(previous.txKey);
    first = previous;
  }
  return first.txKey;
}

/** What {@link toastStepFor} tells the provider to do. */
export type ToastStep = { kind: 'skip' } | { kind: 'show'; toastId: string };

/**
 * What to do with the toast of a transaction when the pool changes.
 *
 * @param tx - The transaction as it is now.
 * @param prevTx - The transaction as it was, if it was in the pool.
 * @param pool - The transaction pool.
 * @param isToastActive - Whether a toast with this id is on screen.
 * @returns The next step.
 */
export function toastStepFor<T extends Transaction>(
  tx: T,
  prevTx: T | undefined,
  pool: TransactionPool<T>,
  isToastActive: (toastId: string) => boolean,
): ToastStep {
  // The record that goes on speaks for the operation from here
  if (successorOf(tx, pool)) return { kind: 'skip' };
  const toastId = toastIdOf(tx, pool);
  if (!prevTx) return tx.pending || isToastActive(toastId) ? { kind: 'show', toastId } : { kind: 'skip' };
  return JSON.stringify(prevTx) === JSON.stringify(tx) ? { kind: 'skip' } : { kind: 'show', toastId };
}

/**
 * The toasts to close as their records left the pool, as when a person stops tracking a transaction. Such a toast would stay
 * on Pending for good, with buttons for a transaction nothing tracks any more.
 *
 * @param prevPool - The pool before the change.
 * @param pool - The pool now.
 * @returns The ids of the toasts to close.
 */
export function toastsOfRemoved<T extends Transaction>(
  prevPool: TransactionPool<T>,
  pool: TransactionPool<T>,
): string[] {
  return Object.values(prevPool)
    .filter((tx) => !pool[tx.txKey] && !successorOf(tx, prevPool))
    .map((tx) => toastIdOf(tx, prevPool));
}

/**
 * The pool as the toasts should find it when the page opens: without what is pending, so that a transaction still pending
 * after a reload gets a toast, and with it the way to speed it up or stop tracking it. A toast for every finished record would
 * be noise.
 *
 * @param pool - The pool when the page opens.
 * @returns The pool of what has finished.
 */
export function settledRecordsOf<T extends Transaction>(pool: TransactionPool<T>): TransactionPool<T> {
  return Object.fromEntries(Object.entries(pool).filter(([, tx]) => !tx.pending));
}

/**
 * What a click of a tracked button leads to once its action has run.
 *
 * @param click - What is known after the action.
 * @param click.walletAtClick - The wallet when the button was pressed.
 * @param click.walletNow - The wallet now.
 * @param click.keyBefore - The last transaction key before the action.
 * @param click.keyAfter - The last transaction key after it.
 * @returns `track` to follow the new transaction; `idle` when the action added none, as when an app catches a rejection and
 * returns nothing, as the button would otherwise wait for good or show the result of an older transaction; `ignore` when the
 * wallet changed meanwhile, as the result belongs to the other wallet.
 */
export function afterTrackedAction(click: {
  walletAtClick?: string;
  walletNow?: string;
  keyBefore?: string;
  keyAfter?: string;
}): 'track' | 'idle' | 'ignore' {
  if (click.walletAtClick !== click.walletNow) return 'ignore';
  return click.keyAfter && click.keyAfter !== click.keyBefore ? 'track' : 'idle';
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
