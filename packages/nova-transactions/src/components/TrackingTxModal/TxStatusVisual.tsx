/**
 * @file This file contains the `TxStatusVisual` component, which displays a large icon representing the transaction's status.
 */

import { ArrowPathIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { ComponentType } from 'react';

export type TxStatusVisualProps = {
  /** True if the transaction is currently being processed (e.g., in the mempool). */
  isProcessing?: boolean;
  /** True if the transaction has successfully completed. */
  isSucceed?: boolean;
  /** True if the transaction has failed or was reverted. */
  isFailed?: boolean;
  /** True if the transaction was replaced (e.g., sped up). */
  isReplaced?: boolean;
};

// A configuration map that links a status to its corresponding icon and styles.
// Defined outside the component to prevent re-creation on every render.
const STATUS_VISUAL_CONFIG: Record<
  'succeed' | 'failed' | 'replaced' | 'processing' | 'initializing',
  { Icon: ComponentType<{ className?: string }>; className: string }
> = {
  succeed: {
    Icon: CheckCircleIcon,
    className: 'text-[var(--tuwa-success-icon)]',
  },
  failed: {
    Icon: ExclamationCircleIcon,
    className: 'text-[var(--tuwa-error-icon)]',
  },
  replaced: {
    Icon: ArrowPathIcon,
    className: 'text-[var(--tuwa-info-icon)]',
  },
  processing: {
    Icon: ArrowPathIcon,
    className: 'animate-spin text-[var(--tuwa-text-accent)]',
  },
  initializing: {
    Icon: ClockIcon,
    className: 'animate-pulse text-[var(--tuwa-pending-icon)]',
  },
};

/**
 * A component that renders a large, animated icon to visually represent the
 * current state of a transaction within the tracking modal.
 */
export function TxStatusVisual({ isProcessing, isSucceed, isFailed, isReplaced }: TxStatusVisualProps) {
  // Determine the current status key based on the props.
  const statusKey =
    (isSucceed && 'succeed') ||
    (isFailed && 'failed') ||
    (isReplaced && 'replaced') ||
    (isProcessing && 'processing') ||
    'initializing';

  const { Icon, className } = STATUS_VISUAL_CONFIG[statusKey];

  return (
    <div className="flex justify-center py-4">
      <Icon className={cn('h-16 w-16', className)} />
    </div>
  );
}
