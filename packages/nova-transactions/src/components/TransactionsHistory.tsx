/**
 * @file This file contains the `TransactionsHistory` component, which displays a list of past and pending transactions.
 */

import { cn } from '@tuwaio/nova-core';
import { selectAllTransactionsByActiveWallet, Transaction } from '@tuwaio/pulsar-core';
import { ComponentType, useMemo } from 'react';

import { NovaProviderProps, useLabels } from '../providers';
import { TransactionHistoryItem, TransactionHistoryItemProps } from './TransactionHistoryItem';

type CustomPlaceholderProps = { title: string; message: string };

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

export type TransactionsHistoryProps<T extends Transaction> = Pick<
  NovaProviderProps<T>,
  'adapter' | 'transactionsPool' | 'connectedWalletAddress'
> & {
  className?: string;
  customization?: TransactionsHistoryCustomization<T>;
};

function HistoryPlaceholder({ title, message, className }: CustomPlaceholderProps & { className?: string }) {
  return (
    <div className={cn('novatx:rounded-lg novatx:bg-[var(--tuwa-bg-muted)] novatx:p-8 novatx:text-center', className)}>
      <h4 className="novatx:font-semibold novatx:text-[var(--tuwa-text-primary)]">{title}</h4>
      <p className="novatx:mt-1 novatx:text-sm novatx:text-[var(--tuwa-text-secondary)]">{message}</p>
    </div>
  );
}

export function TransactionsHistory<T extends Transaction>({
  adapter,
  connectedWalletAddress,
  transactionsPool,
  className,
  customization,
}: TransactionsHistoryProps<T>) {
  const { transactionsModal } = useLabels();

  const sortedTransactions = useMemo(() => {
    if (!connectedWalletAddress) return [];
    const transactions = selectAllTransactionsByActiveWallet(transactionsPool, connectedWalletAddress);
    return transactions.sort((a, b) => (b.localTimestamp ?? 0) - (a.localTimestamp ?? 0));
  }, [transactionsPool, connectedWalletAddress]);

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
            'NovaCustomScroll novatx:max-h-[400px] novatx:overflow-y-auto novatx:rounded-lg novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)]',
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
    <div className={cn('novatx:flex novatx:flex-col novatx:gap-y-3', className)}>
      {customization?.title && (
        <h3 className="novatx:text-lg novatx:font-bold novatx:text-[var(--tuwa-text-primary)]">
          {customization?.title}
        </h3>
      )}
      {renderContent()}
    </div>
  );
}
