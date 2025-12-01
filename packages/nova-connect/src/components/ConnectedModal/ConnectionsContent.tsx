/**
 * @file ConnectionsContent component for managing multiple wallet connections.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { ArrowsRightLeftIcon, ArrowTopRightOnSquareIcon, DocumentDuplicateIcon, ArrowLeftStartOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';
import {
  ConnectorType,
  formatConnectorName,
  getAdapterFromConnectorType,
  recentlyConnectedConnectorsListHelpers,
  RecentlyConnectedConnectorData,
  setChainId,
} from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { useNovaConnect, useNovaConnectLabels } from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { InitialChains } from '../../types';
import { getNetworkIcon } from '../../utils/getNetworIcon';
import { WalletIcon } from '../WalletIcon';

// --- Types ---

export type ConnectionsContentCustomization = {
  components?: {
    Container?: ComponentType<{ className?: string; children: React.ReactNode }>;
    ActiveConnectorsSection?: ComponentType<{ className?: string; children: React.ReactNode; count: number }>;
    RecentlyConnectedSection?: ComponentType<{ className?: string; children: React.ReactNode }>;
    ActiveConnectorRow?: ComponentType<ConnectorRowProps>;
    ConnectedConnectorRow?: ComponentType<ConnectorRowProps>;
    RecentlyConnectedRow?: ComponentType<RecentlyConnectedRowProps>;
  };
  classNames?: {
    container?: () => string;
    activeConnectorsSection?: () => string;
    recentlyConnectedSection?: () => string;
    activeConnectorRow?: (props: ConnectorRowProps) => string;
    connectedConnectorRow?: (props: ConnectorRowProps) => string;
    recentlyConnectedRow?: (props: RecentlyConnectedRowProps) => string;
  };
};

export interface ConnectionsContentProps {
  /** Additional CSS classes */
  className?: string;
  /** Customization options */
  customization?: ConnectionsContentCustomization;
  /** App chains configuration for explorer links */
  appChains?: InitialChains['appChains'];
}

interface ConnectorRowProps {
  connectorType: ConnectorType;
  address: string;
  fullAddress?: string;
  chainId?: number | string;
  isActive: boolean;
  onSwitch?: () => void;
  onDisconnect: (e: React.MouseEvent) => void;
  className?: string;
  explorerLink?: string;
  icon?: string;
}

interface RecentlyConnectedRowProps {
  connectorType: ConnectorType;
  address: string;
  timestamp: number;
  onConnect: () => void;
  onRemove: (e: React.MouseEvent) => void;
  className?: string;
  icon?: string;
  isConnecting?: boolean;
}

// --- Helper Functions ---

const getFormattedConnectorName = (connectorType: string): string => {
  function capitalizeFirstLetter(str: string) {
    if (typeof str !== 'string' || str.length === 0) {
      return ""; // Handle empty strings or non-string inputs
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  // Remove adapter prefix (e.g., "EVM:METAMASK" -> "METAMASK")
  const nameWithoutAdapter = connectorType.includes(':') ? connectorType.split(':')[1] : connectorType;
  return capitalizeFirstLetter(formatConnectorName(nameWithoutAdapter));
};


// --- Default Components ---

const DefaultContainer = forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultActiveConnectorsSection = forwardRef<
  HTMLDivElement,
  { className?: string; children: React.ReactNode; count: number }
 >(({ className, children, count, ...props }, ref) => {
  const labels = useNovaConnectLabels();
  return (
    <div ref={ref} className={className} {...props}>
      <h3 className="novacon:mb-2 novacon:text-xs novacon:font-medium novacon:uppercase novacon:tracking-wider novacon:text-[var(--tuwa-text-secondary)]">
        {labels.active} {labels.connectors} {count > 0 && `(${count})`}
      </h3>
      <div className="novacon:overflow-hidden novacon:rounded-xl novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-secondary)]">
        {children}
      </div>
    </div>
  );
});
DefaultActiveConnectorsSection.displayName = 'DefaultActiveConnectorsSection';

const DefaultRecentlyConnectedSection = forwardRef<
  HTMLDivElement,
  { className?: string; children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  const labels = useNovaConnectLabels();
  return (
    <div ref={ref} className={className} {...props}>
      <h3 className="novacon:mb-2 novacon:text-xs novacon:font-medium novacon:uppercase novacon:tracking-wider novacon:text-[var(--tuwa-text-secondary)]">
        {labels.recent}
      </h3>
      <div className="novacon:flex novacon:flex-col novacon:gap-2">{children}</div>
    </div>
  );
});
DefaultRecentlyConnectedSection.displayName = 'DefaultRecentlyConnectedSection';

const DefaultActiveConnectorRow = forwardRef<HTMLDivElement, ConnectorRowProps>(
  ({ connectorType, address, fullAddress, chainId, onDisconnect, icon, className, explorerLink }, ref) => {
    const labels = useNovaConnectLabels();
    const adapter = getAdapterFromConnectorType(connectorType);
    const networkIcon = getNetworkIcon(adapter);
    const { copy, isCopied } = useCopyToClipboard();

    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      copy(fullAddress || address);
    };

    const handleExplorer = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (explorerLink) {
        window.open(explorerLink, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'novacon:relative novacon:flex novacon:items-center novacon:justify-between novacon:bg-[var(--tuwa-bg-accent)]/10 novacon:p-4',
          className,
        )}
      >
        {/* Active Badge - Absolute Top Right */}
        <div className="novacon:absolute novacon:top-2 novacon:right-2">
          <span className="novacon:rounded-full novacon:bg-[var(--tuwa-success-bg)]/20 novacon:px-1.5 novacon:py-0.5 novacon:text-[10px] novacon:font-medium novacon:text-[var(--tuwa-success-text)]">
            {labels.active}
          </span>
        </div>

        <div className="novacon:flex novacon:items-center novacon:gap-3">
          <div className="novacon:relative">
            <WalletIcon name={connectorType.split(':')[1]} icon={icon} size={40} className="novacon:rounded-xl" />
            <div className="novacon:absolute novacon:-bottom-1 novacon:-right-1 novacon:flex novacon:h-5 novacon:w-5 novacon:items-center novacon:justify-center novacon:rounded-full novacon:border novacon:border-[var(--tuwa-bg-secondary)] novacon:bg-[var(--tuwa-bg-primary)]">
              <Web3Icon chainId={setChainId(chainId ?? networkIcon?.chainId ?? 1)} className="w-full h-full" />
            </div>
          </div>
          <div className="novacon:flex novacon:flex-col">
            <span className="novacon:font-medium novacon:text-[var(--tuwa-text-primary)]">{address}</span>
            <span className="novacon:text-xs novacon:text-[var(--tuwa-text-secondary)]">
              {getFormattedConnectorName(connectorType)}
            </span>
            
            {/* Actions Row */}
            <div className="novacon:mt-1 novacon:flex novacon:items-center novacon:gap-2">
               <button
                onClick={handleCopy}
                className="novacon:flex novacon:cursor-pointer novacon:items-center novacon:gap-1 novacon:text-[10px] novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:text-[var(--tuwa-text-primary)]"
                title="Copy Address"
              >
                <DocumentDuplicateIcon className="novacon:h-3 novacon:w-3" />
                {isCopied ? labels.copied : 'Copy'}
              </button>
              {explorerLink && (
                <button
                  onClick={handleExplorer}
                  className="novacon:flex novacon:cursor-pointer novacon:items-center novacon:gap-1 novacon:text-[10px] novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:text-[var(--tuwa-text-primary)]"
                  title="View on Explorer"
                >
                  <ArrowTopRightOnSquareIcon className="novacon:h-3 novacon:w-3" />
                  Explorer
                </button>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={onDisconnect}
          className="novacon:mt-4 novacon:cursor-pointer novacon:rounded-lg novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:px-3 novacon:py-1.5 novacon:text-xs novacon:font-medium novacon:text-[var(--tuwa-text-primary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-error-text)]"
          aria-label={`${labels.disconnect} ${connectorType}`}
        >
          {labels.disconnect}
        </button>
      </div>
    );
  },
);
DefaultActiveConnectorRow.displayName = 'DefaultActiveConnectorRow';

const DefaultConnectedConnectorRow = forwardRef<HTMLDivElement, ConnectorRowProps>(
  ({ connectorType, address, chainId, onSwitch, onDisconnect, className, icon }, ref) => {
    const labels = useNovaConnectLabels();
    const adapter = getAdapterFromConnectorType(connectorType);
    const networkIcon = getNetworkIcon(adapter);

    return (
      <div
        ref={ref}
        onClick={onSwitch}
        className={cn(
          'novacon:group novacon:relative novacon:flex novacon:cursor-pointer novacon:items-center novacon:justify-between novacon:border-t novacon:border-[var(--tuwa-border-primary)] novacon:p-3 novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)]',
          className,
        )}
      >
        {/* Switch Indicator on Hover */}
        <div className="novacon:absolute novacon:left-2 novacon:top-1/2 novacon:-translate-y-1/2 novacon:opacity-0 novacon:transition-opacity novacon:group-hover:opacity-100">
          <ArrowsRightLeftIcon className="novacon:h-4 novacon:w-4 novacon:text-[var(--tuwa-text-accent)]" />
        </div>

        <div className="novacon:flex novacon:items-center novacon:gap-3 novacon:ml-0 novacon:group-hover:ml-6 novacon:transition-all">
          <div className="novacon:relative">
            <WalletIcon name={connectorType.split(':')[1]} icon={icon} size={32} className="novacon:rounded-xl" />
            <div className="novacon:absolute novacon:-bottom-1 novacon:-right-1 novacon:flex novacon:h-4 novacon:w-4 novacon:items-center novacon:justify-center novacon:rounded-full novacon:border novacon:border-[var(--tuwa-bg-secondary)] novacon:bg-[var(--tuwa-bg-primary)]">
              <Web3Icon chainId={setChainId(chainId ?? networkIcon?.chainId ?? 1)} className="novacon:h-full novacon:w-full" />
            </div>
          </div>
          <div className="novacon:flex novacon:flex-col">
            <span className="novacon:text-sm novacon:font-medium novacon:text-[var(--tuwa-text-primary)]">
              {address}
            </span>
            <span className="novacon:text-[10px] novacon:text-[var(--tuwa-text-secondary)]">
              {getFormattedConnectorName(connectorType)}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect(e);
          }}
          className="novacon:cursor-pointer novacon:rounded-lg novacon:p-1.5 novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-error)]/10 novacon:hover:text-[var(--tuwa-error-text)]"
          aria-label={`${labels.disconnect} ${connectorType}`}
        >
          <ArrowLeftStartOnRectangleIcon className="novacon:h-5 novacon:w-5" />
        </button>
      </div>
    );
  },
);
DefaultConnectedConnectorRow.displayName = 'DefaultConnectedConnectorRow';

const DefaultRecentlyConnectedRow = forwardRef<HTMLDivElement, RecentlyConnectedRowProps>(
  ({ connectorType, address, onConnect, onRemove, className, icon, isConnecting = false }, ref) => {
    const labels = useNovaConnectLabels();
    const adapter = getAdapterFromConnectorType(connectorType);
    const networkIcon = getNetworkIcon(adapter);

    return (
      <div
        ref={ref}
        className={cn(
          'novacon:flex novacon:items-center novacon:justify-between novacon:rounded-xl novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-secondary)] novacon:p-3',
          className,
        )}
      >
        <div className="novacon:flex novacon:items-center novacon:gap-3">
          <div className="novacon:relative">
            <WalletIcon name={connectorType.split(':')[1]} icon={icon} size={32} className="novacon:rounded-lg" />
            <div className="novacon:absolute novacon:-bottom-1 novacon:-right-1 novacon:flex novacon:h-4 novacon:w-4 novacon:items-center novacon:justify-center novacon:rounded-full novacon:border novacon:border-[var(--tuwa-bg-secondary)] novacon:bg-[var(--tuwa-bg-primary)]">
              <Web3Icon chainId={setChainId(networkIcon?.chainId ?? 1)} className="novacon:h-full novacon:w-full" />
            </div>
          </div>
          <div className="novacon:flex novacon:flex-col">
            <span className="novacon:text-sm novacon:font-medium novacon:text-[var(--tuwa-text-primary)]">
              {address}
            </span>
            <span className="novacon:text-[10px] novacon:text-[var(--tuwa-text-secondary)]">
              {getFormattedConnectorName(connectorType)}
            </span>
          </div>
        </div>
        <div className="novacon:flex novacon:items-center novacon:gap-2">
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className={cn(
              'novacon:relative novacon:cursor-pointer novacon:rounded-lg novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:px-3 novacon:py-1.5 novacon:text-xs novacon:font-medium novacon:text-[var(--tuwa-text-primary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)]',
              isConnecting && 'novacon:cursor-not-allowed novacon:opacity-50',
            )}
          >
            {isConnecting && (
              <svg
                className="novacon:absolute novacon:left-2 novacon:top-1/2 novacon:-translate-y-1/2 novacon:h-3 novacon:w-3 novacon:animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="novacon:opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="novacon:opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            <span className={cn(isConnecting && 'novacon:ml-4')}>{labels.connect}</span>
          </button>
          <button
            onClick={onRemove}
            disabled={isConnecting}
            className={cn(
              'novacon:cursor-pointer novacon:rounded-lg novacon:p-1.5 novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-error)]/10 novacon:hover:text-[var(--tuwa-error-text)]',
              isConnecting && 'novacon:cursor-not-allowed novacon:opacity-50',
            )}
            aria-label={`${labels.close} ${connectorType}`}
          >
            <TrashIcon className="novacon:h-4 novacon:w-4" />
          </button>
        </div>
      </div>
    );
  },
);
DefaultRecentlyConnectedRow.displayName = 'DefaultRecentlyConnectedRow';

/**
 * ConnectionsContent displays all connected wallets and allows switching between them.
 */
export const ConnectionsContent: React.FC<ConnectionsContentProps> = ({ className, customization }) => {
  const labels = useNovaConnectLabels();
  const { setIsConnectedModalOpen, setIsConnectModalOpen } = useNovaConnect();
  const connections = useSatelliteConnectStore((store) => store.connections);
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const switchConnection = useSatelliteConnectStore((store) => store.switchConnection);
  const disconnect = useSatelliteConnectStore((store) => store.disconnect);
  const connect = useSatelliteConnectStore((store) => store.connect);
  const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);
  const connecting = useSatelliteConnectStore((store) => store.connecting);

  // Track which recent connector is currently connecting
  const [connectingRecent, setConnectingRecent] = useState<ConnectorType | null>(null);

  // Custom Components
  const Container = customization?.components?.Container || DefaultContainer;
  const ActiveConnectorsSection =
    customization?.components?.ActiveConnectorsSection || DefaultActiveConnectorsSection;
  const RecentlyConnectedSection =
    customization?.components?.RecentlyConnectedSection || DefaultRecentlyConnectedSection;
  const ActiveConnectorRow = customization?.components?.ActiveConnectorRow || DefaultActiveConnectorRow;
  const ConnectedConnectorRow = customization?.components?.ConnectedConnectorRow || DefaultConnectedConnectorRow;
  const RecentlyConnectedRow = customization?.components?.RecentlyConnectedRow || DefaultRecentlyConnectedRow;

  /**
   * Convert connections Record to array for rendering
   */
  const connectionsList = useMemo(() => {
    if (!connections) return [];
    return Object.values(connections);
  }, [connections]);

  /**
   * Recently Connected List State Management
   */
  const [recentListState, setRecentListState] = useState<[ConnectorType, RecentlyConnectedConnectorData][]>([]);

  // Initialize and update recent list
  const updateRecentList = useCallback(() => {
    const allRecent = recentlyConnectedConnectorsListHelpers.getConnectorsSortedByTime();
    // Filter out currently connected wallets
    const filtered = allRecent.filter(([type]) => !connections?.[type]);
    setRecentListState(filtered);
  }, [connections]);

  // Initial load and sync with connections changes
  useEffect(() => {
    updateRecentList();
  }, [updateRecentList]);

  /**
   * Handle switching to a different connection
   */
  const handleSwitch = useCallback(
    async (connectorType: ConnectorType) => {
      await switchConnection(connectorType);
    },
    [switchConnection],
  );

  /**
   * Handle disconnecting a specific wallet
   */
  const handleDisconnect = useCallback(
    (connectorType: ConnectorType | undefined, event: React.MouseEvent) => {
      event.stopPropagation();
      if (connectorType) {
        disconnect(connectorType);
      }
    },
    [disconnect],
  );

  /**
   * Handle connecting a recent wallet
   */
  const handleConnectRecent = useCallback(
    async (connectorType: ConnectorType) => {
      setConnectingRecent(connectorType);
      try {
        const adapter = getAdapterFromConnectorType(connectorType);
        const networkIcon = getNetworkIcon(adapter);
        const chainId = networkIcon?.chainId || 1;
        await connect({ connectorType, chainId });
      } catch (error) {
        console.error('Failed to reconnect:', error);
      } finally {
        setConnectingRecent(null);
      }
    },
    [connect],
  );

  /**
   * Handle removing a recent wallet from history
   */
  const handleRemoveRecent = useCallback(
    (connectorType: ConnectorType, event: React.MouseEvent) => {
      event.stopPropagation();
      recentlyConnectedConnectorsListHelpers.removeConnector(connectorType);
      updateRecentList(); // Manually update state to reflect changes immediately
    },
    [updateRecentList],
  );

  if (connectionsList.length === 0 && recentListState.length === 0) {
    return (
      <Container
        className={cn(
          'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-8',
          className,
        )}
      >
        <p className="novacon:text-[var(--tuwa-text-secondary)]">No connections found</p>
      </Container>
    );
  }

  return (
    <Container className={cn('novacon:flex novacon:flex-col novacon:gap-6 novacon:p-4', className)}>
      {/* Active Connectors Section */}
      {connectionsList.length > 0 && (
        <ActiveConnectorsSection count={connectionsList.length}>
          {/* Active Connection */}
          {activeConnection?.connectorType && (
            <ActiveConnectorRow
              connectorType={activeConnection.connectorType}
              address={textCenterEllipsis(activeConnection.address, 6, 4)}
              fullAddress={activeConnection.address}
              chainId={activeConnection.chainId}
              isActive={true}
              onDisconnect={(e) => handleDisconnect(activeConnection.connectorType, e)}
              explorerLink={(() => {
                try {
                  const adapter = getAdapter(getAdapterFromConnectorType(activeConnection.connectorType));
                  return adapter?.getExplorerUrl?.(`/address/${activeConnection.address}`, setChainId(activeConnection.chainId));
                } catch {
                  return undefined;
                }
              })()}
              icon={activeConnection.icon}
            />
          )}

          {/* Other Connected Wallets */}
          {connectionsList
            .filter((c) => c.connectorType !== activeConnection?.connectorType)
            .map((connection) => (
              <ConnectedConnectorRow
                key={connection.connectorType}
                connectorType={connection.connectorType}
                address={textCenterEllipsis(connection.address, 6, 4)}
                isActive={false}
                onSwitch={() => handleSwitch(connection.connectorType)}
                onDisconnect={(e) => handleDisconnect(connection.connectorType, e)}
                icon={connection.icon}
              />
            ))}
        </ActiveConnectorsSection>
      )}

      {/* Recently Connected Section */}
      {recentListState.length > 0 && (
        <RecentlyConnectedSection>
          {recentListState.map(([connectorType, data]) => (
            <RecentlyConnectedRow
              key={connectorType}
              connectorType={connectorType}
              address={textCenterEllipsis(data.address, 6, 4)}
              timestamp={data.disconnectedTimestamp}
              onConnect={() => handleConnectRecent(connectorType)}
              onRemove={(e) => handleRemoveRecent(connectorType, e)}
              icon={data.icon}
              isConnecting={connecting && connectingRecent === connectorType}
            />
          ))}
        </RecentlyConnectedSection>
      )}

      <button
        type="button"
        onClick={() => {
          setIsConnectModalOpen(true);
        }}
        className="novacon:mt-2 novacon:w-full novacon:cursor-pointer novacon:rounded-xl novacon:border novacon:border-dashed novacon:border-[var(--tuwa-border-primary)] novacon:p-3 novacon:text-sm novacon:font-medium novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:border-[var(--tuwa-text-accent)] novacon:hover:text-[var(--tuwa-text-accent)]"
      >
        + {labels.connectNewWallet}
      </button>
    </Container>
  );
};

ConnectionsContent.displayName = 'ConnectionsContent';
