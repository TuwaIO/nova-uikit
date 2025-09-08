/**
 * @file This file contains the `WalletAddressDisplay` component, a UI element for showing a wallet address.
 */

import { ArrowTopRightOnSquareIcon, CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';
import { JSX } from 'react';

import { useLabels } from '../../providers';

export type WalletAddressDisplayProps = {
  /** The wallet address to display. */
  address: string;
  explorerUrl: string;
  /** Optional additional CSS classes for the container. */
  className?: string;
};

/**
 * A component that renders a wallet address in a styled "pill" format,
 * including a copy button and a link to the appropriate block explorer.
 *
 * @param {WalletAddressDisplayProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function WalletAddressDisplay({ address, explorerUrl, className }: WalletAddressDisplayProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();
  const labels = useLabels();

  // Dynamically generate the explorer link based on the provided chain.
  const explorerLink = explorerUrl ? `${explorerUrl}/address/${address}` : undefined;

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
        title={isCopied ? labels.txError.copied : labels.actions.copy}
        aria-label={isCopied ? labels.txError.copied : labels.actions.copy}
        onClick={() => copy(address)}
        className="cursor-pointer transition-colors hover:text-[var(--tuwa-text-primary)]"
      >
        {isCopied ? (
          <CheckIcon className="h-4 w-4 text-[var(--tuwa-success-icon)]" />
        ) : (
          <DocumentDuplicateIcon className="h-4 w-4" />
        )}
      </button>

      {/* Only render the explorer link if a URL could be generated */}
      {explorerLink && (
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-[var(--tuwa-text-accent)]"
          title={labels.actions.viewOnExplorer}
          aria-label={labels.actions.viewOnExplorer}
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
