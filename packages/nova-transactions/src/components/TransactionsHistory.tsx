/**
 * @file This file contains the `TransactionsHistory` component, which displays a list of past and pending transactions.
 */

import { cn } from '@tuwaio/nova-core';
import { selectAllTransactionsByActiveWallet, Transaction } from '@tuwaio/pulsar-core';
import { ComponentType, JSX, ReactNode } from 'react';

import { NovaProviderProps, useLabels } from '../providers';
import { TransactionHistoryItem, TransactionHistoryItemProps } from './TransactionHistoryItem';
import { WalletInfoModalProps } from './WalletInfoModal';

type CustomPlaceholderProps = { title: string; message: string };

/**
 * Defines the customization options for the TransactionsHistory component.
 */
export type TransactionsHistoryCustomization<TR, T extends Transaction<TR>, A> = {
  classNames?: {
    /** CSS classes for the list's wrapper `div`. */
    listWrapper?: string;
  };
  components?: {
    /**
     * A render prop to replace the default placeholder component
     * (e.g., for "Connect Wallet" or "No Transactions").
     */
    placeholder?: (props: CustomPlaceholderProps) => ReactNode;
    /**
     * A custom component to use instead of the default `TransactionHistoryItem`.
     * This should be a component type, not a render function.
     */
    HistoryItem?: ComponentType<TransactionHistoryItemProps<TR, T, A>>;
  };
};

// A local component for displaying placeholder messages.
function HistoryPlaceholder({ title, message, className }: { title: string; message: string; className?: string }) {
  return (
    <div className={cn('rounded-lg bg-[var(--tuwa-bg-muted)] p-8 text-center', className)}>
      <h4 className="font-semibold text-[var(--tuwa-text-primary)]">{title}</h4>
      <p className="mt-1 text-sm text-[var(--tuwa-text-secondary)]">{message}</p>
    </div>
  );
}

/**
 * A component that displays a scrollable list of transactions for the connected wallet.
 * It handles states for when a wallet is not connected or when there is no history.
 *
 * @param {WalletInfoModalProps<TR, T> & { customization?: TransactionsHistoryCustomization<TR, T> }} props
 * @returns {JSX.Element} The rendered transaction history section.
 */
export function TransactionsHistory<TR, T extends Transaction<TR>, A>({
  adapters,
  connectedWalletAddress,
  transactionsPool,
  className,
  customization,
}: WalletInfoModalProps<TR, T, A> &
  Pick<NovaProviderProps<TR, T, A>, 'adapters'> & {
    className?: string;
    customization?: TransactionsHistoryCustomization<TR, T, A>;
  }): JSX.Element {
  const labels = useLabels();
  const C = customization?.components;

  const transactionsByWallet = connectedWalletAddress
    ? selectAllTransactionsByActiveWallet(transactionsPool, connectedWalletAddress)
    : [];

  // Sort transactions by timestamp, newest first.
  const sortedTransactions = [...transactionsByWallet].sort(
    (a, b) => (b.localTimestamp ?? 0) - (a.localTimestamp ?? 0),
  );

  const renderPlaceholder = (title: string, message: string) => {
    if (C?.placeholder) {
      return C.placeholder({ title, message });
    }
    return <HistoryPlaceholder title={title} message={message} />;
  };

  // Use the custom component if provided, otherwise default to TransactionHistoryItem.
  const HistoryItemComponent = C?.HistoryItem || TransactionHistoryItem;

  return (
    <div className={cn('flex flex-col gap-y-3', className)}>
      <h3 className="text-lg font-bold text-[var(--tuwa-text-primary)]">{labels.walletModal.history.title}</h3>

      {!connectedWalletAddress ? (
        // Case 1: Wallet is not connected.
        renderPlaceholder(
          labels.walletModal.history.connectWalletTitle,
          labels.walletModal.history.connectWalletMessage,
        )
      ) : sortedTransactions.length > 0 ? (
        // Case 2: Wallet is connected and there are transactions.
        <div
          className={cn(
            'max-h-[400px] overflow-y-auto rounded-lg border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)]',
            customization?.classNames?.listWrapper,
          )}
        >
          {sortedTransactions.map((tx) => (
            <HistoryItemComponent
              key={tx.txKey} // The key is now correctly and safely handled here.
              tx={tx}
              transactionsPool={transactionsPool}
              adapters={adapters}
            />
          ))}
        </div>
      ) : (
        // Case 3: Wallet is connected, but no transactions.
        renderPlaceholder(
          labels.walletModal.history.noTransactionsTitle,
          labels.walletModal.history.noTransactionsMessage,
        )
      )}
    </div>
  );
}
