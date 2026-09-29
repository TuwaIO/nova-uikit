import { InformationCircleIcon } from '@heroicons/react/24/outline';
import {
  CloseIcon,
  cn,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  standardButtonClasses,
} from '@tuwaio/nova-core';
import {
  ConnectorType,
  delay,
  formatConnectorName,
  getConnectorTypeFromName,
  getNetworkData,
  impersonatedHelpers,
  isAddress,
  OrbitAdapter,
  TuwaErrorState,
  waitFor,
} from '@tuwaio/orbit-core';
import { motion } from 'framer-motion';
import React, {
  ComponentPropsWithoutRef,
  ComponentType,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { ConnectContentType, useNovaConnect, useNovaConnectLabels } from '../../hooks';
import { Connector, SatelliteStoreContext, useSatelliteConnectStore } from '../../satellite';
import { InitialChains } from '../../types';
import { getConnectChainId, getFilteredConnectors } from '../../utils';
import { AboutWallets, AboutWalletsCustomization } from './AboutWallets';
import { Connecting, ConnectingCustomization } from './Connecting';
import { ConnectorsSelections, ConnectorsSelectionsCustomization } from './ConnectorsSelections';
import { GetWallet, GetWalletCustomization } from './GetWallet';
import { ImpersonateForm, ImpersonateFormCustomization } from './ImpersonatedForm';
import { LegalDisclaimer, LegalDisclaimerCustomization } from './LegalDisclaimer';
import { NetworkSelections, NetworkSelectionsCustomization } from './NetworkSelections';
import { NetworkTabs, NetworkTabsCustomization } from './NetworkTabs';

/**
 * A wallet with its connectors on each network (the connectors of the Satellite store grouped by wallet name).
 */
export interface GroupedConnector {
  /** Name of the wallet connector */
  name: string;
  /** Optional icon for the wallet */
  icon?: string;
  /** Array of supported network adapters */
  adapters: OrbitAdapter[];
  /** Array of connectors with their associated adapters */
  connectors: (Connector & {
    /** Adapter of the connector */
    adapter: OrbitAdapter;
  })[];
}

/**
 * State of the {@link ConnectModal}, passed to its custom components, class name generators and handlers.
 */
export interface ConnectModalData {
  /** Current content type being displayed */
  contentType: ConnectContentType;
  /** Selected network adapter (`undefined` shows the connectors of all networks) */
  selectedAdapter: OrbitAdapter | undefined;
  /** The selected wallet, as `formatConnectorName` of `@tuwaio/orbit-core` returns it */
  activeConnector: string | undefined;
  /** Address typed in the impersonation form */
  impersonatedAddress: string;
  /** Whether the wallet has just connected (`true` for 500 ms before the modal closes) */
  isConnected: boolean;
  /** Whether modal is open */
  isOpen: boolean;
  /** `connectionError` of the Satellite store, or `null` */
  error: Error | TuwaErrorState | null | undefined;
  /** Connectors of the Satellite store by adapter (`getConnectors()`; `undefined` while the modal is closed) */
  connectors: Record<string, Connector[]>;
  /** Filtered connectors for current adapter */
  filteredConnectors: GroupedConnector[];
  /** Current labels from i18n */
  labels: ReturnType<typeof useNovaConnectLabels>;
}

/**
 * The action button in the footer of the {@link ConnectModal}, which depends on the content type.
 */
export interface BottomButtonConfig {
  /** Button title text */
  title: string;
  /** Button click handler */
  onClick: () => void | Promise<void>;
  /** Whether button is disabled (not set by the modal) */
  disabled?: boolean;
  /** Shows `Loading...` and disables the button (not set by the modal) */
  loading?: boolean;
}

// --- Component Props Types ---
/**
 * Props for a custom container of the modal content.
 */
export type ConnectModalContainerProps = {
  /** Classes from `classNames.modalContainer` */
  className?: string;
  /** The header, main content and footer */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom modal header.
 */
export type ConnectModalHeaderProps = {
  /** Classes from `classNames.header` */
  className?: string;
  /** The title and the close button */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom info button (shown on the connectors screen).
 */
export type ConnectModalInfoButtonProps = {
  /** Classes from `classNames.infoButton` */
  className?: string;
  /** Runs `handlers.onInfoClick`, or shows the "About wallets" screen */
  onClick: () => void;
  /** From `config.ariaLabels.infoButton`, or the `learnMore` and `aboutWallets` labels */
  'aria-label'?: string;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLButtonElement>;

/**
 * Props for a custom modal title.
 */
export type ConnectModalTitleProps = {
  /** Classes from `classNames.title` */
  className?: string;
  /** The info button (connectors screen) and the title of the current screen */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom close button.
 */
export type ConnectModalCloseButtonProps = {
  /** Classes from `classNames.closeButton` */
  className?: string;
  /** Closes the modal (through `handlers.onOpenChange` when set) */
  onClick: () => void;
  /** From `config.ariaLabels.closeButton`, or the `closeModal` label */
  'aria-label'?: string;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLButtonElement>;

/**
 * Props for a custom main content wrapper (a `main` element by default).
 */
export type ConnectModalMainContentProps = {
  /** Classes from `classNames.mainContent` */
  className?: string;
  /** The content of the current screen */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom footer.
 */
export type ConnectModalFooterProps = {
  /** Classes from `classNames.footer` */
  className?: string;
  /** The back button and the action button */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom back button (shown on every screen except the connectors one).
 */
export type ConnectModalBackButtonProps = {
  /** Classes from `classNames.backButton` */
  className?: string;
  /** Runs `handlers.onBack`, or goes back to the connectors screen */
  onClick: () => void;
  /** From `config.ariaLabels.backButton`, or the `backToPreviousStep` label */
  'aria-label'?: string;
  /** The `back` label */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLButtonElement>;

/**
 * Props for a custom action button of the footer.
 */
export type ConnectModalActionButtonProps = {
  /** Classes from `classNames.actionButton` */
  className?: string;
  /** `buttonConfig.onClick` */
  onClick: () => void | Promise<void>;
  /** ID of the action description */
  'aria-describedby'?: string;
  /** `buttonConfig.title` */
  children: React.ReactNode;
  /** `buttonConfig.disabled` */
  disabled?: boolean;
  /** `buttonConfig.loading` */
  loading?: boolean;
  /** State of the modal */
  modalData: ConnectModalData;
  /** The button */
  buttonConfig: BottomButtonConfig;
} & React.RefAttributes<HTMLButtonElement>;

/**
 * Props for a custom description of the action button (visually hidden by default).
 */
export type ConnectModalActionDescriptionProps = {
  /** `bottom-action-description` */
  id?: string;
  /** Classes from `classNames.actionDescription` */
  className?: string;
  /** What the action button does, in English */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLSpanElement>;

/**
 * Props for a custom empty state (shown when the store returns no connectors).
 */
export type ConnectModalEmptyProps = {
  /** Classes from `classNames.emptyConnectors` */
  className?: string;
  /** The `noConnectorsAvailable` label */
  children: React.ReactNode;
  /** State of the modal */
  modalData: ConnectModalData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization options of {@link ConnectModal}.
 */
export type ConnectModalCustomization = {
  /** Custom components */
  components?: {
    /** Custom modal container */
    ModalContainer?: ComponentType<ConnectModalContainerProps>;
    /** Custom modal header */
    ModalHeader?: ComponentType<ConnectModalHeaderProps>;
    /** Custom info button */
    InfoButton?: ComponentType<ConnectModalInfoButtonProps>;
    /** Custom title */
    Title?: ComponentType<ConnectModalTitleProps>;
    /** Custom close button */
    CloseButton?: ComponentType<ConnectModalCloseButtonProps>;
    /** Custom main content wrapper */
    MainContent?: ComponentType<ConnectModalMainContentProps>;
    /** Custom footer */
    Footer?: ComponentType<ConnectModalFooterProps>;
    /** Custom back button */
    BackButton?: ComponentType<ConnectModalBackButtonProps>;
    /** Custom action button */
    ActionButton?: ComponentType<ConnectModalActionButtonProps>;
    /** Custom action description */
    ActionDescription?: ComponentType<ConnectModalActionDescriptionProps>;
    /** Custom dialog (default: `Dialog` from `@tuwaio/nova-core`) */
    Dialog?: ComponentType<ComponentPropsWithoutRef<typeof Dialog>>;
    /** Custom dialog content (default: `DialogContent` from `@tuwaio/nova-core`) */
    DialogContent?: ComponentType<ComponentPropsWithoutRef<typeof DialogContent>>;
    /** Custom layout animation wrapper (default: `motion.div`) */
    MotionDiv?: ComponentType<ComponentPropsWithoutRef<typeof motion.div>>;
    /** Custom empty state */
    EmptyState?: ComponentType<ConnectModalEmptyProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns classes of the modal container, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    modalContainer?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the header, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    header?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the info button, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    infoButton?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the title, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    title?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the close button, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    closeButton?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the main content, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    mainContent?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the footer, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    footer?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the back button, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    backButton?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns classes of the action button, added to the default ones.
     *
     * @param params - The modal and the button.
     * @param params.modalData - State of the modal.
     * @param params.buttonConfig - The action button.
     * @returns The classes.
     */
    actionButton?: (params: { modalData: ConnectModalData; buttonConfig: BottomButtonConfig }) => string;
    /**
     * Returns classes of the action description, added to the default ones.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    actionDescription?: (params: { modalData: ConnectModalData }) => string;
    /**
     * Returns the classes of the empty state.
     *
     * @param params - The modal.
     * @param params.modalData - State of the modal.
     * @returns The classes.
     */
    emptyConnectors?: (params: { modalData: ConnectModalData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Replaces the open state change of the dialog (close button, Escape, click outside). The modal stays open until
     * the handler calls `setIsConnectModalOpen(open)` from `useNovaConnect`.
     *
     * @param open - The requested state.
     * @param modalData - State of the modal.
     */
    onOpenChange?: (open: boolean, modalData: ConnectModalData) => void;
    /**
     * Wraps the back button: call `originalHandler()` to go back to the connectors screen.
     *
     * @param modalData - State of the modal.
     * @param originalHandler - Shows the connectors screen.
     */
    onBack?: (modalData: ConnectModalData, originalHandler: () => void) => void;
    /**
     * Replaces the info button, which shows the "About wallets" screen by default.
     *
     * @param modalData - State of the modal.
     */
    onInfoClick?: (modalData: ConnectModalData) => void;
    /** Replace the action button of the footer on each screen */
    onActionClick?: {
      /**
       * Replaces "I don't have a wallet" of the connectors screen, which shows the "Get a wallet" screen by default.
       *
       * @param modalData - State of the modal.
       */
      connectors?: (modalData: ConnectModalData) => void;
      /**
       * Replaces the button of the "Get a wallet" screen, which opens the wallet list of the selected (or first)
       * network in a new tab by default (`ethereum.org` or `solana.com`, from `getNetworkData` of
       * `@tuwaio/orbit-core`).
       *
       * @param modalData - State of the modal.
       */
      getWallet?: (modalData: ConnectModalData) => void;
      /**
       * Replaces "Learn more" of the "About wallets" screen, which opens the wallet guide of the selected (or first)
       * network in a new tab by default.
       *
       * @param modalData - State of the modal.
       */
      about?: (modalData: ConnectModalData) => void;
      /**
       * Replaces "Connect" of the impersonation form. By default it checks the address, saves it to `localStorage`
       * (`satellite-connect:impersonatedAddress`, through `impersonatedHelpers` of `@tuwaio/orbit-core`) and connects
       * the impersonated connector.
       *
       * @param modalData - State of the modal.
       * @returns Resolves when the action finishes.
       */
      impersonate?: (modalData: ConnectModalData) => Promise<void>;
      /**
       * Replaces "Try again", shown after a connection error, which connects the selected wallet again by default.
       *
       * @param modalData - State of the modal.
       * @returns Resolves when the action finishes.
       */
      connecting?: (modalData: ConnectModalData) => Promise<void>;
    };
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /**
       * Returns the ARIA label of the info button (default: the `learnMore` and `aboutWallets` labels).
       *
       * @param modalData - State of the modal.
       * @returns The label.
       */
      infoButton?: (modalData: ConnectModalData) => string;
      /**
       * Returns the ARIA label of the close button (default: the `closeModal` label).
       *
       * @param modalData - State of the modal.
       * @returns The label.
       */
      closeButton?: (modalData: ConnectModalData) => string;
      /**
       * Returns the ARIA label of the back button (default: the `backToPreviousStep` label).
       *
       * @param modalData - State of the modal.
       * @returns The label.
       */
      backButton?: (modalData: ConnectModalData) => string;
    };
    /** Animation configuration */
    animation?: {
      /** Duration of the layout transition between screens, in seconds (default: `0.0001`) */
      layoutDuration?: number;
      /** Sets the duration of the layout transition to `0` */
      disabled?: boolean;
    };
  };
  /** Child component customizations */
  childComponents?: {
    /** AboutWallets customization */
    aboutWallets?: AboutWalletsCustomization;
    /** Connecting customization */
    connecting?: ConnectingCustomization;
    /** ConnectorsSelections customization */
    connectorsSelections?: ConnectorsSelectionsCustomization;
    /** GetWallet customization */
    getWallet?: GetWalletCustomization;
    /** ImpersonateForm customization */
    impersonateForm?: ImpersonateFormCustomization;
    /** NetworkSelections customization */
    networkSelections?: NetworkSelectionsCustomization;
    /** NetworkTabs customization */
    networkTabs?: NetworkTabsCustomization;
    /** LegalDisclaimer customization */
    legalDisclaimer?: LegalDisclaimerCustomization;
  };
};

/**
 * Helper function to safely get connector name from array
 */
function getConnectorName(
  connectors: Connector[] | undefined,
  activeConnector: string | undefined,
): string | undefined {
  if (!connectors || !Array.isArray(connectors) || !activeConnector) {
    return undefined;
  }

  // Use a more direct approach with explicit type casting
  const connector = connectors.find((c) => {
    // Safely check if c is a valid object with a name property
    if (c && typeof c === 'object' && 'name' in c && typeof (c as any).name === 'string') {
      return formatConnectorName((c as { name: string }).name) === activeConnector;
    }
    return false;
  });

  // Safely access the name property with type checking
  if (
    connector &&
    typeof connector === 'object' &&
    'name' in connector &&
    typeof (connector as any).name === 'string'
  ) {
    return (connector as { name: string }).name;
  }

  return undefined;
}

// --- Default Sub-Components ---
const DefaultModalContainer = forwardRef<HTMLDivElement, ConnectModalContainerProps>(
  // eslint-disable-next-line
  ({ className, children, modalData, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('novacon:relative novacon:flex novacon:w-full novacon:flex-col', className)}
      {...props}
    >
      {children}
    </div>
  ),
);
DefaultModalContainer.displayName = 'DefaultModalContainer';

const DefaultModalHeader = forwardRef<HTMLDivElement, ConnectModalHeaderProps>(
  // eslint-disable-next-line
  ({ className, children, modalData, ...props }, ref) => (
    <div ref={ref} {...props}>
      <DialogHeader className={className}>{children}</DialogHeader>
    </div>
  ),
);
DefaultModalHeader.displayName = 'DefaultModalHeader';

const DefaultInfoButton = forwardRef<HTMLButtonElement, ConnectModalInfoButtonProps>(
  // eslint-disable-next-line
  ({ className, onClick, modalData, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'novacon:cursor-pointer novacon:text-[var(--tuwa-text-secondary)] novacon:transition novacon:duration-300 novacon:ease-in-out novacon:active:scale-75 novacon:hover:scale-110 novacon:mr-1',
        className,
      )}
      type="button"
      onClick={onClick}
      {...props}
    >
      <InformationCircleIcon width={20} height={20} aria-hidden="true" />
    </button>
  ),
);
DefaultInfoButton.displayName = 'DefaultInfoButton';

const DefaultTitle = forwardRef<HTMLDivElement, ConnectModalTitleProps>(
  // eslint-disable-next-line
  ({ className, children, modalData, ...props }, ref) => (
    <DialogTitle ref={ref} className={cn('novacon:flex novacon:items-center', className)} {...props}>
      {children}
    </DialogTitle>
  ),
);
DefaultTitle.displayName = 'DefaultTitle';

const DefaultCloseButton = forwardRef<HTMLButtonElement, ConnectModalCloseButtonProps>(
  // eslint-disable-next-line
  ({ className, onClick, modalData, ...props }, ref) => (
    // Not wrapped in `DialogClose`: it would call `onOpenChange` a second time
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        'novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1 novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-text-primary)]',
        className,
      )}
      {...props}
    >
      <CloseIcon aria-hidden="true" />
    </button>
  ),
);
DefaultCloseButton.displayName = 'DefaultCloseButton';

const DefaultMainContent = forwardRef<HTMLDivElement, ConnectModalMainContentProps>(
  // eslint-disable-next-line
  ({ className, children, modalData, ...props }, ref) => (
    <main
      ref={ref}
      className={cn('novacon:flex novacon:flex-col novacon:gap-4 novacon:p-4', className)}
      id="connect-modal-content"
      role="main"
      {...props}
    >
      {children}
    </main>
  ),
);
DefaultMainContent.displayName = 'DefaultMainContent';

const DefaultFooter = forwardRef<HTMLDivElement, ConnectModalFooterProps>(
  // eslint-disable-next-line
  ({ className, children, modalData, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        'novacon:flex novacon:w-full novacon:items-center novacon:justify-between novacon:border-t novacon:border-[var(--tuwa-border-primary)] novacon:p-4',
        className,
      )}
      role="contentinfo"
      {...props}
    >
      {children}
    </footer>
  ),
);
DefaultFooter.displayName = 'DefaultFooter';

const DefaultBackButton = forwardRef<HTMLButtonElement, ConnectModalBackButtonProps>(
  // eslint-disable-next-line
  ({ className, onClick, children, modalData, ...props }, ref) => (
    <button ref={ref} type="button" onClick={onClick} className={cn(standardButtonClasses, className)} {...props}>
      {children}
    </button>
  ),
);
DefaultBackButton.displayName = 'DefaultBackButton';

const DefaultActionButton = forwardRef<HTMLButtonElement, ConnectModalActionButtonProps>(
  // eslint-disable-next-line
  ({ className, onClick, children, disabled, loading, buttonConfig, modalData, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(standardButtonClasses, className)}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
);
DefaultActionButton.displayName = 'DefaultActionButton';

const DefaultActionDescription = forwardRef<HTMLSpanElement, ConnectModalActionDescriptionProps>(
  // eslint-disable-next-line
  ({ className, children, modalData, ...props }, ref) => (
    <span ref={ref} className={cn('novacon:sr-only', className)} {...props}>
      {children}
    </span>
  ),
);
DefaultActionDescription.displayName = 'DefaultActionDescription';

const DefaultEmptyState = forwardRef<HTMLDivElement, ConnectModalEmptyProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { modalData: _modalData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    );
  },
);
DefaultEmptyState.displayName = 'DefaultEmptyState';

/**
 * Props for the {@link ConnectModal} component. `appChains` and `solanaRPCUrls` choose the chain a wallet connects to.
 */
export interface ConnectModalProps extends InitialChains {
  /** Customization options */
  customization?: ConnectModalCustomization;
}

/**
 * The connect modal: wallet list with network tabs, network choice for multi-network wallets, connection progress
 * with retry, "About wallets", "Get a wallet" and the impersonation form. Open it with `setIsConnectModalOpen(true)`
 * from `useNovaConnect`; `NovaConnectProvider` renders it when `appChains` or `solanaRPCUrls` is set.
 *
 * Opening the modal resets it to the wallet list. A wallet connects through `connect` of the Satellite store to the
 * first chain of `appChains` (EVM) or the first cluster of `solanaRPCUrls` (Solana), and the modal closes 400 ms after
 * the wallet reports the connection (it waits up to 10 seconds). Texts come from the Nova Connect labels, except a
 * few English accessibility texts.
 *
 * Props: {@link ConnectModalProps}.
 *
 * @example
 * ```tsx
 * import { ConnectModal } from '@tuwaio/nova-connect/components';
 * import { mainnet, polygon } from 'viem/chains';
 *
 * export const Modal = (
 *   <ConnectModal
 *     appChains={[mainnet, polygon]}
 *     solanaRPCUrls={{ devnet: 'https://api.devnet.solana.com' }}
 *     customization={{
 *       classNames: {
 *         title: ({ modalData }) => (modalData.contentType === 'about' ? 'custom-about-title' : ''),
 *       },
 *     }}
 *   />
 * );
 * ```
 */
export const ConnectModal = memo<ConnectModalProps>(({ appChains, solanaRPCUrls, customization = {} }) => {
  const {
    isConnectModalOpen,
    setIsConnectModalOpen,
    setConnectModalContentType,
    setActiveConnector,
    setImpersonatedAddress,
    setIsConnected,
    connectModalContentType,
    selectedAdapter,
    setSelectedAdapter,
    isConnected,
    activeConnector,
    impersonatedAddress,
  } = useNovaConnect();

  const connectionError = useSatelliteConnectStore((store) => store.connectionError);
  const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);
  const connect = useSatelliteConnectStore((store) => store.connect);
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);

  const labels = useNovaConnectLabels();
  const store = useContext(SatelliteStoreContext);

  // Memoize connectors to avoid recalculation on every render
  const connectors = isConnectModalOpen ? getConnectors() : undefined;

  const filteredConnectors = getFilteredConnectors({ connectors: connectors!, selectedAdapter });

  // Memoize modal data for customization context
  const modalData = useMemo<ConnectModalData>(
    () => ({
      contentType: connectModalContentType,
      selectedAdapter,
      activeConnector,
      impersonatedAddress,
      isConnected,
      isOpen: isConnectModalOpen,
      error: connectionError ?? null,
      connectors: connectors!,
      filteredConnectors,
      labels,
    }),
    [
      connectModalContentType,
      selectedAdapter,
      activeConnector,
      impersonatedAddress,
      isConnected,
      isConnectModalOpen,
      connectionError,
      connectors,
      filteredConnectors,
      labels,
    ],
  );

  // Reset modal state when opened
  useEffect(() => {
    if (isConnectModalOpen) {
      setConnectModalContentType('connectors');
      setSelectedAdapter(undefined);
      setActiveConnector(undefined);
      setImpersonatedAddress('');
      setIsConnected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnectModalOpen]);

  // Extract customization options
  const { components = {}, classNames = {}, handlers = {}, config = {}, childComponents = {} } = customization;

  // Component selections with defaults
  const ModalContainer = components.ModalContainer || DefaultModalContainer;
  const ModalHeader = components.ModalHeader || DefaultModalHeader;
  const InfoButton = components.InfoButton || DefaultInfoButton;
  const Title = components.Title || DefaultTitle;
  const CloseButton = components.CloseButton || DefaultCloseButton;
  const MainContent = components.MainContent || DefaultMainContent;
  const Footer = components.Footer || DefaultFooter;
  const BackButton = components.BackButton || DefaultBackButton;
  const ActionButton = components.ActionButton || DefaultActionButton;
  const ActionDescription = components.ActionDescription || DefaultActionDescription;
  const CustomEmptyState = components.EmptyState || DefaultEmptyState;
  const CustomDialog = components.Dialog || Dialog;
  const CustomDialogContent = components.DialogContent || DialogContent;
  const CustomMotionDiv = components.MotionDiv || motion.div;

  /**
   * Gets the appropriate title for the current modal content
   */
  const getTitle = useCallback(() => {
    switch (connectModalContentType) {
      case 'about':
        return labels.aboutWallets;
      case 'getWallet':
        return labels.getWallet;
      case 'connecting':
        if (selectedAdapter && activeConnector && connectors) {
          const connectorName = getConnectorName(connectors[selectedAdapter], activeConnector);
          return connectorName || labels.connectingEllipsis;
        }
        return labels.connectingEllipsis;
      case 'impersonate':
        return labels.connectImpersonatedWallet;
      default:
        return labels.connectWallet;
    }
  }, [connectModalContentType, selectedAdapter, activeConnector, connectors, labels]);

  /**
   * Determines the content type to navigate back to
   */
  const goBackContentType = useCallback((): ConnectContentType => {
    switch (connectModalContentType) {
      default:
        return 'connectors';
    }
  }, [connectModalContentType]);

  /**
   * Handle modal open/close with custom handler
   */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (handlers?.onOpenChange) {
        handlers.onOpenChange(open, modalData);
      } else {
        setIsConnectModalOpen(open);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handlers?.onOpenChange, modalData, setIsConnectModalOpen],
  );

  /**
   * Handle back navigation with custom handler
   */
  const handleBack = useCallback(() => {
    const originalHandler = () => setConnectModalContentType(goBackContentType());

    if (handlers?.onBack) {
      handlers.onBack(modalData, originalHandler);
    } else {
      originalHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers?.onBack, modalData, setConnectModalContentType, goBackContentType]);

  /**
   * Handle info button click
   */
  const handleInfoClick = useCallback(() => {
    if (handlers?.onInfoClick) {
      handlers.onInfoClick(modalData);
    } else {
      setConnectModalContentType('about');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers?.onInfoClick, modalData, setConnectModalContentType]);

  /**
   * Generic connection handler
   */
  const handleConnect = useCallback(
    async (connectorType: ConnectorType, adapter: OrbitAdapter) => {
      await connect({
        connectorType,
        chainId: getConnectChainId({ appChains, selectedAdapter: adapter, solanaRPCUrls }),
      });

      try {
        await waitFor(() => store?.getState().activeConnection?.isConnected);
        setIsConnected(true);
        const modalCloseTime = setTimeout(() => setIsConnectModalOpen(false), 400);
        const isConnectedTimer = setTimeout(() => setIsConnected(false), 500);
        await delay(null, 500);
        clearTimeout(modalCloseTime);
        clearTimeout(isConnectedTimer);
      } catch (error) {
        console.error(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connect, appChains, selectedAdapter, solanaRPCUrls],
  );

  /**
   * Handle network selection click
   */
  const handleNetworkClick = useCallback(
    async (adapter: OrbitAdapter, connectorType: ConnectorType) => {
      setSelectedAdapter(adapter);
      setConnectModalContentType('connecting');
      await handleConnect(connectorType, adapter);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleConnect],
  );

  /**
   * Handle connector selection click
   */
  const handleConnectorClick = useCallback(
    (connector: GroupedConnector) => {
      setActiveConnector(formatConnectorName(connector.name));
      if (connector.adapters.length === 1) {
        setSelectedAdapter(connector.adapters[0]);
        setConnectModalContentType(
          formatConnectorName(connector.name) === 'impersonatedwallet' ? 'impersonate' : 'connecting',
        );
      } else if (selectedAdapter) {
        setConnectModalContentType(
          formatConnectorName(connector.name) === 'impersonatedwallet' ? 'impersonate' : 'connecting',
        );
      } else if (formatConnectorName(connector.name) === 'impersonatedwallet') {
        setConnectModalContentType('impersonate');
      } else {
        setConnectModalContentType('network');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAdapter],
  );

  /**
   * Renders the main content based on current modal state
   */
  const renderMainContent = useCallback(() => {
    switch (connectModalContentType) {
      case 'network':
        return (
          <NetworkSelections
            activeConnector={activeConnector}
            connectors={filteredConnectors}
            onClick={handleNetworkClick}
            customization={childComponents.networkSelections}
          />
        );
      case 'connectors':
        return connectors ? (
          <>
            <NetworkTabs
              networks={Object.keys(connectors) as OrbitAdapter[]}
              selectedAdapter={selectedAdapter}
              onSelect={(adapter) => setSelectedAdapter(adapter)}
              customization={childComponents.networkTabs}
            />

            <ConnectorsSelections
              isOnlyOneNetwork={Object.keys(connectors).length === 1}
              connectors={filteredConnectors}
              selectedAdapter={selectedAdapter}
              onClick={handleConnectorClick}
              setContentType={setConnectModalContentType}
              appChains={appChains}
              solanaRPCUrls={solanaRPCUrls}
              setIsConnected={setIsConnected}
              setIsOpen={setIsConnectModalOpen}
              customization={childComponents.connectorsSelections}
            />

            <LegalDisclaimer customization={childComponents.legalDisclaimer} />
          </>
        ) : (
          <CustomEmptyState className={classNames.emptyConnectors?.({ modalData })} modalData={modalData}>
            {labels.noConnectorsAvailable}
          </CustomEmptyState>
        );
      case 'about':
        return <AboutWallets customization={childComponents.aboutWallets} />;
      case 'getWallet':
        return <GetWallet customization={childComponents.getWallet} />;
      case 'connecting':
        return (
          <Connecting
            selectedAdapter={selectedAdapter}
            connectors={filteredConnectors}
            activeConnector={activeConnector}
            isConnected={isConnected}
            customization={childComponents.connecting}
          />
        );
      case 'impersonate':
        return (
          <ImpersonateForm
            selectedAdapter={selectedAdapter}
            impersonatedAddress={impersonatedAddress}
            setImpersonatedAddress={setImpersonatedAddress}
            customization={childComponents.impersonateForm}
          />
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connectModalContentType,
    activeConnector,
    filteredConnectors,
    handleNetworkClick,
    childComponents,
    connectors,
    selectedAdapter,
    handleConnectorClick,
    isConnected,
    impersonatedAddress,
  ]);

  /**
   * Gets configuration for the bottom action button
   */
  const getBottomButtonConfig = useCallback((): BottomButtonConfig | undefined => {
    switch (connectModalContentType) {
      case 'connectors':
        return {
          title: labels.iDontHaveWallet,
          onClick: () => {
            if (handlers.onActionClick?.connectors) {
              handlers.onActionClick.connectors(modalData);
            } else {
              setConnectModalContentType('getWallet');
            }
          },
        };
      case 'getWallet':
        return {
          title: labels.choseWallet,
          onClick: () => {
            if (handlers.onActionClick?.getWallet) {
              handlers.onActionClick.getWallet(modalData);
            } else {
              window.open(
                getNetworkData(selectedAdapter ?? (Object.keys(connectors!)[0] as OrbitAdapter))?.links?.choseWallet,
                '_blank',
                'noopener,noreferrer',
              );
            }
          },
        };
      case 'about':
        return {
          title: labels.learnMore,
          onClick: () => {
            if (handlers.onActionClick?.about) {
              handlers.onActionClick.about(modalData);
            } else {
              window.open(
                getNetworkData(selectedAdapter ?? (Object.keys(connectors!)[0] as OrbitAdapter))?.links?.about,
                '_blank',
                'noopener,noreferrer',
              );
            }
          },
        };
      case 'impersonate':
        return {
          title: labels.connect,
          onClick: async () => {
            if (handlers.onActionClick?.impersonate) {
              await handlers.onActionClick.impersonate(modalData);
            } else {
              const trimmedAddress = impersonatedAddress.trim();
              if (connectionError || !trimmedAddress || !isAddress(trimmedAddress) || !!activeConnection?.isConnected)
                return;
              impersonatedHelpers.setImpersonated(trimmedAddress);
              setConnectModalContentType('connecting');
              await handleConnect(
                getConnectorTypeFromName(selectedAdapter ?? OrbitAdapter.EVM, activeConnector ?? '') as ConnectorType,
                selectedAdapter ?? OrbitAdapter.EVM,
              );
            }
          },
        };
      case 'connecting':
        return connectionError && selectedAdapter && activeConnector
          ? {
              title: labels.tryAgain,
              onClick: async () => {
                if (handlers.onActionClick?.connecting) {
                  await handlers.onActionClick.connecting(modalData);
                } else {
                  await handleConnect(
                    getConnectorTypeFromName(selectedAdapter, activeConnector) as ConnectorType,
                    selectedAdapter,
                  );
                }
              },
            }
          : undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connectModalContentType,
    labels,
    handlers,
    modalData,
    selectedAdapter,
    connectors,
    impersonatedAddress,
    connectionError,
    handleConnect,
    activeConnector,
  ]);

  const bottomButtonConfig = getBottomButtonConfig();

  /**
   * Get action description text
   */
  const getActionDescription = useCallback(() => {
    switch (connectModalContentType) {
      case 'getWallet':
        return labels.opensWalletSelectionPage;
      case 'about':
        return labels.opensDocumentation;
      case 'impersonate':
        return labels.connectsImpersonatedWallet;
      case 'connecting':
        return labels.retriesConnection;
      default:
        return '';
    }
  }, [connectModalContentType, labels]);

  return (
    <CustomDialog open={isConnectModalOpen} onOpenChange={handleOpenChange}>
      <CustomDialogContent className={cn('novacon:w-full novacon:sm:max-w-md')}>
        <CustomMotionDiv
          layout
          transition={{
            layout: {
              duration: config.animation?.disabled ? 0 : (config.animation?.layoutDuration ?? 0.0001),
            },
          }}
        >
          <ModalContainer className={classNames.modalContainer?.({ modalData })} modalData={modalData}>
            <ModalHeader className={classNames.header?.({ modalData })} modalData={modalData}>
              <Title className={classNames.title?.({ modalData })} modalData={modalData}>
                {connectModalContentType === 'connectors' && (
                  <InfoButton
                    className={classNames.infoButton?.({ modalData })}
                    onClick={handleInfoClick}
                    aria-label={
                      config.ariaLabels?.infoButton?.(modalData) || `${labels.learnMore} ${labels.aboutWallets}`
                    }
                    modalData={modalData}
                  />
                )}
                {getTitle()}
              </Title>

              <CloseButton
                className={classNames.closeButton?.({ modalData })}
                onClick={() => handleOpenChange(false)}
                aria-label={config.ariaLabels?.closeButton?.(modalData) || labels.closeModal}
                modalData={modalData}
              />
            </ModalHeader>

            <MainContent className={classNames.mainContent?.({ modalData })} modalData={modalData}>
              {renderMainContent()}
            </MainContent>

            <Footer className={classNames.footer?.({ modalData })} modalData={modalData}>
              <div className="novacon:flex novacon:items-center novacon:gap-4">
                {connectModalContentType !== 'connectors' && (
                  <BackButton
                    className={classNames.backButton?.({ modalData })}
                    onClick={handleBack}
                    aria-label={config.ariaLabels?.backButton?.(modalData) || labels.backToPreviousStep}
                    modalData={modalData}
                  >
                    {labels.back}
                  </BackButton>
                )}
              </div>
              {bottomButtonConfig && (
                <div className="novacon:flex novacon:items-center novacon:gap-3">
                  <ActionButton
                    className={classNames.actionButton?.({ modalData, buttonConfig: bottomButtonConfig })}
                    onClick={bottomButtonConfig.onClick}
                    disabled={bottomButtonConfig.disabled}
                    loading={bottomButtonConfig.loading}
                    aria-describedby="bottom-action-description"
                    modalData={modalData}
                    buttonConfig={bottomButtonConfig}
                  >
                    {bottomButtonConfig.title}
                  </ActionButton>
                  <ActionDescription
                    id="bottom-action-description"
                    className={classNames.actionDescription?.({ modalData })}
                    modalData={modalData}
                  >
                    {getActionDescription()}
                  </ActionDescription>
                </div>
              )}
            </Footer>
          </ModalContainer>
        </CustomMotionDiv>
      </CustomDialogContent>
    </CustomDialog>
  );
});

ConnectModal.displayName = 'ConnectModal';
