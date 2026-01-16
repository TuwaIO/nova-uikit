/**
 * @file This file contains the `TransactionHistoryItem` component, which renders a single transaction
 * in a list format for the transaction history view.
 */

import { cn, NetworkIcon } from '@tuwaio/nova-core';
import { setChainId } from '@tuwaio/orbit-core';
import { Transaction } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ComponentType, JSX } from 'react';

import { NovaTransactionsProviderProps } from '../providers';
import { StatusAwareText, StatusAwareTextProps } from './StatusAwareText';
import { TransactionKey, TransactionKeyProps } from './TransactionKey';
import { TransactionStatusBadge, TransactionStatusBadgeProps } from './TransactionStatusBadge';

dayjs.extend(relativeTime);

type CustomIconProps = { chainId: number | string; className?: string };
type CustomTimestampProps = { timestamp?: number; className?: string };

/**
 * Customization options for TransactionHistoryItem component.
 * Allows styling of all sub-elements including icon, text, badge, and hash link.
 */
export type TransactionHistoryItemCustomization<T extends Transaction> = {
  /** Custom components */
  components?: {
    Icon?: ComponentType<CustomIconProps>;
    Title?: ComponentType<StatusAwareTextProps>;
    Description?: ComponentType<StatusAwareTextProps>;
    Timestamp?: ComponentType<CustomTimestampProps>;
    StatusBadge?: ComponentType<TransactionStatusBadgeProps<T>>;
    TransactionKey?: ComponentType<TransactionKeyProps<T>>;
  };
  /** Custom class name generators for all sub-elements */
  classNames?: {
    /** Classes for the item container */
    container?: string;
    /** Classes for the icon wrapper */
    iconWrapper?: string;
    /** Classes for the icon itself */
    icon?: string;
    /** Classes for the content wrapper */
    contentWrapper?: string;
    /** Classes for the title */
    title?: string;
    /** Classes for the timestamp */
    timestamp?: string;
    /** Classes for the description */
    description?: string;
    /** Classes for the status badge */
    statusBadge?: string;
    /** Classes for the transaction key container */
    txKeyContainer?: string;
    /** Classes for hash link label */
    hashLabel?: string;
    /** Classes for hash link */
    hashLink?: string;
    /** Classes for copy button */
    hashCopyButton?: string;
  };
};

export type TransactionHistoryItemProps<T extends Transaction> = {
  /** The transaction object to display. */
  tx: T;
  /** An object to customize and override the default internal components. */
  customization?: TransactionHistoryItemCustomization<T>;
  /** Optional additional CSS classes for the container. */
  className?: string;
} & Pick<NovaTransactionsProviderProps<T>, 'adapter'>;

const DefaultIcon = ({ chainId, className }: CustomIconProps) => (
  <div className={cn('novatx:h-8 novatx:w-8 novatx:text-[var(--tuwa-text-secondary)]', className)}>
    <NetworkIcon chainId={setChainId(chainId)} />
  </div>
);

const DefaultTimestamp = ({ timestamp, className }: CustomTimestampProps) => (
  <span className={cn('novatx:mb-1 novatx:block novatx:text-xs novatx:text-[var(--tuwa-text-secondary)]', className)}>
    {timestamp ? dayjs.unix(timestamp).fromNow() : '...'}
  </span>
);

export function TransactionHistoryItem<T extends Transaction>({
  tx,
  adapter,
  className,
  customization,
}: TransactionHistoryItemProps<T>): JSX.Element {
  const {
    Icon = DefaultIcon,
    Title = StatusAwareText,
    Description = StatusAwareText,
    Timestamp = DefaultTimestamp,
    StatusBadge = TransactionStatusBadge,
    TransactionKey: TxKey = TransactionKey,
  } = customization?.components ?? {};

  const classNames = customization?.classNames;

  return (
    <div
      className={cn(
        'novatx:flex novatx:flex-col novatx:gap-2 novatx:border-b novatx:border-[var(--tuwa-border-secondary)] novatx:p-3 novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-secondary)]',
        classNames?.container,
        className,
      )}
    >
      <div className="novatx:flex novatx:items-start novatx:justify-between">
        <div className="novatx:flex novatx:items-center novatx:gap-4">
          <div
            className={cn(
              'novatx:flex novatx:h-10 novatx:w-10 novatx:flex-shrink-0 novatx:items-center novatx:justify-center novatx:rounded-full novatx:bg-[var(--tuwa-bg-muted)]',
              classNames?.iconWrapper,
            )}
          >
            <Icon chainId={tx.chainId} className={classNames?.icon} />
          </div>
          <div className={classNames?.contentWrapper}>
            <Title
              txStatus={tx.status}
              source={tx.title}
              fallback={tx.type}
              variant="title"
              applyColor
              className={classNames?.title}
            />
            <Timestamp timestamp={tx.localTimestamp} className={classNames?.timestamp} />
            <Description
              txStatus={tx.status}
              source={tx.description}
              variant="description"
              className={classNames?.description}
            />
          </div>
        </div>

        <StatusBadge tx={tx} className={classNames?.statusBadge} />
      </div>

      <TxKey tx={tx} adapter={adapter} variant="history" className={classNames?.txKeyContainer} />
    </div>
  );
}
