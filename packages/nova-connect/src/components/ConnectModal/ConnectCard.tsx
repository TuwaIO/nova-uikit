/**
 * @file ConnectCard component with comprehensive customization options for wallet connection cards.
 */

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { cn, isTouchDevice, NetworkIcon } from '@tuwaio/nova-core';
import { getNetworkData, OrbitAdapter } from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, memo, useCallback } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
import { RecentBadge, RecentBadgeCustomization } from './RecentBadge';

// --- Types ---

/**
 * A network shown on a {@link ConnectCard}.
 */
export interface ConnectCardNetworkData {
  /** Network adapter */
  adapter: OrbitAdapter;
  /** Chain ID of the network icon (from `getNetworkData` of `@tuwaio/orbit-core`) */
  chainId?: number | string;
  /** Chain name in the network icons; the adapter (for example `'evm'`) in `ConnectCardData.visibleNetworks` */
  name?: string;
  /** Position of the network in the list */
  index: number;
}

/**
 * Data of a {@link ConnectCard}, passed to its custom components, class name generators and handlers.
 */
export interface ConnectCardData {
  /** The `title` prop */
  title: string;
  /** The `subtitle` prop */
  subtitle?: string;
  /** The `isRecent` prop */
  isRecent: boolean;
  /** Whether the device has a touch screen (`isTouchDevice` from `@tuwaio/nova-core`): the card is a square tile */
  isTouch: boolean;
  /** The `infoLink` prop */
  infoLink?: string;
  /** The `adapters` prop */
  adapters?: OrbitAdapter[];
  /** The `isOnlyOneNetwork` prop */
  isOnlyOneNetwork?: boolean;
  /** Number of adapters */
  networkCount: number;
  /** The first three adapters */
  visibleNetworks: ConnectCardNetworkData[];
  /** Number of adapters beyond the first three */
  overflowCount: number;
}

/**
 * Props for a custom container of the network icons.
 */
export type ConnectCardNetworkIconsContainerProps = {
  /** Classes from `classNames.container` or the defaults */
  className?: string;
  /** The network icons and the overflow indicator */
  children: React.ReactNode;
  /** `group` */
  role?: string;
  /** The `listOfNetworks` label */
  'aria-label'?: string;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom network icon.
 */
export type ConnectCardNetworkIconProps = {
  /** Classes from `classNames.networkIcon` or the defaults */
  className?: string;
  /** The `NetworkIcon` of the chain */
  children: React.ReactNode;
  /** `img` */
  role?: string;
  /** `Network <chain ID or adapter>` */
  'aria-label'?: string;
  /** The network */
  networkData: ConnectCardNetworkData;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom indicator of the networks beyond the first three.
 */
export type ConnectCardNetworkOverflowProps = {
  /** Classes from `classNames.overflowIndicator` or the defaults */
  className?: string;
  /** `+<overflowCount>` */
  children: React.ReactNode;
  /** `img` */
  role?: string;
  /** `<overflowCount> additional networks` */
  'aria-label'?: string;
  /** Number of networks beyond the first three */
  overflowCount: number;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization of the network icons of a {@link ConnectCard} (shown when the connector supports more than one
 * network).
 */
export type NetworkIconsCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ConnectCardNetworkIconsContainerProps>;
    /** Custom network icon */
    NetworkIcon?: ComponentType<ConnectCardNetworkIconProps>;
    /** Custom overflow indicator */
    OverflowIndicator?: ComponentType<ConnectCardNetworkOverflowProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    container?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of a network icon, instead of the default ones.
     *
     * @param params - The network.
     * @param params.networkData - The network.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    networkIcon?: (params: { networkData: ConnectCardNetworkData; cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the overflow indicator, instead of the default ones.
     *
     * @param params - The indicator.
     * @param params.overflowCount - Number of networks beyond the first three.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    overflowIndicator?: (params: { overflowCount: number; cardData: ConnectCardData }) => string;
  };
};

/**
 * Props for the NetworkIcons component
 */
interface NetworkIconsProps {
  /** Array of network adapters to display as icons */
  adapters?: OrbitAdapter[];
  /** Whether only one network is available */
  isOnlyOneNetwork?: boolean;
  /** Card data for context */
  cardData: ConnectCardData;
  /** Customization options */
  customization?: NetworkIconsCustomization;
}

/**
 * Props for a custom card container (a `button` by default).
 */
export type ConnectCardContainerProps = {
  /** Classes from `classNames.container`, or the defaults with the `className` prop */
  className?: string;
  /** The card content, info link, recent badge and chevron */
  children: React.ReactNode;
  /** `button` */
  type?: 'button';
  /** Runs `handlers.onClick` or the `onClick` prop */
  onClick?: () => void;
  /** From `config.ariaLabels.card`, or the connect label with the title, subtitle and number of networks */
  'aria-label'?: string;
  /** ID of the subtitle, when there is one */
  'aria-describedby'?: string;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLButtonElement>;

/**
 * Props for a custom card content (icon and text).
 */
export type ConnectCardContentProps = {
  /** Classes from `classNames.content` or the defaults */
  className?: string;
  /** The icon container and the text container */
  children: React.ReactNode;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom icon container (the wallet icon and the network icons).
 */
export type ConnectCardIconContainerProps = {
  /** Classes from `classNames.iconContainer` or the defaults */
  className?: string;
  /** The icon wrapper and the network icons */
  children: React.ReactNode;
  /** `img` */
  role?: string;
  /** From `config.ariaLabels.icon`, or the title with the `walletIcon` label */
  'aria-label'?: string;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom wrapper of the wallet icon.
 */
export type ConnectCardIconWrapperProps = {
  /** Classes from `classNames.iconWrapper` or the defaults */
  className?: string;
  /** The `icon` prop */
  children: React.ReactNode;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom text container (title and subtitle).
 */
export type ConnectCardTextContainerProps = {
  /** Classes from `classNames.textContainer` or the defaults */
  className?: string;
  /** The title and the subtitle */
  children: React.ReactNode;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom title.
 */
export type ConnectCardTitleProps = {
  /** Classes from `classNames.title` or the defaults */
  className?: string;
  /** The `title` prop */
  children: React.ReactNode;
  /** `heading` */
  role?: string;
  /** `3` */
  'aria-level'?: number;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLSpanElement>;

/**
 * Props for a custom subtitle (rendered when the `subtitle` prop is set).
 */
export type ConnectCardSubtitleProps = {
  /** Classes from `classNames.subtitle` or the defaults */
  className?: string;
  /** The `subtitle` prop */
  children: React.ReactNode;
  /** `<title>-subtitle`, referenced by `aria-describedby` of the card */
  id?: string;
  /** `text` */
  role?: string;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLSpanElement>;

/**
 * Props for a custom info link (rendered when the `infoLink` prop is set).
 */
export type ConnectCardInfoLinkProps = {
  /** Classes from `classNames.infoLink` or the defaults */
  className?: string;
  /** The information icon */
  children: React.ReactNode;
  /**
   * Stops the click from reaching the card and calls `handlers.onInfoClick`.
   *
   * @param e - The click event.
   */
  onClick?: (e: React.MouseEvent) => void;
  /** The `infoLink` prop */
  href?: string;
  /** `_blank` */
  target?: string;
  /** `noopener noreferrer` */
  rel?: string;
  /** From `config.ariaLabels.infoLink`, or the `learnMore` and `aboutWallets` labels with the title */
  'aria-label'?: string;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLAnchorElement>;

/**
 * Props for a custom wrapper of the recent badge (rendered when the `isRecent` prop is `true`).
 */
export type ConnectCardRecentBadgeWrapperProps = {
  /** Classes from `classNames.recentBadgeWrapper` or the defaults */
  className?: string;
  /** The `RecentBadge` */
  children: React.ReactNode;
  /** From `config.ariaLabels.recentBadge`, or the title with the `recent` label */
  'aria-label'?: string;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom chevron (rendered on devices without a touch screen).
 */
export type ConnectCardChevronProps = {
  /** Classes from `classNames.chevron` or the defaults */
  className?: string;
  /** The chevron icon */
  children: React.ReactNode;
  /** `true` */
  'aria-hidden'?: boolean;
  /** Data of the card */
  cardData: ConnectCardData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization options of {@link ConnectCard}.
 */
export type ConnectCardCustomization = {
  /** Custom components */
  components?: {
    /** Custom card container */
    Container?: ComponentType<ConnectCardContainerProps>;
    /** Custom card content */
    Content?: ComponentType<ConnectCardContentProps>;
    /** Custom icon container */
    IconContainer?: ComponentType<ConnectCardIconContainerProps>;
    /** Custom icon wrapper */
    IconWrapper?: ComponentType<ConnectCardIconWrapperProps>;
    /** Custom text container */
    TextContainer?: ComponentType<ConnectCardTextContainerProps>;
    /** Custom title */
    Title?: ComponentType<ConnectCardTitleProps>;
    /** Custom subtitle */
    Subtitle?: ComponentType<ConnectCardSubtitleProps>;
    /** Custom info link */
    InfoLink?: ComponentType<ConnectCardInfoLinkProps>;
    /** Custom recent badge wrapper */
    RecentBadgeWrapper?: ComponentType<ConnectCardRecentBadgeWrapperProps>;
    /** Custom chevron */
    Chevron?: ComponentType<ConnectCardChevronProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the card container, instead of the default ones and the `className` prop.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    container?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the card content, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    content?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the icon container, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    iconContainer?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the icon wrapper, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    iconWrapper?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the text container, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    textContainer?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the title, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    title?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the subtitle, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    subtitle?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the info link, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    infoLink?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the recent badge wrapper, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    recentBadgeWrapper?: (params: { cardData: ConnectCardData }) => string;
    /**
     * Returns the classes of the chevron, instead of the default ones.
     *
     * @param params - The card.
     * @param params.cardData - Data of the card.
     * @returns The classes.
     */
    chevron?: (params: { cardData: ConnectCardData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click on the card: call `originalHandler()` to run the `onClick` prop.
     *
     * @param cardData - Data of the card.
     * @param originalHandler - The `onClick` prop.
     */
    onClick?: (cardData: ConnectCardData, originalHandler: () => void) => void;
    /**
     * Called when the info link is clicked, before the browser opens it in a new tab (call `event.preventDefault()`
     * to keep it closed). The click does not reach the card.
     *
     * @param cardData - Data of the card.
     * @param event - The click event.
     */
    onInfoClick?: (cardData: ConnectCardData, event: React.MouseEvent) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /**
       * Returns the ARIA label of the card.
       *
       * @param cardData - Data of the card.
       * @returns The label.
       */
      card?: (cardData: ConnectCardData) => string;
      /**
       * Returns the ARIA label of the icon container.
       *
       * @param cardData - Data of the card.
       * @returns The label.
       */
      icon?: (cardData: ConnectCardData) => string;
      /**
       * Returns the ARIA label of the info link.
       *
       * @param cardData - Data of the card.
       * @returns The label.
       */
      infoLink?: (cardData: ConnectCardData) => string;
      /**
       * Returns the ARIA label of the recent badge wrapper.
       *
       * @param cardData - Data of the card.
       * @returns The label.
       */
      recentBadge?: (cardData: ConnectCardData) => string;
    };
  };
  /** NetworkIcons customization */
  networkIcons?: NetworkIconsCustomization;
  /** RecentBadge customization */
  recentBadge?: RecentBadgeCustomization;
};

/**
 * Props for the {@link ConnectCard} component.
 */
export interface ConnectCardProps {
  /** Click handler for the connect card */
  onClick: () => void;
  /** Icon element to display for the wallet/connector */
  icon: React.ReactNode;
  /** Primary title/name of the wallet/connector */
  title: string;
  /** Optional subtitle/description text */
  subtitle?: string;
  /** Optional URL for additional information */
  infoLink?: string;
  /** Whether this connector was recently used */
  isRecent?: boolean;
  /** Array of network adapters to display as icons */
  adapters?: OrbitAdapter[];
  /** Whether only one network is available */
  isOnlyOneNetwork?: boolean;
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
  className?: string;
  /** Customization options */
  customization?: ConnectCardCustomization;
}

// --- Default NetworkIcons Sub-Components ---
const DefaultNetworkIconsContainer = forwardRef<HTMLDivElement, ConnectCardNetworkIconsContainerProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultNetworkIconsContainer.displayName = 'DefaultNetworkIconsContainer';

const DefaultNetworkIcon = forwardRef<HTMLDivElement, ConnectCardNetworkIconProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, networkData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultNetworkIcon.displayName = 'DefaultNetworkIcon';

const DefaultNetworkOverflow = forwardRef<HTMLDivElement, ConnectCardNetworkOverflowProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultNetworkOverflow.displayName = 'DefaultNetworkOverflow';

/**
 * Displays up to 3 network icons with an overflow indicator for additional networks.
 * Hidden when only one network is available or no adapters are provided.
 */
const NetworkIcons = memo(
  forwardRef<HTMLDivElement, NetworkIconsProps>(({ adapters, isOnlyOneNetwork, cardData, customization }, ref) => {
    const labels = useNovaConnectLabels();

    // Extract customization options
    const {
      Container: CustomContainer = DefaultNetworkIconsContainer,
      NetworkIcon: CustomNetworkIcon = DefaultNetworkIcon,
      OverflowIndicator: CustomOverflowIndicator = DefaultNetworkOverflow,
    } = customization?.components ?? {};

    /**
     * Generate visible networks data
     */
    /**
     * Generate visible networks data
     */
    const visibleNetworksData =
      adapters && adapters.length
        ? adapters.slice(0, 3).map((adapter, index): ConnectCardNetworkData => ({
            adapter,
            chainId: getNetworkData(adapter)?.chain?.chainId,
            name: getNetworkData(adapter)?.chain?.name,
            index,
          }))
        : [];

    const overflowCount = adapters?.length ? Math.max(0, adapters.length - 3) : 0;

    // Early returns
    if (!adapters?.length) return null;
    if (isOnlyOneNetwork) return null;

    return (
      <CustomContainer
        ref={ref}
        className={
          customization?.classNames?.container?.({ cardData }) ??
          cn(
            'novacon:absolute novacon:-bottom-1 novacon:-right-1 novacon:w-full novacon:flex novacon:items-center novacon:justify-end',
          )
        }
        role="group"
        aria-label={labels.listOfNetworks}
        cardData={cardData}
      >
        {visibleNetworksData.map((networkData) => (
          <CustomNetworkIcon
            key={networkData.adapter}
            className={
              customization?.classNames?.networkIcon?.({ networkData, cardData }) ??
              cn(
                'novacon:w-4 novacon:h-4 novacon:rounded-full novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-primary)] novacon:flex novacon:items-center novacon:justify-center',
                {
                  'novacon:-ml-2': networkData.index > 0,
                },
              )
            }
            role="img"
            aria-label={formatLabel(labels.networkIcon, { name: networkData.chainId || networkData.adapter })}
            networkData={networkData}
            cardData={cardData}
          >
            <NetworkIcon chainId={networkData.chainId ?? ''} />
          </CustomNetworkIcon>
        ))}
        {overflowCount > 0 && (
          <CustomOverflowIndicator
            className={
              customization?.classNames?.overflowIndicator?.({ overflowCount, cardData }) ??
              cn(
                'novacon:w-4 novacon:h-4 novacon:rounded-full novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-primary)] novacon:-ml-2 novacon:flex novacon:items-center novacon:justify-center novacon:text-[8px]',
              )
            }
            role="img"
            aria-label={formatLabel(labels.additionalNetworks, { count: overflowCount })}
            overflowCount={overflowCount}
            cardData={cardData}
          >
            +{overflowCount}
          </CustomOverflowIndicator>
        )}
      </CustomContainer>
    );
  }),
);
NetworkIcons.displayName = 'NetworkIcons';

// --- Default ConnectCard Sub-Components ---
const DefaultCardContainer = forwardRef<HTMLButtonElement, ConnectCardContainerProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  ),
);
DefaultCardContainer.displayName = 'DefaultCardContainer';

const DefaultCardContent = forwardRef<HTMLDivElement, ConnectCardContentProps>(
  // eslint-disable-next-line
  ({ children, className, cardData }, ref) => (
    <div ref={ref} className={className}>
      {children}
    </div>
  ),
);
DefaultCardContent.displayName = 'DefaultCardContent';

const DefaultIconContainer = forwardRef<HTMLDivElement, ConnectCardIconContainerProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultIconContainer.displayName = 'DefaultIconContainer';

const DefaultIconWrapper = forwardRef<HTMLDivElement, ConnectCardIconWrapperProps>(
  // eslint-disable-next-line
  ({ children, className, cardData }, ref) => (
    <div ref={ref} className={className}>
      {children}
    </div>
  ),
);
DefaultIconWrapper.displayName = 'DefaultIconWrapper';

const DefaultTextContainer = forwardRef<HTMLDivElement, ConnectCardTextContainerProps>(
  // eslint-disable-next-line
  ({ children, className, cardData }, ref) => (
    <div ref={ref} className={className}>
      {children}
    </div>
  ),
);
DefaultTextContainer.displayName = 'DefaultTextContainer';

const DefaultTitle = forwardRef<HTMLSpanElement, ConnectCardTitleProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>
      {children}
    </span>
  ),
);
DefaultTitle.displayName = 'DefaultTitle';

const DefaultSubtitle = forwardRef<HTMLSpanElement, ConnectCardSubtitleProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>
      {children}
    </span>
  ),
);
DefaultSubtitle.displayName = 'DefaultSubtitle';

const DefaultInfoLink = forwardRef<HTMLAnchorElement, ConnectCardInfoLinkProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <a ref={ref} className={className} {...props}>
      {children}
    </a>
  ),
);
DefaultInfoLink.displayName = 'DefaultInfoLink';

const DefaultRecentBadgeWrapper = forwardRef<HTMLDivElement, ConnectCardRecentBadgeWrapperProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultRecentBadgeWrapper.displayName = 'DefaultRecentBadgeWrapper';

const DefaultChevron = forwardRef<HTMLDivElement, ConnectCardChevronProps>(
  // eslint-disable-next-line
  ({ children, className, cardData, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultChevron.displayName = 'DefaultChevron';

/**
 * A clickable card of a wallet connector: icon, title, optional subtitle, network icons (when the connector supports
 * more than one network), a "Recent" badge, an info link and a chevron. On touch devices it is a square tile without
 * the chevron.
 *
 * Props: {@link ConnectCardProps}; the ref is forwarded to the card container.
 *
 * @example
 * ```tsx
 * import { ConnectCard } from '@tuwaio/nova-connect/components';
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 *
 * export const Card = (
 *   <ConnectCard
 *     onClick={() => console.log('connect')}
 *     title="MetaMask"
 *     subtitle="Browser Extension"
 *     icon={<img src="/metamask.svg" alt="" />}
 *     adapters={[OrbitAdapter.EVM, OrbitAdapter.SOLANA]}
 *     isRecent
 *     infoLink="https://metamask.io"
 *     customization={{
 *       classNames: {
 *         container: ({ cardData }) => (cardData.isTouch ? 'touch-card' : 'desktop-card'),
 *       },
 *       handlers: {
 *         onClick: (cardData, originalHandler) => {
 *           console.log('card clicked', cardData.title);
 *           originalHandler();
 *         },
 *       },
 *     }}
 *   />
 * );
 * ```
 */
export const ConnectCard = memo(
  forwardRef<HTMLButtonElement, ConnectCardProps>(
    (
      {
        onClick,
        title,
        icon,
        adapters,
        infoLink,
        subtitle,
        isRecent = false,
        isOnlyOneNetwork = false,
        className,
        customization,
      },
      ref,
    ) => {
      const labels = useNovaConnectLabels();

      // Extract customization options
      const {
        Container: CustomContainer = DefaultCardContainer,
        Content: CustomContent = DefaultCardContent,
        IconContainer: CustomIconContainer = DefaultIconContainer,
        IconWrapper: CustomIconWrapper = DefaultIconWrapper,
        TextContainer: CustomTextContainer = DefaultTextContainer,
        Title: CustomTitle = DefaultTitle,
        Subtitle: CustomSubtitle = DefaultSubtitle,
        InfoLink: CustomInfoLink = DefaultInfoLink,
        RecentBadgeWrapper: CustomRecentBadgeWrapper = DefaultRecentBadgeWrapper,
        Chevron: CustomChevron = DefaultChevron,
      } = customization?.components ?? {};

      const customHandlers = customization?.handlers;
      const customConfig = customization?.config;

      /**
       * Touch device detection
       */
      const isTouch = isTouchDevice();

      /**
       * Memoized network data calculations
       */
      /**
       * Network data calculations
       */
      const networkStats = (() => {
        const networkCount = adapters?.length || 0;
        const visibleNetworks =
          adapters?.slice(0, 3).map((adapter, index): ConnectCardNetworkData => ({
            adapter,
            chainId: getNetworkData(adapter)?.chain?.chainId,
            name: String(adapter),
            index,
          })) || [];
        const overflowCount = Math.max(0, networkCount - 3);

        return {
          networkCount,
          visibleNetworks,
          overflowCount,
        };
      })();

      /**
       * Connect card data
       */
      const cardData: ConnectCardData = {
        title,
        subtitle,
        isRecent,
        isTouch,
        infoLink,
        adapters,
        isOnlyOneNetwork,
        ...networkStats,
      };

      /**
       * Container classes
       */
      const containerClasses = customization?.classNames?.container
        ? customization.classNames.container({ cardData })
        : cn(
            'novacon:group novacon:cursor-pointer novacon:p-4 novacon:rounded-[var(--tuwa-rounded-corners)] novacon:transition-colors novacon:relative novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:disabled:opacity-50 novacon:disabled:cursor-not-allowed novacon:bg-[var(--tuwa-bg-secondary)] novacon:hover:bg-[var(--tuwa-bg-muted)]',
            className,
            'novacon:w-full novacon:h-auto',
            'novacon:flex novacon:items-center novacon:justify-between',
            {
              'novacon:w-[125px] novacon:h-[125px] novacon:p-2 novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:text-center':
                isTouch,
            },
          );

      /**
       * Aria label
       */
      const cardAriaLabel = customConfig?.ariaLabels?.card
        ? customConfig.ariaLabels.card(cardData)
        : `${labels.connect} ${title}${isRecent ? ` (${labels.recent})` : ''}${subtitle ? `, ${subtitle}` : ''}${adapters?.length ? `, supports ${adapters.length} networks` : ''}`;

      /**
       * Handle click with customization
       */
      const handleClick = useCallback(() => {
        if (customHandlers?.onClick) {
          customHandlers.onClick(cardData, onClick);
        } else {
          onClick();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [customHandlers?.onClick, cardData, onClick]);

      /**
       * Handle info link click
       */
      const handleInfoClick = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          if (customHandlers?.onInfoClick) {
            customHandlers.onInfoClick(cardData, e);
          }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [customHandlers?.onInfoClick, cardData],
      );

      return (
        <CustomContainer
          ref={ref}
          type="button"
          className={containerClasses}
          onClick={handleClick}
          aria-label={cardAriaLabel}
          aria-describedby={subtitle ? `${title}-subtitle` : undefined}
          cardData={cardData}
        >
          <CustomContent
            className={
              customization?.classNames?.content?.({ cardData }) ??
              cn(
                'novacon:flex novacon:gap-3 novacon:transition novacon:duration-300 novacon:ease-in-out novacon:text-[var(--tuwa-text-primary)] novacon:group-hover:text-[var(--tuwa-text-accent)] novacon:items-center',
                {
                  'novacon:flex-col novacon:items-center novacon:gap-1': isTouch,
                },
              )
            }
            cardData={cardData}
          >
            <CustomIconContainer
              className={
                customization?.classNames?.iconContainer?.({ cardData }) ??
                cn(
                  'novacon:flex novacon:relative novacon:transition novacon:duration-300 novacon:ease-in-out group-hover:novacon:scale-115',
                )
              }
              role="img"
              aria-label={
                customConfig?.ariaLabels?.icon
                  ? customConfig.ariaLabels.icon(cardData)
                  : `${title} ${labels.walletIcon}`
              }
              cardData={cardData}
            >
              <CustomIconWrapper
                className={
                  customization?.classNames?.iconWrapper?.({ cardData }) ??
                  cn(
                    'novacon:w-[42px] novacon:h-[42px] novacon:sm:w-[32px] novacon:sm:h-[32px] novacon:[&_img]:w-[42px]! novacon:[&_img]:h-[42px]! novacon:sm:[&_img]:w-[32px]! novacon:sm:[&_img]:h-[32px]! novacon:[&_svg]:w-[42px]! novacon:[&_svg]:h-[42px]! novacon:sm:[&_svg]:w-[32px]! novacon:sm:[&_svg]:h-[32px]! novacon:leading-[0]',
                  )
                }
                cardData={cardData}
              >
                {icon}
              </CustomIconWrapper>
              <NetworkIcons
                adapters={adapters}
                isOnlyOneNetwork={isOnlyOneNetwork}
                cardData={cardData}
                customization={customization?.networkIcons}
              />
            </CustomIconContainer>

            <CustomTextContainer
              className={
                customization?.classNames?.textContainer?.({ cardData }) ??
                cn('novacon:flex novacon:flex-col novacon:gap-0.5 novacon:items-start', {
                  'novacon:items-center novacon:text-sm': isTouch,
                })
              }
              cardData={cardData}
            >
              <CustomTitle
                className={customization?.classNames?.title?.({ cardData }) ?? cn({ 'novacon:font-medium': isTouch })}
                role="heading"
                aria-level={3}
                cardData={cardData}
              >
                {title}
              </CustomTitle>
              {subtitle && (
                <CustomSubtitle
                  className={
                    customization?.classNames?.subtitle?.({ cardData }) ??
                    cn('novacon:text-[var(--tuwa-text-secondary)] novacon:text-sm', {
                      'novacon:text-[10px]': isTouch,
                    })
                  }
                  id={`${title}-subtitle`}
                  role="text"
                  cardData={cardData}
                >
                  {subtitle}
                </CustomSubtitle>
              )}
            </CustomTextContainer>
          </CustomContent>

          {infoLink && (
            <CustomInfoLink
              className={
                customization?.classNames?.infoLink?.({ cardData }) ??
                cn(
                  'novacon:absolute novacon:top-[2px] novacon:right-[2px] novacon:text-[var(--tuwa-text-secondary)] novacon:transition novacon:duration-300 novacon:ease-in-out novacon:active:scale-75 novacon:hover:scale-110 novacon:group-hover:text-[var(--tuwa-text-primary)]',
                )
              }
              onClick={handleInfoClick}
              href={infoLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                customConfig?.ariaLabels?.infoLink
                  ? customConfig.ariaLabels.infoLink(cardData)
                  : `${labels.learnMore} ${labels.aboutWallets} ${title}`
              }
              cardData={cardData}
            >
              <InformationCircleIcon width={16} height={16} aria-hidden="true" />
            </CustomInfoLink>
          )}

          {isRecent && (
            <CustomRecentBadgeWrapper
              className={
                customization?.classNames?.recentBadgeWrapper?.({ cardData }) ??
                cn(
                  'novacon:absolute novacon:top-0.5 novacon:right-0.5 novacon:transition novacon:group-hover:opacity-0 novacon:group-hover:scale-90',
                )
              }
              aria-label={
                customConfig?.ariaLabels?.recentBadge
                  ? customConfig.ariaLabels.recentBadge(cardData)
                  : `${title} ${labels.recent}`
              }
              cardData={cardData}
            >
              <RecentBadge customization={customization?.recentBadge}>{labels.recent}</RecentBadge>
            </CustomRecentBadgeWrapper>
          )}

          {!isTouch && (
            <CustomChevron
              className={
                customization?.classNames?.chevron?.({ cardData }) ??
                cn(
                  'novacon:w-5 novacon:h-5 novacon:transition novacon:duration-300 novacon:ease-in-out novacon:translate-x-[-10px] novacon:opacity-0 novacon:group-hover:translate-x-0 novacon:group-hover:opacity-100 novacon:text-[var(--tuwa-text-secondary)]',
                )
              }
              aria-hidden={true}
              cardData={cardData}
            >
              <ChevronRightIcon />
            </CustomChevron>
          )}
        </CustomContainer>
      );
    },
  ),
);

ConnectCard.displayName = 'ConnectCard';
