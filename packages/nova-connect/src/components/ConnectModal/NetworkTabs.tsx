/**
 * @file NetworkTabs component with comprehensive customization options and animated transitions.
 */

import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { cn, NetworkIcon } from '@tuwaio/nova-core';
import { getNetworkData, OrbitAdapter } from '@tuwaio/orbit-core';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React, { ComponentType, forwardRef, memo, useEffect, useEffectEvent } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { formatLabel } from '../../i18n/formatLabel';

// --- Types ---

/**
 * Animation settings of {@link NetworkTabs} (`config.animation`).
 */
export interface AnimationConfig {
  /** Duration of the fade of the tab name, in seconds (default: `0.2`) */
  textDuration: number;
  /** Delay before the name of the selected tab appears, in seconds (default: `0`) */
  textDelay?: number;
}

/**
 * A tab of {@link NetworkTabs}.
 */
export interface NetworkTabData {
  /** Network adapter (undefined for "All") */
  network: OrbitAdapter | undefined;
  /** The `all` label, the name from `config.networkNames`, or the chain name from `getNetworkData` */
  displayName: string;
  /** Default chain of the network (`chain` of `getNetworkData` from `@tuwaio/orbit-core`), `null` for "All" */
  networkInfo: {
    /** Chain ID of the network icon */
    chainId: number | string;
    /** Chain name */
    name: string;
  } | null;
  /** Whether this tab is selected */
  isSelected: boolean;
  /** Tab index */
  index: number;
}

// --- Component Props Types ---
/**
 * Props for a custom container (a `motion.div` with a layout animation by default).
 */
export type NetworkTabsContainerProps = {
  /** Classes from `classNames.container` or the `className` prop */
  className?: string;
  /** The tab list */
  children: React.ReactNode;
  /** `tablist` */
  role?: string;
  /** `config.ariaLabels.container` or the `networkSelectionTabs` label */
  'aria-label'?: string;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom tab list.
 */
export type NetworkTabsTabListProps = {
  /** Classes from `classNames.tabList` or the defaults */
  className?: string;
  /** The tabs */
  children: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom tab wrapper.
 */
export type NetworkTabsTabProps = {
  /** Classes from `classNames.tab` or the defaults */
  className?: string;
  /** The tab button and, for the selected tab, the indicator */
  children: React.ReactNode;
  /** The adapter of the tab, or `all` */
  'data-network': string;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom tab button.
 */
export type NetworkTabsTabButtonProps = {
  /** Classes from `classNames.tabButton` or the defaults */
  className?: string;
  /** The icon and the name */
  children: React.ReactNode;
  /** `button` */
  type?: 'button';
  /** `tab` */
  role?: string;
  /** Whether the tab is selected */
  'aria-selected'?: boolean;
  /** `network-panel-<adapter or all>` */
  'aria-controls'?: string;
  /** Selects the tab (`onSelect`, then `handlers.onTabSelect`) */
  onClick: () => void;
  /** Calls `handlers.onTabHover` */
  onMouseEnter?: () => void;
  /** Calls `handlers.onTabFocus` */
  onFocus?: () => void;
  /** The display name */
  title?: string;
  /** `tabPrefix` and the `networkTab` label with the name, followed by `selectedSuffix` for the selected tab */
  'aria-label'?: string;
  /** The tab */
  tabData: NetworkTabData;
} & React.RefAttributes<HTMLButtonElement>;

/**
 * Props for a custom icon container of a tab.
 */
export type NetworkTabsIconContainerProps = {
  /** Classes from `classNames.iconContainer` or the defaults */
  className?: string;
  /** The network icon, or a globe for "All" */
  children: React.ReactNode;
  /** `img` */
  role?: string;
  /** The `networkNameIcon` label with the name, or the `networkTab` label followed by `iconSuffix` */
  'aria-label'?: string;
  /** The tab */
  tabData: NetworkTabData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom tab name (a `motion.span` shown only for the selected tab by default).
 */
export type NetworkTabsTabTextProps = {
  /** Classes from `classNames.tabText` or the defaults */
  className?: string;
  /** The display name */
  children: React.ReactNode;
  /** Framer Motion variants `active` and `inactive` */
  variants?: Variants;
  /** `active` for the selected tab, otherwise `inactive` */
  animate?: string;
  /** `true` for tabs that are not selected */
  'aria-hidden'?: boolean;
  /** The tab */
  tabData: NetworkTabData;
} & React.RefAttributes<HTMLSpanElement>;

/**
 * Props for a custom selection indicator (the background of the selected tab).
 */
export type NetworkTabsIndicatorProps = {
  /** Classes from `classNames.indicator` or the defaults */
  className?: string;
  /** `true` */
  'aria-hidden'?: boolean;
  /** The selected tab */
  tabData: NetworkTabData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization options of {@link NetworkTabs}.
 */
export type NetworkTabsCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<NetworkTabsContainerProps>;
    /** Custom tab list container */
    TabList?: ComponentType<NetworkTabsTabListProps>;
    /** Custom tab wrapper */
    Tab?: ComponentType<NetworkTabsTabProps>;
    /** Custom tab button */
    TabButton?: ComponentType<NetworkTabsTabButtonProps>;
    /** Custom icon container */
    IconContainer?: ComponentType<NetworkTabsIconContainerProps>;
    /** Custom tab text */
    TabText?: ComponentType<NetworkTabsTabTextProps>;
    /** Custom selection indicator */
    Indicator?: ComponentType<NetworkTabsIndicatorProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the `className` prop.
     *
     * @returns The classes.
     */
    container?: () => string;
    /**
     * Returns the classes of the tab list, instead of the default ones.
     *
     * @returns The classes.
     */
    tabList?: () => string;
    /**
     * Returns the classes of a tab wrapper, instead of the default ones.
     *
     * @param params - The tab.
     * @param params.isSelected - Whether the tab is selected.
     * @param params.index - Tab index.
     * @returns The classes.
     */
    tab?: (params: { isSelected: boolean; index: number }) => string;
    /**
     * Returns the classes of a tab button, instead of the default ones.
     *
     * @param params - The tab.
     * @param params.isSelected - Whether the tab is selected.
     * @param params.tabData - The tab.
     * @returns The classes.
     */
    tabButton?: (params: { isSelected: boolean; tabData: NetworkTabData }) => string;
    /**
     * Returns the classes of an icon container, instead of the default ones.
     *
     * @param params - The tab.
     * @param params.tabData - The tab.
     * @returns The classes.
     */
    iconContainer?: (params: { tabData: NetworkTabData }) => string;
    /**
     * Returns the classes of a tab name, instead of the default ones.
     *
     * @param params - The tab.
     * @param params.isSelected - Whether the tab is selected.
     * @param params.tabData - The tab.
     * @returns The classes.
     */
    tabText?: (params: { isSelected: boolean; tabData: NetworkTabData }) => string;
    /**
     * Returns the classes of the selection indicator, instead of the default ones.
     *
     * @param params - The tab.
     * @param params.tabData - The selected tab.
     * @returns The classes.
     */
    indicator?: (params: { tabData: NetworkTabData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called after `onSelect` when a tab is clicked.
     *
     * @param network - The adapter of the tab, `undefined` for "All".
     * @param tabData - The tab.
     */
    onTabSelect?: (network: OrbitAdapter | undefined, tabData: NetworkTabData) => void;
    /**
     * Called when the pointer enters a tab.
     *
     * @param network - The adapter of the tab, `undefined` for "All".
     * @param tabData - The tab.
     */
    onTabHover?: (network: OrbitAdapter | undefined, tabData: NetworkTabData) => void;
    /**
     * Called when a tab gets focus.
     *
     * @param network - The adapter of the tab, `undefined` for "All".
     * @param tabData - The tab.
     */
    onTabFocus?: (network: OrbitAdapter | undefined, tabData: NetworkTabData) => void;
    /** Called after mount */
    onMount?: () => void;
    /** Called on unmount */
    onUnmount?: () => void;
  };
  /** Configuration options */
  config?: {
    /** Custom animation configuration */
    animation?: Partial<AnimationConfig>;
    /** Custom ARIA labels */
    ariaLabels?: {
      /** ARIA label of the tab list (default: the `networkSelectionTabs` label) */
      container?: string;
      /** Text before the ARIA label of a tab (the `networkTab` label; default: empty) */
      tabPrefix?: string;
      /** Last word of the ARIA label of a tab icon, after the `networkTab` label (default: the `networkNameIcon` label) */
      iconSuffix?: string;
      /** Text after the ARIA label of the selected tab (default: a comma and the `currentlySelected` label) */
      selectedSuffix?: string;
    };
    /** Whether to show "All" option (default: `true`) */
    showAllOption?: boolean;
    /** Tab names by adapter, for example `{ evm: 'EVM' }` (default: the chain name from `getNetworkData`) */
    networkNames?: {
      [key: string]: string;
    };
    /** The tabs render only when there are more networks than this (default: `1`) */
    minNetworksToShow?: number;
  };
};

/**
 * Props for the {@link NetworkTabs} component.
 */
export interface NetworkTabsProps {
  /** Array of available network adapters */
  networks: OrbitAdapter[];
  /** Currently selected network adapter (undefined means "All" is selected) */
  selectedAdapter: OrbitAdapter | undefined;
  /**
   * Called when a tab is clicked.
   *
   * @param adapter - The adapter of the tab, `undefined` for "All".
   */
  onSelect: (adapter: OrbitAdapter | undefined) => void;
  /** Classes of the container (ignored when `classNames.container` is set) */
  className?: string;
  /** Customization options */
  customization?: NetworkTabsCustomization;
}

/**
 * Default animation configuration
 */
const defaultAnimationConfig: AnimationConfig = {
  textDuration: 0.2,
  textDelay: 0,
};

/**
 * Default animation variants for tab text transitions
 */
const getTextVariant = (config: AnimationConfig): Variants => ({
  active: {
    opacity: 1,
    zIndex: 2,
    x: 0,
    position: 'relative',
    transition: {
      duration: config.textDuration,
      delay: config.textDelay,
    },
  },
  inactive: {
    opacity: 0,
    zIndex: -1,
    x: -10,
    position: 'absolute',
    transition: {
      duration: config.textDuration,
    },
  },
});

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLDivElement, NetworkTabsContainerProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      layout
      transition={{
        layout: {
          duration: 0.6,
          ease: [0.1, 0.1, 0.2, 1],
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultTabList = forwardRef<HTMLDivElement, NetworkTabsTabListProps>(({ children, className }, ref) => (
  <motion.div
    ref={ref}
    className={className}
    layout
    transition={{
      layout: {
        duration: 0.0001,
      },
    }}
  >
    {children}
  </motion.div>
));
DefaultTabList.displayName = 'DefaultTabList';

const DefaultTab = forwardRef<HTMLDivElement, NetworkTabsTabProps>(({ children, className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={className}
    layout
    transition={{
      layout: {
        duration: 0.6,
        ease: [0.1, 0.1, 0.2, 1],
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
));
DefaultTab.displayName = 'DefaultTab';

const DefaultTabButton = forwardRef<HTMLButtonElement, NetworkTabsTabButtonProps>(
  // eslint-disable-next-line
  ({ children, className, tabData: _, ...props }, ref) => (
    <motion.button
      ref={ref}
      className={className}
      layout
      transition={{
        layout: {
          duration: 0.0001,
        },
      }}
      {...props}
    >
      {children}
    </motion.button>
  ),
);
DefaultTabButton.displayName = 'DefaultTabButton';

const DefaultIconContainer = forwardRef<HTMLDivElement, NetworkTabsIconContainerProps>(
  // eslint-disable-next-line
  ({ children, className, tabData: _, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultIconContainer.displayName = 'DefaultIconContainer';

const DefaultTabText = forwardRef<HTMLSpanElement, NetworkTabsTabTextProps>(
  // eslint-disable-next-line
  ({ children, className, tabData: _, ...props }, ref) => (
    <motion.span ref={ref} className={className} {...props}>
      {children}
    </motion.span>
  ),
);
DefaultTabText.displayName = 'DefaultTabText';

const DefaultIndicator = forwardRef<HTMLDivElement, NetworkTabsIndicatorProps>(
  // eslint-disable-next-line
  ({ className, tabData: _, ...props }, ref) => (
    <motion.div ref={ref} className={className} layoutId="indicator" {...props} />
  ),
);
DefaultIndicator.displayName = 'DefaultIndicator';

/**
 * The network tabs of the connect modal: an "All" tab and a tab for each network, with the network icon and the name
 * of the selected tab, animated with Framer Motion. Renders nothing when there is only one network.
 *
 * Props: {@link NetworkTabsProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { NetworkTabs } from '@tuwaio/nova-connect/components';
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 * import { useState } from 'react';
 *
 * export function Tabs() {
 *   const [adapter, setAdapter] = useState<OrbitAdapter | undefined>();
 *
 *   return (
 *     <NetworkTabs
 *       networks={[OrbitAdapter.EVM, OrbitAdapter.SOLANA]}
 *       selectedAdapter={adapter}
 *       onSelect={setAdapter}
 *       customization={{
 *         classNames: {
 *           tabButton: ({ isSelected }) => (isSelected ? 'custom-selected' : 'custom-normal'),
 *         },
 *         config: { animation: { textDuration: 0.15 } },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const NetworkTabs = memo(
  forwardRef<HTMLDivElement, NetworkTabsProps>(
    ({ networks, selectedAdapter, onSelect, className, customization }, ref) => {
      const labels = useNovaConnectLabels();

      // Extract customization options
      const {
        Container: CustomContainer = DefaultContainer,
        TabList: CustomTabList = DefaultTabList,
        Tab: CustomTab = DefaultTab,
        TabButton: CustomTabButton = DefaultTabButton,
        IconContainer: CustomIconContainer = DefaultIconContainer,
        TabText: CustomTabText = DefaultTabText,
        Indicator: CustomIndicator = DefaultIndicator,
      } = customization?.components ?? {};

      const customHandlers = customization?.handlers;
      const customConfig = customization?.config;

      /**
       * Memoized animation configuration with customization
       */
      const animationConfig: AnimationConfig = {
        ...defaultAnimationConfig,
        ...customConfig?.animation,
      };

      /**
       * Memoized text animation variants
       */
      const textVariant = getTextVariant(animationConfig);

      /**
       * Check if we should render tabs
       */
      const minNetworks = customConfig?.minNetworksToShow ?? 1;
      const shouldRender = networks.length > minNetworks;

      /**
       * Memoized networks list with "All" option if enabled
       */
      const showAll = customConfig?.showAllOption ?? true;
      const localNetworks = showAll ? [undefined, ...networks] : networks;

      /**
       * Generate network display name function with proper memoization dependencies
       */
      const getNetworkDisplayName = (network: OrbitAdapter | undefined): string => {
        if (!network) return labels.all;

        // Check for custom name first
        const networkKey = network.toString();
        if (customConfig?.networkNames?.[networkKey]) {
          return customConfig.networkNames[networkKey];
        }

        return getNetworkData(network)?.chain?.name ?? labels.unknown;
      };

      const getNetworkAriaLabel = (network: OrbitAdapter | undefined, isSelected: boolean): string => {
        const displayName = getNetworkDisplayName(network);
        const tabPrefix = customConfig?.ariaLabels?.tabPrefix ?? '';
        const selectedSuffix = customConfig?.ariaLabels?.selectedSuffix ?? `, ${labels.currentlySelected}`;

        return `${tabPrefix}${formatLabel(labels.networkTab, { name: displayName })}${isSelected ? selectedSuffix : ''}`.trim();
      };

      /**
       * Generate tab selection handler with proper memoization dependencies
       */
      const handleTabSelect = (network: OrbitAdapter | undefined, tabData: NetworkTabData) => {
        onSelect(network);
        customHandlers?.onTabSelect?.(network, tabData);
      };

      /**
       * Memoized tab data
       */
      const tabsData: NetworkTabData[] = localNetworks.map((network, index) => ({
        network,
        displayName: getNetworkDisplayName(network),
        networkInfo: network ? (getNetworkData(network)?.chain ?? null) : null,
        isSelected: selectedAdapter === network,
        index,
      }));

      /**
       * Generate container classes with proper memoization dependencies
       */
      const containerClasses = customization?.classNames?.container?.() ?? className;

      const tabListClasses =
        customization?.classNames?.tabList?.() ??
        'novacon:flex novacon:overflow-x-auto novacon:gap-2 novacon:p-2 novacon:mb-2 novacon:border-b novacon:border-[var(--tuwa-border-primary)] novacon:relative';

      // The handlers are read through Effect Events, so new handler functions on every render do not re-run the effect
      const onMount = useEffectEvent(() => customHandlers?.onMount?.());
      const onUnmount = useEffectEvent(() => customHandlers?.onUnmount?.());
      useEffect(() => {
        onMount();
        return () => onUnmount();
      }, []);

      // Don't render if not enough networks
      if (!shouldRender) return null;

      const containerAriaLabel = customConfig?.ariaLabels?.container ?? labels.networkSelectionTabs;

      return (
        <CustomContainer ref={ref} className={containerClasses} role="tablist" aria-label={containerAriaLabel}>
          <CustomTabList className={tabListClasses}>
            {tabsData.map((tabData) => {
              const tabKey = `${tabData.network}_${tabData.index}`;
              const networkKey = tabData.network?.toString() ?? 'all';

              // Generate dynamic classes and styles
              const tabClasses =
                customization?.classNames?.tab?.({
                  isSelected: tabData.isSelected,
                  index: tabData.index,
                }) ?? 'novacon:relative novacon:group';

              const tabButtonClasses =
                customization?.classNames?.tabButton?.({
                  isSelected: tabData.isSelected,
                  tabData,
                }) ??
                cn(
                  'novacon:cursor-pointer novacon:flex novacon:items-center novacon:gap-2 novacon:px-4 novacon:py-2 novacon:rounded-[var(--tuwa-rounded-corners)] novacon:transition-colors novacon:overflow-hidden novacon:relative novacon:z-4',
                  'novacon:hover:bg-[var(--tuwa-bg-muted)]',
                  'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
                  tabData.isSelected
                    ? 'novacon:bg-[var(--tuwa-bg-muted)] novacon:text-[var(--tuwa-text-accent)]'
                    : 'novacon:text-[var(--tuwa-text-secondary)]',
                );

              const iconContainerClasses =
                customization?.classNames?.iconContainer?.({ tabData }) ?? 'novacon:w-6 novacon:h-6';

              const tabTextClasses =
                customization?.classNames?.tabText?.({
                  isSelected: tabData.isSelected,
                  tabData,
                }) ?? 'novacon:block';

              const indicatorClasses =
                customization?.classNames?.indicator?.({ tabData }) ??
                'novacon:absolute novacon:inset-0 novacon:bg-[var(--tuwa-bg-muted)] novacon:z-3 novacon:rounded-[var(--tuwa-rounded-corners)]';

              return (
                <CustomTab key={tabKey} className={tabClasses} data-network={networkKey}>
                  <CustomTabButton
                    className={tabButtonClasses}
                    type="button"
                    role="tab"
                    aria-selected={tabData.isSelected}
                    aria-controls={`network-panel-${networkKey}`}
                    onClick={() => handleTabSelect(tabData.network, tabData)}
                    onMouseEnter={() => customHandlers?.onTabHover?.(tabData.network, tabData)}
                    onFocus={() => customHandlers?.onTabFocus?.(tabData.network, tabData)}
                    title={tabData.displayName}
                    aria-label={getNetworkAriaLabel(tabData.network, tabData.isSelected)}
                    tabData={tabData}
                  >
                    <CustomIconContainer
                      className={iconContainerClasses}
                      role="img"
                      aria-label={
                        customConfig?.ariaLabels?.iconSuffix
                          ? `${formatLabel(labels.networkTab, { name: tabData.displayName })} ${customConfig.ariaLabels.iconSuffix}`
                          : formatLabel(labels.networkNameIcon, { name: tabData.displayName })
                      }
                      tabData={tabData}
                    >
                      {tabData.network ? (
                        <NetworkIcon chainId={tabData.networkInfo?.chainId ?? ''} />
                      ) : (
                        <div className="novacon:w-6 novacon:h-6 novacon:rounded-full novacon:bg-[var(--tuwa-bg-primary)]">
                          <GlobeAltIcon aria-hidden="true" />
                        </div>
                      )}
                    </CustomIconContainer>

                    <AnimatePresence initial={false}>
                      <CustomTabText
                        variants={textVariant}
                        className={tabTextClasses}
                        animate={tabData.isSelected ? 'active' : 'inactive'}
                        aria-hidden={!tabData.isSelected}
                        tabData={tabData}
                      >
                        {tabData.displayName}
                      </CustomTabText>
                    </AnimatePresence>
                  </CustomTabButton>

                  {tabData.isSelected && (
                    <CustomIndicator className={indicatorClasses} aria-hidden={true} tabData={tabData} />
                  )}
                </CustomTab>
              );
            })}
          </CustomTabList>
        </CustomContainer>
      );
    },
  ),
);

NetworkTabs.displayName = 'NetworkTabs';
