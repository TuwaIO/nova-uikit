/**
 * @file This file contains the `TxActionButton`, a stateful button for initiating and tracking transactions.
 * It provides users with immediate visual feedback throughout the lifecycle of a transaction,
 * from initiation to success, failure, or replacement.
 */

import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { IInitializeTxTrackingStore, Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { ButtonHTMLAttributes, JSX, ReactNode, useEffect, useState } from 'react';

import { useLabels } from '../providers';

/**
 * Defines the possible visual states of the button, which determine its appearance and content.
 * - `idle`: The default state, ready for user interaction.
 * - `loading`: The transaction has been initiated and is being processed.
 * - `succeed`: The transaction has been successfully completed.
 * - `failed`: The transaction failed or was rejected.
 * - `replaced`: The original transaction was replaced (e.g., sped up).
 */
type ButtonStatus = 'idle' | 'loading' | 'succeed' | 'failed' | 'replaced';

export interface TxActionButtonProps<TR, T extends Transaction<TR>>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    Pick<IInitializeTxTrackingStore<TR, T>, 'transactionsPool'> {
  /** The default content to display when the button is in its 'idle' state. Typically the button's primary call to action text. */
  children: ReactNode;
  /** The asynchronous function to execute when the button is clicked. This function should initiate the transaction and return a promise. */
  action: () => Promise<void>;
  /** A function that returns the unique key (e.g., transaction hash) of the most recently initiated transaction. This is used to link the button's state to a specific transaction in the pool. */
  getLastTxKey: () => string | undefined;
  /** Optional custom content to display in the 'loading' state. If not provided, a default spinner and text will be used. */
  loadingContent?: ReactNode;
  /** Optional custom content to display in the 'succeed' state. If not provided, a default success icon and text will be used. */
  succeedContent?: ReactNode;
  /** Optional custom content to display in the 'failed' state. If not provided, a default error icon and text will be used. */
  failedContent?: ReactNode;
  /** Optional custom content to display in the 'replaced' state. If not provided, a default icon and text will be used. */
  replacedContent?: ReactNode;
  /** The duration (in milliseconds) to display the 'succeed', 'failed', or 'replaced' state before automatically resetting the button to 'idle'. Defaults to 2500ms. */
  resetTimeout?: number;
}

/**
 * A stateful button that provides real-time feedback for a transaction's lifecycle.
 * It listens for changes in the global `transactionsPool` to automatically update its
 * visual state, showing loading, success, failure, and replaced statuses.
 *
 * @template TR - The generic type for the transaction tracker registry.
 * @template T - The generic type for the transaction object.
 * @param {TxActionButtonProps<TR, T>} props - The component props.
 * @returns {JSX.Element} The rendered stateful action button.
 */
export function TxActionButton<TR, T extends Transaction<TR>>({
  children,
  action,
  getLastTxKey,
  loadingContent,
  succeedContent,
  failedContent,
  replacedContent,
  resetTimeout = 2500,
  transactionsPool,
  className,
  ...props
}: TxActionButtonProps<TR, T>): JSX.Element {
  const labels = useLabels();
  const [status, setStatus] = useState<ButtonStatus>('idle');
  const [trackedTxKey, setTrackedTxKey] = useState<string | undefined>(undefined);

  // Effect 1: Monitors the transaction pool.
  // When the status of the tracked transaction changes, this effect updates the button's visual state.
  useEffect(() => {
    if (trackedTxKey) {
      const trackedTransaction = transactionsPool[trackedTxKey];
      if (trackedTransaction?.status) {
        switch (trackedTransaction.status) {
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
    }
  }, [transactionsPool, trackedTxKey]);

  // Effect 2: Resets the button to the 'idle' state.
  // After a terminal state ('succeed', 'failed', 'replaced') is displayed, this timer
  // resets the button to its initial state, ready for another action.
  useEffect(() => {
    if (status === 'succeed' || status === 'failed' || status === 'replaced') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setTrackedTxKey(undefined); // Unlink from the completed transaction.
      }, resetTimeout);
      return () => clearTimeout(timer); // Cleanup timer on component unmount or status change.
    }
  }, [status, resetTimeout]);

  /**
   * Handles the button's click event. It sets the status to 'loading' and invokes the provided action.
   * If the action fails immediately (e.g., user rejects in wallet), it sets the status to 'failed'.
   */
  const handleClick = async () => {
    setStatus('loading');
    try {
      await action();
      // After the action is initiated, get the key to start tracking.
      setTrackedTxKey(getLastTxKey());
    } catch (error) {
      console.error('Transaction initiation failed:', error);
      setStatus('failed');
    }
  };

  // --- Default Content for Different States ---
  const defaultReplacedContent = (
    <>
      <ArrowPathIcon className="h-4 w-4" />
      <span>{labels.trackedTxButton.replaced}</span>
    </>
  );
  const defaultLoadingContent = (
    <>
      <ArrowPathIcon className="h-4 w-4 animate-spin" />
      <span>{labels.trackedTxButton.loading}</span>
    </>
  );
  const defaultSucceedContent = (
    <>
      <CheckCircleIcon className="h-4 w-4" />
      <span>{labels.trackedTxButton.succeed}</span>
    </>
  );
  const defaultFailedContent = (
    <>
      <ExclamationCircleIcon className="h-4 w-4" />
      <span>{labels.trackedTxButton.failed}</span>
    </>
  );

  /**
   * Selects the appropriate content to render based on the current button status.
   * It prioritizes custom content props if they are provided.
   */
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return loadingContent ?? defaultLoadingContent;
      case 'succeed':
        return succeedContent ?? defaultSucceedContent;
      case 'failed':
        return failedContent ?? defaultFailedContent;
      case 'replaced':
        return replacedContent ?? defaultReplacedContent;
      case 'idle':
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
        'cursor-pointer flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70',
        status === 'idle' &&
          'bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-[var(--tuwa-text-on-accent)] hover:opacity-90',
        status === 'loading' && 'bg-gray-400 text-white',
        status === 'replaced' && 'bg-gray-500 text-white',
        status === 'succeed' && 'bg-[var(--tuwa-success-bg)] text-[var(--tuwa-success-text)]',
        status === 'failed' && 'bg-[var(--tuwa-error-bg)] text-[var(--tuwa-error-text)]',
        className,
      )}
    >
      {renderContent()}
    </button>
  );
}
