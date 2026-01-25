/**
 * @file This file contains the `TransactionsHistory` component, which displays a list of past and pending transactions.
 */

import { cn } from '@tuwaio/nova-core';
import { selectAllTransactionsByActiveWallet, Transaction } from '@tuwaio/pulsar-core';
import { ComponentType } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { TransactionHistoryItem, TransactionHistoryItemProps } from './TransactionHistoryItem';

type CustomPlaceholderProps = { title: string; message: string; className?: string };

/**
 * Customization options for TransactionsHistory component.
 * Allows styling of all sub-elements including individual transaction items.
 */
export type TransactionsHistoryCustomization<T extends Transaction> = {
  /** Custom title for the transactions history section */
  title?: string;
  /** Custom class name generators for all elements */
  classNames?: {
    /** Classes for the outer container */
    container?: string;
    /** Classes for the title element */
    titleText?: string;
    /** Classes for the list wrapper container */
    listWrapper?: string;
    /** Classes for the placeholder container */
    placeholderContainer?: string;
    /** Classes for the placeholder title */
    placeholderTitle?: string;
    /** Classes for the placeholder message */
    placeholderMessage?: string;
    // --- TransactionHistoryItem classNames ---
    /** Classes for individual transaction item container */
    itemContainer?: string;
    /** Classes for the icon wrapper */
    itemIconWrapper?: string;
    /** Classes for the icon itself */
    itemIcon?: string;
    /** Classes for the content wrapper (title, timestamp, description) */
    itemContentWrapper?: string;
    /** Classes for the title text */
    itemTitle?: string;
    /** Classes for the timestamp text */
    itemTimestamp?: string;
    /** Classes for the description text */
    itemDescription?: string;
    /** Classes for the status badge container */
    itemStatusBadge?: string;
    /** Classes for the status badge icon */
    itemStatusBadgeIcon?: string;
    /** Classes for the status badge label */
    itemStatusBadgeLabel?: string;
    /** Classes for the transaction key container */
    itemTxKeyContainer?: string;
    /** Classes for the default hash link label */
    itemHashLabel?: string;
    /** Classes for the default hash link */
    itemHashLink?: string;
    /** Classes for the default hash copy button */
    itemHashCopyButton?: string;
    /** Classes for the original hash link label (replaced transactions) */
    itemOriginalHashLabel?: string;
    /** Classes for the original hash link (replaced transactions) */
    itemOriginalHashLink?: string;
    /** Classes for the original hash copy button (replaced transactions) */
    itemOriginalHashCopyButton?: string;
  };
  /** Custom components */
  components?: {
    /** Custom placeholder component */
    Placeholder?: ComponentType<CustomPlaceholderProps>;
    /** Custom history item component */
    HistoryItem?: ComponentType<TransactionHistoryItemProps<T>>;
  };
};

export type TransactionsHistoryProps<T extends Transaction> = Pick<
  NovaTransactionsProviderProps<T>,
  'adapter' | 'transactionsPool' | 'connectedWalletAddress'
> & {
  className?: string;
  customization?: TransactionsHistoryCustomization<T>;
};

function HistoryPlaceholder({
  title,
  message,
  className,
  classNames,
}: CustomPlaceholderProps & { classNames?: { title?: string; message?: string } }) {
  return (
    <div className={cn('novatx:rounded-lg novatx:bg-[var(--tuwa-bg-muted)] novatx:p-8 novatx:text-center', className)}>
      <h4 className={cn('novatx:font-semibold novatx:text-[var(--tuwa-text-primary)]', classNames?.title)}>{title}</h4>
      <p className={cn('novatx:mt-1 novatx:text-sm novatx:text-[var(--tuwa-text-secondary)]', classNames?.message)}>
        {message}
      </p>
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

  const sortedTransactions = (() => {
    if (!connectedWalletAddress) return [];
    const transactions = selectAllTransactionsByActiveWallet(transactionsPool, connectedWalletAddress);
    return transactions.sort((a, b) => (b.localTimestamp ?? 0) - (a.localTimestamp ?? 0));
  })();

  const { Placeholder = HistoryPlaceholder, HistoryItem = TransactionHistoryItem } = customization?.components ?? {};

  const renderContent = () => {
    if (!connectedWalletAddress) {
      return (
        <Placeholder
          title={transactionsModal.history.connectWalletTitle}
          message={transactionsModal.history.connectWalletMessage}
          className={customization?.classNames?.placeholderContainer}
          classNames={{
            title: customization?.classNames?.placeholderTitle,
            message: customization?.classNames?.placeholderMessage,
          }}
        />
      );
    }

    if (sortedTransactions.length > 0) {
      // Extract item classNames from customization
      const itemClassNames = {
        container: customization?.classNames?.itemContainer,
        iconWrapper: customization?.classNames?.itemIconWrapper,
        icon: customization?.classNames?.itemIcon,
        contentWrapper: customization?.classNames?.itemContentWrapper,
        title: customization?.classNames?.itemTitle,
        timestamp: customization?.classNames?.itemTimestamp,
        description: customization?.classNames?.itemDescription,
        statusBadge: customization?.classNames?.itemStatusBadge,
        statusBadgeIcon: customization?.classNames?.itemStatusBadgeIcon,
        statusBadgeLabel: customization?.classNames?.itemStatusBadgeLabel,
        txKeyContainer: customization?.classNames?.itemTxKeyContainer,
        hashLabel: customization?.classNames?.itemHashLabel,
        hashLink: customization?.classNames?.itemHashLink,
        hashCopyButton: customization?.classNames?.itemHashCopyButton,
        originalHashLabel: customization?.classNames?.itemOriginalHashLabel,
        originalHashLink: customization?.classNames?.itemOriginalHashLink,
        originalHashCopyButton: customization?.classNames?.itemOriginalHashCopyButton,
      };

      return (
        <div
          className={cn(
            'NovaCustomScroll novatx:max-h-[400px] novatx:overflow-y-auto novatx:rounded-lg novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)]',
            customization?.classNames?.listWrapper,
          )}
        >
          {sortedTransactions.map((tx) => (
            <HistoryItem key={tx.txKey} tx={tx} adapter={adapter} customization={{ classNames: itemClassNames }} />
          ))}
        </div>
      );
    }

    return (
      <Placeholder
        title={transactionsModal.history.noTransactionsTitle}
        message={transactionsModal.history.noTransactionsMessage}
        className={customization?.classNames?.placeholderContainer}
        classNames={{
          title: customization?.classNames?.placeholderTitle,
          message: customization?.classNames?.placeholderMessage,
        }}
      />
    );
  };

  return (
    <div className={cn('novatx:flex novatx:flex-col novatx:gap-y-3', customization?.classNames?.container, className)}>
      {customization?.title && (
        <h3
          className={cn(
            'novatx:text-lg novatx:font-bold novatx:text-[var(--tuwa-text-primary)]',
            customization?.classNames?.titleText,
          )}
        >
          {customization?.title}
        </h3>
      )}
      {renderContent()}
    </div>
  );
}
