/**
 * @file This file contains the `HashLink` component, a UI element for displaying hashes with copy and explorer link functionality.
 */

import { ArrowTopRightOnSquareIcon, CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';

import { useLabels } from '../providers';

/**
 * A component to display a hash string (e.g., transaction hash or address)
 * with an optional label, a link to a block explorer, and a copy-to-clipboard button.
 *
 * @param {object} props - The component props.
 * @param {string} [props.label] - An optional label to display before the hash (e.g., "Tx Hash").
 * @param {string} props.hash - The full hash string to display and copy.
 * @param {string} [props.explorerUrl] - An optional URL to a block explorer. If provided, the hash becomes a link.
 * @param {'default' | 'compact'} [props.variant='default'] - The visual style of the component.
 * @param {string} [props.className] - Additional CSS classes to apply to the container element.
 * @returns {JSX.Element} The rendered HashLink component.
 */
export function HashLink({
  label,
  hash,
  explorerUrl,
  variant = 'default',
  className,
}: {
  label?: string;
  hash: string;
  explorerUrl?: string;
  variant?: 'default' | 'compact';
  className?: string;
}) {
  const { isCopied, copy } = useCopyToClipboard();
  const labels = useLabels();

  const containerClasses = cn(
    'flex items-center justify-between',
    variant === 'default' && 'text-sm',
    variant === 'compact' && 'text-xs',
    className,
  );

  const labelClasses = cn(
    'pr-1',
    variant === 'default' && 'font-bold text-[var(--tuwa-text-primary)]',
    variant === 'compact' && 'font-medium text-[var(--tuwa-text-secondary)]',
  );

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
            className="flex items-center gap-x-1 text-[var(--tuwa-text-accent)] hover:underline"
            title={labels.actions.viewOnExplorer}
            aria-label={labels.actions.viewOnExplorer}
          >
            {hashContent}
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        ) : (
          hashContent
        )}
        <button
          type="button"
          onClick={() => copy(hash)}
          className="cursor-pointer text-[var(--tuwa-text-tertiary)] transition-colors hover:text-[var(--tuwa-text-secondary)]"
          title={isCopied ? labels.txError.copied : labels.actions.copy}
          aria-label={isCopied ? labels.txError.copied : labels.actions.copy}
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
