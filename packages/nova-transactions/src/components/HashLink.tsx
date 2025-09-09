/**
 * @file This file contains the `HashLink` component, a UI element for displaying
 * blockchain hashes with copy-to-clipboard and block explorer link functionality.
 */

import { ArrowTopRightOnSquareIcon, CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';

import { useLabels } from '../providers';

/**
 * Defines the props for the HashLink component.
 */
export type HashLinkProps = {
  /** The full hash string to display and copy (e.g., a transaction hash or wallet address). */
  hash: string;
  /** An optional label to display before the hash (e.g., "From", "Tx Hash"). */
  label?: string;
  /** An optional URL to a block explorer. If provided, the hash becomes a clickable link. */
  explorerUrl?: string;
  /** The visual style of the component. 'default' is larger, 'compact' is smaller. */
  variant?: 'default' | 'compact';
  /** Additional CSS classes to apply to the container element for custom styling. */
  className?: string;
};

/**
 * A component to display a hash string with an optional label, a link to a block explorer,
 * and a copy-to-clipboard button. It automatically ellipsizes the hash for readability.
 */
export function HashLink({ label, hash, explorerUrl, variant = 'default', className }: HashLinkProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const { actions, txError } = useLabels();

  const containerClasses = cn(
    'flex items-center justify-between',
    {
      'text-sm': variant === 'default',
      'text-xs': variant === 'compact',
    },
    className,
  );

  const labelClasses = cn('pr-1', {
    'font-bold text-[var(--tuwa-text-primary)]': variant === 'default',
    'font-medium text-[var(--tuwa-text-secondary)]': variant === 'compact',
  });

  // The ellipsized hash content, memoized for clarity.
  const hashContent = <span className="font-mono">{textCenterEllipsis(hash, 5, 5)}</span>;

  return (
    <div className={containerClasses}>
      {label && <span className={labelClasses}>{label}:</span>}
      <div className="flex items-center gap-x-2">
        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-x-1 text-[var(--tuwa-text-accent)] transition-colors hover:underline"
            title={actions.viewOnExplorer}
            aria-label={actions.viewOnExplorer}
          >
            {hashContent}
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-[var(--tuwa-text-primary)]">{hashContent}</span>
        )}
        <button
          type="button"
          onClick={() => copy(hash)}
          className="cursor-pointer text-[var(--tuwa-text-tertiary)] transition-colors hover:text-[var(--tuwa-text-secondary)]"
          title={isCopied ? txError.copied : actions.copy}
          aria-label={isCopied ? txError.copied : actions.copy}
        >
          {isCopied ? (
            <CheckIcon className="h-4 w-4 text-[var(--tuwa-success-icon)]" />
          ) : (
            <DocumentDuplicateIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
