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

/** Props of the icon of {@link TransactionHistoryItem} (`customization.components.Icon`). */
export type TransactionHistoryItemIconProps = {
  /** Chain of the transaction. */
  chainId: number | string;
  /** Classes from `customization.classNames.icon`. */
  className?: string;
};
/** Props of the timestamp of {@link TransactionHistoryItem} (`customization.components.Timestamp`). */
export type TransactionHistoryItemTimestampProps = {
  /** Submission time of the transaction, in seconds (`localTimestamp`). */
  timestamp?: number;
  /** Classes from `customization.classNames.timestamp`. */
  className?: string;
};

/**
 * Customization options for TransactionHistoryItem component.
 * Allows styling of all sub-elements including icon, text, badge, and hash link.
 */
export type TransactionHistoryItemCustomization<T extends Transaction> = {
  /** Components that replace the default parts. */
  components?: {
    /** The network icon. */
    Icon?: ComponentType<TransactionHistoryItemIconProps>;
    /** The title (the transaction title, or its type). */
    Title?: ComponentType<StatusAwareTextProps>;
    /** The description. */
    Description?: ComponentType<StatusAwareTextProps>;
    /** The relative submission time ("5 minutes ago"). */
    Timestamp?: ComponentType<TransactionHistoryItemTimestampProps>;
    /** The status badge. */
    StatusBadge?: ComponentType<TransactionStatusBadgeProps<T>>;
    /** The hashes of the transaction. */
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
    /** Classes for the status badge container */
    statusBadge?: string;
    /** Classes for the status badge icon */
    statusBadgeIcon?: string;
    /** Classes for the status badge label */
    statusBadgeLabel?: string;
    /** Classes for the transaction key container */
    txKeyContainer?: string;
    /** Classes for default hash link label */
    hashLabel?: string;
    /** Classes for default hash link */
    hashLink?: string;
    /** Classes for default copy button */
    hashCopyButton?: string;
    /** Classes for original hash link label (replaced transactions) */
    originalHashLabel?: string;
    /** Classes for original hash link (replaced transactions) */
    originalHashLink?: string;
    /** Classes for original hash copy button (replaced transactions) */
    originalHashCopyButton?: string;
  };
};

/**
 * Props of {@link TransactionHistoryItem}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type TransactionHistoryItemProps<T extends Transaction> = {
  /** The transaction object to display. */
  tx: T;
  /** An object to customize and override the default internal components. */
  customization?: TransactionHistoryItemCustomization<T>;
  /** Optional additional CSS classes for the container. */
  className?: string;
  /** Callback triggered when the item is selected to view details. */
  onSelectTx?: () => void;
  /** Whether transaction details can be viewed by clicking on history items. */
  canViewDetails?: boolean;
} & Pick<NovaTransactionsProviderProps<T>, 'adapter'>;

const DefaultIcon = ({ chainId, className }: TransactionHistoryItemIconProps) => (
  <div className={cn('novatx:h-8 novatx:w-8 novatx:text-[var(--tuwa-text-secondary)]', className)}>
    <NetworkIcon chainId={setChainId(chainId)} />
  </div>
);

const DefaultTimestamp = ({ timestamp, className }: TransactionHistoryItemTimestampProps) => (
  <span className={cn('novatx:mb-1 novatx:block novatx:text-xs novatx:text-[var(--tuwa-text-secondary)]', className)}>
    {timestamp ? dayjs.unix(timestamp).fromNow() : '...'}
  </span>
);

/**
 * One transaction of the history list: the network icon, title, relative submission time (`dayjs` with the
 * `relativeTime` plugin, which this module adds to `dayjs` when it is imported), description, status badge and hashes.
 * Clicking the item (outside its links and buttons) calls `onSelectTx` when `canViewDetails` is `true`.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 * @param props - See {@link TransactionHistoryItemProps}.
 * @returns The item.
 */
export function TransactionHistoryItem<T extends Transaction>({
  tx,
  adapter,
  className,
  customization,
  onSelectTx,
  canViewDetails = true,
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
      onClick={(e) => {
        // Prevent trigger if clicking on a button or link inside
        if ((e.target as HTMLElement).closest('button, a')) return;
        if (canViewDetails) onSelectTx?.();
      }}
      className={cn(
        'novatx:flex novatx:flex-col novatx:gap-2 novatx:border-b novatx:border-[var(--tuwa-border-secondary)] novatx:p-3 novatx:transition-colors novatx:last:border-b-0',
        onSelectTx && canViewDetails && 'novatx:cursor-pointer novatx:hover:bg-[var(--tuwa-bg-secondary)]',
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

        <StatusBadge
          tx={tx}
          className={classNames?.statusBadge}
          classNames={{
            icon: classNames?.statusBadgeIcon,
            label: classNames?.statusBadgeLabel,
          }}
        />
      </div>

      <TxKey
        tx={tx}
        adapter={adapter}
        variant="history"
        className={classNames?.txKeyContainer}
        hashLinkClassNames={{
          label: classNames?.hashLabel,
          link: classNames?.hashLink,
          copyButton: classNames?.hashCopyButton,
        }}
        originalHashLinkClassNames={{
          label: classNames?.originalHashLabel,
          link: classNames?.originalHashLink,
          copyButton: classNames?.originalHashCopyButton,
        }}
      />
    </div>
  );
}
