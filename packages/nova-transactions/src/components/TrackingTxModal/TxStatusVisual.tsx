/**
 * @file This file contains the `TxStatusVisual` component, which displays a large icon representing the transaction's status.
 */

import { ArrowPathIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { ComponentType } from 'react';

type StatusKey = 'succeed' | 'failed' | 'replaced' | 'processing' | 'initializing';

export type TxStatusVisualClassNames = {
  /** Base icon className applied to all statuses */
  icon?: string;
  /** Status-specific icon overrides */
  statusOverrides?: Partial<Record<StatusKey, string>>;
};

export type TxStatusVisualProps = {
  /** True if the transaction is currently being processed (e.g., in the mempool). */
  isProcessing?: boolean;
  /** True if the transaction has successfully completed. */
  isSucceed?: boolean;
  /** True if the transaction has failed or was reverted. */
  isFailed?: boolean;
  /** True if the transaction was replaced (e.g., sped up). */
  isReplaced?: boolean;
  /** Additional class names for the container */
  className?: string;
  /** ClassNames for icon styling */
  iconClassNames?: TxStatusVisualClassNames;
};

const STATUS_VISUAL_CONFIG: Record<StatusKey, { Icon: ComponentType<{ className?: string }>; className: string }> = {
  succeed: {
    Icon: CheckCircleIcon,
    className: 'novatx:text-[var(--tuwa-success-icon)]',
  },
  failed: {
    Icon: ExclamationCircleIcon,
    className: 'novatx:text-[var(--tuwa-error-icon)]',
  },
  replaced: {
    Icon: ArrowPathIcon,
    className: 'novatx:text-[var(--tuwa-info-icon)]',
  },
  processing: {
    Icon: ArrowPathIcon,
    className: 'novatx:animate-spin novatx:text-[var(--tuwa-text-accent)]',
  },
  initializing: {
    Icon: ClockIcon,
    className: 'novatx:animate-pulse novatx:text-[var(--tuwa-pending-icon)]',
  },
};

/**
 * A component that renders a large, animated icon to visually represent the
 * current state of a transaction within the tracking modal.
 */
export function TxStatusVisual({
  isProcessing,
  isSucceed,
  isFailed,
  isReplaced,
  className: containerClassName,
  iconClassNames,
}: TxStatusVisualProps) {
  const statusKey: StatusKey =
    (isSucceed && 'succeed') ||
    (isFailed && 'failed') ||
    (isReplaced && 'replaced') ||
    (isProcessing && 'processing') ||
    'initializing';

  const { Icon, className } = STATUS_VISUAL_CONFIG[statusKey];
  const statusOverride = iconClassNames?.statusOverrides?.[statusKey];

  return (
    <div className={cn('novatx:flex novatx:justify-center novatx:py-4', containerClassName)}>
      <Icon className={cn('novatx:h-16 novatx:w-16', className, iconClassNames?.icon, statusOverride)} />
    </div>
  );
}
