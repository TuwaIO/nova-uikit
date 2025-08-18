/**
 * @file This file contains the `TransactionStatusBadge` component for visually displaying a transaction's status.
 */

import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { JSX } from 'react';

import { useLabels } from '../providers';

type TransactionStatusBadgeProps<TR, T extends Transaction<TR>> = {
  /** The transaction object whose status will be displayed. */
  tx: T;
  /** Optional additional CSS classes to apply to the badge container. */
  className?: string;
};

/**
 * A component that displays a transaction's status as a styled badge
 * with a corresponding icon, color, and label.
 *
 * @param {TransactionStatusBadgeProps<TR, T>} props - The component props.
 * @returns {JSX.Element} The rendered status badge.
 */
export function TransactionStatusBadge<TR, T extends Transaction<TR>>({
  tx,
  className,
}: TransactionStatusBadgeProps<TR, T>): JSX.Element {
  const labels = useLabels();

  // A configuration map that links a status to its visual representation.
  const STATUS_CONFIG = {
    Pending: {
      label: labels.statuses.pending,
      Icon: ArrowPathIcon,
      badgeClasses: 'bg-[var(--tuwa-pending-bg)] text-[var(--tuwa-pending-text)]',
      iconClasses: 'animate-spin text-[var(--tuwa-pending-icon)]',
    },
    [TransactionStatus.Success]: {
      label: labels.statuses.success,
      Icon: CheckCircleIcon,
      badgeClasses: 'bg-[var(--tuwa-success-bg)] text-[var(--tuwa-success-text)]',
      iconClasses: 'text-[var(--tuwa-success-icon)]',
    },
    [TransactionStatus.Failed]: {
      label: labels.statuses.failed,
      Icon: XCircleIcon,
      badgeClasses: 'bg-[var(--tuwa-error-bg)] text-[var(--tuwa-error-text)]',
      iconClasses: 'text-[var(--tuwa-error-icon)]',
    },
    [TransactionStatus.Replaced]: {
      label: labels.statuses.replaced,
      Icon: ArrowPathIcon,
      badgeClasses: 'bg-[var(--tuwa-info-bg)] text-[var(--tuwa-info-text)]',
      iconClasses: 'text-[var(--tuwa-info-icon)]',
    },
  };

  const baseClasses = 'inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium';

  // Determine the status key: 'Pending' takes precedence, otherwise use the final status.
  const statusKey = tx.pending ? 'Pending' : tx.status;
  const config = statusKey ? STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] : null;

  // Fallback for unknown or missing statuses.
  if (!config) {
    return (
      <div className={cn(baseClasses, 'bg-[var(--tuwa-info-bg)] text-[var(--tuwa-info-text)]', className)}>
        {tx.status ?? labels.statuses.unknown}
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
