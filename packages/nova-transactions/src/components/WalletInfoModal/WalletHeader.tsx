// TODO: need add ENS support for multiple chains and adapters

/**
 * @file This file contains the `WalletHeader` component, used to display user avatar, name, and address.
 */

import { cn, textCenterEllipsis } from '@tuwaio/nova-core';
import { getAvatar, getName } from '@tuwaio/pulsar-evm';
import { JSX, ReactNode, useEffect, useState } from 'react';

import { useLabels } from '../../providers';
import { WalletAddressDisplay } from './WalletAddressDisplay';
import { WalletAvatar } from './WalletAvatar';

// --- Prop Types for Customization ---
type AvatarRenderProps = { address: string; ensAvatar?: string };
type NameRenderProps = { ensName?: string; isLoading: boolean; address: string };
type AddressRenderProps = { address: string; explorerUrl: string };

/**
 * Defines the props for the `WalletHeader` component, including extensive customization options.
 */
export interface WalletHeaderProps {
  /** The user's wallet address. If undefined, the 'not connected' state is shown. */
  walletAddress?: string;
  explorerUrl: string;
  /** Optional additional CSS classes for the container. */
  className?: string;
  /** A render prop to replace the default `WalletAvatar` component. */
  renderAvatar?: (props: AvatarRenderProps) => ReactNode;
  /** A render prop to replace the default ENS name display. */
  renderName?: (props: NameRenderProps) => ReactNode;
  /** A render prop to replace the default `WalletAddressDisplay` component. */
  renderAddressDisplay?: (props: AddressRenderProps) => ReactNode;
  /** A render prop to replace the default content shown when no wallet is connected. */
  renderNoWalletContent?: () => ReactNode;
}

/**
 * A component that displays the header for the wallet modal, including the user's avatar,
 * ENS name (if available), and address. It handles loading states for ENS data and
 * provides a "not connected" view.
 *
 * @param {WalletHeaderProps} props - The component props.
 * @returns {JSX.Element} The rendered wallet header.
 */
export function WalletHeader({
  walletAddress,
  className,
  renderAvatar,
  renderName,
  renderAddressDisplay,
  renderNoWalletContent,
  explorerUrl,
}: WalletHeaderProps): JSX.Element {
  const labels = useLabels();

  const [ensName, setEnsName] = useState<string | undefined>(undefined);
  const [ensAvatar, setEnsAvatar] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ENS data whenever the wallet address changes.
  useEffect(() => {
    const fetchEnsData = async () => {
      if (walletAddress) {
        setIsLoading(true);
        setEnsName(undefined);
        setEnsAvatar(undefined);

        try {
          const name = await getName(walletAddress as `0x${string}`);
          if (name) {
            setEnsName(name);
            const avatar = await getAvatar(name);
            setEnsAvatar(avatar);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEnsData();
  }, [walletAddress]);

  // --- Render "Not Connected" State ---
  if (!walletAddress) {
    if (renderNoWalletContent) {
      return <>{renderNoWalletContent()}</>;
    }

    return (
      <div
        className={cn(
          'flex h-20 items-center justify-center rounded-lg bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-text-secondary)]',
          className,
        )}
      >
        {labels.walletModal.header.notConnected}
      </div>
    );
  }

  const ensNameAbbreviated = ensName
    ? ensName.length > 30
      ? textCenterEllipsis(ensName, 12, 12)
      : ensName
    : undefined;

  // --- Render "Connected" State ---
  return (
    <div className={cn('flex items-center gap-4 min-h-[4rem]', className)}>
      <div>
        {renderAvatar ? (
          renderAvatar({ address: walletAddress, ensAvatar })
        ) : (
          <WalletAvatar address={walletAddress} ensAvatar={ensAvatar} />
        )}
      </div>

      <div className="flex flex-col justify-center min-h-[3.5rem] min-w-[200px]">
        {renderName ? (
          renderName({ ensName: ensNameAbbreviated, isLoading, address: walletAddress })
        ) : (
          <div className="flex flex-col">
            {/* Primary content area - ENS name or large address */}
            <div className="h-7 flex items-center mb-1.5">
              {isLoading ? (
                <div className="h-full w-48 animate-pulse rounded-md bg-[var(--tuwa-bg-muted)]" />
              ) : ensNameAbbreviated ? (
                <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)]">{ensNameAbbreviated}</h2>
              ) : (
                <WalletAddressDisplay
                  address={walletAddress}
                  explorerUrl={explorerUrl}
                  className="text-xl font-bold text-[var(--tuwa-text-primary)] bg-transparent px-0 py-0 rounded-none"
                />
              )}
            </div>

            {/* Secondary content area - small address display (only when ENS exists) */}
            <div className="h-5 flex items-center">
              {!isLoading &&
                ensNameAbbreviated &&
                (renderAddressDisplay ? (
                  renderAddressDisplay({ address: walletAddress, explorerUrl })
                ) : (
                  <WalletAddressDisplay address={walletAddress} explorerUrl={explorerUrl} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
