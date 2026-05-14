/**
 * @file This file contains the `TxActionButton`, a stateful button for initiating and tracking transactions.
 */

import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionPool, TransactionStatus } from '@tuwaio/pulsar-core';
import { ButtonHTMLAttributes, ReactNode, useEffect, useState } from 'react';

import { NovaTransactionsLabels } from '../i18n/types';
import { useLabels } from '../providers';
import { useNovaTransactionsError } from '../providers/NovaTransactionsErrorContext';

type ButtonStatus = 'idle' | 'loading' | 'succeed' | 'failed' | 'replaced';

const getDefaultContent = (labels: NovaTransactionsLabels['trackedTxButton']) => ({
  replaced: (
    <>
      <ArrowPathIcon className="novatx:h-4 novatx:w-4" />
      <span>{labels.replaced}</span>
    </>
  ),
  loading: (
    <>
      <ArrowPathIcon className="novatx:h-4 novatx:w-4 novatx:animate-spin" />
      <span>{labels.loading}</span>
    </>
  ),
  succeed: (
    <>
      <CheckCircleIcon className="novatx:h-4 novatx:w-4" />
      <span>{labels.succeed}</span>
    </>
  ),
  failed: (
    <>
      <ExclamationCircleIcon className="novatx:h-4 novatx:w-4" />
      <span>{labels.failed}</span>
    </>
  ),
});

/**
 * Props for the `TxActionButton` component.
 *
 * @template T The specific transaction type, extending the base `Transaction`.
 */
export type TxActionButtonProps<T extends Transaction> = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** The default idle-state content (rendered when no action is in progress). */
  children: ReactNode;
  /**
   * The async action to execute when the button is clicked.
   * Typically a wrapper around `executeTxAction` from the Pulsar store.
   *
   * If this function throws, the button transitions to the `'failed'` state **and**
   * the pre-submission error toast is automatically shown when the button is
   * rendered inside a `NovaTransactionsProvider`.
   */
  action: () => Promise<void>;
  /**
   * Selector function that returns the key of the last transaction added to the pool.
   * Used to track the result of the submitted transaction.
   */
  getLastTxKey: () => string | undefined;
  /** The live transaction pool from the Pulsar store. */
  transactionsPool: TransactionPool<T>;
  /** The currently connected wallet address. Changing this resets the button to idle. */
  walletAddress?: string;
  /** Custom content to display while the action is executing. */
  loadingContent?: ReactNode;
  /** Custom content to display after a successful transaction. */
  succeedContent?: ReactNode;
  /** Custom content to display when the action or transaction fails. */
  failedContent?: ReactNode;
  /** Custom content to display when the transaction is replaced. */
  replacedContent?: ReactNode;
  /**
   * Duration in milliseconds before the button resets to idle after reaching
   * a terminal state (`succeed`, `failed`, `replaced`).
   * @defaultValue `2500`
   */
  resetTimeout?: number;
  /** Granular classNames for state-specific styling. Each overrides default styles for that state. */
  classNames?: {
    /** Base button classes (always applied). */
    base?: string;
    /** Classes for idle state (replaces default if provided). */
    idle?: string;
    /** Classes for loading state (replaces default if provided). */
    loading?: string;
    /** Classes for succeed state (replaces default if provided). */
    succeed?: string;
    /** Classes for failed state (replaces default if provided). */
    failed?: string;
    /** Classes for replaced state (replaces default if provided). */
    replaced?: string;
    /** Classes for the status icon. */
    icon?: string;
    /** Classes for the label text. */
    label?: string;
  };
};

/**
 * A stateful button that orchestrates the full transaction lifecycle:
 * idle → loading → succeed / failed / replaced → idle (after `resetTimeout`).
 *
 * When rendered inside a `NovaTransactionsProvider`, any error thrown by `action()`
 * before the transaction reaches the pool is automatically surfaced as a
 * top-center validation error toast — no extra wiring required.
 *
 * @template T The specific transaction type, extending the base `Transaction`.
 */
export function TxActionButton<T extends Transaction>({
  children,
  action,
  getLastTxKey,
  transactionsPool,
  walletAddress,
  loadingContent,
  succeedContent,
  failedContent,
  replacedContent,
  resetTimeout = 2500,
  className,
  classNames,
  ...props
}: TxActionButtonProps<T>) {
  const { trackedTxButton } = useLabels();
  const { showPreSubmitErrorToast } = useNovaTransactionsError();
  const [status, setStatus] = useState<ButtonStatus>('idle');
  const [trackedTxKey, setTrackedTxKey] = useState<string | undefined>(undefined);

  const defaultContent = getDefaultContent(trackedTxButton);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('idle');
    setTrackedTxKey(undefined);
  }, [walletAddress]);

  useEffect(() => {
    if (!trackedTxKey) return;

    const trackedTx = transactionsPool[trackedTxKey];

    if (trackedTx) {
      switch (trackedTx.status) {
        case TransactionStatus.Success:
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStatus('succeed');
          break;
        case TransactionStatus.Replaced:
          setStatus('replaced');
          break;
        case TransactionStatus.Failed:
          setStatus('failed');
          break;
      }
    }
  }, [transactionsPool, trackedTxKey, walletAddress]);

  useEffect(() => {
    if (['succeed', 'failed', 'replaced'].includes(status)) {
      const timer = setTimeout(() => {
        setStatus('idle');
        setTrackedTxKey(undefined);
      }, resetTimeout);
      return () => clearTimeout(timer);
    }
  }, [status, resetTimeout]);

  const handleClick = async () => {
    setStatus('loading');
    try {
      await action();
      setTrackedTxKey(getLastTxKey());
    } catch (error) {
      showPreSubmitErrorToast(error);
      setStatus('failed');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return loadingContent ?? defaultContent.loading;
      case 'succeed':
        return succeedContent ?? defaultContent.succeed;
      case 'failed':
        return failedContent ?? defaultContent.failed;
      case 'replaced':
        return replacedContent ?? defaultContent.replaced;
      default:
        return children;
    }
  };

  // Default state-specific classes
  const defaultStateClasses = {
    idle: 'novatx:bg-[var(--tuwa-button-gradient-from)] novatx:text-[var(--tuwa-text-on-accent)] novatx:hover:opacity-90',
    loading: 'novatx:bg-gray-400 novatx:text-white',
    replaced: 'novatx:bg-gray-500 novatx:text-white',
    succeed: 'novatx:bg-[var(--tuwa-success-bg)] novatx:text-[var(--tuwa-success-text)]',
    failed: 'novatx:bg-[var(--tuwa-error-bg)] novatx:text-[var(--tuwa-error-text)]',
  };

  // Use custom classNames if provided, otherwise use defaults
  const stateClass = classNames?.[status] ?? defaultStateClasses[status];

  const baseClass =
    classNames?.base ??
    'novatx:flex novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:gap-1.5 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:px-3 novatx:py-1.5 novatx:text-sm novatx:font-medium novatx:transition-all novatx:duration-200 novatx:disabled:cursor-not-allowed novatx:disabled:opacity-70';

  return (
    <button
      {...props}
      disabled={status !== 'idle' || props.disabled}
      onClick={handleClick}
      className={cn(baseClass, stateClass, className)}
    >
      {renderContent()}
    </button>
  );
}
