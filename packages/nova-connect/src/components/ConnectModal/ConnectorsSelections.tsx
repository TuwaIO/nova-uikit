/**
 * @file ConnectorsSelections component with comprehensive customization options and categorized connector display.
 */

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn, isTouchDevice } from '@tuwaio/nova-core';
import { formatConnectorName, isInSecureIframe, OrbitAdapter } from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ConnectContentType, useNovaConnect, useNovaConnectLabels } from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { InitialChains } from '../../types';
import { WalletIcon } from '../WalletIcon';
import { ConnectCard, ConnectCardCustomization } from './ConnectCard';
import { GroupedConnector } from './ConnectModal';
import { ConnectorsBlock, ConnectorsBlockCustomization } from './ConnectorsBlock';
import { Disclaimer, DisclaimerCustomization } from './Disclaimer';

// --- Types ---

/**
 * State of {@link ConnectorsSelections}, passed to its custom components, class name generators and handlers.
 */
export interface ConnectorsSelectionsData {
  /** Currently selected network adapter */
  selectedAdapter: OrbitAdapter | undefined;
  /** All available connectors */
  connectors: GroupedConnector[];
  /** Whether only one network is available */
  isOnlyOneNetwork: boolean;
  /** Whether the device has a touch screen */
  isTouch: boolean;
  /** Whether `connectors` has the impersonated wallet */
  hasImpersonatedConnector: boolean;
  /** Whether the impersonated wallet is available and `withImpersonated` of `NovaConnectProvider` is set */
  showImpersonated: boolean;
  /** The wallets by group */
  connectorGroups: {
    /** Wallets that are not popular, impersonated or in a custom group (Safe only inside Safe{Wallet}) */
    installed: GroupedConnector[];
    /** Wallets of `popularConnectors` of `NovaConnectProvider`, in that order */
    popular: GroupedConnector[];
    /** The impersonated wallet */
    impersonated?: GroupedConnector;
    /** Wallets of each group of `customConnectorGroups` of `NovaConnectProvider`, by group title */
    [key: string]: GroupedConnector[] | GroupedConnector | undefined;
  };
  /** Current labels from i18n */
  labels: ReturnType<typeof useNovaConnectLabels>;
}

/**
 * The impersonated wallet section of {@link ConnectorsSelections}.
 */
export interface ImpersonateSectionData {
  /** The impersonated wallet connector */
  connector: GroupedConnector;
  /** Whether the device has a touch screen */
  isTouch: boolean;
  /** Current labels from i18n */
  labels: ReturnType<typeof useNovaConnectLabels>;
  /** State of the wallet list */
  sectionsData: ConnectorsSelectionsData;
}

// --- Component Props Types ---
/**
 * Props for a custom container.
 */
export type ConnectorsSelectionsContainerProps = {
  /** Classes from `classNames.container` or the defaults */
  className?: string;
  /** The content wrapper and, on touch devices, the disclaimer */
  children: React.ReactNode;
  /** `region` */
  role?: string;
  /** `config.ariaLabels.container` or the `connectWallet` label */
  'aria-label'?: string;
  /** State of the wallet list */
  selectionsData: ConnectorsSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom content wrapper (the wallet groups and the impersonation section).
 */
export type ConnectorsSelectionsContentWrapperProps = {
  /** Classes from `classNames.contentWrapper`, or the `config.layout` content classes */
  className?: string;
  /** The connectors area and the impersonation section */
  children: React.ReactNode;
  /** State of the wallet list */
  selectionsData: ConnectorsSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom connectors area (the scrollable wallet groups).
 */
export type ConnectorsSelectionsConnectorsAreaProps = {
  /** Classes from `classNames.connectorsArea`, or the defaults with the `config.layout` connectors classes */
  className?: string;
  /** The installed, custom and popular wallet groups */
  children: React.ReactNode;
  /** `region` */
  role?: string;
  /** `config.ariaLabels.connectorsArea` or the `availableWalletConnectors` label */
  'aria-label'?: string;
  /** State of the wallet list */
  selectionsData: ConnectorsSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom impersonation section.
 */
export type ConnectorsSelectionsImpersonateSectionProps = {
  /** Classes from `classNames.impersonateSection` or the defaults */
  className?: string;
  /** The title and the impersonated wallet card */
  children: React.ReactNode;
  /** `region` */
  role?: string;
  /** `config.ariaLabels.impersonateSection` or the `impersonate` label */
  'aria-label'?: string;
  /** The impersonation section */
  impersonateData: ImpersonateSectionData;
  /** State of the wallet list */
  selectionsData: ConnectorsSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom title of the impersonation section (visible on touch devices only by default).
 */
export type ConnectorsSelectionsImpersonateTitleProps = {
  /** Classes from `classNames.impersonateTitle` or the defaults */
  className?: string;
  /** The `impersonate` label */
  children: React.ReactNode;
  /** The impersonation section */
  impersonateData: ImpersonateSectionData;
  /** State of the wallet list */
  selectionsData: ConnectorsSelectionsData;
} & React.RefAttributes<HTMLParagraphElement>;

/**
 * Props for a custom empty state (shown when the selected network has no wallets).
 */
export type ConnectorsSelectionsEmptyStateProps = {
  /** Classes from `classNames.emptyState` or the defaults */
  className?: string;
  /** A warning icon, the `noConnectorsFound` title and the `noConnectorsDescription` text */
  children: React.ReactNode;
  /** `alert` */
  role?: string;
  /** `polite` */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Calls `handlers.onEmptyStateAction`, when set */
  onClick?: () => void;
  /** State of the wallet list */
  selectionsData: ConnectorsSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom wrapper of the wallet disclaimer (touch devices).
 */
export type ConnectorsSelectionsDisclaimerSectionProps = {
  /** Classes from `classNames.disclaimerSection` (none by default) */
  className?: string;
  /** The `Disclaimer` */
  children: React.ReactNode;
  /** State of the wallet list */
  selectionsData: ConnectorsSelectionsData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization options of {@link ConnectorsSelections}.
 */
export type ConnectorsSelectionsCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ConnectorsSelectionsContainerProps>;
    /** Custom content wrapper */
    ContentWrapper?: ComponentType<ConnectorsSelectionsContentWrapperProps>;
    /** Custom connectors area wrapper */
    ConnectorsArea?: ComponentType<ConnectorsSelectionsConnectorsAreaProps>;
    /** Custom impersonate section */
    ImpersonateSection?: ComponentType<ConnectorsSelectionsImpersonateSectionProps>;
    /** Custom impersonate title */
    ImpersonateTitle?: ComponentType<ConnectorsSelectionsImpersonateTitleProps>;
    /** Custom empty state */
    EmptyState?: ComponentType<ConnectorsSelectionsEmptyStateProps>;
    /** Custom disclaimer section wrapper */
    DisclaimerSection?: ComponentType<ConnectorsSelectionsDisclaimerSectionProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the wallet list.
     * @returns The classes.
     */
    container?: (params: { selectionsData: ConnectorsSelectionsData }) => string;
    /**
     * Returns the classes of the content wrapper, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the wallet list.
     * @returns The classes.
     */
    contentWrapper?: (params: { selectionsData: ConnectorsSelectionsData }) => string;
    /**
     * Returns the classes of the connectors area, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the wallet list.
     * @returns The classes.
     */
    connectorsArea?: (params: { selectionsData: ConnectorsSelectionsData }) => string;
    /**
     * Returns the classes of the impersonation section, instead of the default ones.
     *
     * @param params - The impersonation section.
     * @param params.impersonateData - The impersonation section.
     * @param params.selectionsData - State of the wallet list.
     * @returns The classes.
     */
    impersonateSection?: (params: {
      impersonateData: ImpersonateSectionData;
      selectionsData: ConnectorsSelectionsData;
    }) => string;
    /**
     * Returns the classes of the impersonation title, instead of the default ones.
     *
     * @param params - The impersonation section.
     * @param params.impersonateData - The impersonation section.
     * @param params.selectionsData - State of the wallet list.
     * @returns The classes.
     */
    impersonateTitle?: (params: {
      impersonateData: ImpersonateSectionData;
      selectionsData: ConnectorsSelectionsData;
    }) => string;
    /**
     * Returns the classes of the empty state, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the wallet list.
     * @returns The classes.
     */
    emptyState?: (params: { selectionsData: ConnectorsSelectionsData }) => string;
    /**
     * Returns the classes of the disclaimer wrapper, instead of the default ones.
     *
     * @param params - The selection.
     * @param params.selectionsData - State of the wallet list.
     * @returns The classes.
     */
    disclaimerSection?: (params: { selectionsData: ConnectorsSelectionsData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click on the impersonated wallet card: call `originalHandler()` to run the `onClick` prop with it.
     *
     * @param impersonateData - The impersonation section.
     * @param selectionsData - State of the wallet list.
     * @param originalHandler - Runs the `onClick` prop with the impersonated wallet.
     */
    onImpersonateClick?: (
      impersonateData: ImpersonateSectionData,
      selectionsData: ConnectorsSelectionsData,
      originalHandler: () => void,
    ) => void;
    /**
     * Called when the empty state is clicked.
     *
     * @param selectionsData - State of the wallet list.
     */
    onEmptyStateAction?: (selectionsData: ConnectorsSelectionsData) => void;
    /**
     * Wraps "Learn more" of the wallet disclaimer: call `originalHandler()` to show the "About wallets" screen.
     *
     * @param selectionsData - State of the wallet list.
     * @param originalHandler - Shows the "About wallets" screen.
     */
    onDisclaimerLearnMore?: (selectionsData: ConnectorsSelectionsData, originalHandler: () => void) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /**
       * Returns the ARIA label of the container (default: the `connectWallet` label).
       *
       * @param selectionsData - State of the wallet list.
       * @returns The label.
       */
      container?: (selectionsData: ConnectorsSelectionsData) => string;
      /**
       * Returns the ARIA label of the connectors area (default: the `availableWalletConnectors` label).
       *
       * @param selectionsData - State of the wallet list.
       * @returns The label.
       */
      connectorsArea?: (selectionsData: ConnectorsSelectionsData) => string;
      /**
       * Returns the ARIA label of the impersonation section (default: the `impersonate` label).
       *
       * @param impersonateData - The impersonation section.
       * @returns The label.
       */
      impersonateSection?: (impersonateData: ImpersonateSectionData) => string;
    };
    /** Layout configuration */
    layout?: {
      /** Touch device classes for connectors area */
      touchConnectorsClasses?: string[];
      /** Mouse device classes for connectors area */
      mouseConnectorsClasses?: string[];
      /** Touch device classes for content wrapper */
      touchContentClasses?: string[];
      /** Mouse device classes for content wrapper */
      mouseContentClasses?: string[];
    };
    /** Show/hide features */
    features?: {
      /** Whether to show the empty state; `false` renders nothing (default: `true`) */
      showEmptyState?: boolean;
      /** Whether to show the wallet disclaimer on touch devices (default: `true`) */
      showDisclaimer?: boolean;
      /** Whether to show the impersonation section when it is available (default: `true`) */
      showImpersonate?: boolean;
    };
  };
  /** ConnectorsBlock customization for each connector block */
  connectorsBlock?: {
    /** Customization for installed connectors block */
    installed?: ConnectorsBlockCustomization;
    /** Customization for the popular connectors block and the blocks of custom groups */
    popular?: ConnectorsBlockCustomization;
  };
  /** ConnectCard customization for impersonate card */
  impersonateCard?: ConnectCardCustomization;
  /** Disclaimer customization */
  disclaimer?: DisclaimerCustomization;
};

/**
 * Props for the {@link ConnectorsSelections} component. `appChains` and `solanaRPCUrls` choose the chain a wallet
 * connects to.
 */
export interface ConnectorsSelectionsProps extends InitialChains {
  /** Currently selected network adapter */
  selectedAdapter: OrbitAdapter | undefined;
  /** Wallets of the selected network (all wallets without one) */
  connectors: GroupedConnector[];
  /**
   * Called when a wallet card is clicked, before a single-network wallet connects (the connect modal shows the
   * connection screen or the network choice).
   *
   * @param connector - The clicked wallet.
   */
  onClick: (connector: GroupedConnector) => void;
  /**
   * Sets the "just connected" state of the modal: `true` after the wallet connects, `false` 500 ms later.
   *
   * @param value - The state.
   */
  setIsConnected: (value: boolean) => void;
  /**
   * Opens or closes the modal (closes it 400 ms after the wallet connects).
   *
   * @param value - Whether the modal is open.
   */
  setIsOpen: (value: boolean) => void;
  /**
   * Changes the screen of the connect modal (the disclaimer uses it to show "About wallets").
   *
   * @param contentType - The screen.
   */
  setContentType: (contentType: ConnectContentType) => void;
  /** Whether only one network is available */
  isOnlyOneNetwork?: boolean;
  /** Customization options */
  customization?: ConnectorsSelectionsCustomization;
}

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLDivElement, ConnectorsSelectionsContainerProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { selectionsData: _selectionsData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultContentWrapper = forwardRef<HTMLDivElement, ConnectorsSelectionsContentWrapperProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { selectionsData: _selectionsData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultContentWrapper.displayName = 'DefaultContentWrapper';

const DefaultConnectorsArea = forwardRef<HTMLDivElement, ConnectorsSelectionsConnectorsAreaProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { selectionsData: _selectionsData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultConnectorsArea.displayName = 'DefaultConnectorsArea';

const DefaultImpersonateSection = forwardRef<HTMLDivElement, ConnectorsSelectionsImpersonateSectionProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { impersonateData: _impersonateData, selectionsData: _selectionsData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultImpersonateSection.displayName = 'DefaultImpersonateSection';

const DefaultImpersonateTitle = forwardRef<HTMLParagraphElement, ConnectorsSelectionsImpersonateTitleProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { impersonateData: _impersonateData, selectionsData: _selectionsData, ...restProps } = props;
    return (
      <p ref={ref} className={className} {...restProps}>
        {children}
      </p>
    );
  },
);
DefaultImpersonateTitle.displayName = 'DefaultImpersonateTitle';

const DefaultEmptyState = forwardRef<HTMLDivElement, ConnectorsSelectionsEmptyStateProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { selectionsData: _selectionsData, onClick, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps} onClick={onClick}>
        {children}
      </div>
    );
  },
);
DefaultEmptyState.displayName = 'DefaultEmptyState';

const DefaultDisclaimerSection = forwardRef<HTMLDivElement, ConnectorsSelectionsDisclaimerSectionProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { selectionsData: _selectionsData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultDisclaimerSection.displayName = 'DefaultDisclaimerSection';

function createCustomSort<T>(items: T[], getKey: (item: T) => string, desiredOrder: string[]): T[] {
  return [...items].sort((a, b) => {
    const keyA = getKey(a);
    const keyB = getKey(b);
    const indexA = desiredOrder.indexOf(keyA);
    const indexB = desiredOrder.indexOf(keyB);

    const priorityA = indexA === -1 ? Infinity : indexA;
    const priorityB = indexB === -1 ? Infinity : indexB;

    return priorityA !== priorityB ? priorityA - priorityB : keyA.localeCompare(keyB);
  });
}

/**
 * The wallet list of the connect modal: installed wallets, the groups of `customConnectorGroups`, popular wallets
 * (`popularConnectors` of `NovaConnectProvider`, by default WalletConnect, Porto, Coinbase and Gemini) and, with
 * `withImpersonated`, the impersonated wallet. On touch devices the list scrolls horizontally and a wallet disclaimer
 * is shown. Clicking a wallet that works on one network (or on the selected one) connects it through `connect` of the
 * Satellite store.
 *
 * The Safe connector is listed only inside Safe{Wallet}, detected as in `initializeAutoConnect` of the Satellite store:
 * in an HTTPS iframe, on mount the component calls `getSafeConnectorChainId` of the EVM adapter (the Safe connector of
 * wagmi answers only inside a parent window with an allowed origin).
 *
 * Props: {@link ConnectorsSelectionsProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { getFilteredConnectors } from '@tuwaio/nova-connect';
 * import { ConnectorsSelections } from '@tuwaio/nova-connect/components';
 * import { useNovaConnect } from '@tuwaio/nova-connect/hooks';
 * import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 * import { mainnet } from 'viem/chains';
 *
 * export function EvmWallets() {
 *   const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);
 *   const { setIsConnected, setIsConnectModalOpen, setConnectModalContentType } = useNovaConnect();
 *
 *   return (
 *     <ConnectorsSelections
 *       selectedAdapter={OrbitAdapter.EVM}
 *       connectors={getFilteredConnectors({ connectors: getConnectors(), selectedAdapter: OrbitAdapter.EVM })}
 *       onClick={(connector) => console.log('selected', connector.name)}
 *       setIsConnected={setIsConnected}
 *       setIsOpen={setIsConnectModalOpen}
 *       setContentType={setConnectModalContentType}
 *       appChains={[mainnet]}
 *       customization={{
 *         classNames: {
 *           connectorsArea: ({ selectionsData }) => (selectionsData.isTouch ? 'horizontal-scroll' : 'vertical-stack'),
 *         },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const ConnectorsSelections = memo(
  forwardRef<HTMLDivElement, ConnectorsSelectionsProps>(
    (
      {
        setIsConnected,
        setIsOpen,
        selectedAdapter,
        connectors,
        onClick,
        appChains,
        solanaRPCUrls,
        setContentType,
        isOnlyOneNetwork = false,
        customization,
      },
      ref,
    ) => {
      const { withImpersonated, popularConnectors: popularConnectorsProp, customConnectorGroups } = useNovaConnect();

      // Extract customization options
      const {
        Container: CustomContainer = DefaultContainer,
        ContentWrapper: CustomContentWrapper = DefaultContentWrapper,
        ConnectorsArea: CustomConnectorsArea = DefaultConnectorsArea,
        ImpersonateSection: CustomImpersonateSection = DefaultImpersonateSection,
        ImpersonateTitle: CustomImpersonateTitle = DefaultImpersonateTitle,
        EmptyState: CustomEmptyState = DefaultEmptyState,
        DisclaimerSection: CustomDisclaimerSection = DefaultDisclaimerSection,
      } = customization?.components ?? {};

      const customHandlers = customization?.handlers;
      const customConfig = customization?.config;

      /**
       * Memoized labels and touch detection
       */
      const labels = useNovaConnectLabels();
      const isTouch = useMemo(() => isTouchDevice(), []);

      /**
       * Safe App detection state
       */
      const [isSafeVisible, setIsSafeVisible] = useState(false);

      const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);

      useEffect(() => {
        const evmAdapter = getAdapter(OrbitAdapter.EVM);
        if (!isInSecureIframe || evmAdapter?.key !== OrbitAdapter.EVM || !evmAdapter.getSafeConnectorChainId) return;

        let isMounted = true;
        evmAdapter
          .getSafeConnectorChainId()
          .then((chainId) => {
            if (isMounted) setIsSafeVisible(chainId !== undefined);
          })
          .catch(() => {
            // Outside Safe{Wallet} the Safe connector has no provider
          });
        return () => {
          isMounted = false;
        };
      }, [getAdapter]);

      /**
       * Memoized connector filtering
       */
      /**
       * Connector filtering
       */
      const connectorGroups = useMemo((): Pick<ConnectorsSelectionsData, 'connectorGroups'>['connectorGroups'] => {
        const popularDesiredOrderRaw = popularConnectorsProp || ['walletconnect', 'porto', 'coinbase', 'geminiwallet'];
        const popularDesiredOrder = popularDesiredOrderRaw.map((name) => formatConnectorName(name));

        const customGroupsKeys = customConnectorGroups ? Object.keys(customConnectorGroups) : [];
        const customGroupsConnectorsNamesRaw = customConnectorGroups ? Object.values(customConnectorGroups).flat() : [];
        const customGroupsConnectorsNames = customGroupsConnectorsNamesRaw.map((name) => formatConnectorName(name));

        const installedConnectorsInitial = connectors.filter((group) => {
          const formattedName = formatConnectorName(group.name);
          return (
            formattedName !== 'impersonatedwallet' &&
            !popularDesiredOrder.includes(formattedName) &&
            !customGroupsConnectorsNames.includes(formattedName)
          );
        });

        const installedConnectors = isSafeVisible
          ? installedConnectorsInitial
          : installedConnectorsInitial.filter((group) => formatConnectorName(group.name) !== 'safe');

        const popularConnectors = connectors.filter((group) => {
          const formattedName = formatConnectorName(group.name);
          return popularDesiredOrder.includes(formattedName);
        });

        const impersonatedConnector = connectors.find(
          (group) => formatConnectorName(group.name) === 'impersonatedwallet',
        );

        const customGroups: Record<string, GroupedConnector[]> = {};
        if (customConnectorGroups) {
          customGroupsKeys.forEach((key) => {
            const desiredOrderRaw = customConnectorGroups[key];
            const desiredOrder = desiredOrderRaw.map((name) => formatConnectorName(name));

            const groupConnectors = connectors.filter((group) => {
              const formattedName = formatConnectorName(group.name);
              return desiredOrder.includes(formattedName);
            });
            customGroups[key] = createCustomSort(
              groupConnectors,
              (connector) => formatConnectorName(connector.name),
              desiredOrder,
            );
          });
        }

        return {
          installed: installedConnectors,
          popular: createCustomSort(
            popularConnectors,
            (connector) => formatConnectorName(connector.name),
            popularDesiredOrder,
          ),
          impersonated: impersonatedConnector,
          ...customGroups,
        };
      }, [connectors, popularConnectorsProp, customConnectorGroups, isSafeVisible]);

      /**
       * Memoized selections data
       */
      /**
       * Selections data
       */
      const selectionsData: ConnectorsSelectionsData = {
        selectedAdapter,
        connectors,
        isOnlyOneNetwork,
        isTouch,
        hasImpersonatedConnector: Boolean(connectorGroups.impersonated),
        showImpersonated: Boolean(connectorGroups.impersonated && withImpersonated),
        connectorGroups,
        labels,
      };

      /**
       * Memoized impersonate section data
       */
      /**
       * Impersonate section data
       */
      const impersonateData = ((): ImpersonateSectionData | undefined => {
        if (!connectorGroups.impersonated) return undefined;

        return {
          connector: connectorGroups.impersonated,
          isTouch,
          labels,
          sectionsData: selectionsData,
        };
      })();

      /**
       * Memoized layout classes
       */
      /**
       * Layout classes
       */
      const layoutClasses = (() => {
        const touchConnectorsClasses = customConfig?.layout?.touchConnectorsClasses ?? [
          'novacon:flex-row',
          'novacon:overflow-x-auto',
          'novacon:max-h-none',
          'novacon:gap-3',
          'novacon:pb-4',
          'novacon:px-1',
        ];

        const mouseConnectorsClasses = customConfig?.layout?.mouseConnectorsClasses ?? [
          'novacon:flex-col',
          'novacon:overflow-y-auto',
          'novacon:max-h-[310px]',
          'novacon:gap-2',
        ];

        const touchContentClasses = customConfig?.layout?.touchContentClasses ?? [
          'novacon:flex',
          'novacon:flex-col',
          'novacon:gap-2',
          'novacon:flex-row',
        ];

        const mouseContentClasses = customConfig?.layout?.mouseContentClasses ?? [
          'novacon:flex',
          'novacon:flex-col',
          'novacon:gap-2',
        ];

        return {
          touchConnectorsClasses,
          mouseConnectorsClasses,
          touchContentClasses,
          mouseContentClasses,
        };
      })();

      /**
       * Handles click on impersonated wallet option
       */
      const handleImpersonateClick = useCallback(() => {
        if (!connectorGroups.impersonated) return;
        onClick(connectorGroups.impersonated);
      }, [connectorGroups.impersonated, onClick]);

      /**
       * Wrapper for custom impersonate click handler
       */
      const handleImpersonateClickWrapper = useCallback(() => {
        if (!impersonateData) return;

        if (customHandlers?.onImpersonateClick) {
          customHandlers.onImpersonateClick(impersonateData, selectionsData, handleImpersonateClick);
        } else {
          handleImpersonateClick();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [customHandlers?.onImpersonateClick, impersonateData, selectionsData, handleImpersonateClick]);

      /**
       * Handler for disclaimer learn more action
       */
      const handleDisclaimerLearnMore = useCallback(() => {
        const originalHandler = () => setContentType('about');

        if (customHandlers?.onDisclaimerLearnMore) {
          customHandlers.onDisclaimerLearnMore(selectionsData, originalHandler);
        } else {
          originalHandler();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [customHandlers?.onDisclaimerLearnMore, selectionsData, setContentType]);

      /**
       * Memoized CSS classes
       */
      /**
       * CSS classes
       */
      const cssClasses = {
        container:
          customization?.classNames?.container?.({ selectionsData }) ?? 'novacon:flex novacon:flex-col novacon:gap-4',

        contentWrapper:
          customization?.classNames?.contentWrapper?.({ selectionsData }) ??
          cn(isTouch ? layoutClasses.touchContentClasses : layoutClasses.mouseContentClasses),

        connectorsArea:
          customization?.classNames?.connectorsArea?.({ selectionsData }) ??
          cn(
            'novacon:flex NovaCustomScroll',
            isTouch ? layoutClasses.touchConnectorsClasses : layoutClasses.mouseConnectorsClasses,
          ),

        impersonateSection:
          (impersonateData && customization?.classNames?.impersonateSection?.({ impersonateData, selectionsData })) ??
          cn({ 'novacon:flex novacon:flex-col novacon:gap-2': isTouch }),

        impersonateTitle:
          (impersonateData && customization?.classNames?.impersonateTitle?.({ impersonateData, selectionsData })) ??
          cn('novacon:text-sm novacon:font-mono novacon:hidden', {
            'novacon:block novacon:opacity-0': isTouch,
          }),

        emptyState:
          customization?.classNames?.emptyState?.({ selectionsData }) ??
          'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-8 novacon:text-center novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:rounded-[var(--tuwa-rounded-corners)] novacon:bg-[var(--tuwa-bg-secondary)] novacon:text-[var(--tuwa-text-secondary)]',

        disclaimerSection: customization?.classNames?.disclaimerSection?.({ selectionsData }) ?? '',
      };

      // Early return for empty state
      if (selectedAdapter && !connectors?.length) {
        if (customConfig?.features?.showEmptyState === false) {
          return null;
        }

        return (
          <CustomEmptyState
            ref={ref}
            className={cssClasses.emptyState}
            role="alert"
            aria-live="polite"
            selectionsData={selectionsData}
            onClick={
              customHandlers?.onEmptyStateAction ? () => customHandlers.onEmptyStateAction!(selectionsData) : undefined
            }
          >
            <ExclamationTriangleIcon
              width={32}
              height={32}
              className="novacon:text-[var(--tuwa-text-accent)] novacon:mb-3"
              aria-hidden="true"
            />
            <h2 className="novacon:text-lg novacon:font-semibold novacon:font-mono novacon:text-[var(--tuwa-text-primary)] novacon:mb-1">
              {labels.noConnectorsFound}
            </h2>
            <p className="novacon:text-sm">{labels.noConnectorsDescription}</p>
          </CustomEmptyState>
        );
      }

      const containerAriaLabel = customConfig?.ariaLabels?.container?.(selectionsData) ?? labels.connectWallet;
      const connectorsAreaAriaLabel =
        customConfig?.ariaLabels?.connectorsArea?.(selectionsData) ?? labels.availableWalletConnectors;
      const impersonateAriaLabel =
        (impersonateData && customConfig?.ariaLabels?.impersonateSection?.(impersonateData)) ?? labels.impersonate;

      return (
        <CustomContainer
          ref={ref}
          className={cssClasses.container}
          role="region"
          aria-label={containerAriaLabel}
          selectionsData={selectionsData}
        >
          <CustomContentWrapper className={cssClasses.contentWrapper} selectionsData={selectionsData}>
            <CustomConnectorsArea
              className={cssClasses.connectorsArea}
              role="region"
              aria-label={connectorsAreaAriaLabel}
              selectionsData={selectionsData}
            >
              <ConnectorsBlock
                connectors={connectorGroups.installed}
                title={labels.installed}
                selectedAdapter={selectedAdapter}
                onClick={onClick}
                solanaRPCUrls={solanaRPCUrls}
                setIsConnected={setIsConnected}
                setIsOpen={setIsOpen}
                appChains={appChains}
                isOnlyOneNetwork={isOnlyOneNetwork}
                isTitleBold
                customization={customization?.connectorsBlock?.installed}
              />

              {customConnectorGroups &&
                Object.keys(customConnectorGroups).map((key) => {
                  const groupConnectors = connectorGroups[key] as GroupedConnector[];
                  if (!groupConnectors || groupConnectors.length === 0) return null;

                  return (
                    <ConnectorsBlock
                      key={key}
                      connectors={groupConnectors}
                      title={key}
                      selectedAdapter={selectedAdapter}
                      onClick={onClick}
                      solanaRPCUrls={solanaRPCUrls}
                      setIsConnected={setIsConnected}
                      setIsOpen={setIsOpen}
                      appChains={appChains}
                      isOnlyOneNetwork={isOnlyOneNetwork}
                      customization={customization?.connectorsBlock?.popular}
                    />
                  );
                })}

              {!!connectorGroups.popular.length && (
                <ConnectorsBlock
                  connectors={connectorGroups.popular}
                  title={labels.popular}
                  selectedAdapter={selectedAdapter}
                  onClick={onClick}
                  solanaRPCUrls={solanaRPCUrls}
                  setIsConnected={setIsConnected}
                  setIsOpen={setIsOpen}
                  appChains={appChains}
                  isOnlyOneNetwork={isOnlyOneNetwork}
                  customization={customization?.connectorsBlock?.popular}
                />
              )}
            </CustomConnectorsArea>

            {selectionsData.showImpersonated &&
              impersonateData &&
              customConfig?.features?.showImpersonate !== false && (
                <CustomImpersonateSection
                  className={cssClasses.impersonateSection}
                  role="region"
                  aria-label={impersonateAriaLabel}
                  impersonateData={impersonateData}
                  selectionsData={selectionsData}
                >
                  <CustomImpersonateTitle
                    className={cssClasses.impersonateTitle}
                    impersonateData={impersonateData}
                    selectionsData={selectionsData}
                  >
                    {labels.impersonate}
                  </CustomImpersonateTitle>
                  <ConnectCard
                    icon={<WalletIcon name="impersonatedwallet" />}
                    adapters={!selectedAdapter ? [OrbitAdapter.EVM] : undefined}
                    onClick={handleImpersonateClickWrapper}
                    title={labels.impersonate}
                    subtitle={labels.readOnlyMode}
                    isOnlyOneNetwork={isOnlyOneNetwork}
                    customization={customization?.impersonateCard}
                  />
                </CustomImpersonateSection>
              )}
          </CustomContentWrapper>

          {isTouch && customConfig?.features?.showDisclaimer !== false && (
            <CustomDisclaimerSection className={cssClasses.disclaimerSection} selectionsData={selectionsData}>
              <Disclaimer
                title={labels.whatIsWallet}
                description={labels.walletDescription}
                learnMoreAction={handleDisclaimerLearnMore}
                customization={customization?.disclaimer}
              />
            </CustomDisclaimerSection>
          )}
        </CustomContainer>
      );
    },
  ),
);

ConnectorsSelections.displayName = 'ConnectorsSelections';
