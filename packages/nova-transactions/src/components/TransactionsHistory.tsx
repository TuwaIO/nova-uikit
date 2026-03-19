/**
 * @file This file contains the `TransactionsHistory` component, which displays a list of past and pending transactions.
 * Supports infinite scrolling when `pagination` props are provided.
 */

import { cn } from '@tuwaio/nova-core';
import { selectAllTransactionsByActiveWallet, Transaction, TxInMemoryPagination } from '@tuwaio/pulsar-core';
import { ComponentType, useCallback, useEffect, useRef, useState } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { TransactionHistoryItem, TransactionHistoryItemProps } from './TransactionHistoryItem';

type CustomPlaceholderProps = { title: string; message: string; className?: string };

/** Props exposed to a custom Loader component */
export type TransactionsHistoryLoaderProps = {
  className?: string;
  iconClassName?: string;
};

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
    /** Classes for the infinite scroll loader container */
    loaderContainer?: string;
    /** Classes for the infinite scroll loader icon (spinner) */
    loaderIcon?: string;
    /** Classes for the error indicator container */
    errorContainer?: string;
    /** Classes for the error indicator icon */
    errorIcon?: string;
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
    /** Custom loader component rendered at the bottom during pagination loading */
    Loader?: ComponentType<TransactionsHistoryLoaderProps>;
  };
};

export type TransactionsHistoryProps<T extends Transaction> = Pick<
  NovaTransactionsProviderProps<T>,
  'adapter' | 'transactionsPool' | 'connectedWalletAddress'
> & {
  className?: string;
  customization?: TransactionsHistoryCustomization<T>;
  /** Pagination state for infinite scroll. Uses TxInMemoryPagination from @tuwaio/pulsar-core. */
  pagination?: TxInMemoryPagination;
};

/** Duration (ms) for the error indicator to stay visible before fading out. */
const ERROR_DISPLAY_DURATION = 2500;

/**
 * Default loader component rendered at the bottom of the list during pagination loading.
 */
function DefaultLoader({ className, iconClassName }: TransactionsHistoryLoaderProps) {
  return (
    <div
      className={cn('novatx:flex novatx:items-center novatx:justify-center novatx:py-4', className)}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'novatx:h-5 novatx:w-5 novatx:animate-spin novatx:rounded-full novatx:border-2 novatx:border-[var(--tuwa-text-secondary)] novatx:border-t-transparent',
          iconClassName,
        )}
      />
    </div>
  );
}

/**
 * Error indicator that appears briefly when a fetch fails, then fades out.
 */
function PaginationErrorIndicator({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div
      className={cn(
        'novatx:flex novatx:items-center novatx:justify-center novatx:py-3 novatx:animate-[novatx-fade-out_0.4s_ease-out_2s_forwards]',
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('novatx:h-5 novatx:w-5 novatx:text-red-500', iconClassName)}
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

function HistoryPlaceholder({
  title,
  message,
  className,
  classNames,
}: CustomPlaceholderProps & { classNames?: { title?: string; message?: string } }) {
  return (
    <div
      className={cn(
        'novatx:rounded-[var(--tuwa-rounded-corners)] novatx:bg-[var(--tuwa-bg-muted)] novatx:p-8 novatx:text-center',
        className,
      )}
    >
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
  pagination,
}: TransactionsHistoryProps<T>) {
  const { transactionsModal } = useLabels();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevIsErrorRef = useRef(false);
  const [showError, setShowError] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const sortedTransactions = (() => {
    if (!connectedWalletAddress) return [];
    const transactions = selectAllTransactionsByActiveWallet(transactionsPool, connectedWalletAddress);
    return transactions.sort((a, b) => (b.localTimestamp ?? 0) - (a.localTimestamp ?? 0));
  })();

  /**
   * Detect isError rising edge (false → true) and show the error indicator.
   * Uses a timer ref to auto-hide after the display duration.
   * The setState call is wrapped in setTimeout(…, 0) to satisfy the
   * react-hooks/no-sync-set-state rule (no synchronous setState in effects).
   */
  useEffect(() => {
    const isError = pagination?.isError ?? false;
    const wasError = prevIsErrorRef.current;
    prevIsErrorRef.current = isError;

    if (isError && !wasError) {
      // Defer state update to the next microtask to avoid synchronous setState inside effect body
      const showTimer = setTimeout(() => setShowError(true), 0);

      errorTimerRef.current = setTimeout(() => setShowError(false), ERROR_DISPLAY_DURATION);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(errorTimerRef.current);
      };
    }
  }, [pagination?.isError]);

  /**
   * Stable callback for IntersectionObserver to trigger next page fetch.
   * Only fires when more pages are available and no request is in-flight.
   */
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && pagination?.hasMore && !pagination?.isLoading) {
        void pagination.fetchNextPage();
      }
    },
    [pagination],
  );

  /**
   * Attach IntersectionObserver to the sentinel element at the bottom of the list.
   * Observes only when pagination is active and more pages are available.
   */
  useEffect(() => {
    if (!pagination?.hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [pagination?.hasMore, handleIntersection]);

  const {
    Placeholder = HistoryPlaceholder,
    HistoryItem = TransactionHistoryItem,
    Loader = DefaultLoader,
  } = customization?.components ?? {};

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
            'NovaCustomScroll novatx:max-h-[400px] novatx:overflow-y-auto novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)]',
            customization?.classNames?.listWrapper,
          )}
        >
          {sortedTransactions.map((tx) => (
            <HistoryItem key={tx.txKey} tx={tx} adapter={adapter} customization={{ classNames: itemClassNames }} />
          ))}

          {/* Infinite scroll sentinel — observed by IntersectionObserver */}
          {pagination?.hasMore && <div ref={sentinelRef} className="novatx:h-px" aria-hidden="true" />}

          {/* Bottom loader visible during pagination fetch */}
          {pagination?.isLoading && (
            <Loader
              className={customization?.classNames?.loaderContainer}
              iconClassName={customization?.classNames?.loaderIcon}
            />
          )}

          {/* Brief error indicator on fetch failure */}
          {showError && (
            <PaginationErrorIndicator
              className={customization?.classNames?.errorContainer}
              iconClassName={customization?.classNames?.errorIcon}
            />
          )}
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
