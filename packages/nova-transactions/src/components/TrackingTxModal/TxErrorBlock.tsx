/**
 * @file This file contains the `TxErrorBlock` component for displaying transaction error messages.
 */

import { CheckIcon, DocumentDuplicateIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cn, useCopyToClipboard } from '@tuwaio/nova-core';
import type { TuwaErrorState } from '@tuwaio/orbit-core';
import { useMemo } from 'react';

import { useLabels } from '../../providers';

export type TxErrorBlockClassNames = {
  /** Classes for the container */
  container?: string;
  /** Classes for the header row */
  header?: string;
  /** Classes for the title container (icon + text) */
  title?: string;
  /** Classes for the error icon */
  icon?: string;
  /** Classes for the copy button */
  copyButton?: string;
  /** Classes for the message container */
  messageContainer?: string;
  /** Classes for the message text */
  messageText?: string;
};

export type TxErrorBlockProps = {
  /** The error to display. Can be a string or a TuwaErrorState. If undefined or empty, the component renders nothing. */
  error?: string | TuwaErrorState;
  /** Optional additional CSS classes for the container. */
  className?: string;
  /** Granular classNames for sub-elements */
  classNames?: TxErrorBlockClassNames;
};

/**
 * A component that displays a formatted block for a transaction error message.
 * It includes a title, an icon, the error message in a scrollable area,
 * and a button to copy the message to the clipboard.
 */
export function TxErrorBlock({ error, className, classNames }: TxErrorBlockProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const { actions, txError } = useLabels();

  // Serialize error for display and copy
  const { displayMessage, copyMessage } = useMemo(() => {
    if (!error) return { displayMessage: '', copyMessage: '' };
    if (typeof error === 'string') return { displayMessage: error, copyMessage: error };
    return {
      displayMessage: error.message,
      copyMessage: JSON.stringify(error.raw, null, 2),
    };
  }, [error]);

  // Don't render anything if there is no error message.
  if (!error || !displayMessage) {
    return null;
  }

  return (
    <div
      className={cn(
        'novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-error-icon)]/30 novatx:bg-[var(--tuwa-error-bg)] novatx:p-3 novatx:text-sm',
        classNames?.container,
        className,
      )}
    >
      {/* --- Header with Title and Copy Button --- */}
      <div className={cn('novatx:mb-2 novatx:flex novatx:items-center novatx:justify-between', classNames?.header)}>
        <div
          className={cn(
            'novatx:flex novatx:items-center novatx:gap-2 novatx:font-bold novatx:text-[var(--tuwa-error-icon)]',
            classNames?.title,
          )}
        >
          <ExclamationTriangleIcon className={cn('novatx:h-5 novatx:w-5', classNames?.icon)} />
          <span>{txError.title}</span>
        </div>
        <button
          type="button"
          onClick={() => copy(copyMessage)}
          title={isCopied ? txError.copied : actions.copy}
          aria-label={isCopied ? txError.copied : `${actions.copy} error message`}
          className={cn(
            'novatx:cursor-pointer novatx:text-[var(--tuwa-error-icon)]/50 novatx:transition-colors novatx:hover:text-[var(--tuwa-error-icon)]',
            classNames?.copyButton,
          )}
        >
          {isCopied ? (
            <CheckIcon className="novatx:h-5 novatx:w-5 novatx:text-[var(--tuwa-success-icon)]" />
          ) : (
            <DocumentDuplicateIcon className="novatx:h-5 novatx:w-5" />
          )}
        </button>
      </div>

      {/* --- Scrollable Error Message --- */}
      <div
        className={cn(
          'novatx:max-h-24 novatx:overflow-y-auto novatx:rounded novatx:bg-[var(--tuwa-bg-primary)] novatx:p-2',
          classNames?.messageContainer,
        )}
      >
        <p
          className={cn(
            'novatx:font-mono novatx:text-xs novatx:text-[var(--tuwa-error-text)] novatx:break-all',
            classNames?.messageText,
          )}
        >
          {displayMessage}
        </p>
      </div>
    </div>
  );
}
