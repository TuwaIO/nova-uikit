/**
 * @file This file contains the `TxActionButton`, a stateful button for initiating and tracking transactions.
 */

import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn, MorphIcon, MorphText, QuasarLoader } from '@tuwaio/nova-core';
import { EvmTransaction, Transaction, TransactionPool } from '@tuwaio/pulsar-core';
import { ButtonHTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react';

import { useLabels } from '../providers';
import { useNovaTransactionsError } from '../providers/NovaTransactionsErrorContext';
import { afterTrackedAction, trackedButtonStep } from '../utils/replacement';

type ButtonStatus = 'idle' | 'loading' | 'succeed' | 'failed' | 'replaced';

const ICON_CLASSES = 'novatx:h-4 novatx:w-4';

const STATUS_ICONS = {
  loading: <QuasarLoader size={16} accent="currentColor" />,
  succeed: <CheckCircleIcon className={ICON_CLASSES} />,
  failed: <ExclamationCircleIcon className={ICON_CLASSES} />,
  replaced: <ArrowPathIcon className={ICON_CLASSES} />,
};

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
  /**
   * Custom content to display when the transaction is replaced by something else than a speed-up: after a speed-up the button
   * stays busy with the record that goes on.
   */
  replacedContent?: ReactNode;
  /** Custom content to display when the transaction is cancelled. Defaults to `replacedContent`, then to the label. */
  cancelledContent?: ReactNode;
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
 * idle → loading → succeed / failed / replaced → idle (after `resetTimeout`). After a speed-up it goes on with the new
 * record and stays busy until that has a result; a record that is removed sends it back to idle.
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
  cancelledContent,
  resetTimeout = 2500,
  className,
  classNames,
  ...props
}: TxActionButtonProps<T>) {
  const { trackedTxButton } = useLabels();
  const { showPreSubmitErrorToast } = useNovaTransactionsError();
  const [status, setStatus] = useState<ButtonStatus>('idle');
  const [trackedTxKey, setTrackedTxKey] = useState<string | undefined>(undefined);
  const [wasCancelled, setWasCancelled] = useState(false);
  const seenTrackedTxKey = useRef<string | undefined>(undefined);
  const latestWallet = useRef(walletAddress);

  useEffect(() => {
    latestWallet.current = walletAddress;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('idle');
    setTrackedTxKey(undefined);
  }, [walletAddress]);

  useEffect(() => {
    if (!trackedTxKey) return;

    const trackedTx = transactionsPool[trackedTxKey];

    if (!trackedTx) {
      // Removed after it was seen, for example as its tracking was stopped. A pool can also lag behind the key at first.
      if (seenTrackedTxKey.current === trackedTxKey) {
        setStatus('idle');
        setTrackedTxKey(undefined);
      }
      return;
    }
    seenTrackedTxKey.current = trackedTxKey;

    const step = trackedButtonStep(trackedTx, transactionsPool);
    if (step.kind === 'follow') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrackedTxKey(step.txKey);
    } else if (step.kind === 'show') {
      setStatus(step.status);
      setWasCancelled((trackedTx as unknown as EvmTransaction).replacedReason === 'cancelled');
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
    const walletAtClick = walletAddress;
    const keyBefore = getLastTxKey();
    setStatus('loading');
    try {
      await action();
      const keyAfter = getLastTxKey();
      const next = afterTrackedAction({ walletAtClick, walletNow: latestWallet.current, keyBefore, keyAfter });
      if (next === 'track') setTrackedTxKey(keyAfter);
      else if (next === 'idle') setStatus('idle');
    } catch (error) {
      if (walletAtClick !== latestWallet.current) return;
      showPreSubmitErrorToast(error);
      setStatus('failed');
    }
  };

  const renderContent = () => {
    if (status === 'idle') return typeof children === 'string' ? <MorphText>{children}</MorphText> : children;

    const replacedOrCancelled = wasCancelled ? (cancelledContent ?? replacedContent) : replacedContent;
    const custom = {
      loading: loadingContent,
      succeed: succeedContent,
      failed: failedContent,
      replaced: replacedOrCancelled,
    }[status];
    if (custom) return custom;

    const label = status === 'replaced' && wasCancelled ? trackedTxButton.cancelled : trackedTxButton[status];
    return (
      <>
        <MorphIcon iconKey={status} animateFirst className={classNames?.icon}>
          {STATUS_ICONS[status]}
        </MorphIcon>
        <span className={classNames?.label}>
          <MorphText>{label}</MorphText>
        </span>
      </>
    );
  };

  // Default state-specific classes
  const defaultStateClasses = {
    idle: 'novatx:bg-[var(--tuwa-button-gradient-from)] novatx:text-[var(--tuwa-text-on-accent)] novatx:hover:opacity-90',
    loading: 'novatx:bg-[var(--tuwa-pending-bg)] novatx:text-[var(--tuwa-pending-text)]',
    replaced: 'novatx:bg-[var(--tuwa-info-bg)] novatx:text-[var(--tuwa-info-text)]',
    succeed: 'novatx:bg-[var(--tuwa-success-bg)] novatx:text-[var(--tuwa-success-text)]',
    failed: 'novatx:bg-[var(--tuwa-error-bg)] novatx:text-[var(--tuwa-error-text)]',
  };

  // Use custom classNames if provided, otherwise use defaults
  const stateClass = classNames?.[status] ?? defaultStateClasses[status];

  const baseClass =
    classNames?.base ??
    'novatx:flex novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:gap-1.5 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:px-3 novatx:py-1.5 novatx:min-h-[42px] novatx:text-sm novatx:font-mono novatx:font-medium novatx:transition-all novatx:duration-200 novatx:disabled:cursor-not-allowed novatx:disabled:opacity-70';

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
