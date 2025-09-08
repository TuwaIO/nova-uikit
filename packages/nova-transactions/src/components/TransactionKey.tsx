/**
 * @file This file contains the `TransactionKey` component, which is responsible for displaying
 * the various identifiers associated with a transaction (e.g., hash, Gelato Task ID).
 */

import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey, Transaction, TransactionAdapter } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import { ReactNode } from 'react';

import { NovaProviderProps, useLabels } from '../providers';
import { HashLink } from './HashLink';

// Utility type to extract the props of the HashLink component.
type CustomHashLinkProps = Parameters<typeof HashLink>[0];

export interface ToastTransactionKeyProps<TR, T extends Transaction<TR>, A>
  extends Pick<NovaProviderProps<TR, T, A>, 'adapters' | 'transactionsPool'> {
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
  renderHashLink?: (props: CustomHashLinkProps) => ReactNode;
}

/**
 * A component that intelligently displays the relevant keys and hashes for a transaction.
 * It handles different tracker types (EVM, Gelato, Safe) and statuses (e.g., replaced transactions).
 *
 * @param {ToastTransactionKeyProps<TR, T>} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function TransactionKey<TR, T extends Transaction<TR>, A>({
  tx,
  adapters,
  transactionsPool,
  variant = 'toast',
  className,
  renderHashLink,
}: ToastTransactionKeyProps<TR, T, A>) {
  const labels = useLabels();

  // TODO: temporary, need fix with logic for multiple adapters
  if (tx?.adapter !== TransactionAdapter.EVM) return null;

  const wasReplaced = !!tx.replacedTxHash;

  const containerClasses =
    variant === 'toast'
      ? 'mt-2 flex w-full flex-col gap-y-2 border-t border-[var(--tuwa-border-primary)] pt-2'
      : 'flex w-full flex-col gap-y-2';

  // Helper to use the render prop if provided, otherwise default to HashLink.
  const renderHash = (props: CustomHashLinkProps) => {
    return renderHashLink ? renderHashLink(props) : <HashLink {...props} />;
  };

  const adapter = selectAdapterByKey({ adapterKey: tx.adapter, adapters });

  return (
    <div className={cn(containerClasses, className)}>
      {/* Display tracker-specific identifiers (like Gelato Task ID or SafeTxHash) */}
      {tx.tracker === TransactionTracker.Gelato &&
        renderHash({ label: labels.hashLabels.gelato, hash: tx.txKey, variant: 'compact' })}
      {tx.tracker === TransactionTracker.Safe &&
        renderHash({ label: labels.hashLabels.safe, hash: tx.txKey, variant: 'compact' })}

      {/* Display on-chain hashes */}
      {wasReplaced ? (
        // Case 1: The transaction was replaced (e.g., sped up).
        <>
          {tx.hash && renderHash({ label: labels.hashLabels.original, hash: tx.hash, variant: 'compact' })}
          {tx.replacedTxHash &&
            adapter?.getExplorerTxUrl &&
            renderHash({
              label: labels.hashLabels.replaced,
              hash: tx.replacedTxHash,
              // The explorer link should point to the NEW (replaced) transaction.
              explorerUrl: adapter.getExplorerTxUrl(transactionsPool, tx.txKey, tx.replacedTxHash),
            })}
        </>
      ) : (
        // Case 2: Standard transaction hash.
        tx.hash &&
        adapter?.getExplorerTxUrl &&
        renderHash({
          label: labels.hashLabels.default,
          hash: tx.hash,
          explorerUrl: adapter?.getExplorerTxUrl(transactionsPool, tx.txKey),
        })
      )}
    </div>
  );
}
