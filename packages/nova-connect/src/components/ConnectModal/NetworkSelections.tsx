/**
 * @file NetworkSelections component with comprehensive customization options for network selection.
 */

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn, isTouchDevice, NetworkIcon } from '@tuwaio/nova-core';
import {
  ConnectorType,
  formatConnectorName,
  getConnectorTypeFromName,
  getNetworkData,
  OrbitAdapter,
} from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, memo, useCallback } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { formatLabel } from '../../i18n/formatLabel';
import { ConnectCard, ConnectCardCustomization } from './ConnectCard';
import { GroupedConnector } from './ConnectModal';
import { Disclaimer, DisclaimerCustomization } from './Disclaimer';

// --- Types ---

/**
 * A network offered by {@link NetworkSelections}.
 */
export interface NetworkSelectionsNetworkData {
  /** Network adapter */
  adapter: OrbitAdapter;
  /** Chain ID of the network icon (from `getNetworkData` of `@tuwaio/orbit-core`) */
  chainId?: number | string;
  /** Network name (`Ethereum` when `getNetworkData` has no data for the adapter) */
  name: string;
  /** Page about the network (`links.aboutNetwork` of `getNetworkData`), opened by the info link of the card */
  infoLink?: string;
  /** Position of the network in the list */
  index: number;
}

/**
 * State of {@link NetworkSelections}, passed to its custom components, class name generators and handlers.
 */
export interface NetworkSelectionsData {
  /** The `activeConnector` prop */
  activeConnector?: string;
  /** The `connectors` prop */
  connectors: GroupedConnector[];
  /** Whether the device has a touch screen (the list scrolls horizontally) */
  isTouch: boolean;
  /** Whether `connectors` has no wallet matching `activeConnector` (the error is shown) */
  isError: boolean;
  /** The networks of the active wallet */
  networks: NetworkSelectionsNetworkData[];
}

// --- Component Props Types ---
/**
 * Props for a custom container.
 */
export type NetworkSelectionsContainerProps = {
  /** Classes from `classNames.container` or the defaults */
  className?: string;
  /** The title, the network list and the disclaimer */
  children: React.ReactNode;
  /** `region` */
  role?: string;
  /** ID of the title */
  'aria-labelledby'?: string;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom title.
 */
export type NetworkSelectionsTitleProps = {
  /** Classes from `classNames.title` */
  className?: string;
  /** The `selectAvailableNetwork` label */
  children: React.ReactNode;
  /** `network-selection-title` */
  id?: string;
  /** `heading` */
  role?: string;
  /** `2` */
  'aria-level'?: number;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLHeadingElement>;

/**
 * Props for a custom network list.
 */
export type NetworkSelectionsNetworkListProps = {
  /** Classes from `classNames.networkList` or the defaults (with the `config.scroll` classes) */
  className?: string;
  /** The network items */
  children: React.ReactNode;
  /** `list` */
  role?: string;
  /** `config.ariaLabels.networkList` or the `availableNetworks` label */
  'aria-label'?: string;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom network item.
 */
export type NetworkSelectionsNetworkItemProps = {
  /** Classes from `classNames.networkItem` or the defaults */
  className?: string;
  /** The `ConnectCard` of the network */
  children: React.ReactNode;
  /** `listitem` */
  role?: string;
  /** The network */
  networkData: NetworkSelectionsNetworkData;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom wrapper of the network icon (the icon of the network card).
 */
export type NetworkSelectionsNetworkIconProps = {
  /** Classes from `classNames.networkIcon` */
  className?: string;
  /** The `NetworkIcon` of the chain */
  children: React.ReactNode;
  /** `img` */
  role?: string;
  /** `config.ariaLabels.networkIcon`, or the `networkNameIcon` label with the network name */
  'aria-label'?: string;
  /** The network */
  networkData: NetworkSelectionsNetworkData;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom error container (shown when no wallet matches `activeConnector`).
 */
export type NetworkSelectionsErrorContainerProps = {
  /** Classes from `classNames.errorContainer` or the defaults */
  className?: string;
  /** The error icon, title and message */
  children: React.ReactNode;
  /** `alert` */
  role?: string;
  /** `assertive` */
  'aria-live'?: 'polite' | 'assertive';
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom error icon wrapper.
 */
export type NetworkSelectionsErrorIconProps = {
  /** Classes from `classNames.errorIcon` or the defaults */
  className?: string;
  /** The warning icon */
  children: React.ReactNode;
  /** `true` */
  'aria-hidden'?: boolean;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom error title.
 */
export type NetworkSelectionsErrorTitleProps = {
  /** Classes from `classNames.errorTitle` or the defaults */
  className?: string;
  /** The `somethingWentWrong` label */
  children: React.ReactNode;
  /** `heading` */
  role?: string;
  /** `2` */
  'aria-level'?: number;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLHeadingElement>;

/**
 * Props for a custom error message.
 */
export type NetworkSelectionsErrorMessageProps = {
  /** Classes from `classNames.errorMessage` or the defaults */
  className?: string;
  /** The `networkPickingError` label */
  children: React.ReactNode;
  /** `text` */
  role?: string;
  /** State of the network selection */
  selectionsData: NetworkSelectionsData;
} & React.RefAttributes<HTMLParagraphElement>;

/**
 * Customization options of {@link NetworkSelections}.
 */
export type NetworkSelectionsCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<NetworkSelectionsContainerProps>;
    /** Custom title */
    Title?: ComponentType<NetworkSelectionsTitleProps>;
    /** Custom network list */
    NetworkList?: ComponentType<NetworkSelectionsNetworkListProps>;
    /** Custom network item wrapper */
    NetworkItem?: ComponentType<NetworkSelectionsNetworkItemProps>;
    /** Custom network icon wrapper */
    NetworkIcon?: ComponentType<NetworkSelectionsNetworkIconProps>;
    /** Custom error container */
    ErrorContainer?: ComponentType<NetworkSelectionsErrorContainerProps>;
    /** Custom error icon wrapper */
    ErrorIcon?: ComponentType<NetworkSelectionsErrorIconProps>;
    /** Custom error title */
    ErrorTitle?: ComponentType<NetworkSelectionsErrorTitleProps>;
    /** Custom error message */
    ErrorMessage?: ComponentType<NetworkSelectionsErrorMessageProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    container?: (params: { selectionsData: NetworkSelectionsData }) => string;
    /**
     * Returns the classes of the title (none by default).
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    title?: (params: { selectionsData: NetworkSelectionsData }) => string;
    /**
     * Returns the classes of the network list, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    networkList?: (params: { selectionsData: NetworkSelectionsData }) => string;
    /**
     * Returns the classes of a network item, instead of the default ones.
     *
     * @param params - The network.
     * @param params.networkData - The network.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    networkItem?: (params: {
      networkData: NetworkSelectionsNetworkData;
      selectionsData: NetworkSelectionsData;
    }) => string;
    /**
     * Returns the classes of a network icon wrapper (none by default).
     *
     * @param params - The network.
     * @param params.networkData - The network.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    networkIcon?: (params: {
      networkData: NetworkSelectionsNetworkData;
      selectionsData: NetworkSelectionsData;
    }) => string;
    /**
     * Returns the classes of the error container, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    errorContainer?: (params: { selectionsData: NetworkSelectionsData }) => string;
    /**
     * Returns the classes of the error icon wrapper, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    errorIcon?: (params: { selectionsData: NetworkSelectionsData }) => string;
    /**
     * Returns the classes of the error title, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    errorTitle?: (params: { selectionsData: NetworkSelectionsData }) => string;
    /**
     * Returns the classes of the error message, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the network selection.
     * @returns The classes.
     */
    errorMessage?: (params: { selectionsData: NetworkSelectionsData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click on a network: call `originalHandler(network)` to run the `onClick` prop with the connector type
     * of the active wallet on that network.
     *
     * @param networkData - The clicked network.
     * @param selectionsData - State of the network selection.
     * @param originalHandler - Connects the active wallet on a network.
     */
    onNetworkClick?: (
      networkData: NetworkSelectionsNetworkData,
      selectionsData: NetworkSelectionsData,
      originalHandler: (network: OrbitAdapter) => void,
    ) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /**
       * Returns the ARIA label of the network list (default: the `availableNetworks` label).
       *
       * @param selectionsData - State of the network selection.
       * @returns The label.
       */
      networkList?: (selectionsData: NetworkSelectionsData) => string;
      /**
       * Returns the ARIA label of a network icon (default: the `networkNameIcon` label with the network name).
       *
       * @param networkData - The network.
       * @returns The label.
       */
      networkIcon?: (networkData: NetworkSelectionsNetworkData) => string;
    };
    /** Classes of the default network list (ignored when `classNames.networkList` is set) */
    scroll?: {
      /** Height limit on devices without a touch screen (default: `novacon:max-h-[310px]`) */
      mouseMaxHeight?: string;
      /** Gap between the cards */
      gap?: {
        /** On touch devices (default: `novacon:gap-3`) */
        touch?: string;
        /** On devices without a touch screen (default: `novacon:gap-2`) */
        mouse?: string;
      };
    };
  };
  /** ConnectCard customization for network cards */
  connectCard?: ConnectCardCustomization;
  /** Disclaimer customization */
  disclaimer?: DisclaimerCustomization;
};

/**
 * Props for the {@link NetworkSelections} component.
 */
export interface NetworkSelectionsProps {
  /** The selected wallet, as `formatConnectorName` of `@tuwaio/orbit-core` returns it */
  activeConnector: string | undefined;
  /** Array of grouped wallet connectors with their supported networks */
  connectors: GroupedConnector[];
  /**
   * Connects the wallet on the selected network.
   *
   * @param adapter - The selected network.
   * @param connectorType - Connector type of the wallet on that network (for example `evm:metamask`).
   * @returns Resolves when the connection attempt finishes.
   */
  onClick: (adapter: OrbitAdapter, connectorType: ConnectorType) => Promise<void>;
  /** Customization options */
  customization?: NetworkSelectionsCustomization;
}

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLDivElement, NetworkSelectionsContainerProps>(
  // eslint-disable-next-line
  ({ children, className, selectionsData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultTitle = forwardRef<HTMLHeadingElement, NetworkSelectionsTitleProps>(
  // eslint-disable-next-line
  ({ children, className, selectionsData, ...props }, ref) => (
    <h2 ref={ref} className={className} {...props}>
      {children}
    </h2>
  ),
);
DefaultTitle.displayName = 'DefaultTitle';

const DefaultNetworkList = forwardRef<HTMLDivElement, NetworkSelectionsNetworkListProps>(
  // eslint-disable-next-line
  ({ children, className, selectionsData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultNetworkList.displayName = 'DefaultNetworkList';

const DefaultNetworkItem = forwardRef<HTMLDivElement, NetworkSelectionsNetworkItemProps>(
  // eslint-disable-next-line
  ({ children, className, networkData, selectionsData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultNetworkItem.displayName = 'DefaultNetworkItem';

const DefaultNetworkIcon = forwardRef<HTMLDivElement, NetworkSelectionsNetworkIconProps>(
  // eslint-disable-next-line
  ({ children, className, networkData, selectionsData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultNetworkIcon.displayName = 'DefaultNetworkIcon';

const DefaultErrorContainer = forwardRef<HTMLDivElement, NetworkSelectionsErrorContainerProps>(
  // eslint-disable-next-line
  ({ children, className, selectionsData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultErrorContainer.displayName = 'DefaultErrorContainer';

const DefaultErrorIcon = forwardRef<HTMLDivElement, NetworkSelectionsErrorIconProps>(
  // eslint-disable-next-line
  ({ children, className, selectionsData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultErrorIcon.displayName = 'DefaultErrorIcon';

const DefaultErrorTitle = forwardRef<HTMLHeadingElement, NetworkSelectionsErrorTitleProps>(
  // eslint-disable-next-line
  ({ children, className, selectionsData, ...props }, ref) => (
    <h2 ref={ref} className={className} {...props}>
      {children}
    </h2>
  ),
);
DefaultErrorTitle.displayName = 'DefaultErrorTitle';

const DefaultErrorMessage = forwardRef<HTMLParagraphElement, NetworkSelectionsErrorMessageProps>(
  // eslint-disable-next-line
  ({ children, className, selectionsData, ...props }, ref) => (
    <p ref={ref} className={className} {...props}>
      {children}
    </p>
  ),
);
DefaultErrorMessage.displayName = 'DefaultErrorMessage';

/**
 * The network choice of the connect modal for a wallet that supports several networks: a card for each network of
 * the active wallet (a horizontal list on touch devices) and a disclaimer about networks with links to
 * `academy.binance.com` and `alchemy.com`. Shows an error when `connectors` has no wallet matching `activeConnector`.
 *
 * Props: {@link NetworkSelectionsProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { getFilteredConnectors } from '@tuwaio/nova-connect';
 * import { NetworkSelections } from '@tuwaio/nova-connect/components';
 * import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 *
 * export function MetaMaskNetworks() {
 *   const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);
 *   const connect = useSatelliteConnectStore((store) => store.connect);
 *
 *   return (
 *     <NetworkSelections
 *       activeConnector="metamask"
 *       connectors={getFilteredConnectors({ connectors: getConnectors() })}
 *       onClick={(adapter, connectorType) =>
 *         connect({ connectorType, chainId: adapter === OrbitAdapter.EVM ? 1 : 'solana:devnet' })
 *       }
 *       customization={{
 *         classNames: {
 *           networkList: ({ selectionsData }) => (selectionsData.isTouch ? 'touch-list' : 'desktop-list'),
 *         },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const NetworkSelections = memo(
  forwardRef<HTMLDivElement, NetworkSelectionsProps>(({ connectors, onClick, activeConnector, customization }, ref) => {
    const labels = useNovaConnectLabels();

    // Extract customization options
    const {
      Container: CustomContainer = DefaultContainer,
      Title: CustomTitle = DefaultTitle,
      NetworkList: CustomNetworkList = DefaultNetworkList,
      NetworkItem: CustomNetworkItem = DefaultNetworkItem,
      NetworkIcon: CustomNetworkIcon = DefaultNetworkIcon,
      ErrorContainer: CustomErrorContainer = DefaultErrorContainer,
      ErrorIcon: CustomErrorIcon = DefaultErrorIcon,
      ErrorTitle: CustomErrorTitle = DefaultErrorTitle,
      ErrorMessage: CustomErrorMessage = DefaultErrorMessage,
    } = customization?.components ?? {};

    const customHandlers = customization?.handlers;
    const customConfig = customization?.config;

    /**
     * Memoized touch device detection
     */
    const isTouch = isTouchDevice();

    /**
     * Memoized active connector configuration
     */
    const activeConnectors = connectors.find((connector) => formatConnectorName(connector.name) === activeConnector);

    const networks: NetworkSelectionsNetworkData[] = activeConnectors?.adapters
      ? activeConnectors.adapters.map((adapter, index) => {
          const networkInfo = getNetworkData(adapter);
          return {
            adapter,
            chainId: networkInfo?.chain?.chainId,
            name: networkInfo?.chain?.name ?? 'Ethereum',
            infoLink: networkInfo?.links.aboutNetwork,
            index,
          };
        })
      : [];

    /**
     * Memoized selections data
     */
    const selectionsData: NetworkSelectionsData = {
      activeConnector,
      connectors,
      isTouch,
      isError: !activeConnectors,
      networks,
    };

    /**
     * Memoized CSS classes
     */
    const touchListClasses = [
      'novacon:flex-row',
      'novacon:overflow-x-auto',
      'novacon:max-h-none',
      customConfig?.scroll?.gap?.touch ?? 'novacon:gap-3',
      'novacon:pb-4',
      'novacon:px-1',
    ];

    const mouseListClasses = [
      'novacon:flex-col',
      customConfig?.scroll?.mouseMaxHeight ?? 'novacon:max-h-[310px]',
      'novacon:overflow-y-auto',
      customConfig?.scroll?.gap?.mouse ?? 'novacon:gap-2',
    ];

    const cssClasses = {
      touchListClasses,
      mouseListClasses,
    };

    /**
     * Handle network selection click
     */
    const handleNetworkClick = useCallback(
      (network: OrbitAdapter) => {
        const networkData = networks.find((n) => n.adapter === network);
        if (!networkData || !activeConnector) return;

        const originalHandler = (selectedNetwork: OrbitAdapter) => {
          onClick(
            selectedNetwork,
            getConnectorTypeFromName(selectedNetwork, formatConnectorName(activeConnector)) as ConnectorType,
          );
        };

        if (customHandlers?.onNetworkClick) {
          customHandlers.onNetworkClick(networkData, selectionsData, originalHandler);
        } else {
          originalHandler(network);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [networks, activeConnector, onClick, customHandlers?.onNetworkClick, selectionsData],
    );

    // Error state when active connector is not found
    if (!activeConnectors) {
      return (
        <CustomErrorContainer
          ref={ref}
          className={
            customization?.classNames?.errorContainer?.({ selectionsData }) ??
            'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-8 novacon:text-center novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:rounded-[var(--tuwa-rounded-corners)] novacon:bg-[var(--tuwa-bg-secondary)] novacon:text-[var(--tuwa-text-secondary)]'
          }
          role="alert"
          aria-live="assertive"
          selectionsData={selectionsData}
        >
          <CustomErrorIcon
            className={
              customization?.classNames?.errorIcon?.({ selectionsData }) ??
              'novacon:text-[var(--tuwa-text-accent)] novacon:mb-3'
            }
            aria-hidden={true}
            selectionsData={selectionsData}
          >
            <ExclamationTriangleIcon width={32} height={32} />
          </CustomErrorIcon>
          <CustomErrorTitle
            className={
              customization?.classNames?.errorTitle?.({ selectionsData }) ??
              'novacon:text-lg novacon:font-semibold novacon:font-mono novacon:text-[var(--tuwa-text-primary)] novacon:mb-1'
            }
            role="heading"
            aria-level={2}
            selectionsData={selectionsData}
          >
            {labels.somethingWentWrong}
          </CustomErrorTitle>
          <CustomErrorMessage
            className={customization?.classNames?.errorMessage?.({ selectionsData }) ?? 'novacon:text-sm'}
            role="text"
            selectionsData={selectionsData}
          >
            {labels.networkPickingError}
          </CustomErrorMessage>
        </CustomErrorContainer>
      );
    }

    return (
      <CustomContainer
        ref={ref}
        className={
          customization?.classNames?.container?.({ selectionsData }) ??
          'novacon:flex novacon:flex-col novacon:gap-4 novacon:text-[var(--tuwa-text-primary)]'
        }
        role="region"
        aria-labelledby="network-selection-title"
        selectionsData={selectionsData}
      >
        <CustomTitle
          id="network-selection-title"
          className={customization?.classNames?.title?.({ selectionsData })}
          role="heading"
          aria-level={2}
          selectionsData={selectionsData}
        >
          {labels.selectAvailableNetwork}
        </CustomTitle>

        <CustomNetworkList
          className={
            customization?.classNames?.networkList?.({ selectionsData }) ??
            cn('novacon:flex NovaCustomScroll', isTouch ? cssClasses.touchListClasses : cssClasses.mouseListClasses)
          }
          role="list"
          aria-label={customConfig?.ariaLabels?.networkList?.(selectionsData) ?? labels.availableNetworks}
          selectionsData={selectionsData}
        >
          {networks.map((networkData) => (
            <CustomNetworkItem
              key={networkData.adapter}
              className={
                customization?.classNames?.networkItem?.({ networkData, selectionsData }) ??
                cn({ 'novacon:flex-shrink-0': isTouch })
              }
              role="listitem"
              networkData={networkData}
              selectionsData={selectionsData}
            >
              <ConnectCard
                icon={
                  <CustomNetworkIcon
                    className={customization?.classNames?.networkIcon?.({ networkData, selectionsData })}
                    role="img"
                    aria-label={
                      customConfig?.ariaLabels?.networkIcon?.(networkData) ??
                      formatLabel(labels.networkNameIcon, { name: networkData.name })
                    }
                    networkData={networkData}
                    selectionsData={selectionsData}
                  >
                    <NetworkIcon chainId={networkData.chainId ?? ''} />
                  </CustomNetworkIcon>
                }
                onClick={() => handleNetworkClick(networkData.adapter)}
                title={networkData.name}
                infoLink={networkData.infoLink}
                customization={customization?.connectCard}
              />
            </CustomNetworkItem>
          ))}
        </CustomNetworkList>

        <Disclaimer
          title={labels.whatIsNetwork}
          description={labels.networkDescription}
          learnMoreAction="https://academy.binance.com/en/articles/what-is-blockchain-and-how-does-it-work"
          listAction="https://www.alchemy.com/dapps/top/blockchains"
          customization={customization?.disclaimer}
        />
      </CustomContainer>
    );
  }),
);

NetworkSelections.displayName = 'NetworkSelections';
