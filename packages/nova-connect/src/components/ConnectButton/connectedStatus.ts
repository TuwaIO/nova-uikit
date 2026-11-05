/**
 * @file The state of the connect button from the transactions of the connected wallet.
 */

import { EvmTransaction, Transaction, TransactionStatus } from '@tuwaio/pulsar-core';

/** What the connect button shows about the transactions of the wallet. */
export type ConnectedTxStatus = 'idle' | 'loading' | 'succeed' | 'failed' | 'replaced';

const asEvm = (tx: Transaction) => tx as unknown as EvmTransaction;

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
    // A new record of a speed-up can arrive already finished: it was pending as the record it replaced
    const wasPending = before ? before.pending : !!asEvm(tx).replaces;
    if (!wasPending || !tx.status || tx.status === before?.status) continue;

    if (tx.status === TransactionStatus.Success) result = 'succeed';
    else if (tx.status === TransactionStatus.Failed) result = 'failed';
    else if (tx.status === TransactionStatus.Replaced) {
      const { replacedTxHash, replacedReason } = asEvm(tx);
      const goesOn = replacedReason !== 'cancelled' && current.some((other) => other.txKey === replacedTxHash);
      if (!goesOn) result = 'replaced';
    }
  }

  if (result !== 'idle') return result;
  return current.some((tx) => tx.pending) ? 'loading' : 'idle';
}
