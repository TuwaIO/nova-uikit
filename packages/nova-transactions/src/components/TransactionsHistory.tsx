/**
 * @file This file contains the `TransactionsHistory` component, which displays a list of past and pending transactions.
 */

import { cn } from '@tuwaio/nova-core';
import { selectAllTransactionsByActiveWallet, Transaction } from '@tuwaio/pulsar-core';
import { ComponentType, useMemo } from 'react';

import { NovaProviderProps, useLabels } from '../providers';
import { TransactionHistoryItem, TransactionHistoryItemProps } from './TransactionHistoryItem';

// --- Types for Customization & Props ---

type CustomPlaceholderProps = { title: string; message: string };

/**
 * Defines the customization options for the TransactionsHistory component.
 */
export type TransactionsHistoryCustomization<T extends Transaction> = {
  title?: string;
  classNames?: {
    listWrapper?: string;
  };
  components?: {
    Placeholder?: ComponentType<CustomPlaceholderProps>;
    HistoryItem?: ComponentType<TransactionHistoryItemProps<T>>;
  };
};

/**
 * Defines the props for the TransactionsHistory component.
 * @template T - The transaction type.
 */
export type TransactionsHistoryProps<T extends Transaction> = Pick<
  NovaProviderProps<T>,
  'adapter' | 'transactionsPool' | 'connectedWalletAddress'
> & {
  className?: string;
  customization?: TransactionsHistoryCustomization<T>;
};

// --- Default Sub-Components ---

function HistoryPlaceholder({ title, message, className }: CustomPlaceholderProps & { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-[var(--tuwa-bg-muted)] p-8 text-center', className)}>
      <h4 className="font-semibold text-[var(--tuwa-text-primary)]">{title}</h4>
      <p className="mt-1 text-sm text-[var(--tuwa-text-secondary)]">{message}</p>
    </div>
  );
}

/**
 * A component that displays a scrollable list of transactions for the connected wallet.
 * It handles states for when a wallet is not connected or when the history is empty.
 */
export function TransactionsHistory<T extends Transaction>({
  adapter,
  connectedWalletAddress,
  transactionsPool,
  className,
  customization,
}: TransactionsHistoryProps<T>) {
  const { transactionsModal } = useLabels();

  // Memoize the filtered and sorted transactions to prevent re-computation on every render.
  const sortedTransactions = useMemo(() => {
    if (!connectedWalletAddress) return [];
    const transactions = selectAllTransactionsByActiveWallet(transactionsPool, connectedWalletAddress);
    // Sort by timestamp, newest first.
    return transactions.sort((a, b) => (b.localTimestamp ?? 0) - (a.localTimestamp ?? 0));
  }, [transactionsPool, connectedWalletAddress]);

  // Use custom components if provided, otherwise fall back to the defaults.
  const { Placeholder = HistoryPlaceholder, HistoryItem = TransactionHistoryItem } = customization?.components ?? {};

  const renderContent = () => {
    if (!connectedWalletAddress) {
      return (
        <Placeholder
          title={transactionsModal.history.connectWalletTitle}
          message={transactionsModal.history.connectWalletMessage}
        />
      );
    }

    if (sortedTransactions.length > 0) {
      return (
        <div
          className={cn(
            'NovaCustomScroll max-h-[400px] overflow-y-auto rounded-lg border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)]',
            customization?.classNames?.listWrapper,
          )}
        >
          {sortedTransactions.map((tx) => (
            <HistoryItem key={tx.txKey} tx={tx} adapter={adapter} />
          ))}
        </div>
      );
    }

    return (
      <Placeholder
        title={transactionsModal.history.noTransactionsTitle}
        message={transactionsModal.history.noTransactionsMessage}
      />
    );
  };

  return (
    <div className={cn('flex flex-col gap-y-3', className)}>
      {customization?.title && (
        <h3 className="text-lg font-bold text-[var(--tuwa-text-primary)]">{customization?.title}</h3>
      )}
      {renderContent()}
    </div>
  );
}
