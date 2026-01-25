/**
 * @file ConnectedModal component with comprehensive customization options for all child components.
 */

import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
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
import {
  ScrollableChainList,
  ScrollableChainListCustomization,
  ScrollableChainListProps,
} from '../Chains/ScrollableChainList';
import { ConnectButtonProps } from '../ConnectButton';
import {
  ConnectedModalFooter,
  ConnectedModalFooterCustomization,
  ConnectedModalFooterProps,
} from './ConnectedModalFooter';
import {
  ConnectedModalMainContent,
  ConnectedModalMainContentCustomization,
  ConnectedModalMainContentProps,
} from './ConnectedModalMainContent';
import {
  ConnectedModalTxHistory,
  ConnectedModalTxHistoryCustomization,
  ConnectedModalTxHistoryProps,
} from './ConnectedModalTxHistory';
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
type DialogTitleProps = {
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
type BackButtonProps = {
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
type CloseButtonProps = {
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
type HeaderProps = {
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
 * Props for custom MainContent component
 */
type MainContentProps = Pick<NovaConnectProviderProps, 'transactionPool' | 'pulsarAdapter'> & {
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
  /** Handler for chain change */
  onChainChange: (chainId: string) => void;
  /** Handler for back navigation */
  onBack: () => void;
  /** Function to get chain data */
  getChainData: (chain: string | number) => { formattedChainId: string | number; chain: string | number };
  /** Additional CSS classes */
  className?: string;
  /** Child component customizations */
  childCustomizations?: ConnectedModalCustomization['childCustomizations'];
};

// --- Wallet Name Hook Config Type ---
type WalletNameConfig = {
  abbreviateSymbols?: number;
  maxNameLength?: number;
  autoRetry?: boolean;
  retryDelay?: number;
};

/**
 * Customization options for ConnectedModal component
 */
export type ConnectedModalCustomization = {
  /** Override root dialog props */
  dialogProps?: Partial<ComponentPropsWithoutRef<typeof Dialog>>;
  /** Override dialog content props */
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
    DialogTitle?: ComponentType<DialogTitleProps>;
    /**
     * Custom header component
     * Wraps DialogTitle and CloseButton together
     * Use this to customize the entire header layout
     */
    Header?: ComponentType<HeaderProps>;
    /** Custom back button component (chevron left icon button) */
    BackButton?: ComponentType<BackButtonProps>;
    /** Custom close button component (X icon button) */
    CloseButton?: ComponentType<CloseButtonProps>;
    /** Custom main content component (renders different views based on contentType) */
    MainContent?: ComponentType<MainContentProps>;
    /** Custom main content renderer for main view */
    MainContentRenderer?: ComponentType<ConnectedModalMainContentProps>;
    /** Custom transactions content renderer */
    TransactionsContentRenderer?: ComponentType<ConnectedModalTxHistoryProps>;
    /** Custom chains content renderer */
    ChainsContentRenderer?: ComponentType<ScrollableChainListProps>;
    /** Custom footer component */
    Footer?: ComponentType<ConnectedModalFooterProps>;
    /** Custom motion container for animations */
    MotionContainer?: ComponentType<ComponentPropsWithoutRef<typeof motion.div>>;
  };
  /** Custom class name generators */
  classNames?: {
    /** Function to generate dialog classes */
    dialog?: () => string;
    /** Function to generate dialog content classes */
    dialogContent?: (params: { contentType: ConnectedContentType; hasActiveWallet: boolean }) => string;
    /** Function to generate motion container classes */
    motionContainer?: () => string;
    /** Function to generate content container classes */
    contentContainer?: (params: { contentType: ConnectedContentType }) => string;
    /** Function to generate header classes */
    header?: (params: { contentType: ConnectedContentType }) => string;
    /** Function to generate dialog title classes */
    dialogTitle?: (params: { contentType: ConnectedContentType }) => string;
    /** Function to generate back button classes */
    backButton?: () => string;
    /** Function to generate close button classes */
    closeButton?: () => string;
    /** Function to generate main content classes */
    mainContent?: (params: { contentType: ConnectedContentType }) => string;
    /** Function to generate footer classes */
    footer?: () => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Modal animation variants */
    modal?: Variants;
    /** Content animation variants */
    content?: Variants;
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
    /** Content animation configuration */
    content?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
      /** Animation delay in seconds */
      delay?: number;
    };
    /** Layout animation configuration */
    layout?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
    };
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom handler for modal open state change */
    onOpenChange?: (open: boolean) => void;
    /** Custom handler for back navigation */
    onBack?: () => void;
    /** Custom handler for modal close */
    onClose?: () => void;
    /** Custom handler for chain change */
    onChainChange?: (chainId: string) => void;
    /** Custom handler for content type change */
    onContentTypeChange?: (type: ConnectedContentType) => void;
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
    /** Whether to disable animations */
    disableAnimation?: boolean;
    /** Whether to reduce motion for accessibility */
    reduceMotion?: boolean;
    /** Whether to auto-reset to main view when opening */
    autoResetToMain?: boolean;
    /** Custom ARIA labels for different states */
    ariaLabels?: {
      dialog?: string;
      header?: string;
      backButton?: string;
      closeButton?: string;
      mainContent?: string;
    };
    /** Hook configurations */
    hooks?: {
      /** Configuration for wallet name and avatar hook */
      walletNameAndAvatar?: WalletNameConfig;
    };
  };
};

/**
 * Props for the ConnectedModal component
 */
export interface ConnectedModalProps
  extends
    Omit<ConnectButtonProps, 'className' | 'customization'>,
    Pick<NovaConnectProviderProps, 'transactionPool' | 'pulsarAdapter' | 'appChains' | 'solanaRPCUrls'> {
  /** Additional CSS classes for the modal */
  className?: string;
  /** Customization options */
  customization?: ConnectedModalCustomization;
}

// --- Default Sub-Components ---

/**
 * Default back button component
 */
const DefaultBackButton: React.FC<BackButtonProps> = ({ onBack, labels, className }) => (
  <button
    type="button"
    onClick={onBack}
    aria-label={labels.back}
    className={cn(
      'novacon:cursor-pointer novacon:rounded-full novacon:p-1',
      'novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors',
      'novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-text-primary)]',
      'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-border-primary)]',
      className,
    )}
  >
    <ChevronLeftIcon className="novacon:h-5 novacon:w-5" />
  </button>
);

/**
 * Default close button component
 */
const DefaultCloseButton: React.FC<CloseButtonProps> = ({ onClose, labels, className }) => (
  <DialogClose asChild>
    <button
      type="button"
      onClick={onClose}
      aria-label={labels.closeModal}
      className={cn(
        'novacon:cursor-pointer novacon:rounded-full novacon:p-1',
        'novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors',
        'novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-text-primary)]',
        'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-border-primary)]',
        className,
      )}
    >
      <CloseIcon />
    </button>
  </DialogClose>
);

/**
 * Default dialog title component
 * Combines back button (conditional) and title text
 */
const DefaultDialogTitle: React.FC<DialogTitleProps & { BackButton?: ComponentType<BackButtonProps> }> = ({
  title,
  contentType,
  onBack,
  labels,
  className,
  BackButton = DefaultBackButton,
}) => (
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
  HeaderProps & {
    DialogTitleComponent?: ComponentType<DialogTitleProps>;
    CloseButtonComponent?: ComponentType<CloseButtonProps>;
    BackButtonComponent?: ComponentType<BackButtonProps>;
    dialogTitleClassName?: string;
    closeButtonClassName?: string;
    backButtonClassName?: string;
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
const DefaultMainContent: React.FC<MainContentProps> = ({
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
 * Modal component that displays wallet connection status and provides access to wallet controls with comprehensive customization options.
 *
 * This modal serves as the main interface for connected wallet management, offering:
 * - Wallet connection status and information
 * - Network switching capabilities
 * - Transaction history viewing
 * - Wallet disconnection controls
 * - Comprehensive customization for all UI elements and behaviors
 * - Animation support with reduced motion options
 * - Custom event handlers for enhanced interactivity
 * - Performance-optimized with memoized calculations
 * - Full customization of child components through parent
 *
 * The modal adapts its content based on the current view state and provides
 * full WCAG compliance with proper ARIA labels and keyboard navigation support.
 *
 * @example Basic usage
 * ```tsx
 * <ConnectedModal
 *   solanaRPCUrls={solanaConfig}
 *   transactionPool={txPool}
 *   pulsarAdapter={adapter}
 *   appChains={chainConfig}
 *   store={store}
 * />
 * ```
 *
 * @example Customizing DialogTitle
 * ```tsx
 * <ConnectedModal
 *   customization={{
 *     components: {
 *       DialogTitle: ({ title, contentType, onBack, labels }) => (
 *         <div className="custom-title">
 *           {contentType !== 'main' && (
 *             <button onClick={onBack}>{labels.back}</button>
 *           )}
 *           <h2>{title}</h2>
 *         </div>
 *       ),
 *     },
 *     classNames: {
 *       dialogTitle: ({ contentType }) =>
 *         contentType === 'main' ? 'main-title' : 'sub-title',
 *     },
 *   }}
 * />
 * ```
 */
export const ConnectedModal = forwardRef<HTMLDivElement, ConnectedModalProps>(
  ({ solanaRPCUrls, transactionPool, pulsarAdapter, appChains, className, customization }, ref) => {
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
    const walletNameConfig: WalletNameConfig = hooksConfig?.walletNameAndAvatar ?? {
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
        setIsConnectedModalOpen(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customHandlers?.onClose, setIsConnectedModalOpen]);

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
          backButtonClassName={customization?.classNames?.backButton?.()}
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
