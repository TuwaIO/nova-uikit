/**
 * @file This file contains the `HashLink` component, a UI element for displaying
 * blockchain hashes with copy-to-clipboard and block explorer link functionality.
 */

import { ArrowTopRightOnSquareIcon, CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';

import { useLabels } from '../providers';

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

export function HashLink({ label, hash, explorerUrl, variant = 'default', className }: HashLinkProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const { actions, txError } = useLabels();

  const containerClasses = cn(
    'novatx:flex novatx:items-center novatx:justify-between',
    {
      'novatx:text-sm': variant === 'default',
      'novatx:text-xs': variant === 'compact',
    },
    className,
  );

  const labelClasses = cn('novatx:pr-1', {
    'novatx:font-bold novatx:text-[var(--tuwa-text-primary)]': variant === 'default',
    'novatx:font-medium novatx:text-[var(--tuwa-text-secondary)]': variant === 'compact',
  });

  const hashContent = <span className="novatx:font-mono">{textCenterEllipsis(hash, 5, 5)}</span>;

  return (
    <div className={containerClasses}>
      {label && <span className={labelClasses}>{label}:</span>}
      <div className="novatx:flex novatx:items-center novatx:gap-x-2">
        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="novatx:flex novatx:items-center novatx:gap-x-1 novatx:text-[var(--tuwa-text-accent)] novatx:transition-colors novatx:hover:underline"
            title={actions.viewOnExplorer}
            aria-label={actions.viewOnExplorer}
          >
            {hashContent}
            <ArrowTopRightOnSquareIcon className="novatx:h-4 novatx:w-4" />
          </a>
        ) : (
          <span className="novatx:text-[var(--tuwa-text-primary)]">{hashContent}</span>
        )}
        <button
          type="button"
          onClick={() => copy(hash)}
          className="novatx:cursor-pointer novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors novatx:hover:text-[var(--tuwa-text-secondary)]"
          title={isCopied ? txError.copied : actions.copy}
          aria-label={isCopied ? txError.copied : actions.copy}
        >
          {isCopied ? (
            <CheckIcon className="novatx:h-4 novatx:w-4 novatx:text-[var(--tuwa-success-icon)]" />
          ) : (
            <DocumentDuplicateIcon className="novatx:h-4 novatx:w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
