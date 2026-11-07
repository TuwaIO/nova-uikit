/**
 * @file The state of the connect button from the transactions of the connected wallet.
 */

import { EvmTransaction, Transaction, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';

/** What the connect button shows about the transactions of the wallet. */
export type ConnectedTxStatus = 'idle' | 'loading' | 'succeed' | 'failed' | 'replaced' | 'cancelled';

const RESULTS: readonly ConnectedTxStatus[] = ['succeed', 'failed', 'replaced', 'cancelled'];

/**
 * Whether a status says that a transaction has ended.
 *
 * @param status - The status.
 * @returns `true` for a result.
 */
export const isTxResult = (status: ConnectedTxStatus): boolean => RESULTS.includes(status);

const asEvm = (tx: Transaction) => tx as unknown as EvmTransaction;

/**
 * Whether a replaced record goes on in a record of the new hash: only a speed-up does. The rule of `successorOf` of
 * `@tuwaio/nova-transactions`, which is an optional peer of this package.
 *
 * @param tx - The replaced record.
 * @param list - The records to look in.
 * @returns Whether it goes on.
 */
export function goesOnInNewRecord(tx: Transaction, list: Transaction[]): boolean {
  const { replacedTxHash, replacedReason } = asEvm(tx);
  if (tx.status !== TransactionStatus.Replaced || !replacedTxHash) return false;
  if (replacedReason ? replacedReason !== 'repriced' : tx.tracker === TransactionTracker.Safe) return false;
  return list.some(
    (other) =>
      other.txKey === replacedTxHash &&
      !(other.status === TransactionStatus.Replaced && asEvm(other).replacedTxHash === tx.txKey),
  );
}

/**
 * What the connect button should show after the transactions of the wallet changed. A result that has just arrived comes
 * first, so one transaction that never ends cannot hide every later result. A speed-up is not a result: the operation goes on
 * in the record of the new hash, so the button stays busy until that record has one.
 *
 * @param current - The transactions of the wallet now.
 * @param previous - The transactions of the wallet before the change.
 * @returns The status to show; `idle` means nothing has happened.
 */
export function connectedStatusFor(current: Transaction[], previous: Transaction[]): ConnectedTxStatus {
  let result: ConnectedTxStatus = 'idle';

  for (const tx of current) {
    const before = previous.find((prev) => prev.txKey === tx.txKey);
    // A new record of a speed-up can arrive already finished: it was pending as the record it replaced. Only if that record
    // was pending in the list: after a switch of wallet every old record of the new wallet looks new here, and a page of a
    // history can bring the new record of an old one. Nothing has happened in either case.
    const wasPending = before
      ? before.pending
      : previous.some((prev) => prev.txKey === asEvm(tx).replaces && prev.pending);
    if (!wasPending || !tx.status || tx.status === before?.status) continue;

    if (tx.status === TransactionStatus.Success) result = 'succeed';
    else if (tx.status === TransactionStatus.Failed) result = 'failed';
    else if (tx.status === TransactionStatus.Replaced && !goesOnInNewRecord(tx, current)) {
      result = asEvm(tx).replacedReason === 'cancelled' ? 'cancelled' : 'replaced';
    }
  }

  if (result !== 'idle') return result;
  return current.some((tx) => tx.pending) ? 'loading' : 'idle';
}

/**
 * What the button shows next, from what it shows now and what {@link connectedStatusFor} says.
 *
 * @param shown - What it shows now.
 * @param computed - What the change of the transactions says.
 * @returns The status to show. A shown result stays until its timer ends, which then goes back to busy if something is still
 * pending: any write to the pool meanwhile would otherwise cut the result to a moment.
 */
export function nextConnectedStatus(shown: ConnectedTxStatus, computed: ConnectedTxStatus): ConnectedTxStatus {
  if (computed === 'loading' && RESULTS.includes(shown)) return shown;
  if (computed === 'idle') return shown === 'loading' ? 'idle' : shown;
  return computed;
}
