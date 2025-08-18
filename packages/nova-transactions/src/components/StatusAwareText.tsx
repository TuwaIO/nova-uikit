/**
 * @file This file contains the `StatusAwareText` component, which displays different text based on a transaction's status.
 */

import { cn } from '@tuwaio/nova-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import { ReactNode } from 'react';

/**
 * A mapping from transaction status to an index and a color class.
 * The index corresponds to the position in the `source` array prop.
 * Index 0: Pending
 * Index 1: Success
 * Index 2: Failed
 * Index 3: Replaced
 */
const STATUS_MAP: Record<TransactionStatus | 'default', { index: number; colorClass: string }> = {
  [TransactionStatus.Success]: { index: 1, colorClass: 'text-[var(--tuwa-success-text)]' },
  [TransactionStatus.Failed]: { index: 2, colorClass: 'text-[var(--tuwa-error-text)]' },
  [TransactionStatus.Replaced]: { index: 3, colorClass: 'text-[var(--tuwa-text-secondary)]' },
  default: { index: 0, colorClass: 'text-[var(--tuwa-text-primary)]' }, // For pending or undefined status
};

type StatusAwareTextProps = {
  /** The current status of the transaction. */
  txStatus?: TransactionStatus;
  /**
   * The source for the text. Can be a single string, or an array of strings
   * corresponding to different statuses in the format: `[pending, success, error, replaced]`.
   */
  source?: string | string[];
  /** A fallback string to display if `source` is not provided. */
  fallback?: string;
  /** The visual variant, determines the base text style ('title' or 'description'). */
  variant: 'title' | 'description';
  /** Optional additional CSS classes. */
  className?: string;
  /** If true, applies a status-specific color to the text. */
  applyColor?: boolean;
};

/**
 * A component that renders text conditionally based on a transaction's status.
 * It's designed to work with the `title` and `description` fields of a transaction,
 * which can be a single string or a status-dependent array of strings.
 *
 * @param {StatusAwareTextProps} props - The component props.
 * @returns {ReactNode} The rendered text element or null.
 */
export function StatusAwareText({
  txStatus,
  source,
  fallback,
  variant,
  className,
  applyColor = false,
}: StatusAwareTextProps): ReactNode {
  const baseClasses =
    variant === 'title'
      ? 'text-sm font-semibold text-[var(--tuwa-text-primary)]'
      : 'mt-1 text-xs text-[var(--tuwa-text-secondary)]';

  // Case 1: Source is a simple string.
  if (typeof source === 'string') {
    return <div className={cn(baseClasses, className)}>{source}</div>;
  }

  // Case 2: Source is a status-dependent array.
  if (Array.isArray(source)) {
    const statusKey = txStatus || 'default';
    const config = STATUS_MAP[statusKey] || STATUS_MAP['default'];
    const text = source[config.index];
    const colorClass = applyColor ? config.colorClass : '';

    return <div className={cn(baseClasses, colorClass, className)}>{text}</div>;
  }

  // Case 3: Source is not provided, use the fallback.
  if (fallback) {
    return <div className={cn(baseClasses, className)}>{fallback}</div>;
  }

  // Case 4: Nothing to render.
  return null;
}
