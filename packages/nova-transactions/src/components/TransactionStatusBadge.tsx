/**
 * @file This file contains the `TransactionStatusBadge` component for visually displaying a transaction's status.
 */

import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionStatus } from '@tuwaio/pulsar-core';

import { NovaTransactionsLabels } from '../i18n/types';
import { useLabels } from '../providers';

const getStatusConfig = (labels: NovaTransactionsLabels['statuses']) => ({
  Pending: {
    label: labels.pending,
    Icon: ArrowPathIcon,
    badgeClasses: 'novatx:bg-[var(--tuwa-pending-bg)] novatx:text-[var(--tuwa-pending-text)]',
    iconClasses: 'novatx:animate-spin novatx:text-[var(--tuwa-pending-icon)]',
  },
  [TransactionStatus.Success]: {
    label: labels.success,
    Icon: CheckCircleIcon,
    badgeClasses: 'novatx:bg-[var(--tuwa-success-bg)] novatx:text-[var(--tuwa-success-text)]',
    iconClasses: 'novatx:text-[var(--tuwa-success-icon)]',
  },
  [TransactionStatus.Failed]: {
    label: labels.failed,
    Icon: XCircleIcon,
    badgeClasses: 'novatx:bg-[var(--tuwa-error-bg)] novatx:text-[var(--tuwa-error-text)]',
    iconClasses: 'novatx:text-[var(--tuwa-error-icon)]',
  },
  [TransactionStatus.Replaced]: {
    label: labels.replaced,
    Icon: ArrowPathIcon,
    badgeClasses: 'novatx:bg-[var(--tuwa-info-bg)] novatx:text-[var(--tuwa-info-text)]',
    iconClasses: 'novatx:text-[var(--tuwa-info-icon)]',
  },
});

export type TransactionStatusBadgeProps<T extends Transaction> = {
  tx: T;
  className?: string;
  /** Granular class names for sub-elements */
  classNames?: {
    /** Classes for the badge container */
    container?: string;
    /** Classes for the status icon */
    icon?: string;
    /** Classes for the label text */
    label?: string;
  };
};

export function TransactionStatusBadge<T extends Transaction>({
  tx,
  className,
  classNames,
}: TransactionStatusBadgeProps<T>) {
  const { statuses } = useLabels();

  const statusConfig = getStatusConfig(statuses);

  const baseClasses =
    'novatx:inline-flex novatx:items-center novatx:gap-x-1.5 novatx:rounded-full novatx:px-2 novatx:py-1 novatx:text-xs novatx:font-medium';

  const statusKey = tx.pending ? 'Pending' : tx.status;
  const config = statusKey ? statusConfig[statusKey as keyof typeof statusConfig] : null;

  if (!config) {
    return (
      <div
        className={cn(
          baseClasses,
          'novatx:bg-[var(--tuwa-info-bg)] novatx:text-[var(--tuwa-info-text)]',
          classNames?.container,
          className,
        )}
      >
        <span className={classNames?.label}>{tx.status ?? statuses.unknown}</span>
      </div>
    );
  }

  const { label, Icon, badgeClasses, iconClasses } = config;

  return (
    <div className={cn(baseClasses, badgeClasses, classNames?.container, className)}>
      <Icon className={cn('novatx:h-4 novatx:w-4', iconClasses, classNames?.icon)} />
      <span className={classNames?.label}>{label}</span>
    </div>
  );
}
