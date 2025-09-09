/**
 * @file This file contains the `TxErrorBlock` component for displaying transaction error messages.
 */

import { CheckIcon, DocumentDuplicateIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cn, useCopyToClipboard } from '@tuwaio/nova-core';

import { useLabels } from '../../providers';

export type TxErrorBlockProps = {
  /** The error message string to display. If undefined or empty, the component renders nothing. */
  error?: string;
  /** Optional additional CSS classes for the container. */
  className?: string;
};

/**
 * A component that displays a formatted block for a transaction error message.
 * It includes a title, an icon, the error message in a scrollable area,
 * and a button to copy the message to the clipboard.
 */
export function TxErrorBlock({ error, className }: TxErrorBlockProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const { actions, txError } = useLabels();

  // Don't render anything if there is no error message.
  if (!error) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--tuwa-error-icon)]/30 bg-[var(--tuwa-error-bg)] p-3 text-sm',
        className,
      )}
    >
      {/* --- Header with Title and Copy Button --- */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-[var(--tuwa-error-icon)]">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{txError.title}</span>
        </div>
        <button
          type="button"
          onClick={() => copy(error)}
          title={isCopied ? txError.copied : actions.copy}
          aria-label={isCopied ? txError.copied : `${actions.copy} error message`}
          className="cursor-pointer text-[var(--tuwa-error-icon)]/50 transition-colors hover:text-[var(--tuwa-error-icon)]"
        >
          {isCopied ? (
            <CheckIcon className="h-5 w-5 text-[var(--tuwa-success-icon)]" />
          ) : (
            <DocumentDuplicateIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* --- Scrollable Error Message --- */}
      <div className="max-h-24 overflow-y-auto rounded bg-[var(--tuwa-bg-primary)] p-2">
        <p className="font-mono text-xs text-[var(--tuwa-error-text)] break-all">{error}</p>
      </div>
    </div>
  );
}
