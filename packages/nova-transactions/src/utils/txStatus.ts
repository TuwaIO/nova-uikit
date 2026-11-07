/**
 * @file What the interface shows for the state of a transaction: its tone, the share done and its label.
 */

import type { StatusTone } from '@tuwaio/nova-core';
import { getWalletFromConnectorType, isSameAddress, OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, Transaction, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';

import { NovaTransactionsLabels } from '../i18n/types';

/**
 * The tone of a transaction, for what is colored by status.
 *
 * @param tx - The transaction.
 * @returns `pending` while it is tracked, then `success` or `error`, and `neutral` for a replaced one: its money may well
 * have moved under the new hash, so red would be false.
 */
export function toneOf(tx: Pick<Transaction, 'pending' | 'status' | 'isError'>): StatusTone {
  if (tx.pending) return 'pending';
  if (tx.status === TransactionStatus.Success) return 'success';
  return tx.status === TransactionStatus.Failed || tx.isError ? 'error' : 'neutral';
}

const SOLANA_STAGES: Record<string, number> = { processed: 1 / 3, confirmed: 2 / 3, finalized: 1 };

/**
 * The share of a pending transaction that is really known: confirmations out of those required, or the commitment stage on
 * Solana.
 *
 * @param tx - The transaction.
 * @returns The share from 0 to 1, or `undefined` when nothing says how far it is, as with one confirmation to wait for. The
 * time since sending is no measure: nobody knows when a transaction lands.
 */
export function progressOf(tx: Transaction): number | undefined {
  const stage = 'confirmationStatus' in tx ? tx.confirmationStatus : undefined;
  if (stage) return SOLANA_STAGES[stage];
  const required = Number(tx.requiredConfirmations);
  const confirmations = Number(tx.confirmations);
  return required > 1 && confirmations > 0 ? confirmations / required : undefined;
}

/**
 * Whether a transaction has confirmations to show. A finalized Solana transaction says `MAX`, and a tick of a tracker can write
 * `0`, which must not be rendered next to a status.
 *
 * @param confirmations - The confirmations of the record.
 * @returns Whether to show them.
 */
export function hasConfirmations(confirmations: Transaction['confirmations']): boolean {
  return confirmations === 'MAX' || Number(confirmations) > 0;
}

/**
 * The label of the status of a transaction.
 *
 * @param tx - The transaction.
 * @param statuses - The status labels.
 * @returns The label. A replaced transaction says what happened, as "Replaced" alone does not say whether the money moved:
 * a speed-up went on, a cancel did not.
 */
export function statusLabelOf(tx: Transaction, statuses: NovaTransactionsLabels['statuses']): string {
  if (tx.pending) {
    // `finalized` too: the Solana tracker can write it while it still waits for the details, and it must not step back
    const stage = 'confirmationStatus' in tx ? tx.confirmationStatus : undefined;
    return stage === 'confirmed' || stage === 'finalized' ? statuses.confirmed : statuses.pending;
  }
  switch (tx.status) {
    case TransactionStatus.Success:
      return statuses.success;
    case TransactionStatus.Failed:
      return statuses.failed;
    case TransactionStatus.Replaced: {
      const { replacedReason } = tx as unknown as EvmTransaction;
      if (replacedReason === 'repriced') return statuses.spedUp;
      return replacedReason === 'cancelled' ? statuses.cancelled : statuses.replaced;
    }
    default:
      return tx.status ?? statuses.unknown;
  }
}

/**
 * Whether a failed transaction failed because its tracker gave up, which says nothing about the chain: it may still land, and
 * a Retry could send the operation a second time. A revert on the standard EVM tracker has no error of the tracker. Safe
 * writes one only on giving up in practice, as a saved record of the Gelato relay did. On Solana what had a commitment has landed, whatever came after.
 *
 * @param tx - The transaction.
 * @returns Whether Retry must not be offered.
 */
export function trackerGaveUp(tx: Transaction | undefined): boolean {
  if (tx?.status !== TransactionStatus.Failed || !tx.error) return false;
  switch (tx.tracker) {
    case TransactionTracker.Ethereum:
    case TransactionTracker.Safe:
      return true;
    case TransactionTracker.Solana:
      return 'confirmationStatus' in tx && !!tx.confirmationStatus;
    default:
      // A record saved when the Gelato relay was followed: a relay may have run it, so a Retry could send it twice
      return (tx.tracker as string) === 'gelato';
  }
}

/**
 * The wallet in a connector type. A record holds `evm:metamask`, and the adapter has a row of its own in the details.
 *
 * @param connectorType - The connector type of a transaction.
 * @returns The wallet part, or the value as it is without an adapter.
 */
export function walletPartOf(connectorType?: string): string | undefined {
  return getWalletFromConnectorType(connectorType) ?? connectorType;
}

/**
 * Whether a transaction was sent by a wallet: an EVM address in any case, a Solana address exactly, as base58 in
 * another case is another account.
 *
 * @param tx - The transaction.
 * @param wallet - The address of the wallet.
 * @returns `true` when it is the sender.
 */
export function isTxOfWallet(tx: Pick<Transaction, 'adapter' | 'from'>, wallet: string | undefined): boolean {
  if (!tx.from || !wallet) return false;
  return isSameAddress(tx.adapter === OrbitAdapter.EVM ? 'eip155' : tx.adapter, tx.from, wallet);
}

/**
 * The title a transaction shows: the one the app gave it, otherwise the default of the labels with its type in brackets,
 * which says what kind of transaction it is. A saved text would freeze one language, so the default is read here and never
 * written to the record.
 *
 * @param tx - The transaction.
 * @param tx.title - Its title, by status or one for all.
 * @param tx.type - Its type, from the app.
 * @param labels - The labels of a transaction.
 * @returns What to pass to `StatusAwareText` as `source`.
 */
export function txTitleSource(
  tx: { title?: string | readonly string[]; type?: string },
  labels: NovaTransactionsLabels['transaction'],
): string | readonly string[] {
  if (tx.title?.length) return tx.title;
  return tx.type ? `${labels.defaultTitle} (${tx.type})` : labels.defaultTitle;
}

/**
 * The description a toast shows: the one the app gave the transaction, otherwise a sentence about its status.
 *
 * @param tx - The transaction.
 * @param tx.description - Its description, by status or one for all.
 * @param labels - The labels of a transaction.
 * @returns What to pass to `StatusAwareText` as `source`, in the order pending, success, failed, replaced.
 */
export function txDescriptionSource(
  tx: { description?: string | readonly string[] },
  labels: NovaTransactionsLabels['transaction'],
): string | readonly string[] {
  if (tx.description?.length) return tx.description;
  const { pending, success, failed, replaced } = labels.defaultDescription;
  return [pending, success, failed, replaced];
}
