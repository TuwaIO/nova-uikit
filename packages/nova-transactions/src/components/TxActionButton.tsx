/**
 * @file This file contains the `TxActionButton`, a stateful button for initiating and tracking transactions.
 */

import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionPool, TransactionStatus } from '@tuwaio/pulsar-core';
import { ButtonHTMLAttributes, ReactNode, useEffect, useMemo, useState } from 'react';

import { NovaTransactionsLabels } from '../i18n/types';
import { useLabels } from '../providers';

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

export type TxActionButtonProps<T extends Transaction> = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  children: ReactNode;
  action: () => Promise<void>;
  getLastTxKey: () => string | undefined;
  transactionsPool: TransactionPool<T>;
  walletAddress?: string;
  loadingContent?: ReactNode;
  succeedContent?: ReactNode;
  failedContent?: ReactNode;
  replacedContent?: ReactNode;
  resetTimeout?: number;
};

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

  const defaultContent = useMemo(() => getDefaultContent(trackedTxButton), [trackedTxButton]);

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
        'novatx:flex novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:gap-1.5 novatx:rounded-md novatx:px-3 novatx:py-1.5 novatx:text-sm novatx:font-medium novatx:transition-all novatx:duration-200 novatx:disabled:cursor-not-allowed novatx:disabled:opacity-70',
        {
          'novatx:bg-gradient-to-r novatx:from-[var(--tuwa-button-gradient-from)] novatx:to-[var(--tuwa-button-gradient-to)] novatx:text-[var(--tuwa-text-on-accent)] novatx:hover:opacity-90':
            status === 'idle',
          'novatx:bg-gray-400 novatx:text-white': status === 'loading',
          'novatx:bg-gray-500 novatx:text-white': status === 'replaced',
          'novatx:bg-[var(--tuwa-success-bg)] novatx:text-[var(--tuwa-success-text)]': status === 'succeed',
          'novatx:bg-[var(--tuwa-error-bg)] novatx:text-[var(--tuwa-error-text)]': status === 'failed',
        },
        className,
      )}
    >
      {renderContent()}
    </button>
  );
}
