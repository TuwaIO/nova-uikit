/**
 * @file This file contains the `TransactionKey` component, which is responsible for displaying
 * the various identifiers associated with a transaction (e.g., hash, Safe transaction hash).
 */

import { cn } from '@tuwaio/nova-core/utils';
import { selectAdapterByKey } from '@tuwaio/orbit-core';
import { Transaction, TransactionTracker } from '@tuwaio/pulsar-core';
import { ReactNode } from 'react';

import { useLabels } from '../providers/NovaTransactionsLabelsProvider';
import type { NovaTransactionsProviderProps } from '../providers/NovaTransactionsProvider';
import { explorerUrlOfHash, explorerUrlOfReplaced } from '../utils/replacement';
import { HashLink, HashLinkProps } from './HashLink';

/**
 * Props of {@link TransactionKey}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type TransactionKeyProps<T extends Transaction> = Pick<NovaTransactionsProviderProps<T>, 'adapter'> & {
  /** The transaction. */
  tx: T;
  /** Layout: `'toast'` adds a top border and spacing. Defaults to `'toast'`. */
  variant?: 'toast' | 'history';
  /** Classes of the container. */
  className?: string;
  /**
   * Renders each hash instead of {@link HashLink}.
   *
   * @param props - The props the default `HashLink` would receive.
   * @returns The rendered hash.
   */
  renderHashLink?: (props: HashLinkProps) => ReactNode;
  /** Number of confirmations, shown below the hashes when it is above 0. */
  confirmations?: number;
  /** ClassNames to pass to HashLink components (default and replaced hash) */
  hashLinkClassNames?: HashLinkProps['classNames'];
  /** ClassNames for original hash link in replaced transactions (falls back to hashLinkClassNames) */
  originalHashLinkClassNames?: HashLinkProps['classNames'];
};

/**
 * The identifiers of a transaction: the key of its tracker when it differs from the on-chain hash (Safe transaction
 * hash, ERC-4337 user operation hash, Solana signature), and the on-chain hash; for a replaced
 * transaction, the original and the replacing hash. Hashes link to the explorer URL of the adapter's
 * `getExplorerTxUrl` when there is one.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 * @param props - See {@link TransactionKeyProps}.
 * @returns The identifiers, or `null` when no adapter matches the transaction.
 */
export function TransactionKey<T extends Transaction>({
  tx,
  adapter,
  variant = 'toast',
  className,
  renderHashLink,
  confirmations,
  hashLinkClassNames,
  originalHashLinkClassNames,
}: TransactionKeyProps<T>) {
  const { hashLabels, statuses } = useLabels();

  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter });

  if (!foundAdapter) return null;

  const renderHash = (props: HashLinkProps, customClassNames?: HashLinkProps['classNames']) => {
    const classNames = customClassNames ?? hashLinkClassNames;
    return renderHashLink ? renderHashLink(props) : <HashLink {...props} classNames={classNames} />;
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
          foundAdapter.getExplorerTxUrl &&
          (tx.tracker === TransactionTracker.Solana || tx.tracker === TransactionTracker.ERC4337)
            ? foundAdapter.getExplorerTxUrl(
                tx.tracker === TransactionTracker.ERC4337 && (tx as Record<string, unknown>).hash
                  ? ({ ...tx, hash: undefined, replacedTxHash: undefined } as T)
                  : tx,
              )
            : undefined,
      })
    : null;

  const onChainHashesElement = (() => {
    const txRecord = tx as Record<string, unknown>;
    const onChainHash = typeof txRecord.hash === 'string' ? txRecord.hash : undefined;
    const replacedHash = typeof txRecord.replacedTxHash === 'string' ? txRecord.replacedTxHash : undefined;
    const replaces = typeof txRecord.replaces === 'string' ? txRecord.replaces : undefined;

    if (!onChainHash && !replacedHash) return null;

    if (replacedHash) {
      return (
        <>
          {onChainHash &&
            renderHash(
              {
                label: hashLabels.original,
                hash: onChainHash,
                variant: 'compact',
                explorerUrl: explorerUrlOfHash(foundAdapter, tx, onChainHash),
              },
              originalHashLinkClassNames,
            )}
          {typeof foundAdapter.getExplorerTxUrl !== 'undefined' &&
            renderHash({
              label: hashLabels.replaced,
              hash: replacedHash,
              explorerUrl: explorerUrlOfHash(foundAdapter, tx, replacedHash),
            })}
        </>
      );
    }

    return (
      <>
        {onChainHash &&
          typeof foundAdapter.getExplorerTxUrl !== 'undefined' &&
          renderHash({
            label: hashLabels.default,
            hash: onChainHash,
            explorerUrl: foundAdapter.getExplorerTxUrl(tx),
          })}
        {replaces &&
          renderHash(
            {
              label: hashLabels.replaces,
              hash: replaces,
              variant: 'compact',
              explorerUrl: explorerUrlOfReplaced(foundAdapter, tx, replaces),
            },
            originalHashLinkClassNames,
          )}
      </>
    );
  })();

  const shouldShowTrackerKey =
    trackerLabel && trackerLabel !== hashLabels.default && tx.txKey !== (tx as Record<string, unknown>).hash;

  return (
    <div className={cn(containerClasses, className)}>
      {shouldShowTrackerKey && trackerKeyElement}
      {onChainHashesElement}
      {typeof confirmations === 'number' && confirmations > 0 && (
        <p className="novatx:text-xs novatx:text-[var(--tuwa-text-secondary)]">
          {statuses.confirmationsLabel}: {confirmations}
        </p>
      )}
    </div>
  );
}
