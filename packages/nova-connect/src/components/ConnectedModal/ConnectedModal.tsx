/**
 * @file ConnectedModal component with comprehensive customization options for all child components.
 */

import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { CloseIcon, cn, Dialog, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { ConnectorType, formatConnectorChainId, getAdapterFromConnectorType } from '@tuwaio/orbit-core';
import { type Easing, motion, type Transition, type Variants } from 'framer-motion';
import React, { ComponentPropsWithoutRef, ComponentType, forwardRef, useCallback, useEffect } from 'react';

import {
  ConnectedContentType,
  NativeBalanceResult,
  NovaConnectProviderProps,
  useGetWalletNameAndAvatar,
  useNovaConnect,
  useNovaConnectLabels,
  useWalletChainsList,
  useWalletNativeBalance,
} from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { ScrollableChainList, ScrollableChainListCustomization } from '../Chains/ScrollableChainList';
import { ConnectButtonProps } from '../ConnectButton';
import {
  ConnectedModalFooter,
  ConnectedModalFooterCustomization,
  ConnectedModalFooterProps,
} from './ConnectedModalFooter';
import { ConnectedModalMainContent, ConnectedModalMainContentCustomization } from './ConnectedModalMainContent';
import { ConnectedModalTxHistory, ConnectedModalTxHistoryCustomization } from './ConnectedModalTxHistory';
import { ConnectionsContent, ConnectionsContentCustomization } from './ConnectionsContent';

// --- Default Motion Variants ---
const DEFAULT_MODAL_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// --- Component Props Types ---

/**
 * Props for custom DialogTitle component
 * DialogTitle is the main title element that includes back button and title text
 */
export type ConnectedModalDialogTitleProps = {
  /** Current title text */
  title: string;
  /** Current content type for conditional rendering */
  contentType: ConnectedContentType;
  /** Handler for back button click */
  onBack: () => void;
  /** Localized labels */
  labels: Record<string, string>;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Props for custom BackButton component
 */
export type ConnectedModalBackButtonProps = {
  /** Handler for back button click */
  onBack: () => void;
  /** Localized labels */
  labels: Record<string, string>;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Props for custom CloseButton component
 */
export type ConnectedModalCloseButtonProps = {
  /** Handler for close button click */
  onClose: () => void;
  /** Localized labels */
  labels: Record<string, string>;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Props for custom Header component
 * Header wraps DialogTitle and CloseButton together
 */
export type ConnectedModalHeaderProps = {
  /** Current content type */
  contentType: ConnectedContentType;
  /** Current title text */
  title: string;
  /** Handler for back button click */
  onBack: () => void;
  /** Handler for close button click */
  onClose: () => void;
  /** Localized labels */
  labels: Record<string, string>;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Props for a custom main content (the default one renders the screen of `contentType`).
 */
export type ConnectedModalMainContentSlotProps = Pick<
  NovaConnectProviderProps,
  'transactionPool' | 'pulsarAdapter' | 'pagination'
> & {
  /** Current content type */
  contentType: ConnectedContentType;
  /** Native balance result */
  balance: NativeBalanceResult | null;
  /** Refetch balance function */
  refetch: () => void;
  /** Abbreviated ENS name or address */
  ensNameAbbreviated: string | undefined;
  /** Whether avatar is loading */
  avatarIsLoading: boolean;
  /** Whether balance is loading */
  balanceLoading: boolean;
  /** ENS avatar URL */
  ensAvatar: string | null;
  /** List of available chains */
  chainsList: (string | number)[];
  /**
   * Runs `handlers.onChainChange`, or `switchNetwork` of the Satellite store.
   *
   * @param chainId - The selected chain ID, formatted for the connector.
   */
  onChainChange: (chainId: string) => void;
  /** Runs `handlers.onBack`, or shows the main screen */
  onBack: () => void;
  /**
   * Formats a chain of `chainsList` for the connector of the active connection.
   *
   * @param chain - A chain of `chainsList`.
   * @returns The formatted chain ID and the original one.
   */
  getChainData: (chain: string | number) => {
    /** The chain ID formatted for the connector */
    formattedChainId: string | number;
    /** The chain as given */
    chain: string | number;
  };
  /** Classes from `classNames.mainContent` */
  className?: string;
  /** Child component customizations */
  childCustomizations?: ConnectedModalCustomization['childCustomizations'];
};

// --- Wallet Name Hook Config Type ---
/**
 * Options of `useGetWalletNameAndAvatar` used by {@link ConnectedModal} (`config.hooks.walletNameAndAvatar`). When
 * set, the object replaces the defaults (`6`, `30`, `false`, `3000`), and omitted fields take the defaults of the hook.
 */
export type ConnectedModalWalletNameConfig = {
  /** Characters kept at each end of a shortened address */
  abbreviateSymbols?: number;
  /** Names longer than this are shortened */
  maxNameLength?: number;
  /** Whether to retry a failed name lookup */
  autoRetry?: boolean;
  /** Delay before a retry, in milliseconds */
  retryDelay?: number;
};

/**
 * Customization options of {@link ConnectedModal}.
 */
export type ConnectedModalCustomization = {
  /** Props of the dialog, applied after `open` and `onOpenChange` (they override them) */
  dialogProps?: Partial<ComponentPropsWithoutRef<typeof Dialog>>;
  /** Props of the dialog content, applied last (they override the generated ones) */
  dialogContentProps?: Partial<ComponentPropsWithoutRef<typeof DialogContent>>;
  /** Custom components */
  components?: {
    /** Custom dialog component (root modal wrapper) */
    Dialog?: ComponentType<ComponentPropsWithoutRef<typeof Dialog>>;
    /** Custom dialog content component (modal content wrapper) */
    DialogContent?: ComponentType<ComponentPropsWithoutRef<typeof DialogContent>>;
    /**
     * Custom dialog title component
     * Includes back button (when not on main view) and title text
     * Use this to customize the entire title area
     */
    DialogTitle?: ComponentType<ConnectedModalDialogTitleProps>;
    /**
     * Custom header component
     * Wraps DialogTitle and CloseButton together
     * Use this to customize the entire header layout
     */
    Header?: ComponentType<ConnectedModalHeaderProps>;
    /** Custom back button component (chevron left icon button) */
    BackButton?: ComponentType<ConnectedModalBackButtonProps>;
    /** Custom close button component (X icon button) */
    CloseButton?: ComponentType<ConnectedModalCloseButtonProps>;
    /** Custom main content component (renders different views based on contentType) */
    MainContent?: ComponentType<ConnectedModalMainContentSlotProps>;
    /** Custom footer component */
    Footer?: ComponentType<ConnectedModalFooterProps>;
    /** Custom motion container for animations */
    MotionContainer?: ComponentType<ComponentPropsWithoutRef<typeof motion.div>>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the dialog content, instead of the default ones and the `className` prop.
     *
     * @param params - The modal state.
     * @param params.contentType - The current screen.
     * @param params.hasActiveWallet - Always `true` (nothing is rendered without a connected wallet).
     * @returns The classes.
     */
    dialogContent?: (params: { contentType: ConnectedContentType; hasActiveWallet: boolean }) => string;
    /**
     * Returns the classes of the layout animation container.
     *
     * @returns The classes.
     */
    motionContainer?: () => string;
    /**
     * Returns the classes of the content container, instead of the default ones (an empty string keeps them).
     *
     * @param params - The modal state.
     * @param params.contentType - The current screen.
     * @returns The classes.
     */
    contentContainer?: (params: { contentType: ConnectedContentType }) => string;
    /**
     * Returns the classes of the header, added to the default ones.
     *
     * @param params - The modal state.
     * @param params.contentType - The current screen.
     * @returns The classes.
     */
    header?: (params: { contentType: ConnectedContentType }) => string;
    /**
     * Returns the classes of the title, the only classes of the title.
     *
     * @param params - The modal state.
     * @param params.contentType - The current screen.
     * @returns The classes.
     */
    dialogTitle?: (params: { contentType: ConnectedContentType }) => string;
    /**
     * Returns classes added to the close button.
     *
     * @returns The classes.
     */
    closeButton?: () => string;
    /**
     * Returns the classes of the main content, added to the default ones.
     *
     * @param params - The modal state.
     * @param params.contentType - The current screen.
     * @returns The classes.
     */
    mainContent?: (params: { contentType: ConnectedContentType }) => string;
    /**
     * Returns classes added to the footer.
     *
     * @returns The classes.
     */
    footer?: () => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Variants of the animation container (`initial`, `animate`, `exit`) */
    modal?: Variants;
  };
  /** Custom animation configuration */
  animation?: {
    /** Modal animation configuration */
    modal?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
      /** Animation delay in seconds */
      delay?: number;
    };
    /** Layout animation between screens */
    layout?: {
      /** Animation duration in seconds (default: `0.0001`) */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
    };
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Replaces the open state change of the dialog (Escape, click outside, close button). The modal stays open until
     * the handler calls `setIsConnectedModalOpen(open)` from `useNovaConnect`.
     *
     * @param open - The requested state.
     */
    onOpenChange?: (open: boolean) => void;
    /** Replaces the back button (and the return after a chain is selected), which shows the main screen by default */
    onBack?: () => void;
    /** Replaces the close button, which closes the modal by default (through `onOpenChange` when it is set) */
    onClose?: () => void;
    /**
     * Replaces the network switch of the network screen (`switchNetwork` of the Satellite store by default).
     *
     * @param chainId - The selected chain ID, formatted for the connector.
     */
    onChainChange?: (chainId: string) => void;
  };
  /** Child component customizations */
  childCustomizations?: {
    /** Customization for ConnectedModalMainContent component */
    mainContent?: ConnectedModalMainContentCustomization;
    /** Customization for ConnectionsContent component */
    connections?: ConnectionsContentCustomization;
    /** Customization for ConnectedModalTxHistory component */
    txHistory?: ConnectedModalTxHistoryCustomization;
    /** Customization for ScrollableChainList component */
    chainList?: ScrollableChainListCustomization;
    /** Customization for ConnectedModalFooter component */
    footer?: ConnectedModalFooterCustomization;
  };
  /** Configuration options */
  config?: {
    /** Disables the modal and layout animations (default: `false`) */
    disableAnimation?: boolean;
    /** Same as `disableAnimation` (default: `false`) */
    reduceMotion?: boolean;
    /** Whether to show the main screen each time the modal opens (default: `true`) */
    autoResetToMain?: boolean;
    /** Custom ARIA labels for different states */
    ariaLabels?: {
      /** ARIA label of the dialog content */
      dialog?: string;
    };
    /** Hook configurations */
    hooks?: {
      /** Configuration for wallet name and avatar hook */
      walletNameAndAvatar?: ConnectedModalWalletNameConfig;
    };
  };
};

/**
 * Props for the {@link ConnectedModal} component. `appChains` and `solanaRPCUrls` give the chains of the network
 * screen; `transactionPool`, `pulsarAdapter` and `pagination` (Pulsar) feed the transaction history.
 */
export interface ConnectedModalProps
  extends
    Omit<ConnectButtonProps, 'className' | 'customization'>,
    Pick<NovaConnectProviderProps, 'transactionPool' | 'pulsarAdapter' | 'appChains' | 'solanaRPCUrls' | 'pagination'> {
  /** Classes added to the dialog content classes (ignored when `classNames.dialogContent` is set) */
  className?: string;
  /** Customization options */
  customization?: ConnectedModalCustomization;
}

// --- Default Sub-Components ---

/**
 * Default back button component
 */
const DefaultBackButton: React.FC<ConnectedModalBackButtonProps> = ({ onBack, labels, className }) => (
  <button
    type="button"
    onClick={onBack}
    aria-label={labels.back}
    className={cn(
      'novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1',
      'novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors',
      'novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-text-primary)]',
      'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
      className,
    )}
  >
    <ChevronLeftIcon className="novacon:h-5 novacon:w-5" />
  </button>
);

/**
 * Default close button component
 */
// Not wrapped in `DialogClose`: `onClose` closes the modal, and `DialogClose` would also call `onOpenChange`
const DefaultCloseButton: React.FC<ConnectedModalCloseButtonProps> = ({ onClose, labels, className }) => (
  <button
    type="button"
    onClick={onClose}
    aria-label={labels.closeModal}
    className={cn(
      'novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1',
      'novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors',
      'novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-text-primary)]',
      'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
      className,
    )}
  >
    <CloseIcon />
  </button>
);

/**
 * Default dialog title component
 * Combines back button (conditional) and title text
 */
const DefaultDialogTitle: React.FC<
  ConnectedModalDialogTitleProps & { BackButton?: ComponentType<ConnectedModalBackButtonProps> }
> = ({ title, contentType, onBack, labels, className, BackButton = DefaultBackButton }) => (
  <DialogTitle className={className}>
    <div className="novacon:flex novacon:items-center novacon:justify-between novacon:gap-2">
      {contentType !== 'main' && <BackButton onBack={onBack} labels={labels} />}
      <span className="novacon:flex-1 novacon:text-center novacon:font-semibold">{title}</span>
    </div>
  </DialogTitle>
);

/**
 * Default header component
 * Wraps DialogTitle and CloseButton
 */
const DefaultHeader: React.FC<
  ConnectedModalHeaderProps & {
    DialogTitleComponent?: ComponentType<ConnectedModalDialogTitleProps>;
    CloseButtonComponent?: ComponentType<ConnectedModalCloseButtonProps>;
    BackButtonComponent?: ComponentType<ConnectedModalBackButtonProps>;
    dialogTitleClassName?: string;
    closeButtonClassName?: string;
  }
> = ({
  contentType,
  title,
  onBack,
  onClose,
  labels,
  className,
  DialogTitleComponent,
  CloseButtonComponent = DefaultCloseButton,
  BackButtonComponent = DefaultBackButton,
  dialogTitleClassName,
  closeButtonClassName,
}) => {
  // If custom DialogTitle is provided, use it directly
  if (DialogTitleComponent) {
    return (
      <DialogHeader className={className}>
        <DialogTitleComponent
          title={title}
          contentType={contentType}
          onBack={onBack}
          labels={labels}
          className={dialogTitleClassName}
        />
        <CloseButtonComponent onClose={onClose} labels={labels} className={closeButtonClassName} />
      </DialogHeader>
    );
  }

  // Otherwise use default with custom BackButton if provided
  return (
    <DialogHeader className={className}>
      <DefaultDialogTitle
        title={title}
        contentType={contentType}
        onBack={onBack}
        labels={labels}
        className={dialogTitleClassName}
        BackButton={BackButtonComponent}
      />
      <CloseButtonComponent onClose={onClose} labels={labels} className={closeButtonClassName} />
    </DialogHeader>
  );
};

/**
 * Default main content component
 * Renders different views based on contentType
 */
const DefaultMainContent: React.FC<ConnectedModalMainContentSlotProps> = ({
  contentType,
  balance,
  refetch,
  ensNameAbbreviated,
  avatarIsLoading,
  balanceLoading,
  ensAvatar,
  chainsList,
  transactionPool,
  pulsarAdapter,
  onChainChange,
  onBack,
  getChainData,
  className,
  childCustomizations,
  pagination,
}) => {
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);

  const renderContent = () => {
    switch (contentType) {
      case 'main':
        return (
          <ConnectedModalMainContent
            balance={balance}
            refetch={refetch}
            ensNameAbbreviated={ensNameAbbreviated}
            avatarIsLoading={avatarIsLoading}
            balanceLoading={balanceLoading}
            txsLoading={pagination?.isLoading ?? false}
            ensAvatar={ensAvatar}
            chainsList={chainsList}
            transactionPool={transactionPool}
            customization={childCustomizations?.mainContent}
          />
        );
      case 'transactions':
        return (
          <ConnectedModalTxHistory
            transactionPool={transactionPool}
            pulsarAdapter={pulsarAdapter}
            customization={childCustomizations?.txHistory}
            pagination={pagination}
          />
        );
      case 'chains':
        if (!activeConnection) return null;
        return (
          <ScrollableChainList
            chainsList={chainsList}
            selectValue={String(
              formatConnectorChainId(
                (activeConnection as { chainId: string | number }).chainId,
                getAdapterFromConnectorType((activeConnection as { connectorType: ConnectorType }).connectorType),
              ),
            )}
            handleValueChange={onChainChange}
            getChainData={getChainData}
            onClose={onBack}
            customization={childCustomizations?.chainList}
          />
        );
      case 'connections':
        return <ConnectionsContent customization={childCustomizations?.connections} />;
      default:
        return null;
    }
  };

  return (
    <main
      className={cn('novacon:relative', className)}
      id="connected-modal-description"
      aria-live="polite"
      aria-atomic="true"
    >
      {renderContent()}
    </main>
  );
};

/**
 * The connected modal: the main screen (avatar, name, balance, transactions button), the network screen, the
 * transaction history and the connections screen, with a footer to disconnect and open the explorer. Open it with
 * `setIsConnectedModalOpen(true)` from `useNovaConnect`; `NovaConnectProvider` renders it when `appChains` or
 * `solanaRPCUrls` is set. Renders nothing without a connected wallet.
 *
 * The name and avatar come from `useGetWalletNameAndAvatar` (ENS or SNS lookups), the balance from
 * `useWalletNativeBalance`; both send requests through the Satellite adapter.
 *
 * Props: {@link ConnectedModalProps}; the ref is forwarded to the dialog content.
 *
 * @example
 * ```tsx
 * import { ConnectedModal } from '@tuwaio/nova-connect/components';
 * import { mainnet, polygon } from 'viem/chains';
 *
 * export const Modal = (
 *   <ConnectedModal
 *     appChains={[mainnet, polygon]}
 *     customization={{
 *       classNames: {
 *         dialogTitle: ({ contentType }) => (contentType === 'main' ? 'main-title' : 'sub-title'),
 *       },
 *     }}
 *   />
 * );
 * ```
 */
export const ConnectedModal = forwardRef<HTMLDivElement, ConnectedModalProps>(
  ({ solanaRPCUrls, transactionPool, pulsarAdapter, appChains, className, customization, pagination }, ref) => {
    // Get localized labels for UI text
    const labels = useNovaConnectLabels();

    // Get modal state and controls from hook
    const { setConnectedModalContentType, isConnectedModalOpen, setIsConnectedModalOpen, connectedModalContentType } =
      useNovaConnect();
    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
    const switchNetwork = useSatelliteConnectStore((store) => store.switchNetwork);

    // Extract customization options with stable references
    const {
      Dialog: CustomDialog = Dialog,
      DialogContent: CustomDialogContent = DialogContent,
      DialogTitle: CustomDialogTitle,
      Header: CustomHeader,
      BackButton: CustomBackButton = DefaultBackButton,
      CloseButton: CustomCloseButton = DefaultCloseButton,
      MainContent: CustomMainContent = DefaultMainContent,
      Footer: CustomFooter = ConnectedModalFooter,
      MotionContainer = motion.div,
    } = customization?.components ?? {};

    const {
      disableAnimation = false,
      reduceMotion = false,
      autoResetToMain = true,
      ariaLabels,
      hooks: hooksConfig,
    } = customization?.config ?? {};

    // Memoize handler references
    const customHandlers = customization?.handlers;

    // Hook configurations
    const walletNameConfig: ConnectedModalWalletNameConfig = hooksConfig?.walletNameAndAvatar ?? {
      abbreviateSymbols: 6,
      maxNameLength: 30,
      autoRetry: false,
      retryDelay: 3000,
    };

    const {
      ensAvatar,
      ensNameAbbreviated,
      isLoading: avatarIsLoading,
    } = useGetWalletNameAndAvatar({
      ...walletNameConfig,
    });

    const { balance, isLoading: balanceLoading, refetch } = useWalletNativeBalance();

    /**
     * Handles network switching when user selects a different chain
     */
    const handleChainChange = useCallback(
      (newChainId: string) => {
        if (customHandlers?.onChainChange) {
          customHandlers.onChainChange(newChainId);
        } else {
          switchNetwork(newChainId);
        }
      },
      [customHandlers, switchNetwork],
    );

    /**
     * Handle modal open state changes
     */
    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (customHandlers?.onOpenChange) {
          customHandlers.onOpenChange(open);
        } else {
          setIsConnectedModalOpen(open);
        }
      },
      [customHandlers, setIsConnectedModalOpen],
    );

    /**
     * Reset modal content to main view when modal opens
     * This ensures consistent initial state every time the modal is opened
     */
    useEffect(() => {
      if (isConnectedModalOpen && autoResetToMain) {
        setConnectedModalContentType('main');
      }
    }, [isConnectedModalOpen, autoResetToMain, setConnectedModalContentType]);

    /**
     * Use custom hook to fetch chains list asynchronously
     * This handles the async nature of getChainsListByConnectorType
     */
    const { chainsList } = useWalletChainsList({
      activeConnection,
      appChains,
      solanaRPCUrls,
    });

    /**
     * Helper function to format chain data for display and selection
     * @param chain - Chain identifier (string or number)
     * @returns Object with formatted chain ID and original chain value
     */
    const getChainData = useCallback(
      (chain: string | number) => {
        if (!activeConnection) {
          return { formattedChainId: chain, chain };
        }

        return {
          formattedChainId: formatConnectorChainId(
            chain,
            getAdapterFromConnectorType((activeConnection as { connectorType: ConnectorType }).connectorType),
          ),
          chain,
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [activeConnection?.connectorType],
    );

    /**
     * Get localized title based on current modal content type
     * @returns Appropriate title string from labels
     */
    const getTitle = useCallback((): string => {
      switch (connectedModalContentType) {
        case 'transactions':
          return labels.transactionsInApp;
        case 'chains':
          return labels.switchNetwork;
        case 'connections':
          return labels.connectedWallets;
        default:
          return labels.connected;
      }
    }, [connectedModalContentType, labels]);

    /**
     * Navigate back to main modal content
     * Used by back button in sub-views
     */
    const handleBackToMain = useCallback(() => {
      if (customHandlers?.onBack) {
        customHandlers.onBack();
      } else {
        setConnectedModalContentType('main');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customHandlers?.onBack, setConnectedModalContentType]);

    /**
     * Close the entire modal
     * Resets state and closes modal dialog
     */
    const handleCloseModal = useCallback(() => {
      if (customHandlers?.onClose) {
        customHandlers.onClose();
      } else {
        handleOpenChange(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customHandlers?.onClose, handleOpenChange]);

    /**
     * Memoized state calculations
     */
    const hasActiveWallet = Boolean(activeConnection && (activeConnection as { isConnected?: boolean }).isConnected);
    const currentTitle = getTitle();

    /**
     * Generate dialog content classes
     */
    const dialogContentClasses = (() => {
      if (customization?.classNames?.dialogContent) {
        return customization.classNames.dialogContent({
          contentType: connectedModalContentType,
          hasActiveWallet,
        });
      }
      return cn('novacon:w-full novacon:sm:max-w-md', className);
    })();

    /**
     * Animation variants
     */
    const modalVariants = customization?.variants?.modal || DEFAULT_MODAL_ANIMATION_VARIANTS;

    /**
     * Motion props configuration
     */
    const motionProps = (() => {
      if (disableAnimation || reduceMotion) {
        return {};
      }

      const layoutTransition: Transition = {
        duration: customization?.animation?.layout?.duration ?? 0.0001,
        ease: customization?.animation?.layout?.ease,
      };

      return {
        layout: true,
        variants: modalVariants,
        initial: 'initial' as const,
        animate: 'animate' as const,
        exit: 'exit' as const,
        transition: {
          layout: layoutTransition,
          duration: customization?.animation?.modal?.duration ?? 0.3,
          ease: customization?.animation?.modal?.ease ?? 'easeOut',
          delay: customization?.animation?.modal?.delay ?? 0,
        },
      };
    })();

    // Early return if no active wallet - prevents rendering empty modal
    if (!hasActiveWallet || !activeConnection) {
      return null;
    }

    /**
     * Render header section
     * Supports full Header replacement or individual component customization
     */
    const renderHeader = () => {
      // If custom Header component is provided, use it directly
      if (CustomHeader) {
        return (
          <CustomHeader
            contentType={connectedModalContentType}
            title={currentTitle}
            onBack={handleBackToMain}
            onClose={handleCloseModal}
            labels={labels}
            className={customization?.classNames?.header?.({ contentType: connectedModalContentType })}
          />
        );
      }

      // Otherwise use DefaultHeader with customizable sub-components
      return (
        <DefaultHeader
          contentType={connectedModalContentType}
          title={currentTitle}
          onBack={handleBackToMain}
          onClose={handleCloseModal}
          labels={labels}
          className={customization?.classNames?.header?.({ contentType: connectedModalContentType })}
          DialogTitleComponent={CustomDialogTitle}
          BackButtonComponent={CustomBackButton}
          CloseButtonComponent={CustomCloseButton}
          dialogTitleClassName={customization?.classNames?.dialogTitle?.({ contentType: connectedModalContentType })}
          closeButtonClassName={customization?.classNames?.closeButton?.()}
        />
      );
    };

    const content = (
      <>
        {/* Modal header with navigation and close controls */}
        {renderHeader()}

        {/* Main content area - changes based on current view */}
        <CustomMainContent
          contentType={connectedModalContentType}
          balance={balance}
          refetch={refetch}
          ensNameAbbreviated={ensNameAbbreviated}
          avatarIsLoading={avatarIsLoading}
          balanceLoading={balanceLoading}
          ensAvatar={ensAvatar}
          chainsList={chainsList}
          transactionPool={transactionPool}
          pulsarAdapter={pulsarAdapter}
          onChainChange={handleChainChange}
          onBack={handleBackToMain}
          getChainData={getChainData}
          childCustomizations={customization?.childCustomizations}
          className={customization?.classNames?.mainContent?.({ contentType: connectedModalContentType })}
          pagination={pagination}
        />

        {/* Footer with additional controls */}
        <CustomFooter
          setIsOpen={setIsConnectedModalOpen}
          className={customization?.classNames?.footer?.()}
          customization={customization?.childCustomizations?.footer}
        />
      </>
    );

    return (
      <CustomDialog open={isConnectedModalOpen} onOpenChange={handleOpenChange} {...customization?.dialogProps}>
        <CustomDialogContent
          ref={ref}
          className={dialogContentClasses}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabels?.dialog}
          {...customization?.dialogContentProps}
        >
          <MotionContainer className={customization?.classNames?.motionContainer?.()} {...motionProps}>
            <div
              className={
                customization?.classNames?.contentContainer?.({ contentType: connectedModalContentType })
                  ? customization?.classNames?.contentContainer?.({ contentType: connectedModalContentType })
                  : cn('novacon:relative novacon:flex novacon:w-full novacon:flex-col')
              }
            >
              {content}
            </div>
          </MotionContainer>
        </CustomDialogContent>
      </CustomDialog>
    );
  },
);

ConnectedModal.displayName = 'ConnectedModal';
