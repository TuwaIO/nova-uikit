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

import { SatelliteStoreContext, useSatelliteConnectStore } from '../../satellite';
import { getConnectChainId } from '../../utils/getConnectedChainId';
import { WalletIcon, WalletIconCustomization } from '../WalletIcon';
import { ConnectCard, ConnectCardCustomization } from './ConnectCard';
import { GroupedConnector } from './ConnectModal';
import { ConnectorsSelectionsProps } from './ConnectorsSelections';

// --- Types ---

/**
 * Connector block data for customization context
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
  /** Whether device is touch-enabled */
  isTouch: boolean;
  /** Whether there are connectors to display */
  hasConnectors: boolean;
  /** Recent wallets data */
  recentWallets: [string, RecentlyConnectedConnectorData][] | null;
  /** Section ID for accessibility */
  sectionId: string;
}

/**
 * Individual connector item data
 */
export interface ConnectorItemData {
  /** Grouped connector configuration */
  group: GroupedConnector;
  /** Formatted wallet name */
  name: string;
  /** Whether this wallet was recently used */
  isRecent: boolean;
  /** Item index in the list */
  index: number;
}

// --- Component Props Types ---
type ContainerProps = {
  className?: string;
  children: React.ReactNode;
  role?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLElement>;

type TitleProps = {
  className?: string;
  children: React.ReactNode;
  id?: string;
  role?: string;
  'aria-level'?: number;
  onClick?: () => void;
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLHeadingElement>;

type ConnectorsListProps = {
  className?: string;
  children: React.ReactNode;
  role?: string;
  'aria-label'?: string;
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLDivElement>;

type ConnectorItemProps = {
  className?: string;
  children: React.ReactNode;
  role?: string;
  itemData: ConnectorItemData;
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLDivElement>;

type EmptyStateProps = {
  className?: string;
  children: React.ReactNode;
  role?: string;
  'aria-label'?: string;
  onClick?: () => void;
  blockData: ConnectorsBlockData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization options for ConnectorsBlock component
 */
export type ConnectorsBlockCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ContainerProps>;
    /** Custom title component */
    Title?: ComponentType<TitleProps>;
    /** Custom connectors list */
    ConnectorsList?: ComponentType<ConnectorsListProps>;
    /** Custom connector item wrapper */
    ConnectorItem?: ComponentType<ConnectorItemProps>;
    /** Custom empty state component */
    EmptyState?: ComponentType<EmptyStateProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /** Function to generate container classes */
    container?: (params: { blockData: ConnectorsBlockData }) => string;
    /** Function to generate title classes */
    title?: (params: { blockData: ConnectorsBlockData }) => string;
    /** Function to generate connectors list classes */
    connectorsList?: (params: { blockData: ConnectorsBlockData }) => string;
    /** Function to generate connector item classes */
    connectorItem?: (params: { itemData: ConnectorItemData; blockData: ConnectorsBlockData }) => string;
    /** Function to generate empty state classes */
    emptyState?: (params: { blockData: ConnectorsBlockData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom connector click handler */
    onConnectorClick?: (
      itemData: ConnectorItemData,
      blockData: ConnectorsBlockData,
      originalHandler: (group: GroupedConnector) => Promise<void>,
    ) => void;
    /** Custom title click handler */
    onTitleClick?: (blockData: ConnectorsBlockData) => void;
    /** Custom empty state action handler */
    onEmptyStateAction?: (blockData: ConnectorsBlockData) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      container?: (blockData: ConnectorsBlockData) => string;
      connectorsList?: (blockData: ConnectorsBlockData) => string;
      emptyState?: (blockData: ConnectorsBlockData) => string;
    };
    /** Custom layout configuration */
    layout?: {
      /** Touch device gap between items */
      touchGap?: string;
      /** Mouse device gap between items */
      mouseGap?: string;
      /** Custom touch layout classes */
      touchClasses?: string[];
      /** Custom mouse layout classes */
      mouseClasses?: string[];
    };
    /** Show/hide features */
    features?: {
      /** Whether to show empty state */
      showEmptyState?: boolean;
      /** Whether to show title when no connectors */
      showTitleWhenEmpty?: boolean;
      /** Whether to show recent indicators */
      showRecentIndicators?: boolean;
    };
  };
  /** ConnectCard customization for each connector card */
  connectCard?: ConnectCardCustomization;
  /** WalletIcon customization for wallet icons */
  walletIcon?: WalletIconCustomization;
};

/**
 * Props for the ConnectorsBlock component
 */
interface ConnectorsBlockProps extends Pick<
  ConnectorsSelectionsProps,
  'setIsOpen' | 'setIsConnected' | 'onClick' | 'appChains' | 'solanaRPCUrls'
> {
  /** Currently selected network adapter */
  selectedAdapter: OrbitAdapter | undefined;
  /** Array of grouped wallet connectors to display */
  connectors: GroupedConnector[];
  /** Title text for the connector group */
  title: string;
  /** Whether to render the title in bold accent color */
  isTitleBold?: boolean;
  /** Whether only one network is available */
  isOnlyOneNetwork?: boolean;
  /** Customization options */
  customization?: ConnectorsBlockCustomization;
}

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLElement, ContainerProps>(({ children, className, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blockData: _blockData, ...restProps } = props;
  return (
    <section ref={ref} className={className} {...restProps}>
      {children}
    </section>
  );
});
DefaultContainer.displayName = 'DefaultContainer';

const DefaultTitle = forwardRef<HTMLHeadingElement, TitleProps>(({ children, className, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blockData: _blockData, ...restProps } = props;
  return (
    <h3 ref={ref} className={className} {...restProps}>
      {children}
    </h3>
  );
});
DefaultTitle.displayName = 'DefaultTitle';

const DefaultConnectorsList = forwardRef<HTMLDivElement, ConnectorsListProps>(
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

const DefaultConnectorItem = forwardRef<HTMLDivElement, ConnectorItemProps>(
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

const DefaultEmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(({ children, className, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blockData: _blockData, ...restProps } = props;
  return (
    <div ref={ref} className={className} {...restProps}>
      {children}
    </div>
  );
});
DefaultEmptyState.displayName = 'DefaultEmptyState';

/**
 * ConnectorsBlock component - Displays a grouped section of wallet connectors with full customization
 *
 * This component renders a section of wallet connectors with:
 * - Responsive layout adapting to touch/mouse interfaces
 * - Support for multi-network wallet selection
 * - Automatic connection handling for single-network wallets
 * - Recent wallet indicators and prioritization
 * - Full accessibility support with proper labeling
 * - Error handling and connection retry logic
 * - Complete customization of all child components and styling
 *
 * Layout features:
 * - Touch devices: Horizontal scrolling layout with cards
 * - Mouse devices: Vertical stacked layout for better readability
 * - Dynamic title styling based on section importance
 * - Consistent spacing and visual hierarchy
 * - Customizable layout parameters and responsive behavior
 *
 * Connection flow:
 * - Single adapter: Direct connection attempt
 * - Multiple adapters without selection: Triggers network selection
 * - Selected adapter: Uses specific adapter for connection
 * - Recent wallets: Visual indicators for previously used wallets
 * - Error handling with retry mechanisms
 *
 * Accessibility features:
 * - Semantic heading structure with proper levels
 * - Group labeling for related connector sets
 * - Screen reader friendly section descriptions
 * - Proper focus management and keyboard navigation
 * - ARIA live regions for dynamic content updates
 *
 * @example Basic usage
 * ```tsx
 * <ConnectorsBlock
 *   selectedAdapter={OrbitAdapter.EVM}
 *   connectors={installedConnectors}
 *   title="Installed"
 *   isTitleBold={true}
 *   isOnlyOneNetwork={false}
 *   onClick={(group) => handleWalletSelection(group)}
 *   appChains={appConfiguration}
 *   solanaRPCUrls={rpcConfig}
 *   store={walletStore}
 * />
 * ```
 *
 * @example With full customization
 * ```tsx
 * <ConnectorsBlock
 *   selectedAdapter={undefined}
 *   connectors={popularConnectors}
 *   title="Popular"
 *   isTitleBold={false}
 *   isOnlyOneNetwork={true}
 *   onClick={(group) => initiateConnection(group)}
 *   customization={{
 *     components: {
 *       Container: CustomConnectorsContainer,
 *       Title: CustomSectionTitle
 *     },
 *     classNames: {
 *       connectorsList: ({ blockData }) =>
 *         blockData.isTouch ? 'horizontal-scroll' : 'vertical-stack',
 *       connectorItem: ({ itemData, blockData }) =>
 *         itemData.isRecent ? 'recent-connector' : 'standard-connector'
 *     },
 *     handlers: {
 *       onConnectorClick: (itemData, blockData, originalHandler) => {
 *         analytics.track('connector_clicked', { wallet: itemData.name });
 *         originalHandler(itemData.group);
 *       }
 *     },
 *     connectCard: {
 *       classNames: {
 *         container: ({ cardData }) =>
 *           cardData.isRecent ? 'bg-accent' : 'bg-default'
 *       }
 *     }
 *   }}
 * />
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
          cn('novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]', {
            'novacon:font-bold novacon:text-[var(--tuwa-text-accent)]': blockData.isTitleBold,
          }),

        connectorsList:
          customization?.classNames?.connectorsList?.({ blockData }) ??
          cn('novacon:flex', blockData.isTouch ? layoutClasses.touchClasses : layoutClasses.mouseClasses),

        emptyState:
          customization?.classNames?.emptyState?.({ blockData }) ??
          'novacon:flex novacon:items-center novacon:justify-center novacon:p-4 novacon:text-sm novacon:text-[var(--tuwa-text-secondary)] novacon:bg-[var(--tuwa-bg-muted)] novacon:rounded-[var(--tuwa-rounded-corners)]',
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
                customConfig?.ariaLabels?.emptyState?.(blockData) ?? `No ${title.toLowerCase()} connectors available`
              }
              blockData={blockData}
              onClick={
                customHandlers?.onEmptyStateAction ? () => customHandlers.onEmptyStateAction!(blockData) : undefined
              }
            >
              No {title.toLowerCase()} wallets available
            </CustomEmptyState>
          </CustomContainer>
        );
      }

      const containerAriaLabel =
        customConfig?.ariaLabels?.container?.(blockData) ?? `${title} wallet connectors section`;
      const listAriaLabel = customConfig?.ariaLabels?.connectorsList?.(blockData) ?? `${title} wallet connectors`;

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
