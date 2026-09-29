/**
 * @file ConnectedModalMainContent component with comprehensive customization options for all child components.
 */

import { cn, standardButtonClasses } from '@tuwaio/nova-core';
import { Transaction } from '@tuwaio/pulsar-core';
import { BaseConnector } from '@tuwaio/satellite-core';
import { AnimatePresence, type Easing, motion, type Variants } from 'framer-motion';
import React, {
  ComponentPropsWithoutRef,
  ComponentType,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
} from 'react';

import { NativeBalanceResult, NovaConnectProviderProps, useNovaConnect, useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
import { useSatelliteConnectStore } from '../../satellite';
import { WalletAvatar, type WalletAvatarCustomization } from '../WalletAvatar';
import {
  ConnectedModalNameAndBalance,
  ConnectedModalNameAndBalanceCustomization,
} from './ConnectedModalNameAndBalance';
import { IconButton, IconButtonProps } from './IconButton';

// --- Default Motion Variants ---
const DEFAULT_CONTAINER_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

const DEFAULT_LOADING_ANIMATION_VARIANTS: Variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
  exit: { scale: 0.6, opacity: 0, transition: { duration: 0.3 } },
};

const DEFAULT_AVATAR_SECTION_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const DEFAULT_INFO_SECTION_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const DEFAULT_TRANSACTIONS_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// --- Types for Customization ---
/**
 * Props for a custom loading indicator (a spinner in the corner by default).
 */
export type ConnectedModalMainContentLoadingIndicatorProps = {
  /** Whether the avatar, the balance or the transactions are loading */
  isLoading: boolean;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.loadingIndicator` */
  className?: string;
};

/**
 * Props for a custom avatar section: the wallet avatar with the wallet and network buttons.
 */
export type ConnectedModalMainContentAvatarSectionProps = {
  /** The active connection */
  activeConnection: BaseConnector;
  /** The ENS or SNS avatar URL, or `null` */
  ensAvatar: string | null;
  /** The wallet part of the connector type (for example `metamask`), or the `unknownWallet` label */
  walletName: string;
  /** Number of connectors of all networks in the Satellite store */
  connectorsCount: number;
  /** Chains the wallet can switch to */
  chainsList: (string | number)[];
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Runs `handlers.onSwitchWallet`, or shows the connections screen */
  onSwitchWallet: () => void;
  /** Runs `handlers.onSwitchNetwork`, or shows the network screen */
  onSwitchNetwork: () => void;
  /** Classes from `classNames.avatarSection` */
  className?: string;
  /** Customization for switch wallet IconButton */
  switchWalletButtonProps?: Partial<IconButtonProps>;
  /** Customization for switch network IconButton */
  switchNetworkButtonProps?: Partial<IconButtonProps>;
  /** Customization for WalletAvatar component */
  walletAvatarCustomization?: WalletAvatarCustomization;
};

/**
 * Props for a custom info section: the wallet name and the balance.
 */
export type ConnectedModalMainContentInfoSectionProps = {
  /** The `balanceLoading` prop */
  balanceLoading: boolean;
  /** The `balance` prop */
  balance: NativeBalanceResult | null;
  /** The `refetch` prop */
  refetch: () => void;
  /** The `ensNameAbbreviated` prop */
  ensNameAbbreviated: string | undefined;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.infoSection` */
  className?: string;
  /** `childCustomizations.nameAndBalance` */
  nameAndBalanceCustomization?: ConnectedModalNameAndBalanceCustomization;
};

/**
 * Props for a custom transactions section: the "View transactions" button (rendered only when the wallet has
 * transactions).
 */
export type ConnectedModalMainContentTransactionsSectionProps = {
  /** Transactions of `transactionPool` sent from the active address */
  walletTransactions: Transaction[];
  /** Whether one of them is pending */
  hasPendingTransactions: boolean;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Runs `handlers.onViewTransactions`, or shows the transaction history */
  onViewTransactions: () => void;
  /** `config.showPendingIndicators` */
  showPendingIndicators?: boolean;
  /** Classes from `classNames.transactionsSection` */
  className?: string;
  /** Classes from `classNames.transactionsButton` (default: `standardButtonClasses` of `@tuwaio/nova-core`) */
  buttonClassName?: string;
};

/**
 * Props for a custom indicator shown when the wallet has no transactions (a visually hidden status by default).
 */
export type ConnectedModalMainContentNoTransactionsIndicatorProps = {
  /** Classes from `classNames.noTransactions` */
  className?: string;
};

/**
 * Customization options of {@link ConnectedModalMainContent}.
 */
export type ConnectedModalMainContentCustomization = {
  /** Props of the container (the component props, `className`, `role` and `aria-label` take precedence) */
  containerProps?: Partial<
    Omit<
      ComponentPropsWithoutRef<'div'>,
      | 'popover'
      | 'onDrag'
      | 'onDragEnd'
      | 'onDragExit'
      | 'onDragStart'
      | 'onDragStartCapture'
      | 'onAnimationStart'
      | 'onAnimationEnd'
      | 'onAnimationStartCapture'
      | 'onAnimationEndCapture'
      | 'onAnimationIteration'
      | 'onAnimationIterationCapture'
    >
  >;
  /** Custom components */
  components?: {
    /** Custom loading indicator component */
    LoadingIndicator?: ComponentType<ConnectedModalMainContentLoadingIndicatorProps>;
    /** Custom avatar section component */
    AvatarSection?: ComponentType<ConnectedModalMainContentAvatarSectionProps>;
    /** Custom info section component */
    InfoSection?: ComponentType<ConnectedModalMainContentInfoSectionProps>;
    /** Custom transactions section component */
    TransactionsSection?: ComponentType<ConnectedModalMainContentTransactionsSectionProps>;
    /** Custom no transactions indicator component */
    NoTransactionsIndicator?: ComponentType<ConnectedModalMainContentNoTransactionsIndicatorProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and the `className` prop.
     *
     * @param params - The content state.
     * @param params.hasActiveWallet - Always `true` (nothing is rendered without a connected wallet).
     * @param params.isLoading - Whether the avatar, the balance or the transactions are loading.
     * @param params.hasTransactions - Whether the wallet has transactions in `transactionPool`.
     * @param params.hasPendingTransactions - Whether one of them is pending.
     * @returns The classes.
     */
    container?: (params: {
      hasActiveWallet: boolean;
      isLoading: boolean;
      hasTransactions: boolean;
      hasPendingTransactions: boolean;
    }) => string;
    /**
     * Returns classes added to the loading indicator.
     *
     * @param params - The loading state.
     * @param params.isLoading - Whether something is loading.
     * @returns The classes.
     */
    loadingIndicator?: (params: { isLoading: boolean }) => string;
    /**
     * Returns classes of the avatar section, added to the default ones.
     *
     * @returns The classes.
     */
    avatarSection?: () => string;
    /**
     * Returns classes of the info section, the only classes of the section.
     *
     * @returns The classes.
     */
    infoSection?: () => string;
    /**
     * Returns classes added to the transactions section.
     *
     * @param params - The transactions.
     * @param params.transactionsCount - Number of transactions of the wallet.
     * @param params.hasPendingTransactions - Whether one of them is pending.
     * @returns The classes.
     */
    transactionsSection?: (params: { transactionsCount: number; hasPendingTransactions: boolean }) => string;
    /**
     * Returns classes of the "View transactions" button, instead of `standardButtonClasses` of `@tuwaio/nova-core`.
     *
     * @returns The classes.
     */
    transactionsButton?: () => string;
    /**
     * Returns classes of the no-transactions indicator, added to the default ones.
     *
     * @returns The classes.
     */
    noTransactions?: () => string;
    /**
     * Returns classes of the wrapper of `renderExtraBalances`, the only classes of the wrapper.
     *
     * @returns The classes.
     */
    extraBalancesContainer?: () => string;
    /**
     * Returns classes of the wrapper of `renderCustomContent`, the only classes of the wrapper.
     *
     * @returns The classes.
     */
    customContentContainer?: () => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Container animation variants (`initial`, `animate`, `exit`) */
    container?: Variants;
  };
  /** Custom animation configuration */
  animation?: {
    /** Container animation configuration */
    container?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
      /** Animation delay in seconds */
      delay?: number;
      /** Children stagger delay */
      staggerChildren?: number;
    };
  };
  /** Custom event handlers */
  handlers?: {
    /** Replaces the wallet button, which shows the connections screen by default */
    onSwitchWallet?: () => void;
    /** Replaces the network button, which shows the network screen by default */
    onSwitchNetwork?: () => void;
    /** Replaces the "View transactions" button, which shows the transaction history by default */
    onViewTransactions?: () => void;
    /**
     * Called after mount and whenever the loading state changes.
     *
     * @param isLoading - Whether the avatar, the balance or the transactions are loading.
     */
    onLoadingStateChange?: (isLoading: boolean) => void;
    /**
     * Called after mount and whenever the transactions of the active address change.
     *
     * @param transactions - Transactions of `transactionPool` sent from the active address.
     * @param pendingCount - Number of pending ones.
     */
    onTransactionsUpdate?: (transactions: Transaction[], pendingCount: number) => void;
  };
  /** Child component customizations */
  childCustomizations?: {
    /** Customization for ConnectedModalNameAndBalance component */
    nameAndBalance?: ConnectedModalNameAndBalanceCustomization;
    /** Customization for WalletAvatar component */
    walletAvatar?: WalletAvatarCustomization;
    /** Switch wallet button: only `className` (added) and `customization` are applied */
    switchWalletButton?: Partial<IconButtonProps>;
    /** Switch network button: only `className` (added) and `customization` are applied */
    switchNetworkButton?: Partial<IconButtonProps>;
  };
  /** Configuration options */
  config?: {
    /** Renders the container without Framer Motion (default: `false`) */
    disableAnimation?: boolean;
    /** Same as `disableAnimation` (default: `false`) */
    reduceMotion?: boolean;
    /** Whether to show the loading indicator (default: `true`) */
    showLoadingIndicators?: boolean;
    /** Whether to show a spinner next to the transactions button while one is pending (default: `true`) */
    showPendingIndicators?: boolean;
    /** Custom ARIA labels for different states */
    ariaLabels?: {
      /** ARIA label of the container, after the `aria-label` prop (default: `walletConnected` label and wallet name) */
      container?: string;
    };
  };
  /** Render slot for extra balances (tokens like USDC, ETH) - rendered after native balance */
  renderExtraBalances?: () => ReactNode;
  /** Render slot for custom content (like Telegram bot button) - rendered after transactions button */
  renderCustomContent?: () => ReactNode;
};

/**
 * Props for the {@link ConnectedModalMainContent} component. `transactionPool` is the Pulsar transaction pool; the
 * transactions sent from the active address are counted. Other props are passed to the container.
 */
export interface ConnectedModalMainContentProps extends Pick<NovaConnectProviderProps, 'transactionPool'> {
  /** List of available chains for the current wallet */
  chainsList: (string | number)[];
  /** The ENS or SNS avatar URL, or `null` */
  ensAvatar: string | null;
  /** Whether the avatar is loading */
  avatarIsLoading: boolean;
  /** Whether the balance is loading */
  balanceLoading: boolean;
  /** Whether the transactions are loading */
  txsLoading: boolean;
  /** The shortened ENS or SNS name, when the address has one */
  ensNameAbbreviated: string | undefined;
  /** The native balance, or `null` */
  balance: NativeBalanceResult | null;
  /** Reloads the balance */
  refetch: () => void;
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
  className?: string;
  /** ARIA label of the container (default: the `walletConnected` label and the wallet name) */
  'aria-label'?: string;
  /** Customization options */
  customization?: ConnectedModalMainContentCustomization;
}

// --- Default Sub-Components ---
const DefaultLoadingIndicator: React.FC<ConnectedModalMainContentLoadingIndicatorProps> = ({
  isLoading,
  labels,
  className,
}) => {
  if (!isLoading) return null;

  return (
    <motion.div
      variants={DEFAULT_LOADING_ANIMATION_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('novacon:absolute novacon:right-5 novacon:top-2 novacon:w-5 novacon:h-5', className)}
      role="status"
      aria-label={labels.loading}
    >
      <div className="Toastify__spinner" aria-hidden="true" />
      <span className="novacon:sr-only">{labels.loading}</span>
    </motion.div>
  );
};

const DefaultAvatarSection: React.FC<ConnectedModalMainContentAvatarSectionProps> = ({
  activeConnection,
  ensAvatar,
  walletName,
  connectorsCount,
  chainsList,
  labels,
  onSwitchWallet,
  onSwitchNetwork,
  className,
  switchWalletButtonProps,
  switchNetworkButtonProps,
  walletAvatarCustomization,
}) => {
  return (
    <motion.div
      variants={DEFAULT_AVATAR_SECTION_ANIMATION_VARIANTS}
      className={cn('novacon:mb-6 novacon:relative', className)}
      role="group"
      aria-label={labels.walletControls}
    >
      {/* Wallet Switch Button */}
      <IconButton
        className={cn(
          'novacon:absolute novacon:z-[11] novacon:bottom-[-10px] novacon:left-[-10px]',
          switchWalletButtonProps?.className,
        )}
        walletIcon={activeConnection.icon}
        walletName={walletName}
        items={connectorsCount}
        onClick={onSwitchWallet}
        aria-label={formatLabel(labels.connectWalletsAvailable, { count: connectorsCount })}
        data-testid="switch-wallet-button"
        customization={switchWalletButtonProps?.customization}
      />

      {/* Network Switch Button */}
      <IconButton
        className={cn(
          'novacon:absolute novacon:z-[11] novacon:bottom-[-10px] novacon:right-[-10px]',
          switchNetworkButtonProps?.className,
        )}
        walletChainId={activeConnection.chainId}
        items={chainsList.length}
        onClick={onSwitchNetwork}
        aria-label={formatLabel(labels.switchNetworkNetworksAvailable, { count: chainsList.length })}
        data-testid="switch-network-button"
        customization={switchNetworkButtonProps?.customization}
      />

      {/* Main Wallet Avatar */}
      <WalletAvatar
        ensAvatar={ensAvatar}
        address={activeConnection.address}
        className="novacon:w-36 novacon:h-36 novacon:sm:w-32 novacon:sm:h-32"
        aria-describedby="wallet-info"
        customization={walletAvatarCustomization}
      />
    </motion.div>
  );
};

const DefaultInfoSection: React.FC<ConnectedModalMainContentInfoSectionProps> = ({
  balanceLoading,
  balance,
  refetch,
  ensNameAbbreviated,
  labels,
  className,
  nameAndBalanceCustomization,
}) => {
  return (
    <motion.div
      variants={DEFAULT_INFO_SECTION_ANIMATION_VARIANTS}
      id="wallet-info"
      className={className}
      role="region"
      aria-label={labels.walletBalance}
    >
      <ConnectedModalNameAndBalance
        balanceLoading={balanceLoading}
        balance={balance}
        refetch={refetch}
        ensNameAbbreviated={ensNameAbbreviated}
        customization={nameAndBalanceCustomization}
      />
    </motion.div>
  );
};

const DefaultTransactionsSection: React.FC<ConnectedModalMainContentTransactionsSectionProps> = ({
  walletTransactions,
  hasPendingTransactions,
  labels,
  onViewTransactions,
  showPendingIndicators = true,
  className,
  buttonClassName,
}) => {
  if (walletTransactions.length === 0) return null;

  return (
    <motion.div
      variants={DEFAULT_TRANSACTIONS_ANIMATION_VARIANTS}
      className={cn(
        'novacon:relative novacon:flex novacon:items-center novacon:justify-center novacon:gap-2',
        className,
      )}
      role="group"
      aria-label={formatLabel(labels.transactionsInAppCount, { count: walletTransactions.length })}
    >
      <button
        type="button"
        className={buttonClassName || standardButtonClasses}
        onClick={onViewTransactions}
        aria-describedby="transaction-count"
        data-testid="view-transactions-button"
      >
        {labels.viewTransactions}

        <span id="transaction-count" className="novacon:sr-only">
          {formatLabel(labels.transactionsAvailable, { count: walletTransactions.length })}
          {hasPendingTransactions && `, ${labels.transactionLoading}`}
        </span>
      </button>

      {/* Pending Transactions Indicator */}
      {showPendingIndicators && (
        <AnimatePresence>
          {hasPendingTransactions && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="novacon:block novacon:absolute novacon:left-[110%] novacon:w-4 novacon:h-4"
              role="status"
              aria-label={labels.transactionLoading}
            >
              <span className="novacon:block Toastify__spinner" aria-hidden="true" />
              <span className="novacon:sr-only">{labels.transactionLoading}</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const DefaultNoTransactionsIndicator: React.FC<ConnectedModalMainContentNoTransactionsIndicatorProps> = ({
  className,
}) => {
  const labels = useNovaConnectLabels();
  return (
    <div className={cn('novacon:sr-only', className)} role="status" aria-live="polite">
      {labels.noTransactionsForWallet}
    </div>
  );
};

/**
 * The main screen of the connected modal: the wallet avatar with buttons to the connections and network screens, the
 * name and balance, and a "View transactions" button when the wallet has transactions. Renders nothing without a
 * connected wallet.
 *
 * Props: {@link ConnectedModalMainContentProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { ConnectedModalMainContent } from '@tuwaio/nova-connect/components';
 * import { useGetWalletNameAndAvatar, useWalletNativeBalance } from '@tuwaio/nova-connect/hooks';
 *
 * export function WalletSummary() {
 *   const { ensAvatar, ensNameAbbreviated, isLoading } = useGetWalletNameAndAvatar({});
 *   const { balance, isLoading: balanceLoading, refetch } = useWalletNativeBalance();
 *
 *   return (
 *     <ConnectedModalMainContent
 *       chainsList={[1, 8453]}
 *       ensAvatar={ensAvatar}
 *       avatarIsLoading={isLoading}
 *       balanceLoading={balanceLoading}
 *       txsLoading={false}
 *       ensNameAbbreviated={ensNameAbbreviated}
 *       balance={balance}
 *       refetch={refetch}
 *       customization={{
 *         classNames: { avatarSection: () => 'custom-avatar-section' },
 *         handlers: { onViewTransactions: () => console.log('view transactions') },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const ConnectedModalMainContent = forwardRef<HTMLDivElement, ConnectedModalMainContentProps>(
  (
    {
      transactionPool,
      chainsList,
      ensAvatar,
      avatarIsLoading,
      balanceLoading,
      txsLoading,
      ensNameAbbreviated,
      balance,
      refetch,
      className,
      'aria-label': ariaLabel,
      customization,
      ...props
    },
    ref,
  ) => {
    // Get localized labels for UI text
    const labels = useNovaConnectLabels();
    // Get modal controls and state from hook
    const { setConnectedModalContentType, setIsConnectedModalOpen, setIsConnectModalOpen } = useNovaConnect();
    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
    const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);

    // Extract custom components and config with stable references
    const customComponents = customization?.components;
    const customConfig = customization?.config;
    const customHandlers = customization?.handlers;

    const {
      LoadingIndicator = DefaultLoadingIndicator,
      AvatarSection = DefaultAvatarSection,
      InfoSection = DefaultInfoSection,
      TransactionsSection = DefaultTransactionsSection,
      NoTransactionsIndicator = DefaultNoTransactionsIndicator,
    } = customComponents ?? {};

    const {
      disableAnimation = false,
      reduceMotion = false,
      showLoadingIndicators = true,
      showPendingIndicators = true,
      ariaLabels,
    } = customConfig ?? {};

    /**
     * Handle wallet switching by closing connected modal and opening connect modal
     * Provides seamless transition between modal views
     */
    const handleSwitchWallet = useCallback(() => {
      if (customHandlers?.onSwitchWallet) {
        customHandlers.onSwitchWallet();
      } else {
        setConnectedModalContentType('connections');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customHandlers?.onSwitchWallet, setIsConnectedModalOpen, setIsConnectModalOpen]);

    /**
     * Handle network switching by changing to chains view
     */
    const handleSwitchNetwork = useCallback(() => {
      if (customHandlers?.onSwitchNetwork) {
        customHandlers.onSwitchNetwork();
      } else {
        setConnectedModalContentType('chains');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customHandlers?.onSwitchNetwork, setConnectedModalContentType]);

    /**
     * Handle viewing transactions by changing to transactions view
     */
    const handleViewTransactions = useCallback(() => {
      if (customHandlers?.onViewTransactions) {
        customHandlers.onViewTransactions();
      } else {
        setConnectedModalContentType('transactions');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customHandlers?.onViewTransactions, setConnectedModalContentType]);

    /**
     * Connectors from store
     */
    const connectors = getConnectors();

    /**
     * Wallet transactions filtered by current wallet address
     * Only includes transactions from the currently connected wallet
     */
    const activeAddress = activeConnection?.address;
    const walletTransactions = useMemo(
      () =>
        activeAddress && transactionPool
          ? Object.values(transactionPool).filter(
              (tx) => tx?.from && tx.from.toLowerCase() === activeAddress.toLowerCase(),
            )
          : [],
      [activeAddress, transactionPool],
    );

    /**
     * Check if there are pending transactions for loading indicator
     */
    const hasPendingTransactions = walletTransactions.some((tx) => tx.pending);

    /**
     * Get number of available connectors for the current wallet type
     */
    const connectorsCount = activeConnection ? Object.values(connectors)?.flat().length || 0 : 0;

    /**
     * Get wallet name from wallet type for display
     */
    const walletName = activeConnection?.connectorType?.split(':')[1] || labels.unknownWallet;

    /**
     * State calculations
     */
    const hasActiveWallet = Boolean(activeConnection?.isConnected);
    const isLoading = avatarIsLoading || balanceLoading || txsLoading;
    const hasTransactions = walletTransactions.length > 0;

    /**
     * Effect for transaction updates
     */
    const pendingCount = walletTransactions.filter((tx) => tx.pending).length;

    // The handlers are read through Effect Events, so a new `handlers` object on every render does not re-run the
    // effects
    const onTransactionsUpdate = useEffectEvent((transactions: Transaction[], count: number) =>
      customHandlers?.onTransactionsUpdate?.(transactions, count),
    );
    const onLoadingStateChange = useEffectEvent((loading: boolean) => customHandlers?.onLoadingStateChange?.(loading));

    useEffect(() => {
      onTransactionsUpdate(walletTransactions, pendingCount);
    }, [walletTransactions, pendingCount]);

    useEffect(() => {
      onLoadingStateChange(isLoading);
    }, [isLoading]);

    /**
     * Generate container classes with custom generator
     */
    /**
     * Generate container classes with custom generator
     */
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({
          hasActiveWallet,
          isLoading,
          hasTransactions,
          hasPendingTransactions,
        })
      : cn(
          'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:gap-2 novacon:p-4',
          className,
        );

    /**
     * Animation variants
     */
    const containerVariants = customization?.variants?.container || DEFAULT_CONTAINER_ANIMATION_VARIANTS;

    /**
     * Merge container props
     */
    /**
     * Merge container props
     */
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      role: 'main',
      'aria-label': ariaLabel || ariaLabels?.container || `${labels.walletConnected} - ${walletName}`,
    };

    // Early return if no active wallet
    if (!hasActiveWallet || !activeConnection) {
      return null;
    }

    const content = (
      <>
        {/* Loading Indicator */}
        {showLoadingIndicators && (
          <AnimatePresence>
            <LoadingIndicator
              isLoading={isLoading}
              labels={labels}
              className={customization?.classNames?.loadingIndicator?.({ isLoading })}
            />
          </AnimatePresence>
        )}

        {/* Wallet Avatar with Control Buttons */}
        <AvatarSection
          activeConnection={activeConnection}
          ensAvatar={ensAvatar}
          walletName={walletName}
          connectorsCount={connectorsCount}
          chainsList={chainsList}
          labels={labels}
          onSwitchWallet={handleSwitchWallet}
          onSwitchNetwork={handleSwitchNetwork}
          className={customization?.classNames?.avatarSection?.()}
          switchWalletButtonProps={customization?.childCustomizations?.switchWalletButton}
          switchNetworkButtonProps={customization?.childCustomizations?.switchNetworkButton}
          walletAvatarCustomization={customization?.childCustomizations?.walletAvatar}
        />

        {/* Wallet Name and Balance */}
        <InfoSection
          balanceLoading={balanceLoading}
          balance={balance}
          refetch={refetch}
          ensNameAbbreviated={ensNameAbbreviated}
          labels={labels}
          className={customization?.classNames?.infoSection?.()}
          nameAndBalanceCustomization={customization?.childCustomizations?.nameAndBalance}
        />

        {/* Extra Balances Slot (tokens like USDC, ETH) */}
        {customization?.renderExtraBalances && (
          <div className={customization?.classNames?.extraBalancesContainer?.()}>
            {customization.renderExtraBalances()}
          </div>
        )}

        {/* Transactions Section */}
        <TransactionsSection
          walletTransactions={walletTransactions}
          hasPendingTransactions={hasPendingTransactions}
          labels={labels}
          onViewTransactions={handleViewTransactions}
          showPendingIndicators={showPendingIndicators}
          className={customization?.classNames?.transactionsSection?.({
            transactionsCount: walletTransactions.length,
            hasPendingTransactions,
          })}
          buttonClassName={customization?.classNames?.transactionsButton?.()}
        />

        {/* Custom Content Slot (like Telegram bot button) */}
        {customization?.renderCustomContent && (
          <div className={customization?.classNames?.customContentContainer?.()}>
            {customization.renderCustomContent()}
          </div>
        )}

        {/* No Transactions State */}
        {walletTransactions.length === 0 && (
          <NoTransactionsIndicator className={customization?.classNames?.noTransactions?.()} />
        )}
      </>
    );

    if (disableAnimation || reduceMotion) {
      return <div {...containerProps}>{content}</div>;
    }

    return (
      <motion.div
        {...containerProps}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: customization?.animation?.container?.duration ?? 0.4,
          ease: customization?.animation?.container?.ease ?? 'easeOut',
          delay: customization?.animation?.container?.delay ?? 0,
          staggerChildren: customization?.animation?.container?.staggerChildren ?? 0.1,
        }}
      >
        {content}
      </motion.div>
    );
  },
);

ConnectedModalMainContent.displayName = 'ConnectedModalMainContent';
