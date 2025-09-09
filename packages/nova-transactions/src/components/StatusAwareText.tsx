/**
 * @file This file contains the `StatusAwareText` component, which displays different text based on a transaction's status.
 */

import { cn } from '@tuwaio/nova-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import { ReactNode } from 'react';

/**
 * A mapping from transaction status to an array index and a theme-aware color class.
 * The index corresponds to the position in the `source` array prop: `[pending, success, error, replaced]`.
 */
const STATUS_CONFIG = {
  [TransactionStatus.Success]: { index: 1, colorClass: 'text-[var(--tuwa-success-text)]' },
  [TransactionStatus.Failed]: { index: 2, colorClass: 'text-[var(--tuwa-error-text)]' },
  [TransactionStatus.Replaced]: { index: 3, colorClass: 'text-[var(--tuwa-text-secondary)]' },
  default: { index: 0, colorClass: 'text-[var(--tuwa-text-primary)]' }, // For pending or undefined status
} as const;

export type StatusAwareTextProps = {
  /** The current status of the transaction, used to select the correct text and color. */
  txStatus?: TransactionStatus;
  /**
   * The source for the text. Can be a single string for static text, or an array of strings
   * for dynamic text based on status. The array format must be: `[pending, success, error, replaced]`.
   */
  source?: string | readonly string[];
  /** A fallback string to display if `source` is not provided or is invalid. */
  fallback?: string;
  /** The visual variant, which determines the base text style ('title' or 'description'). */
  variant: 'title' | 'description';
  /** If true, applies a status-specific color to the text. Defaults to false. */
  applyColor?: boolean;
  /** Optional additional CSS classes for custom styling. */
  className?: string;
};

/**
 * A component that renders text conditionally based on a transaction's status.
 * It's designed to work with the `title` and `description` fields of a transaction object.
 */
export function StatusAwareText({
  txStatus,
  source,
  fallback,
  variant,
  className,
  applyColor = false,
}: StatusAwareTextProps): ReactNode {
  let displayText: string | undefined;
  let colorClass = '';

  // 1. Determine the text to display based on the source type.
  if (typeof source === 'string') {
    displayText = source;
  } else if (Array.isArray(source)) {
    const statusKey = txStatus || 'default';
    const config = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.default;
    displayText = source[config.index];
    if (applyColor) {
      colorClass = config.colorClass;
    }
  } else {
    displayText = fallback;
  }

  // If no text could be determined, render nothing.
  if (!displayText) {
    return null;
  }

  // 2. Determine the base styling based on the variant.
  const baseClasses =
    variant === 'title'
      ? 'text-sm font-semibold text-[var(--tuwa-text-primary)]'
      : 'mt-1 text-xs text-[var(--tuwa-text-secondary)]';

  // 3. Combine classes and render the final output.
  return <div className={cn(baseClasses, colorClass, className)}>{displayText}</div>;
}
