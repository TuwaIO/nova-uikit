/**
 * @file This file contains the `TransactionKey` component, which is responsible for displaying
 * the various identifiers associated with a transaction (e.g., hash, Gelato Task ID).
 */

import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey } from '@tuwaio/orbit-core';
import { Transaction, TransactionTracker } from '@tuwaio/pulsar-core';
import { ReactNode } from 'react';

import { NovaProviderProps, useLabels } from '../providers';
import { HashLink, HashLinkProps } from './HashLink';

/**
 * Defines the props for the TransactionKey component.
 * @template TR - The type of the tracker identifier.
 * @template T - The transaction type.
 * @template A - The type of the key returned by an action function.
 */
export type TransactionKeyProps<T extends Transaction> = Pick<NovaProviderProps<T>, 'adapter'> & {
  /** The transaction object to display identifiers for. */
  tx: T;
  /** The visual variant, which applies different container styles. */
  variant?: 'toast' | 'history';
  /** Optional additional CSS classes for the container. */
  className?: string;
  /**
   * An optional render prop to allow for complete customization of how the hash link is rendered.
   * If not provided, the default `HashLink` component will be used.
   */
  renderHashLink?: (props: HashLinkProps) => ReactNode;
  /** Optional number of confirmations for a transaction. */
  confirmations?: number;
};

/**
 * A component that intelligently displays the relevant keys and hashes for a transaction.
 * It leverages the adapter system to show chain-specific identifiers and explorer links.
 */
export function TransactionKey<T extends Transaction>({
  tx,
  adapter,
  variant = 'toast',
  className,
  renderHashLink,
  confirmations,
}: TransactionKeyProps<T>) {
  const { hashLabels, statuses } = useLabels();

  // Select the correct adapter for the given transaction.
  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter });

  if (!foundAdapter) return null;

  // Helper to use the render prop if provided, otherwise default to HashLink.
  const renderHash = (props: HashLinkProps) => {
    return renderHashLink ? renderHashLink(props) : <HashLink {...props} />;
  };

  const containerClasses =
    variant === 'toast'
      ? 'mt-2 flex w-full flex-col gap-y-2 border-t border-[var(--tuwa-border-primary)] pt-2'
      : 'flex w-full flex-col gap-y-2';

  // The primary key of the transaction (e.g., taskId, safeTxHash).
  // This removes the need for `@ts-expect-error` by using a type assertion to key into hashLabels.
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

  // The on-chain hash elements, handling normal and replaced transactions.
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

  // Avoid showing the tracker key if it's the same as the on-chain hash.
  const shouldShowTrackerKey = trackerLabel && trackerLabel !== hashLabels.default && tx.txKey !== (tx as any).hash;

  return (
    <div className={cn(containerClasses, className)}>
      {shouldShowTrackerKey && trackerKeyElement}
      {onChainHashesElement}
      {typeof confirmations === 'number' && (
        <p className="text-xs text-[var(--tuwa-text-tertiary)]">
          {statuses.confirmationsLabel}: {confirmations}
        </p>
      )}
    </div>
  );
}
