/**
 * @file This file contains the `TransactionStatusBadge` component for visually displaying a transaction's status.
 */

import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { useMemo } from 'react';

import { TuwaLabels } from '../i18n/types';
import { useLabels } from '../providers';

/**
 * A factory function to create the status configuration object.
 * This is defined outside the component to avoid re-creation on every render.
 * It depends on the `labels` object for internationalization.
 */
const getStatusConfig = (labels: TuwaLabels['statuses']) => ({
  Pending: {
    label: labels.pending,
    Icon: ArrowPathIcon,
    badgeClasses: 'bg-[var(--tuwa-pending-bg)] text-[var(--tuwa-pending-text)]',
    iconClasses: 'animate-spin text-[var(--tuwa-pending-icon)]',
  },
  [TransactionStatus.Success]: {
    label: labels.success,
    Icon: CheckCircleIcon,
    badgeClasses: 'bg-[var(--tuwa-success-bg)] text-[var(--tuwa-success-text)]',
    iconClasses: 'text-[var(--tuwa-success-icon)]',
  },
  [TransactionStatus.Failed]: {
    label: labels.failed,
    Icon: XCircleIcon,
    badgeClasses: 'bg-[var(--tuwa-error-bg)] text-[var(--tuwa-error-text)]',
    iconClasses: 'text-[var(--tuwa-error-icon)]',
  },
  [TransactionStatus.Replaced]: {
    label: labels.replaced,
    Icon: ArrowPathIcon,
    badgeClasses: 'bg-[var(--tuwa-info-bg)] text-[var(--tuwa-info-text)]',
    iconClasses: 'text-[var(--tuwa-info-icon)]',
  },
});

/**
 * Defines the props for the TransactionStatusBadge component.
 * @template TR - The type of the tracker identifier.
 * @template T - The transaction type.
 */
export type TransactionStatusBadgeProps<TR, T extends Transaction<TR>> = {
  /** The transaction object whose status will be displayed. */
  tx: T;
  /** Optional additional CSS classes to apply to the badge container. */
  className?: string;
};

/**
 * A component that displays a transaction's status as a styled badge
 * with a corresponding icon, color, and label.
 */
export function TransactionStatusBadge<TR, T extends Transaction<TR>>({
  tx,
  className,
}: TransactionStatusBadgeProps<TR, T>) {
  const { statuses } = useLabels();

  // Memoize the configuration object so it's not re-created on every render.
  // It will only be re-calculated if the labels change (e.g., language switch).
  const statusConfig = useMemo(() => getStatusConfig(statuses), [statuses]);

  const baseClasses = 'inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium';

  // Determine the status key: 'Pending' if the transaction is pending, otherwise use its final status.
  const statusKey = tx.pending ? 'Pending' : tx.status;
  const config = statusKey ? statusConfig[statusKey as keyof typeof statusConfig] : null;

  // Fallback for unknown or missing statuses.
  if (!config) {
    return (
      <div className={cn(baseClasses, 'bg-[var(--tuwa-info-bg)] text-[var(--tuwa-info-text)]', className)}>
        {tx.status ?? statuses.unknown}
      </div>
    );
  }

  const { label, Icon, badgeClasses, iconClasses } = config;

  return (
    <div className={cn(baseClasses, badgeClasses, className)}>
      <Icon className={cn('h-4 w-4', iconClasses)} />
      {label}
    </div>
  );
}
