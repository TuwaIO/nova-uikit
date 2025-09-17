/**
 * @file This file contains the `TxActionButton`, a stateful button for initiating and tracking transactions.
 * It provides users with immediate visual feedback throughout the lifecycle of a transaction.
 */

import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionPool, TransactionStatus } from '@tuwaio/pulsar-core';
import { ButtonHTMLAttributes, ReactNode, useEffect, useMemo, useState } from 'react';

import { TuwaLabels } from '../i18n/types';
import { useLabels } from '../providers';

/**
 * Defines the possible visual states of the button.
 */
type ButtonStatus = 'idle' | 'loading' | 'succeed' | 'failed' | 'replaced';

/**
 * A factory function to create the default content for each button state.
 * Defined outside the component to prevent re-creation on every render.
 */
const getDefaultContent = (labels: TuwaLabels['trackedTxButton']) => ({
  replaced: (
    <>
      <ArrowPathIcon className="h-4 w-4" />
      <span>{labels.replaced}</span>
    </>
  ),
  loading: (
    <>
      <ArrowPathIcon className="h-4 w-4 animate-spin" />
      <span>{labels.loading}</span>
    </>
  ),
  succeed: (
    <>
      <CheckCircleIcon className="h-4 w-4" />
      <span>{labels.succeed}</span>
    </>
  ),
  failed: (
    <>
      <ExclamationCircleIcon className="h-4 w-4" />
      <span>{labels.failed}</span>
    </>
  ),
});

export type TxActionButtonProps<T extends Transaction> = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** The default content to display when the button is 'idle'. */
  children: ReactNode;
  /** The async function to execute when the button is clicked to initiate the transaction. */
  action: () => Promise<void>;
  /** A function that returns the unique key of the most recently initiated transaction. */
  getLastTxKey: () => string | undefined;
  /** The global transaction pool from the Pulsar store. */
  transactionsPool: TransactionPool<T>;
  /** Optional active wallet address. If provided, the button will only track transactions from this address. */
  walletAddress?: string;
  /** Optional custom content for the 'loading' state. */
  loadingContent?: ReactNode;
  /** Optional custom content for the 'succeed' state. */
  succeedContent?: ReactNode;
  /** Optional custom content for the 'failed' state. */
  failedContent?: ReactNode;
  /** Optional custom content for the 'replaced' state. */
  replacedContent?: ReactNode;
  /** The duration (in ms) to display a final state before resetting to 'idle'. Defaults to 2500ms. */
  resetTimeout?: number;
};

/**
 * A stateful button that provides real-time feedback for a transaction's lifecycle.
 * It listens for changes in `transactionsPool` to automatically update its visual state.
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
  ...props
}: TxActionButtonProps<T>) {
  const { trackedTxButton } = useLabels();
  const [status, setStatus] = useState<ButtonStatus>('idle');
  const [trackedTxKey, setTrackedTxKey] = useState<string | undefined>(undefined);

  // Memoize default content to avoid re-creating it on every render.
  const defaultContent = useMemo(() => getDefaultContent(trackedTxButton), [trackedTxButton]);

  // Effect 1: Reset the button's state if the connected wallet changes.
  useEffect(() => {
    setStatus('idle');
    setTrackedTxKey(undefined);
  }, [walletAddress]);

  // Effect 2: Monitor the transaction pool for status updates.
  useEffect(() => {
    if (!trackedTxKey) return;

    const trackedTx = transactionsPool[trackedTxKey];

    if (trackedTx) {
      switch (trackedTx.status) {
        case TransactionStatus.Success:
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

  // Effect 3: Automatically reset the button to 'idle' after a final state is shown.
  useEffect(() => {
    if (['succeed', 'failed', 'replaced'].includes(status)) {
      const timer = setTimeout(() => {
        setStatus('idle');
        setTrackedTxKey(undefined); // Unlink from the completed transaction.
      }, resetTimeout);
      return () => clearTimeout(timer); // Cleanup timer.
    }
  }, [status, resetTimeout]);

  const handleClick = async () => {
    setStatus('loading');
    try {
      await action();
      // After the action resolves, get the key to start tracking this specific transaction.
      setTrackedTxKey(getLastTxKey());
    } catch (error) {
      console.error('Transaction initiation failed:', error);
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

  return (
    <button
      {...props}
      disabled={status !== 'idle' || props.disabled}
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70',
        {
          'bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-[var(--tuwa-text-on-accent)] hover:opacity-90':
            status === 'idle',
          'bg-gray-400 text-white': status === 'loading',
          'bg-gray-500 text-white': status === 'replaced',
          'bg-[var(--tuwa-success-bg)] text-[var(--tuwa-success-text)]': status === 'succeed',
          'bg-[var(--tuwa-error-bg)] text-[var(--tuwa-error-text)]': status === 'failed',
        },
        className,
      )}
    >
      {renderContent()}
    </button>
  );
}
