/**
 * @file This file contains the `TransactionsHistory` component, which displays a list of past and pending transactions.
 * Supports infinite scrolling when `pagination` props are provided.
 */

import { cn, QuasarLoader } from '@tuwaio/nova-core';
import { selectAllTransactionsByActiveWallet, Transaction, TxInMemoryPagination } from '@tuwaio/pulsar-core';
import {
  ComponentType,
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useLabels } from '../providers/NovaTransactionsLabelsProvider';
import type { NovaTransactionsProviderProps } from '../providers/NovaTransactionsProvider';
import { latestRecordOf, successorOf } from '../utils/replacement';
import { TransactionDetails, TransactionDetailsCustomization } from './TransactionDetails';
import { TransactionHistoryItem, TransactionHistoryItemProps } from './TransactionHistoryItem';

/** Props of the placeholder of {@link TransactionsHistory} (no wallet connected, or no transactions). */
export type TransactionsHistoryPlaceholderProps = {
  /** The placeholder title. */
  title: string;
  /** The placeholder message. */
  message: string;
  /** Classes of the placeholder. */
  className?: string;
};

/** Props exposed to a custom Loader component */
export type TransactionsHistoryLoaderProps = {
  /** Classes from `customization.classNames.loaderContainer`. */
  className?: string;
  /** Classes from `customization.classNames.loaderIcon`. */
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
    /** Classes for the infinite scroll loader */
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
    Placeholder?: ComponentType<TransactionsHistoryPlaceholderProps>;
    /** Custom history item component */
    HistoryItem?: ComponentType<TransactionHistoryItemProps<T>>;
    /** Custom loader component rendered at the bottom during pagination loading */
    Loader?: ComponentType<TransactionsHistoryLoaderProps>;
  };
  /** Customization for the detailed transaction view */
  detailsCustomization?: TransactionDetailsCustomization;
};

/**
 * Props of {@link TransactionsHistory}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type TransactionsHistoryProps<T extends Transaction> = Pick<
  NovaTransactionsProviderProps<T>,
  'adapter' | 'transactionsPool' | 'connectedWalletAddress'
> & {
  /** Classes of the list. */
  className?: string;
  /** Class names and replacement components for the parts of the list and of the details view. */
  customization?: TransactionsHistoryCustomization<T>;
  /** Pagination state for infinite scroll. Uses TxInMemoryPagination from @tuwaio/pulsar-core. */
  pagination?: TxInMemoryPagination;
  /** Optional transaction key to open directly in detail view */
  initialTxKey?: string | null;
  /** Whether transaction details can be viewed by clicking on history items. Defaults to true. */
  canViewDetails?: boolean;
  /**
   * Called with the key of the selected transaction instead of opening its details inside the list; for a container
   * that shows them itself, as {@link TransactionsInfoModal} does under its own header.
   *
   * @param txKey - The `txKey` of the selected transaction.
   */
  onSelectTx?: (txKey: string) => void;
  /**
   * `removeTxFromPool` of the Pulsar store. With it, the details of a transaction pending for a long time offer to stop
   * tracking it.
   */
  removeTxFromPool?: (txKey: string) => void;
};

/** Duration (ms) for the error indicator to stay visible before fading out. */
const ERROR_DISPLAY_DURATION = 2500;

/**
 * Default loader component rendered at the bottom of the list during pagination loading.
 */
function DefaultLoader({ className, iconClassName }: TransactionsHistoryLoaderProps) {
  const { trackedTxButton } = useLabels();

  return (
    <div
      className={cn('novatx:flex novatx:items-center novatx:justify-center novatx:py-4', className)}
      role="status"
      aria-live="polite"
    >
      <QuasarLoader size={20} className={iconClassName} />
      <span className="novatx:sr-only">{trackedTxButton.loading}</span>
    </div>
  );
}

type HistoryRowProps<T extends Transaction> = Pick<
  TransactionHistoryItemProps<T>,
  'tx' | 'adapter' | 'canViewDetails' | 'customization'
> & {
  HistoryItem: ComponentType<TransactionHistoryItemProps<T>>;
  selectRow: (txKey: string) => void;
};

/** One row of the list, rendered again only when its own record changes. */
const HistoryRow = memo(function HistoryRow<T extends Transaction>({
  HistoryItem,
  selectRow,
  ...props
}: HistoryRowProps<T>) {
  return <HistoryItem {...props} onSelectTx={() => selectRow(props.tx.txKey)} />;
}) as <T extends Transaction>(props: HistoryRowProps<T> & { key: string }) => ReactElement;

/**
 * Error indicator that appears briefly when a fetch fails, then fades out.
 */
function PaginationErrorIndicator({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div
      className={cn('novatx:flex novatx:items-center novatx:justify-center novatx:py-3', className)}
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
}: TransactionsHistoryPlaceholderProps & { classNames?: { title?: string; message?: string } }) {
  return (
    <div
      className={cn(
        // The secondary background: the secondary text on the muted one reads at 4.4:1 only
        'novatx:rounded-[var(--tuwa-rounded-corners)] novatx:bg-[var(--tuwa-bg-secondary)] novatx:p-8 novatx:text-center',
        className,
      )}
    >
      <h4
        className={cn(
          'novatx:text-lg novatx:font-bold novatx:font-mono novatx:text-[var(--tuwa-text-primary)]',
          classNames?.title,
        )}
      >
        {title}
      </h4>
      <p className={cn('novatx:mt-1 novatx:text-sm novatx:text-[var(--tuwa-text-secondary)]', classNames?.message)}>
        {message}
      </p>
    </div>
  );
}

/**
 * The transactions of the connected wallet (`selectAllTransactionsByActiveWallet` from `@tuwaio/pulsar-core`), newest
 * first, with a placeholder when no wallet is connected or there are no transactions. Selecting an item opens
 * {@link TransactionDetails} (when `canViewDetails` is `true`; `initialTxKey` opens one directly), or calls
 * `onSelectTx` when it is set. With `pagination`, it calls `pagination.fetchNextPage(connectedWalletAddress)` when the
 * end of the list becomes visible (an `IntersectionObserver`) and shows a short error indicator when loading a page
 * fails.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 * @param props - See {@link TransactionsHistoryProps}.
 * @returns The list, or the details of the selected transaction.
 */
export function TransactionsHistory<T extends Transaction>({
  adapter,
  connectedWalletAddress,
  transactionsPool,
  className,
  customization,
  pagination,
  initialTxKey,
  canViewDetails = true,
  onSelectTx,
  removeTxFromPool,
}: TransactionsHistoryProps<T>) {
  const { transactionsModal } = useLabels();

  const [selectedTxKey, setSelectedTxKey] = useState<string | null>(canViewDetails ? (initialTxKey ?? null) : null);

  // Sync initialTxKey if it changes externally (e.g. from provider)
  useEffect(() => {
    if (initialTxKey && canViewDetails) {
      const timer = setTimeout(() => setSelectedTxKey(initialTxKey), 0);
      return () => clearTimeout(timer);
    }
  }, [initialTxKey, canViewDetails]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevIsErrorRef = useRef(false);
  const [showError, setShowError] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const sortedTransactions = useMemo(() => {
    if (!connectedWalletAddress) return [];
    const transactions = selectAllTransactionsByActiveWallet(transactionsPool, connectedWalletAddress);
    return transactions.sort((a, b) => (b.localTimestamp ?? 0) - (a.localTimestamp ?? 0));
  }, [transactionsPool, connectedWalletAddress]);

  // The rows below are memoized: a write to one record, about once a second on Solana, must not render all of them
  const classNames = customization?.classNames;
  const rowCustomization = useMemo(
    () => ({
      classNames: {
        container: classNames?.itemContainer,
        iconWrapper: classNames?.itemIconWrapper,
        icon: classNames?.itemIcon,
        contentWrapper: classNames?.itemContentWrapper,
        title: classNames?.itemTitle,
        timestamp: classNames?.itemTimestamp,
        description: classNames?.itemDescription,
        statusBadge: classNames?.itemStatusBadge,
        statusBadgeIcon: classNames?.itemStatusBadgeIcon,
        statusBadgeLabel: classNames?.itemStatusBadgeLabel,
        txKeyContainer: classNames?.itemTxKeyContainer,
        hashLabel: classNames?.itemHashLabel,
        hashLink: classNames?.itemHashLink,
        hashCopyButton: classNames?.itemHashCopyButton,
        originalHashLabel: classNames?.itemOriginalHashLabel,
        originalHashLink: classNames?.itemOriginalHashLink,
        originalHashCopyButton: classNames?.itemOriginalHashCopyButton,
      },
    }),
    [classNames],
  );
  // The latest props, from a function that stays the same for the rows
  const selectRow = useRef<(txKey: string) => void>(() => undefined);
  useEffect(() => {
    selectRow.current = (txKey) => {
      if (!canViewDetails) return;
      if (onSelectTx) onSelectTx(txKey);
      else setSelectedTxKey(txKey);
    };
  });
  const handleSelectRow = useCallback((txKey: string) => selectRow.current(txKey), []);

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

      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setShowError(false), ERROR_DISPLAY_DURATION);

      // Not the timer that hides it: when the next try cleared the error, the mark stayed on screen after the page had loaded
      return () => clearTimeout(showTimer);
    }
  }, [pagination?.isError]);

  useEffect(() => () => clearTimeout(errorTimerRef.current), []);

  // Read through an Effect Event: a failed page changes only its flags, and a new observer for them reports the sentinel in
  // view at once, which fetched that page again and again for as long as the end of the list was on screen
  const fetchNextPage = useEffectEvent(() => {
    if (pagination?.hasMore && !pagination.isLoading && connectedWalletAddress) {
      void pagination.fetchNextPage(connectedWalletAddress);
    }
  });

  /**
   * Attach IntersectionObserver to the sentinel element at the bottom of the list. A loaded page re-arms it, by
   * `currentPage`. After a failure the next try comes when the sentinel leaves the view and enters it again.
   */
  useEffect(() => {
    if (!pagination?.hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
    // `selectedTxKey` too: the details take the list and its sentinel away, and Back brings a new one to observe
  }, [pagination?.hasMore, pagination?.currentPage, connectedWalletAddress, selectedTxKey]);

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

    // One row for one operation: a sped-up record is shown in the details of the record that goes on
    const shownTransactions = sortedTransactions.filter((tx) => !successorOf(tx, transactionsPool));

    if (shownTransactions.length > 0) {
      return (
        <div
          className={cn(
            // Positioned: a screen reader text of a row is `absolute`, and it escaped an unpositioned list, which stretched the
            // whole window, with a second scroll and an empty band under its footer
            'NovaCustomScroll novatx:relative novatx:sm:max-h-[400px] novatx:overflow-y-auto novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)]',
            customization?.classNames?.listWrapper,
          )}
        >
          {shownTransactions.map((tx) => (
            <HistoryRow
              key={tx.txKey}
              HistoryItem={HistoryItem}
              tx={tx}
              adapter={adapter}
              canViewDetails={canViewDetails}
              customization={rowCustomization}
              selectRow={handleSelectRow}
            />
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

  if (selectedTxKey && !onSelectTx) {
    const opened = sortedTransactions.find((tx) => tx.txKey === selectedTxKey);
    // The details go on with the operation: a speed-up that lands while they are open must not leave them on the old record
    const selectedTx = opened && latestRecordOf(opened, transactionsPool);
    if (selectedTx) {
      return (
        <TransactionDetails
          tx={selectedTx}
          adapter={adapter}
          onBack={() => setSelectedTxKey(null)}
          customization={customization?.detailsCustomization}
          connectedWalletAddress={connectedWalletAddress}
          onStopTracking={
            removeTxFromPool &&
            ((txKey) => {
              removeTxFromPool(txKey);
              setSelectedTxKey(null);
            })
          }
        />
      );
    }
  }

  return (
    <div className={cn('novatx:flex novatx:flex-col novatx:gap-y-3', customization?.classNames?.container, className)}>
      {customization?.title && (
        <h3
          className={cn(
            'novatx:text-lg novatx:font-bold novatx:font-mono novatx:text-[var(--tuwa-text-primary)]',
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
