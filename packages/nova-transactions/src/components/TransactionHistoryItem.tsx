/**
 * @file This file contains the `TransactionHistoryItem` component, which renders a single transaction
 * in a list format for the transaction history view.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionPool } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { JSX, ReactNode } from 'react';
import { Chain } from 'viem';

import { StatusAwareText } from './StatusAwareText';
import { TransactionKey } from './TransactionKey';
import { TransactionStatusBadge } from './TransactionStatusBadge';

// Extend dayjs with the relativeTime plugin to format timestamps as "a few seconds ago".
dayjs.extend(relativeTime);

// --- Prop Types for Customization ---
type CustomIconProps = { chainId: number };
type CustomStatusAwareTextProps = Parameters<typeof StatusAwareText>[0];
type CustomTimestampProps = { timestamp?: number };
type CustomStatusBadgeProps<TR, T extends Transaction<TR>> = Parameters<typeof TransactionStatusBadge<TR, T>>[0];
type CustomTransactionKeyProps<TR, T extends Transaction<TR>> = Parameters<typeof TransactionKey<TR, T>>[0];

/**
 * Defines the structure for the `customization` prop, allowing users to override
 * default sub-components with their own implementations for a history item.
 */
export type TransactionHistoryItemCustomization<TR, T extends Transaction<TR>> = {
  components?: {
    /** Override the default chain icon. */
    icon?: (props: CustomIconProps) => ReactNode;
    /** Override the default title component. */
    title?: (props: CustomStatusAwareTextProps) => ReactNode;
    /** Override the default description component. */
    description?: (props: CustomStatusAwareTextProps) => ReactNode;
    /** Override the default timestamp component. */
    timestamp?: (props: CustomTimestampProps) => ReactNode;
    /** Override the default status badge component. */
    statusBadge?: (props: CustomStatusBadgeProps<TR, T>) => ReactNode;
    /** Override the default component for displaying transaction keys/hashes. */
    transactionKey?: (props: CustomTransactionKeyProps<TR, T>) => ReactNode;
  };
};

export type TransactionHistoryItemProps<TR, T extends Transaction<TR>> = {
  /** The transaction object to display. */
  tx: T;
  /** An array of supported chain objects. */
  appChains: Chain[];
  /** The entire pool of transactions. */
  transactionsPool: TransactionPool<TR, T>;
  /** Optional additional CSS classes for the container. */
  className?: string;
  /** An object to customize and override the default internal components. */
  customization?: TransactionHistoryItemCustomization<TR, T>;
};

/**
 * A component that renders a single row in the transaction history list.
 * It is highly customizable via the `customization` prop.
 *
 * @param {TransactionHistoryItemProps<TR, T>} props - The component props.
 * @returns {JSX.Element} The rendered history item.
 */
export function TransactionHistoryItem<TR, T extends Transaction<TR>>({
  tx,
  appChains,
  transactionsPool,
  className,
  customization,
}: TransactionHistoryItemProps<TR, T>): JSX.Element {
  const C = customization?.components; // Shortcut for customization components

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-b border-[var(--tuwa-border-secondary)] p-3 transition-colors hover:bg-[var(--tuwa-bg-secondary)]',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        {/* --- Main Info: Icon, Title, Timestamp, Description --- */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--tuwa-bg-muted)]">
            {C?.icon ? (
              C.icon({ chainId: tx.chainId as number })
            ) : (
              <div className="h-8 w-8 text-[var(--tuwa-text-secondary)]">
                <Web3Icon chainId={tx.chainId as number} />
              </div>
            )}
          </div>
          <div>
            {C?.title ? (
              C.title({ txStatus: tx.status, source: tx.title, fallback: tx.type, variant: 'title', applyColor: true })
            ) : (
              <StatusAwareText txStatus={tx.status} source={tx.title} fallback={tx.type} variant="title" applyColor />
            )}

            {C?.timestamp ? (
              C.timestamp({ timestamp: tx.localTimestamp })
            ) : (
              <span className="mb-1 block text-xs text-[var(--tuwa-text-secondary)]">
                {tx.localTimestamp ? dayjs.unix(tx.localTimestamp).fromNow() : '...'}
              </span>
            )}

            {C?.description ? (
              C.description({ txStatus: tx.status, source: tx.description, variant: 'description' })
            ) : (
              <StatusAwareText txStatus={tx.status} source={tx.description} variant="description" />
            )}
          </div>
        </div>

        {/* --- Status Badge --- */}
        {C?.statusBadge ? C.statusBadge({ tx }) : <TransactionStatusBadge tx={tx} />}
      </div>

      {/* --- Transaction Keys/Hashes --- */}
      {C?.transactionKey ? (
        C.transactionKey({ tx, appChains, transactionsPool, variant: 'history' })
      ) : (
        <TransactionKey tx={tx} appChains={appChains} transactionsPool={transactionsPool} variant="history" />
      )}
    </div>
  );
}
