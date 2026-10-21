/**
 * @file This file contains the `StatusAwareText` component, which displays different text based on a transaction's
 * status.
 */

import { cn } from '@tuwaio/nova-core/utils';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import { ReactNode } from 'react';

import { statusText } from '../utils/statusText';

/** Theme-aware color classes of the text for each status (pending or no status: `default`). */
const STATUS_COLORS = {
  [TransactionStatus.Success]: 'novatx:text-[var(--tuwa-success-text)]',
  [TransactionStatus.Failed]: 'novatx:text-[var(--tuwa-error-text)]',
  [TransactionStatus.Replaced]: 'novatx:text-[var(--tuwa-text-secondary)]',
  default: 'novatx:text-[var(--tuwa-text-primary)]',
} as const;

/** Props of {@link StatusAwareText}. */
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
 *
 * @param props - See {@link StatusAwareTextProps}.
 * @returns The text, or `null` when there is neither `source` nor `fallback`.
 */
export function StatusAwareText({
  txStatus,
  source,
  fallback,
  variant,
  className,
  applyColor = false,
}: StatusAwareTextProps): ReactNode {
  const displayText = typeof source === 'string' || Array.isArray(source) ? statusText(source, txStatus) : fallback;
  const colorClass = applyColor && Array.isArray(source) ? STATUS_COLORS[txStatus ?? 'default'] : '';

  if (!displayText) {
    return null;
  }

  const baseClasses =
    variant === 'title'
      ? 'novatx:text-sm novatx:font-mono novatx:font-semibold novatx:text-[var(--tuwa-text-primary)]'
      : 'novatx:mt-1 novatx:text-xs novatx:text-[var(--tuwa-text-secondary)]';

  return <div className={cn(baseClasses, colorClass, className)}>{displayText}</div>;
}
