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
        'novatx:rounded-lg novatx:border novatx:border-[var(--tuwa-error-icon)]/30 novatx:bg-[var(--tuwa-error-bg)] novatx:p-3 novatx:text-sm',
        className,
      )}
    >
      {/* --- Header with Title and Copy Button --- */}
      <div className="novatx:mb-2 novatx:flex novatx:items-center novatx:justify-between">
        <div className="novatx:flex novatx:items-center novatx:gap-2 novatx:font-bold novatx:text-[var(--tuwa-error-icon)]">
          <ExclamationTriangleIcon className="novatx:h-5 novatx:w-5" />
          <span>{txError.title}</span>
        </div>
        <button
          type="button"
          onClick={() => copy(error)}
          title={isCopied ? txError.copied : actions.copy}
          aria-label={isCopied ? txError.copied : `${actions.copy} error message`}
          className="novatx:cursor-pointer novatx:text-[var(--tuwa-error-icon)]/50 novatx:transition-colors novatx:hover:text-[var(--tuwa-error-icon)]"
        >
          {isCopied ? (
            <CheckIcon className="novatx:h-5 novatx:w-5 novatx:text-[var(--tuwa-success-icon)]" />
          ) : (
            <DocumentDuplicateIcon className="novatx:h-5 novatx:w-5" />
          )}
        </button>
      </div>

      {/* --- Scrollable Error Message --- */}
      <div className="novatx:max-h-24 novatx:overflow-y-auto novatx:rounded novatx:bg-[var(--tuwa-bg-primary)] novatx:p-2">
        <p className="novatx:font-mono novatx:text-xs novatx:text-[var(--tuwa-error-text)] novatx:break-all">{error}</p>
      </div>
    </div>
  );
}
