/**
 * @file ConnectionsContent component for managing multiple wallet connections.
 */

import {
  ArrowLeftStartOnRectangleIcon,
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { cn, NetworkIcon, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';
import {
  ConnectorType,
  formatConnectorName,
  getAdapterFromConnectorType,
  getNetworkData,
  impersonatedHelpers,
  RecentlyConnectedConnectorData,
  recentlyConnectedConnectorsListHelpers,
  setChainId,
} from '@tuwaio/orbit-core';
import {
  ComponentPropsWithoutRef,
  ComponentType,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useGetWalletNameAndAvatar, useNovaConnect, useNovaConnectLabels } from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { InitialChains } from '../../types';
import { WalletIcon } from '../WalletIcon';

// --- Types for Customization ---

type CustomContainerProps = {
  className?: string;
  children: ReactNode;
  isEmpty?: boolean;
  connectionsCount?: number;
  recentCount?: number;
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
};

type CustomSectionHeaderProps = {
  title: string;
  count?: number;
  className?: string;
  'aria-level'?: number;
};

type CustomActiveSectionProps = {
  className?: string;
  children: ReactNode;
  count: number;
  labels?: Record<string, string>;
  /** Granular classNames for sub-elements */
  classNames?: {
    title?: string;
    wrapper?: string;
  };
};

type CustomRecentSectionProps = {
  className?: string;
  children: ReactNode;
  count?: number;
  labels?: Record<string, string>;
  /** Granular classNames for sub-elements */
  classNames?: {
    title?: string;
    list?: string;
  };
};

type CustomActiveRowProps = {
  connectorType: ConnectorType;
  address: string;
  fullAddress?: string;
  chainId?: number | string;
  onDisconnect: (e: React.MouseEvent) => void;
  className?: string;
  explorerLink?: string;
  icon?: string;
  labels?: Record<string, string>;
  isCopied?: boolean;
  onCopy?: () => void;
  onExplorer?: () => void;
  displayName?: string;
  /** Granular classNames for sub-elements */
  classNames?: {
    container?: string;
    badge?: string;
    content?: string;
    walletName?: string;
    connectorName?: string;
    actionsContainer?: string;
    copyButton?: string;
    copyIcon?: string;
    explorerButton?: string;
    explorerIcon?: string;
    disconnectButton?: string;
    iconWrapper?: string;
    iconBadge?: string;
  };
};

type CustomConnectedRowProps = {
  connectorType: ConnectorType;
  address: string;
  chainId?: number | string;
  onSwitch: () => void;
  onDisconnect: (e: React.MouseEvent) => void;
  className?: string;
  icon?: string;
  labels?: Record<string, string>;
  isHovered?: boolean;
  /** Granular classNames for sub-elements */
  classNames?: {
    container?: string;
    switchIndicator?: string;
    switchIcon?: string;
    content?: string;
    walletName?: string;
    connectorName?: string;
    disconnectButton?: string;
    disconnectIcon?: string;
    iconWrapper?: string;
    iconBadge?: string;
  };
};

type CustomRecentRowProps = {
  connectorType: ConnectorType;
  address: string;
  timestamp: number;
  onConnect?: () => void;
  onRemove: (e: React.MouseEvent) => void;
  className?: string;
  icon?: string;
  isConnecting?: boolean;
  labels?: Record<string, string>;
  /** Granular classNames for sub-elements */
  classNames?: {
    container?: string;
    content?: string;
    walletName?: string;
    connectorName?: string;
    actionsContainer?: string;
    connectButton?: string;
    connectSpinner?: string;
    removeButton?: string;
    removeIcon?: string;
    iconWrapper?: string;
    iconBadge?: string;
  };
};

type CustomActionButtonProps = {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  variant?: 'primary' | 'secondary' | 'danger';
};

type CustomAddWalletButtonProps = {
  onClick: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
};

type CustomEmptyStateProps = {
  message: string;
  className?: string;
  /** Granular classNames for sub-elements */
  classNames?: {
    container?: string;
    message?: string;
  };
};

/**
 * Customization options for ConnectionsContent component
 */
export type ConnectionsContentCustomization = {
  /** Override container element props */
  containerProps?: Partial<ComponentPropsWithoutRef<'div'>>;
  /** Custom components */
  components?: {
    /** Custom container component */
    Container?: ComponentType<CustomContainerProps>;
    /** Custom section header component */
    SectionHeader?: ComponentType<CustomSectionHeaderProps>;
    /** Custom active connectors section */
    ActiveConnectorsSection?: ComponentType<CustomActiveSectionProps>;
    /** Custom recently connected section */
    RecentlyConnectedSection?: ComponentType<CustomRecentSectionProps>;
    /** Custom active connector row */
    ActiveConnectorRow?: ComponentType<CustomActiveRowProps>;
    /** Custom connected connector row */
    ConnectedConnectorRow?: ComponentType<CustomConnectedRowProps>;
    /** Custom recently connected row */
    RecentlyConnectedRow?: ComponentType<CustomRecentRowProps>;
    /** Custom action button */
    ActionButton?: ComponentType<CustomActionButtonProps>;
    /** Custom add wallet button */
    AddWalletButton?: ComponentType<CustomAddWalletButtonProps>;
    /** Custom empty state */
    EmptyState?: ComponentType<CustomEmptyStateProps>;
  };
  /** Custom class name generators */
  classNames?: {
    // ─────────────────────────────────────────────────────────────────────
    // Container & Sections
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate container classes */
    container?: (params: { isEmpty: boolean; connectionsCount: number; recentCount: number }) => string;
    /** Function to generate empty state classes */
    emptyState?: () => string;
    /** Function to generate empty state message classes */
    emptyStateMessage?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Active Connectors Section
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate active section wrapper classes */
    activeSection?: (params: { count: number }) => string;
    /** Function to generate active section title classes */
    activeSectionTitle?: () => string;
    /** Function to generate active section content wrapper classes */
    activeSectionWrapper?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Recent Section
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate recent section wrapper classes */
    recentSection?: (params: { count: number }) => string;
    /** Function to generate recent section title classes */
    recentSectionTitle?: () => string;
    /** Function to generate recent section list container classes */
    recentSectionList?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Active Connector Row (Primary/Active connection)
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate active row container classes */
    activeRowContainer?: (params: { connectorType: ConnectorType; hasExplorer: boolean }) => string;
    /** Function to generate active badge classes */
    activeRowBadge?: () => string;
    /** Function to generate active row content wrapper classes */
    activeRowContent?: () => string;
    /** Function to generate wallet name/address classes */
    activeRowWalletName?: () => string;
    /** Function to generate connector name classes */
    activeRowConnectorName?: () => string;
    /** Function to generate actions container classes */
    activeRowActionsContainer?: () => string;
    /** Function to generate copy button classes */
    activeRowCopyButton?: (params: { isCopied: boolean }) => string;
    /** Function to generate copy icon classes */
    activeRowCopyIcon?: () => string;
    /** Function to generate explorer button classes */
    activeRowExplorerButton?: () => string;
    /** Function to generate explorer icon classes */
    activeRowExplorerIcon?: () => string;
    /** Function to generate disconnect button classes */
    activeRowDisconnectButton?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Connected Connector Row (Secondary connections)
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate connected row container classes */
    connectedRowContainer?: (params: { connectorType: ConnectorType }) => string;
    /** Function to generate switch indicator classes */
    connectedRowSwitchIndicator?: () => string;
    /** Function to generate switch icon classes */
    connectedRowSwitchIcon?: () => string;
    /** Function to generate content wrapper classes */
    connectedRowContent?: () => string;
    /** Function to generate wallet address classes */
    connectedRowWalletName?: () => string;
    /** Function to generate connector name classes */
    connectedRowConnectorName?: () => string;
    /** Function to generate disconnect button classes */
    connectedRowDisconnectButton?: () => string;
    /** Function to generate disconnect icon classes */
    connectedRowDisconnectIcon?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Recently Connected Row
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate recent row container classes */
    recentRowContainer?: (params: { connectorType: ConnectorType; isConnecting: boolean }) => string;
    /** Function to generate recent row content wrapper classes */
    recentRowContent?: () => string;
    /** Function to generate wallet address classes */
    recentRowWalletName?: () => string;
    /** Function to generate connector name classes */
    recentRowConnectorName?: () => string;
    /** Function to generate actions wrapper classes */
    recentRowActionsContainer?: () => string;
    /** Function to generate connect button classes */
    recentRowConnectButton?: (params: { isConnecting: boolean }) => string;
    /** Function to generate connect button spinner classes */
    recentRowConnectSpinner?: () => string;
    /** Function to generate remove button classes */
    recentRowRemoveButton?: (params: { isConnecting: boolean }) => string;
    /** Function to generate remove icon classes */
    recentRowRemoveIcon?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Connector Icon
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate connector icon wrapper classes */
    connectorIconWrapper?: (params: { size: number }) => string;
    /** Function to generate network badge wrapper classes */
    connectorIconBadge?: (params: { badgeSize: number }) => string;

    // ─────────────────────────────────────────────────────────────────────
    // Add Wallet Button
    // ─────────────────────────────────────────────────────────────────────
    /** Function to generate add wallet button classes */
    addWalletButton?: (params: { disabled?: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom handler before switching connection */
    onBeforeSwitch?: (connectorType: ConnectorType) => boolean | Promise<boolean>;
    /** Custom handler after switching connection */
    onAfterSwitch?: (connectorType: ConnectorType) => void;
    /** Custom handler when switch fails */
    onSwitchError?: (connectorType: ConnectorType, error: Error) => void;
    /** Custom handler before disconnect */
    onBeforeDisconnect?: (connectorType: ConnectorType) => boolean | Promise<boolean>;
    /** Custom handler after disconnect */
    onAfterDisconnect?: (connectorType: ConnectorType) => void;
    /** Custom handler when disconnect fails */
    onDisconnectError?: (connectorType: ConnectorType, error: Error) => void;
    /** Custom handler before connecting recent */
    onBeforeConnect?: (connectorType: ConnectorType) => boolean | Promise<boolean>;
    /** Custom handler after connecting recent */
    onAfterConnect?: (connectorType: ConnectorType) => void;
    /** Custom handler when connect fails */
    onConnectError?: (connectorType: ConnectorType, error: Error) => void;
    /** Custom handler before removing recent */
    onBeforeRemove?: (connectorType: ConnectorType) => boolean | Promise<boolean>;
    /** Custom handler after removing recent */
    onAfterRemove?: (connectorType: ConnectorType) => void;
    /** Custom handler for copy address */
    onCopyAddress?: (address: string, connectorType: ConnectorType) => void;
    /** Custom handler for explorer click */
    onExplorerClick?: (url: string, address: string, connectorType: ConnectorType) => void;
    /** Custom handler for add wallet click */
    onAddWalletClick?: () => void;
  };
  /** Custom text and ARIA labels */
  labels?: {
    /** Custom empty state message */
    emptyStateMessage?: string;
    /** Custom active section title */
    activeSectionTitle?: string;
    /** Custom recent section title */
    recentSectionTitle?: string;
    /** Custom disconnect button label */
    disconnectLabel?: string;
    /** Custom switch button label */
    switchLabel?: string;
    /** Custom connect button label */
    connectLabel?: string;
    /** Custom remove button label */
    removeLabel?: string;
    /** Custom copy button label */
    copyLabel?: string;
    /** Custom copied success label */
    copiedLabel?: string;
    /** Custom explorer button label */
    explorerLabel?: string;
    /** Custom add wallet button label */
    addWalletLabel?: string;
    /** Custom ARIA label for container */
    containerAriaLabel?: string;
    /** Custom ARIA label for active section */
    activeSectionAriaLabel?: string;
    /** Custom ARIA label for recent section */
    recentSectionAriaLabel?: string;
    /** Custom ARIA description for switch action */
    switchAriaDescription?: string;
    /** Custom ARIA description for disconnect action */
    disconnectAriaDescription?: string;
    /** Custom ARIA description for connect action */
    connectAriaDescription?: string;
    /** Custom ARIA description for remove action */
    removeAriaDescription?: string;
    /** Custom ARIA live region announcement for switch */
    switchAnnouncement?: (walletName: string) => string;
    /** Custom ARIA live region announcement for disconnect */
    disconnectAnnouncement?: (walletName: string) => string;
    /** Custom ARIA live region announcement for connect */
    connectAnnouncement?: (walletName: string) => string;
  };
  /** Configuration options */
  config?: {
    /** Whether to disable animations */
    disableAnimation?: boolean;
    /** Whether to reduce motion for accessibility */
    reduceMotion?: boolean;
    /** Whether to show empty state */
    showEmptyState?: boolean;
    /** Whether to show add wallet button */
    showAddWalletButton?: boolean;
    /** Whether to show recently connected section */
    showRecentSection?: boolean;
    /** Whether to enable keyboard shortcuts */
    enableKeyboardShortcuts?: boolean;
    /** Custom keyboard shortcuts map */
    keyboardShortcuts?: {
      /** Key for switching to next connection */
      nextConnection?: string;
      /** Key for switching to previous connection */
      prevConnection?: string;
      /** Key for disconnecting active wallet */
      disconnect?: string;
    };
    /** Maximum recent connections to show */
    maxRecentConnections?: number;
    /** Whether to auto-focus first interactive element */
    autoFocus?: boolean;
    /** Custom test IDs */
    testIds?: {
      container?: string;
      activeSection?: string;
      recentSection?: string;
      addWalletButton?: string;
    };
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
  /** Optional display name (e.g. ENS name) to show instead of address */
  displayName?: string;
  /** Granular classNames for sub-elements */
  classNames?: CustomActiveRowProps['classNames'];
}

interface RecentlyConnectedRowProps {
  connectorType: ConnectorType;
  address: string;
  timestamp: number;
  onConnect?: () => void;
  onRemove: (e: React.MouseEvent) => void;
  className?: string;
  icon?: string;
  isConnecting?: boolean;
  /** Granular classNames for sub-elements */
  classNames?: CustomRecentRowProps['classNames'];
}

// --- Helper Functions ---

const getFormattedConnectorName = (connectorType: string): string => {
  function capitalizeFirstLetter(str: string) {
    if (typeof str !== 'string' || str.length === 0) {
      return ''; // Handle empty strings or non-string inputs
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  // Remove adapter prefix (e.g., "EVM:METAMASK" -> "METAMASK")
  const nameWithoutAdapter = connectorType.includes(':') ? connectorType.split(':')[1] : connectorType;
  return capitalizeFirstLetter(formatConnectorName(nameWithoutAdapter));
};

/**
 * Props for the ConnectorIcon component
 */
interface ConnectorIconProps {
  connectorType: ConnectorType;
  icon?: string;
  chainId?: number | string;
  size?: number;
  badgeSize?: number;
  imageClassName?: string;
  /** Custom class for icon wrapper */
  wrapperClassName?: string;
  /** Custom class for network badge */
  badgeClassName?: string;
}

/**
 * Helper component to display wallet icon with network badge
 */
const ConnectorIcon: React.FC<ConnectorIconProps> = ({
  connectorType,
  icon,
  chainId,
  size = 32,
  badgeSize = 16,
  imageClassName,
  wrapperClassName,
  badgeClassName,
}) => {
  const adapter = getAdapterFromConnectorType(connectorType);
  const networkIcon = getNetworkData(adapter)?.chain;

  return (
    <div
      className={cn('novacon:relative novacon:flex-shrink-0', wrapperClassName)}
      style={{ width: size, height: size }}
    >
      <WalletIcon name={connectorType.split(':')[1]} icon={icon} size={size} className={imageClassName} />
      <div
        className={cn(
          'novacon:absolute novacon:-bottom-1 novacon:-right-1 novacon:flex novacon:items-center novacon:justify-center novacon:rounded-full novacon:border novacon:border-[var(--tuwa-bg-secondary)] novacon:bg-[var(--tuwa-bg-primary)]',
          badgeClassName,
        )}
        style={{ width: badgeSize, height: badgeSize }}
      >
        <NetworkIcon
          chainId={setChainId(chainId ?? networkIcon?.chainId ?? 1)}
          className="novacon:h-full novacon:w-full"
        />
      </div>
    </div>
  );
};

// --- Default Components ---

const DefaultContainer = forwardRef<HTMLDivElement, CustomContainerProps>(
  (
    {
      className,
      children,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isEmpty,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      connectionsCount,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      recentCount,
      role,
      'aria-label': ariaLabel,
      'data-testid': testId,
      ...domProps
    },
    ref,
  ) => (
    <div ref={ref} className={className} role={role} aria-label={ariaLabel} data-testid={testId} {...domProps}>
      {children}
    </div>
  ),
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultActiveConnectorsSection = forwardRef<HTMLDivElement, CustomActiveSectionProps>(
  ({ className, children, count, classNames, ...props }, ref) => {
    const labels = useNovaConnectLabels();
    return (
      <div ref={ref} className={className} {...props}>
        <h3
          className={cn(
            'novacon:mb-2 novacon:text-xs novacon:font-medium novacon:uppercase novacon:tracking-wider novacon:text-[var(--tuwa-text-secondary)]',
            classNames?.title,
          )}
        >
          {labels.active} {labels.connectors} {count > 0 && `(${count})`}
        </h3>
        <div
          className={cn(
            'novacon:overflow-hidden novacon:rounded-xl novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-secondary)]',
            classNames?.wrapper,
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);
DefaultActiveConnectorsSection.displayName = 'DefaultActiveConnectorsSection';

const DefaultRecentlyConnectedSection = forwardRef<HTMLDivElement, CustomRecentSectionProps>(
  ({ className, children, classNames, ...props }, ref) => {
    const labels = useNovaConnectLabels();
    return (
      <div ref={ref} className={className} {...props}>
        <h3
          className={cn(
            'novacon:mb-2 novacon:text-xs novacon:font-medium novacon:uppercase novacon:tracking-wider novacon:text-[var(--tuwa-text-secondary)]',
            classNames?.title,
          )}
        >
          {labels.recent}
        </h3>
        <div
          className={cn(
            'NovaCustomScroll novacon:max-h-[240px] novacon:overflow-x-hidden novacon:overflow-y-auto novacon:flex novacon:flex-col novacon:gap-2',
            classNames?.list,
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);
DefaultRecentlyConnectedSection.displayName = 'DefaultRecentlyConnectedSection';

const DefaultActiveConnectorRow = forwardRef<HTMLDivElement, ConnectorRowProps>(
  (
    {
      connectorType,
      address,
      fullAddress,
      chainId,
      onDisconnect,
      icon,
      className,
      explorerLink,
      displayName,
      classNames,
    },
    ref,
  ) => {
    const labels = useNovaConnectLabels();
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
          classNames?.container,
          className,
        )}
      >
        {/* Active Badge - Absolute Top Right */}
        <div className="novacon:absolute novacon:top-2 novacon:right-2">
          <span
            className={cn(
              'novacon:rounded-full novacon:bg-[var(--tuwa-success-bg)]/20 novacon:px-1.5 novacon:py-0.5 novacon:text-[10px] novacon:font-medium novacon:text-[var(--tuwa-success-text)]',
              classNames?.badge,
            )}
          >
            {labels.active}
          </span>
        </div>

        <div className={cn('novacon:flex novacon:items-center novacon:gap-3', classNames?.content)}>
          <ConnectorIcon
            connectorType={connectorType}
            icon={icon}
            chainId={chainId}
            size={40}
            badgeSize={20}
            imageClassName="novacon:rounded-xl"
            wrapperClassName={classNames?.iconWrapper}
            badgeClassName={classNames?.iconBadge}
          />
          <div className="novacon:flex novacon:flex-col">
            <span
              className={cn(
                'novacon:font-medium novacon:text-[var(--tuwa-text-primary)]',
                classNames?.walletName,
              )}
            >
              {displayName || address}
            </span>
            <span
              className={cn(
                'novacon:text-xs novacon:text-[var(--tuwa-text-secondary)]',
                classNames?.connectorName,
              )}
            >
              {getFormattedConnectorName(connectorType)}
            </span>

            {/* Actions Row */}
            <div
              className={cn(
                'novacon:mt-1 novacon:flex novacon:items-center novacon:gap-2',
                classNames?.actionsContainer,
              )}
            >
              <button
                onClick={handleCopy}
                className={cn(
                  'novacon:flex novacon:cursor-pointer novacon:items-center novacon:gap-1 novacon:text-[10px] novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:text-[var(--tuwa-text-primary)]',
                  classNames?.copyButton,
                )}
                title="Copy Address"
              >
                <DocumentDuplicateIcon className={cn('novacon:h-3 novacon:w-3', classNames?.copyIcon)} />
                {isCopied ? labels.copied : 'Copy'}
              </button>
              {explorerLink && (
                <button
                  onClick={handleExplorer}
                  className={cn(
                    'novacon:flex novacon:cursor-pointer novacon:items-center novacon:gap-1 novacon:text-[10px] novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:text-[var(--tuwa-text-primary)]',
                    classNames?.explorerButton,
                  )}
                  title="View on Explorer"
                >
                  <ArrowTopRightOnSquareIcon className={cn('novacon:h-3 novacon:w-3', classNames?.explorerIcon)} />
                  Explorer
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onDisconnect}
          className={cn(
            'novacon:mt-4 novacon:cursor-pointer novacon:rounded-lg novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:px-3 novacon:py-1.5 novacon:text-xs novacon:font-medium novacon:text-[var(--tuwa-text-primary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-error-text)]',
            classNames?.disconnectButton,
          )}
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
  ({ connectorType, address, chainId, onSwitch, onDisconnect, className, icon, classNames }, ref) => {
    const labels = useNovaConnectLabels();

    return (
      <div
        ref={ref}
        onClick={onSwitch}
        className={cn(
          'novacon:group novacon:relative novacon:flex novacon:cursor-pointer novacon:items-center novacon:justify-between novacon:border-t novacon:border-[var(--tuwa-border-primary)] novacon:p-3 novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)]',
          classNames?.container,
          className,
        )}
      >
        {/* Switch Indicator on Hover */}
        <div
          className={cn(
            'novacon:absolute novacon:left-2 novacon:top-1/2 novacon:-translate-y-1/2 novacon:opacity-0 novacon:transition-opacity novacon:group-hover:opacity-100',
            classNames?.content, // reuse content for switch indicator wrapper
          )}
        >
          <ArrowsRightLeftIcon
            className={cn('novacon:h-4 novacon:w-4 novacon:text-[var(--tuwa-text-accent)]', classNames?.copyIcon)}
          />
        </div>

        <div className="novacon:flex novacon:items-center novacon:gap-3 novacon:ml-0 novacon:group-hover:ml-6 novacon:transition-all">
          <ConnectorIcon
            connectorType={connectorType}
            icon={icon}
            chainId={chainId}
            size={32}
            badgeSize={16}
            imageClassName="novacon:rounded-xl"
            wrapperClassName={classNames?.iconWrapper}
            badgeClassName={classNames?.iconBadge}
          />
          <div className="novacon:flex novacon:flex-col">
            <span
              className={cn(
                'novacon:text-sm novacon:font-medium novacon:text-[var(--tuwa-text-primary)]',
                classNames?.walletName,
              )}
            >
              {address}
            </span>
            <span
              className={cn(
                'novacon:text-[10px] novacon:text-[var(--tuwa-text-secondary)]',
                classNames?.connectorName,
              )}
            >
              {getFormattedConnectorName(connectorType)}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect(e);
          }}
          className={cn(
            'novacon:cursor-pointer novacon:rounded-lg novacon:p-1.5 novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-error)]/10 novacon:hover:text-[var(--tuwa-error-text)]',
            classNames?.disconnectButton,
          )}
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
  ({ connectorType, address, onConnect, onRemove, className, icon, isConnecting = false, classNames }, ref) => {
    const labels = useNovaConnectLabels();

    return (
      <div
        ref={ref}
        className={cn(
          'novacon:flex novacon:items-center novacon:justify-between novacon:rounded-xl novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-secondary)] novacon:p-3',
          classNames?.container,
          className,
        )}
      >
        <div className={cn('novacon:flex novacon:items-center novacon:gap-3', classNames?.content)}>
          <ConnectorIcon
            connectorType={connectorType}
            icon={icon}
            size={32}
            badgeSize={16}
            imageClassName="novacon:rounded-lg"
            wrapperClassName={classNames?.iconWrapper}
            badgeClassName={classNames?.iconBadge}
          />
          <div className="novacon:flex novacon:flex-col">
            <span
              className={cn(
                'novacon:text-sm novacon:font-medium novacon:text-[var(--tuwa-text-primary)]',
                classNames?.walletName,
              )}
            >
              {address}
            </span>
            <span
              className={cn(
                'novacon:text-[10px] novacon:text-[var(--tuwa-text-secondary)]',
                classNames?.connectorName,
              )}
            >
              {getFormattedConnectorName(connectorType)}
            </span>
          </div>
        </div>
        <div className={cn('novacon:flex novacon:items-center novacon:gap-2', classNames?.actionsContainer)}>
          {onConnect && (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className={cn(
                'novacon:relative novacon:cursor-pointer novacon:rounded-lg novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:px-3 novacon:py-1.5 novacon:text-xs novacon:font-medium novacon:text-[var(--tuwa-text-primary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)]',
                isConnecting && 'novacon:cursor-not-allowed novacon:opacity-50',
                classNames?.connectButton,
              )}
            >
              {isConnecting && (
                <svg
                  className={cn(
                    'novacon:absolute novacon:left-2 novacon:top-1/2 novacon:-translate-y-1/2 novacon:h-3 novacon:w-3 novacon:animate-spin',
                    classNames?.connectSpinner,
                  )}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="novacon:opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="novacon:opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span className={cn(isConnecting && 'novacon:ml-4')}>{labels.connect}</span>
            </button>
          )}
          <button
            onClick={onRemove}
            disabled={isConnecting}
            className={cn(
              'novacon:cursor-pointer novacon:rounded-lg novacon:p-1.5 novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-error)]/10 novacon:hover:text-[var(--tuwa-error-text)]',
              isConnecting && 'novacon:cursor-not-allowed novacon:opacity-50',
              classNames?.removeButton,
            )}
            aria-label={`${labels.close} ${connectorType}`}
          >
            <TrashIcon className={cn('novacon:h-4 novacon:w-4', classNames?.removeIcon)} />
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
  const { setIsConnectModalOpen } = useNovaConnect();
  const connections = useSatelliteConnectStore((store) => store.connections);
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const switchConnection = useSatelliteConnectStore((store) => store.switchConnection);
  const disconnect = useSatelliteConnectStore((store) => store.disconnect);
  const connect = useSatelliteConnectStore((store) => store.connect);
  const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);
  const connecting = useSatelliteConnectStore((store) => store.connecting);
  const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);

  // Fetch ENS/SNS name and avatar for active connection
  const { ensNameAbbreviated } = useGetWalletNameAndAvatar({
    abbreviateSymbols: 6,
    maxNameLength: 20,
  });

  // Track which recent connector is currently connecting
  const [connectingRecent, setConnectingRecent] = useState<ConnectorType | null>(null);

  // ARIA live region for announcements
  const [announcement, setAnnouncement] = useState<string>('');

  // Extract customization options
  const {
    showEmptyState = true,
    showAddWalletButton = true,
    showRecentSection = true,
    maxRecentConnections = 10,
    enableKeyboardShortcuts = true,
    autoFocus = false,
    testIds,
  } = customization?.config ?? {};

  // Merge custom labels with defaults
  const finalLabels = useMemo(
    () => ({
      ...labels,
      ...(customization?.labels && {
        emptyState: customization.labels.emptyStateMessage ?? 'No connections found',
        containerAriaLabel: customization.labels.containerAriaLabel ?? 'Wallet connections manager',
        activeSectionAriaLabel: customization.labels.activeSectionAriaLabel ?? 'Active wallet connections',
        recentSectionAriaLabel: customization.labels.recentSectionAriaLabel ?? 'Recently connected wallets',
      }),
    }),
    [labels, customization?.labels],
  );

  // Ref for container element for focus management
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-focus first interactive element on mount if enabled
   */
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstInteractive = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (firstInteractive) {
        firstInteractive.focus();
      }
    }
  }, [autoFocus]);

  // Custom Components
  const Container = customization?.components?.Container || DefaultContainer;
  const ActiveConnectorsSection = customization?.components?.ActiveConnectorsSection || DefaultActiveConnectorsSection;
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
    setRecentListState(filtered.slice(0, maxRecentConnections));
  }, [connections, maxRecentConnections]);

  // Initial load and sync with connections changes
  useEffect(() => {
    updateRecentList();
  }, [updateRecentList]);

  /**
   * Handle switching to a different connection with custom handlers and announcements
   */
  const handleSwitch = useCallback(
    async (connectorType: ConnectorType) => {
      try {
        // Custom before switch handler
        if (customization?.handlers?.onBeforeSwitch) {
          const shouldProceed = await customization.handlers.onBeforeSwitch(connectorType);
          if (!shouldProceed) return;
        }

        await switchConnection(connectorType);

        // Announce to screen readers
        const walletName = getFormattedConnectorName(connectorType);
        const announcement =
          customization?.labels?.switchAnnouncement?.(walletName) ?? `Switched to ${walletName} wallet`;
        setAnnouncement(announcement);
        setTimeout(() => setAnnouncement(''), 3000);

        // Custom after switch handler
        if (customization?.handlers?.onAfterSwitch) {
          customization.handlers.onAfterSwitch(connectorType);
        }
      } catch (error) {
        console.error('Failed to switch connection:', error);
        if (customization?.handlers?.onSwitchError) {
          customization.handlers.onSwitchError(connectorType, error as Error);
        }
      }
    },
    [switchConnection, customization],
  );

  /**
   * Handle disconnecting a specific wallet with custom handlers and announcements
   */
  const handleDisconnect = useCallback(
    async (connectorType: ConnectorType | undefined, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!connectorType) return;

      try {
        // Custom before disconnect handler
        if (customization?.handlers?.onBeforeDisconnect) {
          const shouldProceed = await customization.handlers.onBeforeDisconnect(connectorType);
          if (!shouldProceed) return;
        }

        disconnect(connectorType);

        // Announce to screen readers
        const walletName = getFormattedConnectorName(connectorType);
        const announcement =
          customization?.labels?.disconnectAnnouncement?.(walletName) ?? `Disconnected ${walletName} wallet`;
        setAnnouncement(announcement);
        setTimeout(() => setAnnouncement(''), 3000);

        // Custom after disconnect handler
        if (customization?.handlers?.onAfterDisconnect) {
          customization.handlers.onAfterDisconnect(connectorType);
        }
      } catch (error) {
        console.error('Failed to disconnect:', error);
        if (customization?.handlers?.onDisconnectError) {
          customization.handlers.onDisconnectError(connectorType, error as Error);
        }
      }
    },
    [disconnect, customization],
  );

  /**
   * Handle connecting a recent wallet with custom handlers and announcements
   */
  const handleConnectRecent = useCallback(
    async (address: string, connectorType: ConnectorType) => {
      setConnectingRecent(connectorType);
      try {
        // Custom before connect handler
        if (customization?.handlers?.onBeforeConnect) {
          const shouldProceed = await customization.handlers.onBeforeConnect(connectorType);
          if (!shouldProceed) {
            setConnectingRecent(null);
            return;
          }
        }

        const adapter = getAdapterFromConnectorType(connectorType);
        const networkIcon = getNetworkData(adapter)?.chain;
        const chainId = networkIcon?.chainId || 1;
        const walletName = getFormattedConnectorName(connectorType);
        if (walletName === 'impersonatedwallet') {
          impersonatedHelpers.setImpersonated(address.trim());
          await connect({ connectorType, chainId });
        } else {
          await connect({ connectorType, chainId });
        }

        // Announce to screen readers
        const announcement =
          customization?.labels?.connectAnnouncement?.(walletName) ?? `Connected ${walletName} wallet`;
        setAnnouncement(announcement);
        setTimeout(() => setAnnouncement(''), 3000);

        // Custom after connect handler
        if (customization?.handlers?.onAfterConnect) {
          customization.handlers.onAfterConnect(connectorType);
        }
      } catch (error) {
        console.error('Failed to reconnect:', error);
        if (customization?.handlers?.onConnectError) {
          customization.handlers.onConnectError(connectorType, error as Error);
        }
      } finally {
        setConnectingRecent(null);
      }
    },
    [connect, customization],
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

  /**
   * Keyboard navigation support
   * Must be after all handlers are defined
   */
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey } = event;
      const modKey = ctrlKey || metaKey;

      // Get custom shortcuts or use defaults
      const shortcuts = customization?.config?.keyboardShortcuts ?? {
        nextConnection: 'ArrowDown',
        prevConnection: 'ArrowUp',
        disconnect: 'd',
      };

      // Navigate to next connection (Ctrl/Cmd + ArrowDown or custom)
      if (modKey && key === shortcuts.nextConnection) {
        event.preventDefault();
        const currentIndex = connectionsList.findIndex((c) => c.connectorType === activeConnection?.connectorType);
        if (currentIndex < connectionsList.length - 1) {
          handleSwitch(connectionsList[currentIndex + 1].connectorType);
        }
        return;
      }

      // Navigate to previous connection (Ctrl/Cmd + ArrowUp or custom)
      if (modKey && key === shortcuts.prevConnection) {
        event.preventDefault();
        const currentIndex = connectionsList.findIndex((c) => c.connectorType === activeConnection?.connectorType);
        if (currentIndex > 0) {
          handleSwitch(connectionsList[currentIndex - 1].connectorType);
        }
        return;
      }

      // Disconnect active wallet (Ctrl/Cmd + D or custom)
      if (modKey && key === shortcuts.disconnect && activeConnection) {
        event.preventDefault();
        const syntheticEvent = new MouseEvent('click') as unknown as React.MouseEvent;
        handleDisconnect(activeConnection.connectorType, syntheticEvent);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, connectionsList, activeConnection, customization, handleSwitch, handleDisconnect]);

  const allConnectors = getConnectors();

  if (connectionsList.length === 0 && recentListState.length === 0) {
    if (!showEmptyState) return null;

    return (
      <Container
        className={cn(
          'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-8',
          customization?.classNames?.emptyState?.(),
          className,
        )}
        isEmpty={true}
        connectionsCount={0}
        recentCount={0}
      >
        <p
          className={cn(
            'novacon:text-[var(--tuwa-text-secondary)]',
            customization?.classNames?.emptyStateMessage?.(),
          )}
          role="status"
        >
          {finalLabels.emptyState}
        </p>
      </Container>
    );
  }

  return (
    <Container
      className={cn('novacon:flex novacon:flex-col novacon:gap-6 novacon:p-4', className)}
      isEmpty={false}
      connectionsCount={connectionsList.length}
      recentCount={recentListState.length}
      role="region"
      aria-label={finalLabels.containerAriaLabel}
      data-testid={testIds?.container}
    >
      {/* ARIA Live Region for announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="novacon:sr-only">
        {announcement}
      </div>
      {/* Active Connectors Section */}
      {connectionsList.length > 0 && (
        <ActiveConnectorsSection
          count={connectionsList.length}
          classNames={{
            title: customization?.classNames?.activeSectionTitle?.(),
            wrapper: customization?.classNames?.activeSectionWrapper?.(),
          }}
        >
          {/* Active Connection */}
          {activeConnection?.connectorType && (
            <ActiveConnectorRow
              connectorType={activeConnection.connectorType}
              address={textCenterEllipsis(activeConnection.address, 6, 4)}
              fullAddress={activeConnection.address}
              displayName={ensNameAbbreviated}
              chainId={activeConnection.chainId}
              isActive={true}
              onDisconnect={(e) => handleDisconnect(activeConnection.connectorType, e)}
              explorerLink={(() => {
                try {
                  const adapter = getAdapter(getAdapterFromConnectorType(activeConnection.connectorType));
                  return adapter?.getExplorerUrl?.(
                    `/address/${activeConnection.address}`,
                    setChainId(activeConnection.chainId),
                  );
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
      {showRecentSection && recentListState.length > 0 && (
        <RecentlyConnectedSection
          classNames={{
            title: customization?.classNames?.recentSectionTitle?.(),
            list: customization?.classNames?.recentSectionList?.(),
          }}
        >
          {recentListState.map(([connectorType, data]) => {
            // Use a more direct approach with explicit type casting
            const isAvailable = allConnectors[getAdapterFromConnectorType(connectorType)]?.some((c) => {
              // Safely check if c is a valid object with a name property
              if (c && typeof c === 'object' && 'name' in c && typeof (c as any).name === 'string') {
                return (
                  `${getAdapterFromConnectorType(connectorType)}:${formatConnectorName((c as { name: string }).name)}` ===
                  connectorType
                );
              }
              return false;
            });
            return (
              <RecentlyConnectedRow
                key={connectorType}
                connectorType={connectorType}
                address={textCenterEllipsis(data.address, 6, 4)}
                timestamp={data.disconnectedTimestamp}
                onConnect={isAvailable ? () => handleConnectRecent(data.address, connectorType) : undefined}
                onRemove={(e) => handleRemoveRecent(connectorType, e)}
                icon={data.icon}
                isConnecting={connecting && connectingRecent === connectorType}
              />
            );
          })}
        </RecentlyConnectedSection>
      )}

      {showAddWalletButton && (
        <button
          type="button"
          onClick={() => {
            setIsConnectModalOpen(true);
          }}
          className={cn(
            'novacon:mt-2 novacon:w-full novacon:cursor-pointer novacon:rounded-xl novacon:border novacon:border-dashed novacon:border-[var(--tuwa-border-primary)] novacon:p-3 novacon:text-sm novacon:font-medium novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:border-[var(--tuwa-text-accent)] novacon:hover:text-[var(--tuwa-text-accent)]',
            customization?.classNames?.addWalletButton?.({}),
          )}
        >
          + {labels.connectNewWallet}
        </button>
      )}
    </Container>
  );
};

ConnectionsContent.displayName = 'ConnectionsContent';
