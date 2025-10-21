/**
 * @file This file contains the `TransactionKey` component, which is responsible for displaying
 * the various identifiers associated with a transaction (e.g., hash, Gelato Task ID).
 */

import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey } from '@tuwaio/orbit-core';
import { Transaction, TransactionTracker } from '@tuwaio/pulsar-core';
import { ReactNode } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { HashLink, HashLinkProps } from './HashLink';

export type TransactionKeyProps<T extends Transaction> = Pick<NovaTransactionsProviderProps<T>, 'adapter'> & {
  tx: T;
  variant?: 'toast' | 'history';
  className?: string;
  renderHashLink?: (props: HashLinkProps) => ReactNode;
  confirmations?: number;
};

export function TransactionKey<T extends Transaction>({
  tx,
  adapter,
  variant = 'toast',
  className,
  renderHashLink,
  confirmations,
}: TransactionKeyProps<T>) {
  const { hashLabels, statuses } = useLabels();

  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter });

  if (!foundAdapter) return null;

  const renderHash = (props: HashLinkProps) => {
    return renderHashLink ? renderHashLink(props) : <HashLink {...props} />;
  };

  const containerClasses =
    variant === 'toast'
      ? 'novatx:mt-2 novatx:flex novatx:w-full novatx:flex-col novatx:gap-y-2 novatx:border-t novatx:border-[var(--tuwa-border-primary)] novatx:pt-2'
      : 'novatx:flex novatx:w-full novatx:flex-col novatx:gap-y-2';

  const trackerLabel = (hashLabels as Record<string, string>)[String(tx.tracker)];
  const trackerKeyElement = trackerLabel
    ? renderHash({
        label: trackerLabel,
        hash: tx.txKey,
        variant: tx.tracker !== TransactionTracker.Solana ? 'compact' : 'default',
        explorerUrl:
          foundAdapter.getExplorerTxUrl && tx.tracker === TransactionTracker.Solana
            ? foundAdapter?.getExplorerTxUrl(tx)
            : undefined,
      })
    : null;

  const onChainHashesElement = (() => {
    const onChainHash = (tx as any).hash;
    const replacedHash = (tx as any).replacedTxHash;

    if (!onChainHash && !replacedHash) return null;

    if (replacedHash) {
      return (
        <>
          {onChainHash &&
            renderHash({
              label: hashLabels.original,
              hash: onChainHash,
              variant: 'compact',
            })}
          {typeof foundAdapter.getExplorerTxUrl !== 'undefined' &&
            renderHash({
              label: hashLabels.replaced,
              hash: replacedHash,
              explorerUrl: foundAdapter.getExplorerTxUrl(tx),
            })}
        </>
      );
    }

    return (
      onChainHash &&
      typeof foundAdapter.getExplorerTxUrl !== 'undefined' &&
      renderHash({
        label: hashLabels.default,
        hash: onChainHash,
        explorerUrl: foundAdapter.getExplorerTxUrl(tx),
      })
    );
  })();

  const shouldShowTrackerKey = trackerLabel && trackerLabel !== hashLabels.default && tx.txKey !== (tx as any).hash;

  return (
    <div className={cn(containerClasses, className)}>
      {shouldShowTrackerKey && trackerKeyElement}
      {onChainHashesElement}
      {typeof confirmations === 'number' && (
        <p className="novatx:text-xs novatx:text-[var(--tuwa-text-tertiary)]">
          {statuses.confirmationsLabel}: {confirmations}
        </p>
      )}
    </div>
  );
}
