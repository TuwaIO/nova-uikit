/**
 * @file This file contains the `TransactionHistoryItem` component, which renders a single transaction
 * in a list format for the transaction history view.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { cn } from '@tuwaio/nova-core';
import { setChainId } from '@tuwaio/orbit-core';
import { Transaction } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ComponentType, JSX } from 'react';

import { NovaProviderProps } from '../providers';
import { StatusAwareText, StatusAwareTextProps } from './StatusAwareText';
import { TransactionKey, TransactionKeyProps } from './TransactionKey';
import { TransactionStatusBadge, TransactionStatusBadgeProps } from './TransactionStatusBadge';

// Extend dayjs with the relativeTime plugin to format timestamps as "a few seconds ago".
dayjs.extend(relativeTime);

// --- Prop Types for Customization ---
type CustomIconProps = { chainId: number | string };
type CustomTimestampProps = { timestamp?: number };

/**
 * Defines the structure for the `customization` prop, allowing users to override
 * default sub-components with their own implementations for a history item.
 */
export type TransactionHistoryItemCustomization<T extends Transaction> = {
  components?: {
    Icon?: ComponentType<CustomIconProps>;
    Title?: ComponentType<StatusAwareTextProps>;
    Description?: ComponentType<StatusAwareTextProps>;
    Timestamp?: ComponentType<CustomTimestampProps>;
    StatusBadge?: ComponentType<TransactionStatusBadgeProps<T>>;
    TransactionKey?: ComponentType<TransactionKeyProps<T>>;
  };
};

export type TransactionHistoryItemProps<T extends Transaction> = {
  /** The transaction object to display. */
  tx: T;
  /** An object to customize and override the default internal components. */
  customization?: TransactionHistoryItemCustomization<T>;
  /** Optional additional CSS classes for the container. */
  className?: string;
} & Pick<NovaProviderProps<T>, 'adapter'>;

// --- Default Sub-Components ---

const DefaultIcon = ({ chainId }: CustomIconProps) => (
  <div className="h-8 w-8 text-[var(--tuwa-text-secondary)]">
    <Web3Icon chainId={setChainId(chainId)} />
  </div>
);
const DefaultTimestamp = ({ timestamp }: CustomTimestampProps) => (
  <span className="mb-1 block text-xs text-[var(--tuwa-text-secondary)]">
    {timestamp ? dayjs.unix(timestamp).fromNow() : '...'}
  </span>
);

/**
 * A component that renders a single row in the transaction history list.
 * It is highly customizable via the `customization` prop, allowing developers
 * to override any of its internal parts with their own components.
 */
export function TransactionHistoryItem<T extends Transaction>({
  tx,
  adapter,
  className,
  customization,
}: TransactionHistoryItemProps<T>): JSX.Element {
  // Use the provided custom components, or fall back to the defaults.
  const {
    Icon = DefaultIcon,
    Title = StatusAwareText,
    Description = StatusAwareText,
    Timestamp = DefaultTimestamp,
    StatusBadge = TransactionStatusBadge,
    TransactionKey: TxKey = TransactionKey,
  } = customization?.components ?? {};

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
            <Icon chainId={tx.chainId} />
          </div>
          <div>
            <Title txStatus={tx.status} source={tx.title} fallback={tx.type} variant="title" applyColor />
            <Timestamp timestamp={tx.localTimestamp} />
            <Description txStatus={tx.status} source={tx.description} variant="description" />
          </div>
        </div>

        {/* --- Status Badge --- */}
        <StatusBadge tx={tx} />
      </div>

      {/* --- Transaction Keys/Hashes --- */}
      <TxKey tx={tx} adapter={adapter} variant="history" />
    </div>
  );
}
