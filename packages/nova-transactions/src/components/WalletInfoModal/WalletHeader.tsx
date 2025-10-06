/**
 * @file This file contains the `WalletHeader` component, used to display user avatar, name, and address.
 */

import { cn, textCenterEllipsis } from '@tuwaio/nova-core';
import { selectAdapterByKey } from '@tuwaio/orbit-core';
import { Transaction } from '@tuwaio/pulsar-core';
import { ReactNode, useEffect, useState } from 'react';

import { NovaProviderProps, useLabels } from '../../providers';
import { WalletAddressDisplay, WalletAddressDisplayProps } from './WalletAddressDisplay';
import { WalletAvatar, WalletAvatarProps } from './WalletAvatar';

// --- Prop Types for Customization ---
type NameRenderProps = { ensName?: string; isLoading: boolean; address: string };

/**
 * Defines the props for the `WalletHeader` component, including extensive customization options.
 */
export type WalletHeaderProps<T extends Transaction> = Pick<
  NovaProviderProps<T>,
  'adapter' | 'connectedAdapterType'
> & {
  walletAddress?: string;
  explorerUrl?: string;
  className?: string;
  renderAvatar?: (props: WalletAvatarProps) => ReactNode;
  renderName?: (props: NameRenderProps) => ReactNode;
  renderAddressDisplay?: (props: WalletAddressDisplayProps) => ReactNode;
  renderNoWalletContent?: () => ReactNode;
};

// --- Default Sub-Components ---

const DefaultNameDisplay = ({
  isLoading,
  ensName,
  walletAddress,
  explorerUrl,
  renderAddressDisplay,
}: {
  isLoading: boolean;
  ensName?: string;
  walletAddress: string;
  explorerUrl?: string;
  renderAddressDisplay?: (props: WalletAddressDisplayProps) => ReactNode;
}) => (
  <div className="flex flex-col">
    {/* Primary content area - ENS name or large address */}
    <div className="mb-1.5 flex h-7 items-center">
      {isLoading ? (
        <div className="h-full w-48 animate-pulse rounded-md bg-[var(--tuwa-bg-muted)]" />
      ) : ensName ? (
        <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)]">{ensName}</h2>
      ) : (
        <WalletAddressDisplay
          address={walletAddress}
          explorerUrl={explorerUrl}
          className="rounded-none bg-transparent px-0 py-0 text-xl font-bold text-[var(--tuwa-text-primary)]"
        />
      )}
    </div>

    {/* Secondary content area - small address display (only when ENS exists) */}
    <div className="flex h-5 items-center">
      {!isLoading &&
        ensName &&
        (renderAddressDisplay ? (
          renderAddressDisplay({ address: walletAddress, explorerUrl })
        ) : (
          <WalletAddressDisplay address={walletAddress} explorerUrl={explorerUrl} />
        ))}
    </div>
  </div>
);

/**
 * A component that displays the header for the wallet modal, including the user's avatar,
 * name (if available), and address. It leverages the active adapter to fetch name service data.
 */
export function WalletHeader<T extends Transaction>({
  walletAddress,
  adapter,
  connectedAdapterType,
  className,
  renderAvatar,
  renderName,
  renderAddressDisplay,
  renderNoWalletContent,
  explorerUrl,
}: WalletHeaderProps<T>) {
  const { walletModal } = useLabels();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Name Service data whenever the wallet address or active adapter changes.
  useEffect(() => {
    const fetchNameData = async () => {
      if (!walletAddress || !connectedAdapterType) {
        setIsLoading(false);
        return;
      }

      // Select the currently active adapter.
      const foundAdapter = selectAdapterByKey({ adapterKey: connectedAdapterType, adapter });

      // Check if the adapter supports name and avatar resolution.
      const hasNameResolver = foundAdapter && 'getName' in foundAdapter && typeof foundAdapter.getName === 'function';
      const hasAvatarResolver =
        foundAdapter && 'getAvatar' in foundAdapter && typeof foundAdapter.getAvatar === 'function';

      if (!hasNameResolver) {
        setIsLoading(false);
        return; // This adapter doesn't support ENS or equivalent.
      }

      setIsLoading(true);
      setEnsName(null);
      setEnsAvatar(null);

      try {
        const name = foundAdapter?.getName ? await foundAdapter.getName(walletAddress) : null;
        if (name) {
          setEnsName(name);
          if (hasAvatarResolver) {
            const avatar = foundAdapter?.getAvatar ? await foundAdapter.getAvatar(name) : null;
            setEnsAvatar(avatar);
          }
        }
      } catch (error) {
        console.error('Failed to fetch name service data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNameData();
  }, [walletAddress, adapter, connectedAdapterType]);

  const ensNameAbbreviated = ensName
    ? ensName.length > 30
      ? textCenterEllipsis(ensName, 12, 12)
      : ensName
    : undefined;

  // --- Render "Not Connected" State ---
  if (!walletAddress) {
    if (renderNoWalletContent) return <>{renderNoWalletContent()}</>;
    return (
      <div
        className={cn(
          'flex h-20 items-center justify-center rounded-lg bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-text-secondary)]',
          className,
        )}
      >
        {walletModal.header.notConnected}
      </div>
    );
  }

  // --- Render "Connected" State ---
  return (
    <div className={cn('flex min-h-[4rem] items-center gap-4', className)}>
      <div>
        {renderAvatar ? (
          renderAvatar({ address: walletAddress, ensAvatar })
        ) : (
          <WalletAvatar address={walletAddress} ensAvatar={ensAvatar} />
        )}
      </div>

      <div className="flex min-h-[3.5rem] min-w-[200px] flex-col justify-center">
        {renderName ? (
          renderName({ ensName: ensNameAbbreviated, isLoading, address: walletAddress })
        ) : (
          <DefaultNameDisplay
            isLoading={isLoading}
            ensName={ensNameAbbreviated}
            walletAddress={walletAddress}
            explorerUrl={explorerUrl}
            renderAddressDisplay={renderAddressDisplay}
          />
        )}
      </div>
    </div>
  );
}
