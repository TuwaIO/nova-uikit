/**
 * @file This file contains the `TxStatusVisual` component, which displays a large icon representing the transaction's status.
 */

import { ArrowPathIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { JSX, ReactNode } from 'react';

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

/**
 * A component that renders a large, animated icon to visually represent the
 * current state of a transaction within the tracking modal.
 *
 * @param {TxStatusVisualProps} props - The component props.
 * @returns {JSX.Element} The rendered visual status indicator.
 */
export function TxStatusVisual({ isProcessing, isSucceed, isFailed, isReplaced }: TxStatusVisualProps): JSX.Element {
  let icon: ReactNode;

  // The logic is structured as an if/else if chain to ensure only one icon is selected.
  if (isSucceed) {
    icon = <CheckCircleIcon className="h-16 w-16 text-[var(--tuwa-success-icon)]" />;
  } else if (isFailed) {
    icon = <ExclamationCircleIcon className="h-16 w-16 text-[var(--tuwa-error-icon)]" />;
  } else if (isReplaced) {
    icon = <ArrowPathIcon className="h-16 w-16 text-[var(--tuwa-info-icon)]" />;
  } else if (isProcessing) {
    icon = <ArrowPathIcon className="h-16 w-16 animate-spin text-[var(--tuwa-text-accent)]" />;
  } else {
    // Default state when the transaction is created but not yet processing.
    icon = <ClockIcon className="h-16 w-16 animate-pulse text-[var(--tuwa-pending-icon)]" />;
  }

  return <div className="flex justify-center py-4">{icon}</div>;
}
