/**
 * @file ConnectorsBlock component with comprehensive customization options and connector group display.
 */

import { cn, isTouchDevice } from '@tuwaio/nova-core';
import {
  ConnectorType,
  delay,
  formatConnectorName,
  getConnectorTypeFromName,
  OrbitAdapter,
  RecentlyConnectedConnectorData,
  recentlyConnectedConnectorsListHelpers,
  waitFor,
} from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, memo, useCallback, useContext, useMemo, useRef } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { formatLabel } from '../../i18n/formatLabel';
import { SatelliteStoreContext, useSatelliteConnectStore } from '../../satellite';
import { getConnectChainId } from '../../utils/getConnectedChainId';
import { WalletIcon, WalletIconCustomization } from '../WalletIcon';
import { ConnectCard, ConnectCardCustomization } from './ConnectCard';
import { GroupedConnector } from './ConnectModal';
import { ConnectorsSelectionsProps } from './ConnectorsSelections';

// --- Types ---

/**
 * State of a {@link ConnectorsBlock}, passed to its custom components, class name generators and handlers.
 */
export interface ConnectorsBlockData {
  /** Currently selected network adapter */
  selectedAdapter: OrbitAdapter | undefined;
  /** Array of grouped wallet connectors to display */
  connectors: GroupedConnector[];
  /** Title text for the connector group */
  title: string;
  /** Whether to render the title in bold accent color */
  isTitleBold: boolean;
  /** Whether only one network is available */
  isOnlyOneNetwork: boolean;
  /** Whether the device has a touch screen */
  isTouch: boolean;
  /** Whether there are connectors to display */
  hasConnectors: boolean;
  /** The three most recently disconnected wallets (connector type and data), read from `localStorage` on mount */
  recentWallets: [string, RecentlyConnectedConnectorData][] | null;
  /** `connectors-<title in kebab case>`, the prefix of the title ID */
  sectionId: string;
}

/**
 * A wallet of a {@link ConnectorsBlock}.
 */
export interface ConnectorItemData {
  /** The wallet */
  group: GroupedConnector;
  /** The wallet name as `formatConnectorName` of `@tuwaio/orbit-core` returns it */
  name: string;
  /** Whether the wallet is one of the three most recent ones (the card shows the "Recent" badge) */
  isRecent: boolean;
  /** Item index in the list */
  index: number;
}

// --- Component Props Types ---
/**
 * Props for a custom container (a `section` by default).
 */
export type ConnectorsBlockContainerProps = {
  /** Classes from `classNames.container` or the defaults */
  className?: string;
  /** The title and the wallet list, or the empty state */
  children: React.ReactNode;
  /** `group` */
  role?: string;
  /** ID of the title (not set in the empty state without a title) */
  'aria-labelledby'?: string;
  /** `config.ariaLabels.container` or the `connectorsSection` label with the title */
  'aria-label'?: string;
  /** State of the group */
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLElement>;

/**
 * Props for a custom title.
 */
export type ConnectorsBlockTitleProps = {
  /** Classes from `classNames.title` or the defaults (bold accent with `isTitleBold`) */
  className?: string;
  /** The `title` prop */
  children: React.ReactNode;
  /** `<sectionId>-title` */
  id?: string;
  /** `heading` */
  role?: string;
  /** `3` */
  'aria-level'?: number;
  /** Calls `handlers.onTitleClick`, when set */
  onClick?: () => void;
  /** State of the group */
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLHeadingElement>;

/**
 * Props for a custom wallet list.
 */
export type ConnectorsBlockConnectorsListProps = {
  /** Classes from `classNames.connectorsList`, or the defaults with the `config.layout` classes */
  className?: string;
  /** The wallet items */
  children: React.ReactNode;
  /** `list` */
  role?: string;
  /** `config.ariaLabels.connectorsList` or the `connectorsList` label with the title */
  'aria-label'?: string;
  /** State of the group */
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom wallet item.
 */
export type ConnectorsBlockConnectorItemProps = {
  /** Classes from `classNames.connectorItem` or the defaults */
  className?: string;
  /** The `ConnectCard` of the wallet */
  children: React.ReactNode;
  /** `listitem` */
  role?: string;
  /** The wallet */
  itemData: ConnectorItemData;
  /** State of the group */
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom empty state (shown when the group has no wallets).
 */
export type ConnectorsBlockEmptyStateProps = {
  /** Classes from `classNames.emptyState` or the defaults */
  className?: string;
  /** The `noGroupWallets` label with the title */
  children: React.ReactNode;
  /** `status` */
  role?: string;
  /** `config.ariaLabels.emptyState` or the `noGroupConnectors` label with the title */
  'aria-label'?: string;
  /** Calls `handlers.onEmptyStateAction`, when set */
  onClick?: () => void;
  /** State of the group */
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization options of {@link ConnectorsBlock}.
 */
export type ConnectorsBlockCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ConnectorsBlockContainerProps>;
    /** Custom title component */
    Title?: ComponentType<ConnectorsBlockTitleProps>;
    /** Custom connectors list */
    ConnectorsList?: ComponentType<ConnectorsBlockConnectorsListProps>;
    /** Custom connector item wrapper */
    ConnectorItem?: ComponentType<ConnectorsBlockConnectorItemProps>;
    /** Custom empty state component */
    EmptyState?: ComponentType<ConnectorsBlockEmptyStateProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones.
     *
     * @param params - The group.
     * @param params.blockData - State of the group.
     * @returns The classes.
     */
    container?: (params: { blockData: ConnectorsBlockData }) => string;
    /**
     * Returns the classes of the title, instead of the default ones.
     *
     * @param params - The group.
     * @param params.blockData - State of the group.
     * @returns The classes.
     */
    title?: (params: { blockData: ConnectorsBlockData }) => string;
    /**
     * Returns the classes of the wallet list, instead of the default ones.
     *
     * @param params - The group.
     * @param params.blockData - State of the group.
     * @returns The classes.
     */
    connectorsList?: (params: { blockData: ConnectorsBlockData }) => string;
    /**
     * Returns the classes of a wallet item, instead of the default ones.
     *
     * @param params - The wallet.
     * @param params.itemData - The wallet.
     * @param params.blockData - State of the group.
     * @returns The classes.
     */
    connectorItem?: (params: { itemData: ConnectorItemData; blockData: ConnectorsBlockData }) => string;
    /**
     * Returns the classes of the empty state, instead of the default ones.
     *
     * @param params - The group.
     * @param params.blockData - State of the group.
     * @returns The classes.
     */
    emptyState?: (params: { blockData: ConnectorsBlockData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click on a wallet card: call `originalHandler(itemData.group)` to run the default behavior. A wallet
     * with several networks and no selected network goes to `onClick` (the network choice); otherwise `onClick` runs
     * and the wallet connects through `connect` of the Satellite store, then the modal closes.
     *
     * @param itemData - The clicked wallet.
     * @param blockData - State of the group.
     * @param originalHandler - The default behavior.
     */
    onConnectorClick?: (
      itemData: ConnectorItemData,
      blockData: ConnectorsBlockData,
      originalHandler: (group: GroupedConnector) => Promise<void>,
    ) => void;
    /**
     * Called when the title is clicked.
     *
     * @param blockData - State of the group.
     */
    onTitleClick?: (blockData: ConnectorsBlockData) => void;
    /**
     * Called when the empty state is clicked.
     *
     * @param blockData - State of the group.
     */
    onEmptyStateAction?: (blockData: ConnectorsBlockData) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /**
       * Returns the ARIA label of the container (default: the `connectorsSection` label with the title).
       *
       * @param blockData - State of the group.
       * @returns The label.
       */
      container?: (blockData: ConnectorsBlockData) => string;
      /**
       * Returns the ARIA label of the wallet list (default: the `connectorsList` label with the title).
       *
       * @param blockData - State of the group.
       * @returns The label.
       */
      connectorsList?: (blockData: ConnectorsBlockData) => string;
      /**
       * Returns the ARIA label of the empty state (default: the `noGroupConnectors` label with the title).
       *
       * @param blockData - State of the group.
       * @returns The label.
       */
      emptyState?: (blockData: ConnectorsBlockData) => string;
    };
    /** Classes of the default wallet list (ignored when `classNames.connectorsList` is set) */
    layout?: {
      /** Gap on touch devices, used without `touchClasses` (default: `novacon:gap-3`) */
      touchGap?: string;
      /** Gap on devices without a touch screen, used without `mouseClasses` (default: `novacon:gap-2`) */
      mouseGap?: string;
      /** Classes on touch devices (default: a row with `touchGap`) */
      touchClasses?: string[];
      /** Classes on devices without a touch screen (default: a column with `mouseGap`) */
      mouseClasses?: string[];
    };
    /** Show/hide features */
    features?: {
      /** Whether to show the empty state; `false` renders nothing without wallets (default: `true`) */
      showEmptyState?: boolean;
      /** Whether the empty state has the title (default: `true`) */
      showTitleWhenEmpty?: boolean;
      /** Whether cards of recent wallets show the "Recent" badge (default: `true`) */
      showRecentIndicators?: boolean;
    };
  };
  /** ConnectCard customization for each connector card */
  connectCard?: ConnectCardCustomization;
  /** WalletIcon customization for wallet icons */
  walletIcon?: WalletIconCustomization;
};

/**
 * Props for the {@link ConnectorsBlock} component. The props picked from `ConnectorsSelectionsProps` work as there.
 */
export interface ConnectorsBlockProps extends Pick<
  ConnectorsSelectionsProps,
  'setIsOpen' | 'setIsConnected' | 'onClick' | 'appChains' | 'solanaRPCUrls'
> {
  /** Currently selected network adapter */
  selectedAdapter: OrbitAdapter | undefined;
  /** Array of grouped wallet connectors to display */
  connectors: GroupedConnector[];
  /** Title text for the connector group */
  title: string;
  /** Whether to render the title in bold accent color (default: `false`) */
  isTitleBold?: boolean;
  /** Whether only one network is available; hides the network icons of the cards (default: `false`) */
  isOnlyOneNetwork?: boolean;
  /** Customization options */
  customization?: ConnectorsBlockCustomization;
}

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLElement, ConnectorsBlockContainerProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blockData: _blockData, ...restProps } = props;
    return (
      <section ref={ref} className={className} {...restProps}>
        {children}
      </section>
    );
  },
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultTitle = forwardRef<HTMLHeadingElement, ConnectorsBlockTitleProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blockData: _blockData, ...restProps } = props;
    return (
      <h3 ref={ref} className={className} {...restProps}>
        {children}
      </h3>
    );
  },
);
DefaultTitle.displayName = 'DefaultTitle';

const DefaultConnectorsList = forwardRef<HTMLDivElement, ConnectorsBlockConnectorsListProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blockData: _blockData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultConnectorsList.displayName = 'DefaultConnectorsList';

const DefaultConnectorItem = forwardRef<HTMLDivElement, ConnectorsBlockConnectorItemProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { itemData: _itemData, blockData: _blockData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultConnectorItem.displayName = 'DefaultConnectorItem';

const DefaultEmptyState = forwardRef<HTMLDivElement, ConnectorsBlockEmptyStateProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blockData: _blockData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultEmptyState.displayName = 'DefaultEmptyState';

/**
 * A titled group of wallet cards in the connect modal ("Installed", "Popular" or a custom group). The cards of the
 * three most recently used wallets (read from `localStorage` key `orbit-core:recentlyConnectedConnectorsListHelpers`
 * on mount) show a "Recent" badge.
 *
 * Clicking a wallet with several networks while no network is selected calls `onClick` (the modal shows the network
 * choice). Otherwise it calls `onClick`, connects the wallet through `connect` of the Satellite store to the chain
 * from `appChains` or `solanaRPCUrls`, waits up to 10 seconds for the connection and closes the modal 400 ms later.
 * A second click while a connection is running is ignored.
 *
 * Props: {@link ConnectorsBlockProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { getFilteredConnectors } from '@tuwaio/nova-connect';
 * import { ConnectorsBlock } from '@tuwaio/nova-connect/components';
 * import { useNovaConnect } from '@tuwaio/nova-connect/hooks';
 * import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 * import { mainnet } from 'viem/chains';
 *
 * export function InstalledWallets() {
 *   const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);
 *   const { setIsConnected, setIsConnectModalOpen } = useNovaConnect();
 *
 *   return (
 *     <ConnectorsBlock
 *       title="Installed"
 *       isTitleBold
 *       selectedAdapter={OrbitAdapter.EVM}
 *       connectors={getFilteredConnectors({ connectors: getConnectors(), selectedAdapter: OrbitAdapter.EVM })}
 *       onClick={(connector) => console.log('selected', connector.name)}
 *       setIsConnected={setIsConnected}
 *       setIsOpen={setIsConnectModalOpen}
 *       appChains={[mainnet]}
 *       customization={{
 *         classNames: {
 *           connectorItem: ({ itemData }) => (itemData.isRecent ? 'recent-connector' : 'standard-connector'),
 *         },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const ConnectorsBlock = memo(
  forwardRef<HTMLElement, ConnectorsBlockProps>(
    (
      {
        selectedAdapter,
        connectors,
        solanaRPCUrls,
        appChains,
        setIsConnected,
        setIsOpen,
        onClick,
        title,
        isTitleBold = false,
        isOnlyOneNetwork = false,
        customization,
      },
      ref,
    ) => {
      const isMountedRef = useRef(true);
      const connectInProgressRef = useRef(false);

      // Extract customization options
      const {
        Container: CustomContainer = DefaultContainer,
        Title: CustomTitle = DefaultTitle,
        ConnectorsList: CustomConnectorsList = DefaultConnectorsList,
        ConnectorItem: CustomConnectorItem = DefaultConnectorItem,
        EmptyState: CustomEmptyState = DefaultEmptyState,
      } = customization?.components ?? {};

      const labels = useNovaConnectLabels();
      const customHandlers = customization?.handlers;
      const customConfig = customization?.config;

      /**
       * Memoized touch device detection
       */
      const isTouch = isTouchDevice();

      /**
       * Memoized store functions
       */
      const connect = useSatelliteConnectStore((store) => store.connect);
      const store = useContext(SatelliteStoreContext);

      /**
       * Memoized recent wallets data with proper type handling
       */
      const recentWallets = useMemo(() => {
        const sortedConnectors = recentlyConnectedConnectorsListHelpers.getConnectorsSortedByTime();
        // Take top 3 most recent
        const top3Recent = sortedConnectors.slice(0, 3);
        return top3Recent;
      }, []);

      /**
       * Memoized section ID
       */
      const sectionId = `connectors-${title.toLowerCase().replace(/\s+/g, '-')}`;

      const blockData: ConnectorsBlockData = {
        selectedAdapter,
        connectors,
        title,
        isTitleBold,
        isOnlyOneNetwork,
        isTouch,
        hasConnectors: Boolean(connectors?.length),
        recentWallets,
        sectionId,
      };

      const touchClasses = customConfig?.layout?.touchClasses ?? [
        'novacon:flex-row',
        customConfig?.layout?.touchGap ?? 'novacon:gap-3',
      ];

      const mouseClasses = customConfig?.layout?.mouseClasses ?? [
        'novacon:flex-col',
        customConfig?.layout?.mouseGap ?? 'novacon:gap-2',
      ];

      const layoutClasses = {
        touchClasses,
        mouseClasses,
      };

      /**
       * Memoized connector items data
       */
      const connectorItems: ConnectorItemData[] = connectors?.length
        ? connectors.map((group, index) => {
            const name = formatConnectorName(group.name);

            let isRecent = false;
            if (customConfig?.features?.showRecentIndicators !== false && recentWallets && recentWallets.length > 0) {
              // Check if any adapter in the group matches a recent connector
              isRecent = group.adapters.some((adapter) => {
                const typeToCheck = getConnectorTypeFromName(adapter, name);
                return recentWallets.some(([recentType]) => recentType === typeToCheck);
              });
            }

            return {
              group,
              name,
              isRecent,
              index,
            };
          })
        : [];

      /**
       * Handle connector click with connection logic
       */
      const handleConnectorClick = useCallback(
        async (group: GroupedConnector) => {
          if (!isMountedRef.current || connectInProgressRef.current) return;

          const name = formatConnectorName(group.name);

          try {
            connectInProgressRef.current = true;

            // If multiple adapters available and no specific adapter selected, show network selection
            if (group.adapters.length > 1 && !selectedAdapter) {
              onClick(group);
              return;
            }

            // Use the selected adapter or the first available adapter
            const targetAdapter = selectedAdapter || group.adapters[0];
            const connectorType = getConnectorTypeFromName(targetAdapter, name) as ConnectorType;

            onClick(group);

            await connect({
              connectorType,
              chainId: getConnectChainId({ appChains, selectedAdapter: targetAdapter, solanaRPCUrls }),
            });

            await waitFor(() => store?.getState().activeConnection?.isConnected);
            setIsConnected(true);
            const modalCloseTime = setTimeout(() => setIsOpen(false), 400);
            const isConnectedTimer = setTimeout(() => setIsConnected(false), 500);
            await delay(null, 500);
            clearTimeout(modalCloseTime);
            clearTimeout(isConnectedTimer);
          } catch (error) {
            console.error('Connection error:', error);
          } finally {
            connectInProgressRef.current = false;
          }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedAdapter, onClick, connect, appChains, solanaRPCUrls, setIsConnected, setIsOpen],
      );

      /**
       * Wrapper for custom connector click handler
       */
      const handleConnectorClickWrapper = useCallback(
        (itemData: ConnectorItemData) => {
          if (customHandlers?.onConnectorClick) {
            customHandlers.onConnectorClick(itemData, blockData, handleConnectorClick);
          } else {
            handleConnectorClick(itemData.group);
          }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [customHandlers?.onConnectorClick, blockData, handleConnectorClick],
      );

      /**
       * Memoized CSS classes
       */
      const cssClasses = {
        container:
          customization?.classNames?.container?.({ blockData }) ?? 'novacon:flex novacon:flex-col novacon:gap-2',

        title:
          customization?.classNames?.title?.({ blockData }) ??
          cn('novacon:text-sm novacon:font-mono novacon:text-[var(--tuwa-text-secondary)]', {
            'novacon:font-bold novacon:text-[var(--tuwa-text-accent)]': blockData.isTitleBold,
          }),

        connectorsList:
          customization?.classNames?.connectorsList?.({ blockData }) ??
          cn('novacon:flex', blockData.isTouch ? layoutClasses.touchClasses : layoutClasses.mouseClasses),

        emptyState:
          customization?.classNames?.emptyState?.({ blockData }) ??
          'novacon:flex novacon:items-center novacon:justify-center novacon:p-4 novacon:text-sm novacon:text-[var(--tuwa-text-secondary)] novacon:bg-[var(--tuwa-bg-muted)] novacon:rounded-[var(--tuwa-rounded-corners)] novacon:flex-1',
      };

      // Cleanup effect
      React.useEffect(() => {
        isMountedRef.current = true;

        return () => {
          isMountedRef.current = false;
          connectInProgressRef.current = false;
        };
      }, []);

      // Early return for empty state
      if (!blockData.hasConnectors) {
        if (customConfig?.features?.showEmptyState === false) {
          return null;
        }

        return (
          <CustomContainer
            ref={ref}
            className={cssClasses.container}
            role="group"
            aria-labelledby={
              customConfig?.features?.showTitleWhenEmpty !== false ? `${blockData.sectionId}-title` : undefined
            }
            blockData={blockData}
          >
            {customConfig?.features?.showTitleWhenEmpty !== false && (
              <CustomTitle
                id={`${blockData.sectionId}-title`}
                className={cssClasses.title}
                role="heading"
                aria-level={3}
                blockData={blockData}
                onClick={customHandlers?.onTitleClick ? () => customHandlers.onTitleClick!(blockData) : undefined}
              >
                {title}
              </CustomTitle>
            )}

            <CustomEmptyState
              className={cssClasses.emptyState}
              role="status"
              aria-label={
                customConfig?.ariaLabels?.emptyState?.(blockData) ??
                formatLabel(labels.noGroupConnectors, { title: title.toLowerCase() })
              }
              blockData={blockData}
              onClick={
                customHandlers?.onEmptyStateAction ? () => customHandlers.onEmptyStateAction!(blockData) : undefined
              }
            >
              {formatLabel(labels.noGroupWallets, { title: title.toLowerCase() })}
            </CustomEmptyState>
          </CustomContainer>
        );
      }

      const containerAriaLabel =
        customConfig?.ariaLabels?.container?.(blockData) ?? formatLabel(labels.connectorsSection, { title });
      const listAriaLabel =
        customConfig?.ariaLabels?.connectorsList?.(blockData) ?? formatLabel(labels.connectorsList, { title });

      return (
        <CustomContainer
          ref={ref}
          className={cssClasses.container}
          role="group"
          aria-labelledby={`${blockData.sectionId}-title`}
          aria-label={containerAriaLabel}
          blockData={blockData}
        >
          <CustomTitle
            id={`${blockData.sectionId}-title`}
            className={cssClasses.title}
            role="heading"
            aria-level={3}
            blockData={blockData}
            onClick={customHandlers?.onTitleClick ? () => customHandlers.onTitleClick!(blockData) : undefined}
          >
            {title}
          </CustomTitle>

          <CustomConnectorsList
            className={cssClasses.connectorsList}
            role="list"
            aria-label={listAriaLabel}
            blockData={blockData}
          >
            {connectorItems.map((itemData) => {
              const itemClasses =
                customization?.classNames?.connectorItem?.({ itemData, blockData }) ??
                cn(blockData.isTouch && 'novacon:flex-shrink-0');

              return (
                <CustomConnectorItem
                  key={`${itemData.name}-${itemData.group.adapters.join('-')}`}
                  className={itemClasses}
                  role="listitem"
                  itemData={itemData}
                  blockData={blockData}
                >
                  <ConnectCard
                    icon={
                      <WalletIcon
                        icon={itemData.group.icon}
                        name={itemData.name}
                        customization={customization?.walletIcon}
                      />
                    }
                    adapters={!selectedAdapter ? itemData.group.adapters : undefined}
                    onClick={() => handleConnectorClickWrapper(itemData)}
                    title={itemData.group.name}
                    isOnlyOneNetwork={isOnlyOneNetwork}
                    isRecent={itemData.isRecent}
                    customization={customization?.connectCard}
                  />
                </CustomConnectorItem>
              );
            })}
          </CustomConnectorsList>
        </CustomContainer>
      );
    },
  ),
);

ConnectorsBlock.displayName = 'ConnectorsBlock';
