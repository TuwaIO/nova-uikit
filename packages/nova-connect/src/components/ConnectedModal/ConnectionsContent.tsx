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
import { ComponentType, forwardRef, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useGetWalletNameAndAvatar, useNovaConnect, useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
import { useSatelliteConnectStore } from '../../satellite';
import { getConnectChainId } from '../../utils/getConnectedChainId';
import { WalletIcon } from '../WalletIcon';

// --- Types for Customization ---

/**
 * Props for a custom container.
 */
export type ConnectionsContentContainerProps = {
  /** Classes from `classNames.container` or the defaults (with `classNames.emptyState` in the empty state) */
  className?: string;
  /** The sections and the add wallet button, or the empty state message */
  children: ReactNode;
  /** Whether there are no connections and no recent wallets */
  isEmpty?: boolean;
  /** Number of connected wallets */
  connectionsCount?: number;
  /** Number of recent wallets shown */
  recentCount?: number;
  /** `region` (not set in the empty state) */
  role?: string;
  /** `labels.containerAriaLabel` or the `walletConnectionsManager` label (not set in the empty state) */
  'aria-label'?: string;
  /** `config.testIds.container` */
  'data-testid'?: string;
  /** Keyboard shortcuts (see `config.enableKeyboardShortcuts`); pass it to the container element */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Pass it to the container element: `config.autoFocus` focuses its first interactive element */
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Props for a custom section of the connected wallets.
 */
export type ConnectionsContentActiveSectionProps = {
  /** The row of the active wallet and the rows of the other connected wallets */
  children: ReactNode;
  /** Number of connected wallets */
  count: number;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.activeSectionTitle` */
    title?: string;
    /** From `classNames.activeSectionWrapper` */
    wrapper?: string;
  };
};

/**
 * Props for a custom section of the recent wallets.
 */
export type ConnectionsContentRecentSectionProps = {
  /** The rows of the recent wallets */
  children: ReactNode;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.recentSectionTitle` */
    title?: string;
    /** From `classNames.recentSectionList` */
    list?: string;
  };
};

/**
 * Props for a custom row of the active wallet. The component also passes `isActive: true`.
 */
export type ConnectionsContentActiveRowProps = {
  /** Connector type of the wallet */
  connectorType: ConnectorType;
  /** The address shortened to `0x1234…abcd` */
  address: string;
  /** The full address, copied by the copy button */
  fullAddress?: string;
  /** Chain of the connection */
  chainId?: number | string;
  /**
   * Disconnects the wallet.
   *
   * @param e - The click event (propagation is stopped).
   */
  onDisconnect: (e: React.MouseEvent) => void;
  /** Explorer page of the address, `undefined` when the chain has no explorer */
  explorerLink?: string;
  /** Wallet icon of the connection */
  icon?: string;
  /** The ENS or SNS name of the address, shortened, when it has one */
  displayName?: string;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.activeRowContainer` */
    container?: string;
    /** From `classNames.activeRowBadge` */
    badge?: string;
    /** From `classNames.activeRowContent` */
    content?: string;
    /** From `classNames.activeRowWalletName` */
    walletName?: string;
    /** From `classNames.activeRowConnectorName` */
    connectorName?: string;
    /** From `classNames.activeRowActionsContainer` */
    actionsContainer?: string;
    /** From `classNames.activeRowCopyButton` */
    copyButton?: string;
    /** From `classNames.activeRowCopyIcon` */
    copyIcon?: string;
    /** From `classNames.activeRowExplorerButton` */
    explorerButton?: string;
    /** From `classNames.activeRowExplorerIcon` */
    explorerIcon?: string;
    /** From `classNames.activeRowDisconnectButton` */
    disconnectButton?: string;
    /** From `classNames.connectorIconWrapper` */
    iconWrapper?: string;
    /** From `classNames.connectorIconBadge` */
    iconBadge?: string;
  };
};

/**
 * Props for a custom row of another connected wallet (click it to make it active). The component also passes
 * `isActive: false`.
 */
export type ConnectionsContentConnectedRowProps = {
  /** Connector type of the wallet */
  connectorType: ConnectorType;
  /** The address shortened to `0x1234…abcd` */
  address: string;
  /** Chain of the connection */
  chainId?: number | string;
  /** Makes this connection active (`switchConnection` of the Satellite store) */
  onSwitch: () => void;
  /**
   * Disconnects the wallet.
   *
   * @param e - The click event.
   */
  onDisconnect: (e: React.MouseEvent) => void;
  /** Wallet icon of the connection */
  icon?: string;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.connectedRowContainer` */
    container?: string;
    /** From `classNames.connectedRowSwitchIndicator` */
    switchIndicator?: string;
    /** From `classNames.connectedRowSwitchIcon` */
    switchIcon?: string;
    /** From `classNames.connectedRowContent` */
    content?: string;
    /** From `classNames.connectedRowWalletName` */
    walletName?: string;
    /** From `classNames.connectedRowConnectorName` */
    connectorName?: string;
    /** From `classNames.connectedRowDisconnectButton` */
    disconnectButton?: string;
    /** From `classNames.connectedRowDisconnectIcon` */
    disconnectIcon?: string;
    /** From `classNames.connectorIconWrapper` */
    iconWrapper?: string;
    /** From `classNames.connectorIconBadge` */
    iconBadge?: string;
  };
};

/**
 * Props for a custom row of a recently connected wallet.
 */
export type ConnectionsContentRecentRowProps = {
  /** Connector type of the wallet */
  connectorType: ConnectorType;
  /** The last address of the wallet, shortened to `0x1234…abcd` */
  address: string;
  /** When the wallet was disconnected (`disconnectedTimestamp` of the recent list) */
  timestamp: number;
  /** Connects the wallet again; `undefined` when the store has no connector for it */
  onConnect?: () => void;
  /**
   * Removes the wallet from the recent list.
   *
   * @param e - The click event (propagation is stopped).
   */
  onRemove: (e: React.MouseEvent) => void;
  /** Wallet icon saved in the recent list */
  icon?: string;
  /** Whether this wallet is being connected */
  isConnecting?: boolean;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.recentRowContainer` */
    container?: string;
    /** From `classNames.recentRowContent` */
    content?: string;
    /** From `classNames.recentRowWalletName` */
    walletName?: string;
    /** From `classNames.recentRowConnectorName` */
    connectorName?: string;
    /** From `classNames.recentRowActionsContainer` */
    actionsContainer?: string;
    /** From `classNames.recentRowConnectButton` */
    connectButton?: string;
    /** From `classNames.recentRowConnectSpinner` */
    connectSpinner?: string;
    /** From `classNames.recentRowRemoveButton` */
    removeButton?: string;
    /** From `classNames.recentRowRemoveIcon` */
    removeIcon?: string;
    /** From `classNames.connectorIconWrapper` */
    iconWrapper?: string;
    /** From `classNames.connectorIconBadge` */
    iconBadge?: string;
  };
};

/**
 * Customization options of {@link ConnectionsContent}.
 */
export type ConnectionsContentCustomization = {
  /** Custom components */
  components?: {
    /** Custom container component (forward `ref` and `onKeyDown` to the container element) */
    Container?: ComponentType<ConnectionsContentContainerProps>;
    /** Custom active connectors section */
    ActiveConnectorsSection?: ComponentType<ConnectionsContentActiveSectionProps>;
    /** Custom recently connected section */
    RecentlyConnectedSection?: ComponentType<ConnectionsContentRecentSectionProps>;
    /** Custom active connector row */
    ActiveConnectorRow?: ComponentType<ConnectionsContentActiveRowProps>;
    /** Custom connected connector row */
    ConnectedConnectorRow?: ComponentType<ConnectionsContentConnectedRowProps>;
    /** Custom recently connected row */
    RecentlyConnectedRow?: ComponentType<ConnectionsContentRecentRowProps>;
  };
  /** Custom class name generators */
  classNames?: {
    // ─────────────────────────────────────────────────────────────────────
    // Container & Sections
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns the classes of the container, instead of the default ones and the `className` prop (not in the empty
     * state).
     *
     * @param params - The lists.
     * @param params.connectionsCount - Number of connected wallets.
     * @param params.recentCount - Number of recent wallets shown.
     * @returns The classes.
     */
    container?: (params: { connectionsCount: number; recentCount: number }) => string;
    /**
     * Returns classes added to the container in the empty state.
     *
     * @returns The classes.
     */
    emptyState?: () => string;
    /**
     * Returns classes added to the empty state message.
     *
     * @returns The classes.
     */
    emptyStateMessage?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Active Connectors Section
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns classes added to the title of the connected wallets section.
     *
     * @returns The classes.
     */
    activeSectionTitle?: () => string;
    /**
     * Returns classes added to the box of the connected wallets.
     *
     * @returns The classes.
     */
    activeSectionWrapper?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Recent Section
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns classes added to the title of the recent wallets section.
     *
     * @returns The classes.
     */
    recentSectionTitle?: () => string;
    /**
     * Returns classes added to the scrollable list of recent wallets.
     *
     * @returns The classes.
     */
    recentSectionList?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Active Connector Row (Primary/Active connection)
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns classes added to the row of the active wallet.
     *
     * @param params - The row.
     * @param params.connectorType - Connector type of the wallet.
     * @param params.hasExplorer - Whether the chain of the connection has a block explorer.
     * @returns The classes.
     */
    activeRowContainer?: (params: { connectorType: ConnectorType; hasExplorer: boolean }) => string;
    /**
     * Returns classes added to the "Active" badge.
     *
     * @returns The classes.
     */
    activeRowBadge?: () => string;
    /**
     * Returns classes added to the icon and texts of the active row.
     *
     * @returns The classes.
     */
    activeRowContent?: () => string;
    /**
     * Returns classes added to the name or address of the active wallet.
     *
     * @returns The classes.
     */
    activeRowWalletName?: () => string;
    /**
     * Returns classes added to the connector name of the active wallet.
     *
     * @returns The classes.
     */
    activeRowConnectorName?: () => string;
    /**
     * Returns classes added to the copy and explorer buttons container.
     *
     * @returns The classes.
     */
    activeRowActionsContainer?: () => string;
    /**
     * Returns classes added to the copy button.
     *
     * @returns The classes.
     */
    activeRowCopyButton?: () => string;
    /**
     * Returns classes added to the copy icon.
     *
     * @returns The classes.
     */
    activeRowCopyIcon?: () => string;
    /**
     * Returns classes added to the explorer button.
     *
     * @returns The classes.
     */
    activeRowExplorerButton?: () => string;
    /**
     * Returns classes added to the explorer icon.
     *
     * @returns The classes.
     */
    activeRowExplorerIcon?: () => string;
    /**
     * Returns classes added to the disconnect button of the active row.
     *
     * @returns The classes.
     */
    activeRowDisconnectButton?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Connected Connector Row (Secondary connections)
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns classes added to the row of another connected wallet.
     *
     * @param params - The row.
     * @param params.connectorType - Connector type of the wallet.
     * @returns The classes.
     */
    connectedRowContainer?: (params: { connectorType: ConnectorType }) => string;
    /**
     * Returns classes added to the switch indicator (shown on hover).
     *
     * @returns The classes.
     */
    connectedRowSwitchIndicator?: () => string;
    /**
     * Returns classes added to the switch icon.
     *
     * @returns The classes.
     */
    connectedRowSwitchIcon?: () => string;
    /**
     * Returns classes added to the icon and texts of the row.
     *
     * @returns The classes.
     */
    connectedRowContent?: () => string;
    /**
     * Returns classes added to the address of the wallet.
     *
     * @returns The classes.
     */
    connectedRowWalletName?: () => string;
    /**
     * Returns classes added to the connector name of the wallet.
     *
     * @returns The classes.
     */
    connectedRowConnectorName?: () => string;
    /**
     * Returns classes added to the disconnect button of the row.
     *
     * @returns The classes.
     */
    connectedRowDisconnectButton?: () => string;
    /**
     * Returns classes added to the disconnect icon of the row.
     *
     * @returns The classes.
     */
    connectedRowDisconnectIcon?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Recently Connected Row
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns classes added to the row of a recent wallet.
     *
     * @param params - The row.
     * @param params.connectorType - Connector type of the wallet.
     * @param params.isConnecting - Whether this wallet is being connected.
     * @returns The classes.
     */
    recentRowContainer?: (params: { connectorType: ConnectorType; isConnecting: boolean }) => string;
    /**
     * Returns classes added to the icon and texts of the row.
     *
     * @returns The classes.
     */
    recentRowContent?: () => string;
    /**
     * Returns classes added to the address of the wallet.
     *
     * @returns The classes.
     */
    recentRowWalletName?: () => string;
    /**
     * Returns classes added to the connector name of the wallet.
     *
     * @returns The classes.
     */
    recentRowConnectorName?: () => string;
    /**
     * Returns classes added to the buttons container.
     *
     * @returns The classes.
     */
    recentRowActionsContainer?: () => string;
    /**
     * Returns classes added to the connect button.
     *
     * @param params - The row.
     * @param params.isConnecting - Whether this wallet is being connected.
     * @returns The classes.
     */
    recentRowConnectButton?: (params: { isConnecting: boolean }) => string;
    /**
     * Returns classes added to the spinner of the connect button.
     *
     * @returns The classes.
     */
    recentRowConnectSpinner?: () => string;
    /**
     * Returns classes added to the remove button.
     *
     * @param params - The row.
     * @param params.isConnecting - Whether this wallet is being connected.
     * @returns The classes.
     */
    recentRowRemoveButton?: (params: { isConnecting: boolean }) => string;
    /**
     * Returns classes added to the remove icon.
     *
     * @returns The classes.
     */
    recentRowRemoveIcon?: () => string;

    // ─────────────────────────────────────────────────────────────────────
    // Connector Icon
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns classes added to the wallet icon of a row.
     *
     * @param params - The icon.
     * @param params.size - Icon size in pixels (`40` in the active row, `32` in the others).
     * @returns The classes.
     */
    connectorIconWrapper?: (params: { size: number }) => string;
    /**
     * Returns classes added to the network badge of the wallet icon.
     *
     * @param params - The badge.
     * @param params.badgeSize - Badge size in pixels (`20` in the active row, `16` in the others).
     * @returns The classes.
     */
    connectorIconBadge?: (params: { badgeSize: number }) => string;

    // ─────────────────────────────────────────────────────────────────────
    // Add Wallet Button
    // ─────────────────────────────────────────────────────────────────────
    /**
     * Returns classes added to the "Connect new wallet" button.
     *
     * @returns The classes.
     */
    addWalletButton?: () => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called before a connected wallet becomes active. Return `false` to cancel.
     *
     * @param connectorType - The wallet to switch to.
     * @returns Whether to switch.
     */
    onBeforeSwitch?: (connectorType: ConnectorType) => boolean | Promise<boolean>;
    /**
     * Called after `switchConnection` of the Satellite store resolves.
     *
     * @param connectorType - The wallet that became active.
     */
    onAfterSwitch?: (connectorType: ConnectorType) => void;
    /**
     * Called when switching throws (the error is also logged).
     *
     * @param connectorType - The wallet.
     * @param error - The error.
     */
    onSwitchError?: (connectorType: ConnectorType, error: Error) => void;
    /**
     * Called before a wallet is disconnected. Return `false` to cancel.
     *
     * @param connectorType - The wallet to disconnect.
     * @returns Whether to disconnect.
     */
    onBeforeDisconnect?: (connectorType: ConnectorType) => boolean | Promise<boolean>;
    /**
     * Called right after `disconnect` of the Satellite store is called (without waiting for it).
     *
     * @param connectorType - The disconnected wallet.
     */
    onAfterDisconnect?: (connectorType: ConnectorType) => void;
    /**
     * Called when the disconnect call throws synchronously (the error is also logged).
     *
     * @param connectorType - The wallet.
     * @param error - The error.
     */
    onDisconnectError?: (connectorType: ConnectorType, error: Error) => void;
    /**
     * Called before a recent wallet is connected again. Return `false` to cancel.
     *
     * @param connectorType - The wallet to connect.
     * @returns Whether to connect.
     */
    onBeforeConnect?: (connectorType: ConnectorType) => boolean | Promise<boolean>;
    /**
     * Called after `connect` of the Satellite store resolves (the store keeps connection errors in `connectionError`).
     *
     * @param connectorType - The wallet.
     */
    onAfterConnect?: (connectorType: ConnectorType) => void;
    /**
     * Called when connecting throws (the error is also logged).
     *
     * @param connectorType - The wallet.
     * @param error - The error.
     */
    onConnectError?: (connectorType: ConnectorType, error: Error) => void;
  };
  /** Custom text and ARIA labels */
  labels?: {
    /** Message of the empty state (default: the `noConnectionsFound` label) */
    emptyStateMessage?: string;
    /** ARIA label of the container (default: the `walletConnectionsManager` label) */
    containerAriaLabel?: string;
    /**
     * Returns the screen reader announcement after a switch (default: the `switchedToWallet` label).
     *
     * @param walletName - The wallet name.
     * @returns The announcement.
     */
    switchAnnouncement?: (walletName: string) => string;
    /**
     * Returns the screen reader announcement after a disconnect (default: the `disconnectedWallet` label).
     *
     * @param walletName - The wallet name.
     * @returns The announcement.
     */
    disconnectAnnouncement?: (walletName: string) => string;
    /**
     * Returns the screen reader announcement after a recent wallet connects (default: the `connectedWallet` label).
     *
     * @param walletName - The wallet name.
     * @returns The announcement.
     */
    connectAnnouncement?: (walletName: string) => string;
  };
  /** Configuration options */
  config?: {
    /** Whether to show the empty state; `false` renders nothing without wallets (default: `true`) */
    showEmptyState?: boolean;
    /** Whether to show the "Connect new wallet" button, which opens the connect modal (default: `true`) */
    showAddWalletButton?: boolean;
    /** Whether to show the recent wallets (default: `true`) */
    showRecentSection?: boolean;
    /**
     * Whether keyboard shortcuts work while the focus is inside the screen: Ctrl or Cmd with ArrowDown or ArrowUp
     * switches to the next or previous connection, Ctrl or Cmd with Backspace disconnects the active wallet (default:
     * `true`)
     */
    enableKeyboardShortcuts?: boolean;
    /** Keys used with Ctrl or Cmd (`KeyboardEvent.key` values) */
    keyboardShortcuts?: {
      /** Key for switching to next connection (default: `ArrowDown`) */
      nextConnection?: string;
      /** Key for switching to previous connection (default: `ArrowUp`) */
      prevConnection?: string;
      /** Key for disconnecting active wallet (default: `Backspace`) */
      disconnect?: string;
    };
    /** Maximum recent connections to show (default: `10`) */
    maxRecentConnections?: number;
    /** Whether to focus the first interactive element on mount (default: `false`) */
    autoFocus?: boolean;
    /** Custom test IDs */
    testIds?: {
      /** `data-testid` of the container */
      container?: string;
    };
  };
};

/**
 * Props for the {@link ConnectionsContent} component.
 */
export interface ConnectionsContentProps {
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
  className?: string;
  /** Customization options */
  customization?: ConnectionsContentCustomization;
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
  /** Granular classNames for sub-elements - union of active and connected row classNames */
  classNames?: ConnectionsContentActiveRowProps['classNames'] & ConnectionsContentConnectedRowProps['classNames'];
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
  classNames?: ConnectionsContentRecentRowProps['classNames'];
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

const DefaultContainer = forwardRef<HTMLDivElement, ConnectionsContentContainerProps>(
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

const DefaultActiveConnectorsSection = forwardRef<HTMLDivElement, ConnectionsContentActiveSectionProps>(
  ({ children, count, classNames }, ref) => {
    const labels = useNovaConnectLabels();
    return (
      <div ref={ref}>
        <h3
          className={cn(
            'novacon:mb-2 novacon:text-xs novacon:font-mono novacon:font-medium novacon:uppercase novacon:tracking-wider novacon:text-[var(--tuwa-text-secondary)]',
            classNames?.title,
          )}
        >
          {labels.active} {labels.connectors} {count > 0 && `(${count})`}
        </h3>
        <div
          className={cn(
            'novacon:overflow-hidden novacon:rounded-[var(--tuwa-rounded-corners)] novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-secondary)]',
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

const DefaultRecentlyConnectedSection = forwardRef<HTMLDivElement, ConnectionsContentRecentSectionProps>(
  ({ children, classNames }, ref) => {
    const labels = useNovaConnectLabels();
    return (
      <div ref={ref}>
        <h3
          className={cn(
            'novacon:mb-2 novacon:text-xs novacon:font-mono novacon:font-medium novacon:uppercase novacon:tracking-wider novacon:text-[var(--tuwa-text-secondary)]',
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
            imageClassName="novacon:rounded-[var(--tuwa-rounded-corners)]"
            wrapperClassName={classNames?.iconWrapper}
            badgeClassName={classNames?.iconBadge}
          />
          <div className="novacon:flex novacon:flex-col">
            <span
              className={cn(
                'novacon:font-medium novacon:font-mono novacon:text-[var(--tuwa-text-primary)]',
                classNames?.walletName,
              )}
            >
              {displayName || address}
            </span>
            <span
              className={cn('novacon:text-xs novacon:text-[var(--tuwa-text-secondary)]', classNames?.connectorName)}
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
                  'novacon:flex novacon:cursor-pointer novacon:items-center novacon:gap-1 novacon:font-mono novacon:text-[10px] novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:text-[var(--tuwa-text-primary)]',
                  classNames?.copyButton,
                )}
                title={labels.copyAddress}
              >
                <DocumentDuplicateIcon className={cn('novacon:h-3 novacon:w-3', classNames?.copyIcon)} />
                {isCopied ? labels.copied : labels.copy}
              </button>
              {explorerLink && (
                <button
                  onClick={handleExplorer}
                  className={cn(
                    'novacon:flex novacon:cursor-pointer novacon:items-center novacon:gap-1 novacon:text-[10px] novacon:font-mono novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:text-[var(--tuwa-text-primary)]',
                    classNames?.explorerButton,
                  )}
                  title={labels.viewOnExplorer}
                >
                  <ArrowTopRightOnSquareIcon className={cn('novacon:h-3 novacon:w-3', classNames?.explorerIcon)} />
                  {labels.explorer}
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onDisconnect}
          className={cn(
            'novacon:mt-4 novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:px-3 novacon:py-1.5 novacon:font-mono novacon:text-xs novacon:font-medium novacon:text-[var(--tuwa-text-primary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-error-text)]',
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
            classNames?.switchIndicator,
          )}
        >
          <ArrowsRightLeftIcon
            className={cn('novacon:h-4 novacon:w-4 novacon:text-[var(--tuwa-text-accent)]', classNames?.switchIcon)}
          />
        </div>

        <div
          className={cn(
            'novacon:flex novacon:items-center novacon:gap-3 novacon:ml-0 novacon:group-hover:ml-6 novacon:transition-all',
            classNames?.content,
          )}
        >
          <ConnectorIcon
            connectorType={connectorType}
            icon={icon}
            chainId={chainId}
            size={32}
            badgeSize={16}
            imageClassName="novacon:rounded-[var(--tuwa-rounded-corners)]"
            wrapperClassName={classNames?.iconWrapper}
            badgeClassName={classNames?.iconBadge}
          />
          <div className="novacon:flex novacon:flex-col">
            <span
              className={cn(
                'novacon:text-sm novacon:font-medium novacon:font-mono novacon:text-[var(--tuwa-text-primary)]',
                classNames?.walletName,
              )}
            >
              {address}
            </span>
            <span
              className={cn('novacon:text-[10px] novacon:text-[var(--tuwa-text-secondary)]', classNames?.connectorName)}
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
            'novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1.5 novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-error)]/10 novacon:hover:text-[var(--tuwa-error-text)]',
            classNames?.disconnectButton,
          )}
          aria-label={`${labels.disconnect} ${connectorType}`}
        >
          <ArrowLeftStartOnRectangleIcon className={cn('novacon:h-5 novacon:w-5', classNames?.disconnectIcon)} />
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
          'novacon:flex novacon:items-center novacon:justify-between novacon:rounded-[var(--tuwa-rounded-corners)] novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-secondary)] novacon:p-3',
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
            imageClassName="novacon:rounded-[var(--tuwa-rounded-corners)]"
            wrapperClassName={classNames?.iconWrapper}
            badgeClassName={classNames?.iconBadge}
          />
          <div className="novacon:flex novacon:flex-col">
            <span
              className={cn(
                'novacon:text-sm novacon:font-medium novacon:font-mono novacon:text-[var(--tuwa-text-primary)]',
                classNames?.walletName,
              )}
            >
              {address}
            </span>
            <span
              className={cn('novacon:text-[10px] novacon:text-[var(--tuwa-text-secondary)]', classNames?.connectorName)}
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
                'novacon:relative novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:px-3 novacon:py-1.5 novacon:font-mono novacon:text-xs novacon:font-medium novacon:text-[var(--tuwa-text-primary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)]',
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
              'novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1.5 novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-error)]/10 novacon:hover:text-[var(--tuwa-error-text)]',
              isConnecting && 'novacon:cursor-not-allowed novacon:opacity-50',
              classNames?.removeButton,
            )}
            aria-label={formatLabel(labels.removeFromRecent, { name: getFormattedConnectorName(connectorType) })}
          >
            <TrashIcon className={cn('novacon:h-4 novacon:w-4', classNames?.removeIcon)} />
          </button>
        </div>
      </div>
    );
  },
);
DefaultRecentlyConnectedRow.displayName = 'DefaultRecentlyConnectedRow';

const DEFAULT_KEYBOARD_SHORTCUTS = {
  nextConnection: 'ArrowDown',
  prevConnection: 'ArrowUp',
  disconnect: 'Backspace',
};

/**
 * The "Connections" screen of the connected modal: the active wallet (with copy, explorer and disconnect), the other
 * connected wallets (click one to make it active), the recently connected wallets and a button that opens the connect
 * modal.
 *
 * The recent wallets come from `localStorage` (`orbit-core:recentlyConnectedConnectorsListHelpers`, through
 * `recentlyConnectedConnectorsListHelpers` of `@tuwaio/orbit-core`), without the connected ones. Removing one writes
 * that key. Connecting one calls `connect` of the Satellite store with the first chain of its network in
 * `appChains` or `solanaRPCUrls` of `NovaConnectProvider` (Ethereum Mainnet or Solana Mainnet without them); for the
 * impersonated wallet it first saves the address to `satellite-connect:impersonatedAddress`. The explorer link opens
 * in a new tab. Without wallets it shows the empty state, or nothing when `config.showEmptyState` is `false`.
 *
 * Keyboard shortcuts (`config.enableKeyboardShortcuts`) work while the focus is inside the screen.
 *
 * Props: {@link ConnectionsContentProps}.
 */
export const ConnectionsContent: React.FC<ConnectionsContentProps> = ({ className, customization }) => {
  const labels = useNovaConnectLabels();
  const { setIsConnectModalOpen, appChains, solanaRPCUrls } = useNovaConnect();
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

  const emptyStateMessage = customization?.labels?.emptyStateMessage ?? labels.noConnectionsFound;
  const containerAriaLabel = customization?.labels?.containerAriaLabel ?? labels.walletConnectionsManager;

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          customization?.labels?.switchAnnouncement?.(walletName) ??
          formatLabel(labels.switchedToWallet, { name: walletName });
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
    [switchConnection, customization, labels],
  );

  /**
   * Handle disconnecting a specific wallet with custom handlers and announcements
   */
  const handleDisconnect = useCallback(
    async (connectorType: ConnectorType | undefined, event: React.SyntheticEvent) => {
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
          customization?.labels?.disconnectAnnouncement?.(walletName) ??
          formatLabel(labels.disconnectedWallet, { name: walletName });
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
    [disconnect, customization, labels],
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

        // The first chain of the app for the network of the wallet, as in the connect modal
        const chainId = getConnectChainId({
          selectedAdapter: getAdapterFromConnectorType(connectorType),
          appChains,
          solanaRPCUrls,
        });
        const walletName = getFormattedConnectorName(connectorType);
        if (walletName === 'Impersonatedwallet') {
          impersonatedHelpers.setImpersonated(address.trim());
          await connect({ connectorType, chainId });
        } else {
          await connect({ connectorType, chainId });
        }

        // Announce to screen readers
        const announcement =
          customization?.labels?.connectAnnouncement?.(walletName) ??
          formatLabel(labels.connectedWallet, { name: walletName });
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
    [connect, customization, labels, appChains, solanaRPCUrls],
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
   * Keyboard shortcuts, on the container: they work only while the focus is inside the screen
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableKeyboardShortcuts || !(event.ctrlKey || event.metaKey)) return;

    const shortcuts = { ...DEFAULT_KEYBOARD_SHORTCUTS, ...customization?.config?.keyboardShortcuts };
    const currentIndex = connectionsList.findIndex((c) => c.connectorType === activeConnection?.connectorType);

    // Next connection (Ctrl/Cmd + ArrowDown by default)
    if (event.key === shortcuts.nextConnection) {
      event.preventDefault();
      if (currentIndex < connectionsList.length - 1) {
        void handleSwitch(connectionsList[currentIndex + 1].connectorType);
      }
      return;
    }

    // Previous connection (Ctrl/Cmd + ArrowUp by default)
    if (event.key === shortcuts.prevConnection) {
      event.preventDefault();
      if (currentIndex > 0) {
        void handleSwitch(connectionsList[currentIndex - 1].connectorType);
      }
      return;
    }

    // Disconnect the active wallet (Ctrl/Cmd + Backspace by default)
    if (event.key === shortcuts.disconnect && activeConnection) {
      event.preventDefault();
      void handleDisconnect(activeConnection.connectorType, event);
    }
  };

  const allConnectors = getConnectors();

  // `undefined` when the chain of the active connection has no block explorer
  const activeExplorerLink = (() => {
    if (!activeConnection?.connectorType) return undefined;
    try {
      const adapter = getAdapter(getAdapterFromConnectorType(activeConnection.connectorType));
      return adapter?.getExplorerUrl?.(`/address/${activeConnection.address}`, setChainId(activeConnection.chainId));
    } catch {
      return undefined;
    }
  })();

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
          className={cn('novacon:text-[var(--tuwa-text-secondary)]', customization?.classNames?.emptyStateMessage?.())}
          role="status"
        >
          {emptyStateMessage}
        </p>
      </Container>
    );
  }

  return (
    <Container
      className={
        customization?.classNames?.container?.({
          connectionsCount: connectionsList.length,
          recentCount: recentListState.length,
        }) ?? cn('novacon:flex novacon:flex-col novacon:gap-6 novacon:p-4', className)
      }
      isEmpty={false}
      connectionsCount={connectionsList.length}
      recentCount={recentListState.length}
      role="region"
      aria-label={containerAriaLabel}
      data-testid={testIds?.container}
      onKeyDown={handleKeyDown}
      ref={containerRef}
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
              explorerLink={activeExplorerLink}
              icon={activeConnection.icon}
              classNames={{
                container: customization?.classNames?.activeRowContainer?.({
                  connectorType: activeConnection.connectorType,
                  hasExplorer: Boolean(activeExplorerLink),
                }),
                badge: customization?.classNames?.activeRowBadge?.(),
                content: customization?.classNames?.activeRowContent?.(),
                walletName: customization?.classNames?.activeRowWalletName?.(),
                connectorName: customization?.classNames?.activeRowConnectorName?.(),
                actionsContainer: customization?.classNames?.activeRowActionsContainer?.(),
                copyButton: customization?.classNames?.activeRowCopyButton?.(),
                copyIcon: customization?.classNames?.activeRowCopyIcon?.(),
                explorerButton: customization?.classNames?.activeRowExplorerButton?.(),
                explorerIcon: customization?.classNames?.activeRowExplorerIcon?.(),
                disconnectButton: customization?.classNames?.activeRowDisconnectButton?.(),
                iconWrapper: customization?.classNames?.connectorIconWrapper?.({ size: 40 }),
                iconBadge: customization?.classNames?.connectorIconBadge?.({ badgeSize: 20 }),
              }}
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
                chainId={connection.chainId}
                isActive={false}
                onSwitch={() => handleSwitch(connection.connectorType)}
                onDisconnect={(e) => handleDisconnect(connection.connectorType, e)}
                icon={connection.icon}
                classNames={{
                  container: customization?.classNames?.connectedRowContainer?.({
                    connectorType: connection.connectorType,
                  }),
                  switchIndicator: customization?.classNames?.connectedRowSwitchIndicator?.(),
                  switchIcon: customization?.classNames?.connectedRowSwitchIcon?.(),
                  content: customization?.classNames?.connectedRowContent?.(),
                  walletName: customization?.classNames?.connectedRowWalletName?.(),
                  connectorName: customization?.classNames?.connectedRowConnectorName?.(),
                  disconnectButton: customization?.classNames?.connectedRowDisconnectButton?.(),
                  disconnectIcon: customization?.classNames?.connectedRowDisconnectIcon?.(),
                  iconWrapper: customization?.classNames?.connectorIconWrapper?.({ size: 32 }),
                  iconBadge: customization?.classNames?.connectorIconBadge?.({ badgeSize: 16 }),
                }}
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
              if (c && typeof c === 'object' && 'name' in c && typeof (c as { name: unknown }).name === 'string') {
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
                classNames={{
                  container: customization?.classNames?.recentRowContainer?.({
                    connectorType,
                    isConnecting: connecting && connectingRecent === connectorType,
                  }),
                  content: customization?.classNames?.recentRowContent?.(),
                  walletName: customization?.classNames?.recentRowWalletName?.(),
                  connectorName: customization?.classNames?.recentRowConnectorName?.(),
                  actionsContainer: customization?.classNames?.recentRowActionsContainer?.(),
                  connectButton: customization?.classNames?.recentRowConnectButton?.({
                    isConnecting: connecting && connectingRecent === connectorType,
                  }),
                  connectSpinner: customization?.classNames?.recentRowConnectSpinner?.(),
                  removeButton: customization?.classNames?.recentRowRemoveButton?.({
                    isConnecting: connecting && connectingRecent === connectorType,
                  }),
                  removeIcon: customization?.classNames?.recentRowRemoveIcon?.(),
                  iconWrapper: customization?.classNames?.connectorIconWrapper?.({ size: 32 }),
                  iconBadge: customization?.classNames?.connectorIconBadge?.({ badgeSize: 16 }),
                }}
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
            'novacon:mt-2 novacon:w-full novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:border novacon:border-dashed novacon:border-[var(--tuwa-border-primary)] novacon:p-3 novacon:font-mono novacon:text-sm novacon:font-medium novacon:text-[var(--tuwa-text-secondary)] novacon:transition-colors novacon:hover:border-[var(--tuwa-text-accent)] novacon:hover:text-[var(--tuwa-text-accent)]',
            customization?.classNames?.addWalletButton?.(),
          )}
        >
          + {labels.connectNewWallet}
        </button>
      )}
    </Container>
  );
};

ConnectionsContent.displayName = 'ConnectionsContent';
