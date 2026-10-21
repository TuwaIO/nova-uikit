/**
 * @file The rule for offering speed-up and cancel of a pending transaction.
 */

import { Transaction, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';

/**
 * Whether a transaction can be sped up or canceled: it is pending and unconfirmed, tracked by the `ethereum` tracker,
 * sent with MetaMask, and its adapter has `speedUpTxAction` and `cancelTxAction`. The tracking modal and the
 * transaction details offer the two actions only then.
 *
 * @param tx - The transaction.
 * @param adapter - The adapter of the transaction's chain family.
 * @returns `true` when both actions can be offered.
 * @internal
 */
export function canReplaceTx<T extends Transaction>(tx: T | undefined, adapter: TxAdapter<T> | undefined): boolean {
  return !!(
    tx &&
    adapter?.speedUpTxAction &&
    adapter.cancelTxAction &&
    tx.pending &&
    (!tx.confirmations || Number(tx.confirmations) < 1) &&
    tx.tracker === TransactionTracker.Ethereum &&
    tx.connectorType?.split(':')[1] === 'metamask'
  );
}
