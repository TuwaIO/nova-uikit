/**
 * @file This file contains the `WalletAddressDisplay` component, a UI element for showing a wallet address.
 */

import { ArrowTopRightOnSquareIcon, CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';
import { useMemo } from 'react';

import { useLabels } from '../../providers';

export type WalletAddressDisplayProps = {
  /** The full wallet address to display. */
  address: string;
  /** The base URL for the block explorer. If not provided, the explorer link will not be rendered. */
  explorerUrl?: string;
  /** Optional additional CSS classes for the container. */
  className?: string;
};

/**
 * A component that renders a wallet address in a styled "pill" format,
 * including a copy button and an optional link to the appropriate block explorer.
 */
export function WalletAddressDisplay({ address, explorerUrl, className }: WalletAddressDisplayProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const { actions, txError } = useLabels();

  // Memoize the full explorer link to avoid re-calculating it on every render.
  const fullExplorerLink = useMemo(
    () => (explorerUrl && address ? `${explorerUrl}/address/${address}` : undefined),
    [explorerUrl, address],
  );

  return (
    <div
      className={cn(
        'flex items-center gap-x-3 rounded-full bg-[var(--tuwa-bg-muted)] px-3 py-1 font-mono text-xs text-[var(--tuwa-text-secondary)]',
        className,
      )}
    >
      <span>{textCenterEllipsis(address, 6, 6)}</span>
      <button
        type="button"
        title={isCopied ? txError.copied : actions.copy}
        aria-label={isCopied ? txError.copied : `${actions.copy} address`}
        onClick={() => copy(address)}
        className="cursor-pointer transition-colors hover:text-[var(--tuwa-text-primary)]"
      >
        {isCopied ? (
          <CheckIcon className="h-4 w-4 text-[var(--tuwa-success-icon)]" />
        ) : (
          <DocumentDuplicateIcon className="h-4 w-4" />
        )}
      </button>

      {fullExplorerLink && (
        <a
          href={fullExplorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-[var(--tuwa-text-accent)]"
          title={actions.viewOnExplorer}
          aria-label={actions.viewOnExplorer}
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
