/**
 * @file Main NovaConnect provider component with comprehensive customization capabilities.
 * @module NovaConnectProvider
 */

import { deepMerge } from '@tuwaio/nova-core';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { BaseWallet } from '@tuwaio/satellite-core';
import { ComponentType, ReactNode, useMemo, useState } from 'react';

import {
  ButtonTxStatus,
  ConnectContentType,
  ConnectedContentType,
  defaultLabels,
  ErrorsProvider,
  ErrorsProviderCustomization,
  NovaConnectLabels,
  NovaConnectLabelsProvider,
  NovaConnectProviderContext,
  NovaConnectProviderProps as BaseNovaConnectProviderProps,
  NovaConnectProviderType,
  useSatelliteConnectStore,
} from '../index';

// --- Customization Types ---

/**
 * Props for custom NovaConnectLabelsProvider component
 */
type CustomLabelsProviderProps = {
  labels?: Partial<NovaConnectLabels>;
  children: ReactNode;
};

/**
 * Props for custom ErrorsProvider component
 */
type CustomErrorsProviderProps = {
  customization?: ErrorsProviderCustomization;
};

/**
 * Context data passed to custom provider components
 */
type ProviderContext = {
  /** Current wallet connection state */
  isConnected: boolean;
  /** Active wallet instance */
  activeWallet: BaseWallet | undefined;
  /** Current wallet connection error */
  walletConnectionError: string | undefined;
  /** All modal and UI states */
  modalStates: {
    isConnectModalOpen: boolean;
    isConnectedModalOpen: boolean;
    isChainsListOpen: boolean;
    isChainsListOpenMobile: boolean;
  };
  /** Current content types for modals */
  contentTypes: {
    connectModal: ConnectContentType;
    connectedModal: ConnectedContentType;
  };
  /** Button and transaction statuses */
  statuses: {
    connectedButton: ButtonTxStatus;
  };
};

/**
 * Comprehensive customization options for NovaConnectProvider
 */
export type NovaConnectProviderCustomization = {
  /** Custom components */
  components?: {
    /** Custom labels provider component */
    LabelsProvider?: ComponentType<CustomLabelsProviderProps>;
    /** Custom errors provider component */
    ErrorsProvider?: ComponentType<CustomErrorsProviderProps>;
  };
  /** Labels customization and merging strategy */
  labels?: {
    /** Custom labels merging function */
    merge?: (defaultLabels: NovaConnectLabels, userLabels: Partial<NovaConnectLabels>) => NovaConnectLabels;
    /** Transform final merged labels before use */
    transform?: (mergedLabels: NovaConnectLabels, context: ProviderContext) => NovaConnectLabels;
  };
  /** ErrorsProvider customization - passed through to ErrorsProvider */
  errors?: ErrorsProviderCustomization;
  /** Custom context value transformation */
  contextValue?: {
    /** Transform context value before providing to children */
    transform?: (defaultValue: NovaConnectProviderType, context: ProviderContext) => NovaConnectProviderType;
  };
  /** Custom rendering logic */
  rendering?: {
    /** Custom provider tree structure */
    providerTree?: (
      defaultTree: ReactNode,
      components: {
        ErrorsProvider: ReactNode;
        LabelsProvider: ReactNode;
        MainContent: ReactNode;
      },
      context: ProviderContext,
    ) => ReactNode;
  };
};

/**
 * Extended props for NovaConnectProvider with full customization capabilities
 */
export interface NovaConnectProviderPropsWithCustomization extends BaseNovaConnectProviderProps {
  /** Comprehensive customization options for the provider and its sub-components */
  customization?: NovaConnectProviderCustomization;
}

// --- Default Components ---

/**
 * Default labels provider component
 */
const DefaultLabelsProvider = ({ labels, children }: CustomLabelsProviderProps) => {
  return <NovaConnectLabelsProvider labels={labels as NovaConnectLabels}>{children}</NovaConnectLabelsProvider>;
};

/**
 * Default errors provider component
 */
const DefaultErrorsProvider = ({ customization }: CustomErrorsProviderProps) => {
  return <ErrorsProvider customization={customization} />;
};

// --- Default Handlers ---

/**
 * Default labels merging function
 */
const defaultLabelsMerge = (
  defaultLabels: NovaConnectLabels,
  userLabels: Partial<NovaConnectLabels>,
): NovaConnectLabels => {
  return deepMerge(defaultLabels, userLabels || {});
};

/**
 * Default labels transform function (identity)
 */
const defaultLabelsTransform = (mergedLabels: NovaConnectLabels): NovaConnectLabels => mergedLabels;

/**
 * Default context value transform function (identity)
 */
const defaultContextValueTransform = (defaultValue: NovaConnectProviderType): NovaConnectProviderType => defaultValue;

/**
 * Default provider tree renderer
 */
const defaultProviderTreeRenderer = (
  defaultTree: ReactNode,
  // Unused but kept for API consistency
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  components: {
    ErrorsProvider: ReactNode;
    LabelsProvider: ReactNode;
    MainContent: ReactNode;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: ProviderContext,
): ReactNode => {
  return defaultTree;
};

/**
 * Main NovaConnect provider component with comprehensive customization capabilities.
 *
 * This provider manages wallet connection state, error handling, internationalization,
 * and modal states while offering extensive customization options for all sub-components
 * and behaviors.
 *
 * Features:
 * - Complete wallet connection state management
 * - Customizable error handling through ErrorsProvider
 * - Flexible internationalization system
 * - Modal and UI state coordination
 * - Extensive customization API for all aspects
 * - Custom component replacement capabilities
 *
 * @example Basic usage
 * ```tsx
 * <NovaConnectProvider store={store}>
 *   <App />
 * </NovaConnectProvider>
 * ```
 *
 * @example With customization
 * ```tsx
 * <NovaConnectProvider
 *   store={store}
 *   labels={customLabels}
 *   customization={{
 *     errors: {
 *       position: 'bottom-right',
 *       autoClose: 5000,
 *       components: {
 *         ToastError: CustomToastError
 *       }
 *     },
 *   }}
 * >
 *   <App />
 * </NovaConnectProvider>
 * ```
 *
 * @param props - Provider configuration and customization options
 */
export function NovaConnectProvider({ labels, children, customization }: NovaConnectProviderPropsWithCustomization) {
  const activeWallet = useSatelliteConnectStore((store) => store.activeWallet);
  const walletConnectionError = useSatelliteConnectStore((store) => store.walletConnectionError);

  // Extract custom components
  const { LabelsProvider = DefaultLabelsProvider, ErrorsProvider: CustomErrorsProvider = DefaultErrorsProvider } =
    customization?.components ?? {};

  // Extract custom handlers
  const { merge: customLabelsMerge = defaultLabelsMerge, transform: customLabelsTransform = defaultLabelsTransform } =
    customization?.labels ?? {};

  const { transform: customContextValueTransform = defaultContextValueTransform } = customization?.contextValue ?? {};

  const { providerTree: customProviderTreeRenderer = defaultProviderTreeRenderer } = customization?.rendering ?? {};

  // Merge labels using custom or default logic
  const mergedLabels = useMemo(() => {
    return customLabelsMerge(defaultLabels, labels || {});
  }, [labels, customLabelsMerge]);

  // State management - all existing state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnectedModalOpen, setIsConnectedModalOpen] = useState(false);
  const [isChainsListOpen, setIsChainsListOpen] = useState(false);
  const [isChainsListOpenMobile, setIsChainsListOpenMobile] = useState(false);
  const [connectedButtonStatus, setConnectedButtonStatus] = useState<ButtonTxStatus>('idle');
  const [connectModalContentType, setConnectModalContentType] = useState<ConnectContentType>('connectors');
  const [selectedAdapter, setSelectedAdapter] = useState<OrbitAdapter | undefined>(undefined);
  const [activeConnector, setActiveConnector] = useState<string | undefined>(undefined);
  const [impersonatedAddress, setImpersonatedAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedModalContentType, setConnectedModalContentType] = useState<ConnectedContentType>('main');

  // Create provider context for custom handlers
  const providerContext = useMemo(
    (): ProviderContext => ({
      isConnected,
      activeWallet,
      walletConnectionError,
      modalStates: {
        isConnectModalOpen,
        isConnectedModalOpen,
        isChainsListOpen,
        isChainsListOpenMobile,
      },
      contentTypes: {
        connectModal: connectModalContentType,
        connectedModal: connectedModalContentType,
      },
      statuses: {
        connectedButton: connectedButtonStatus,
      },
    }),
    [
      isConnected,
      activeWallet,
      walletConnectionError,
      isConnectModalOpen,
      isConnectedModalOpen,
      isChainsListOpen,
      isChainsListOpenMobile,
      connectModalContentType,
      connectedModalContentType,
      connectedButtonStatus,
    ],
  );

  // Transform labels using custom logic if provided
  const finalLabels = useMemo(() => {
    return customLabelsTransform(mergedLabels, providerContext);
  }, [mergedLabels, customLabelsTransform, providerContext]);

  // Create and transform context value using custom logic if provided - moved inside useMemo
  const contextValue = useMemo(() => {
    const defaultContextValue: NovaConnectProviderType = {
      isConnectModalOpen,
      setIsConnectModalOpen,
      isConnectedModalOpen,
      setIsConnectedModalOpen,
      isChainsListOpen,
      setIsChainsListOpen,
      isChainsListOpenMobile,
      setIsChainsListOpenMobile,
      connectedButtonStatus,
      setConnectedButtonStatus,
      connectedModalContentType,
      setConnectedModalContentType,
      connectModalContentType,
      setConnectModalContentType,
      selectedAdapter,
      setSelectedAdapter,
      activeConnector,
      setActiveConnector,
      impersonatedAddress,
      setImpersonatedAddress,
      isConnected,
      setIsConnected,
    };

    return customContextValueTransform(defaultContextValue, providerContext);
  }, [
    isConnectModalOpen,
    setIsConnectModalOpen,
    isConnectedModalOpen,
    setIsConnectedModalOpen,
    isChainsListOpen,
    setIsChainsListOpen,
    isChainsListOpenMobile,
    setIsChainsListOpenMobile,
    connectedButtonStatus,
    setConnectedButtonStatus,
    connectedModalContentType,
    setConnectedModalContentType,
    connectModalContentType,
    setConnectModalContentType,
    selectedAdapter,
    setSelectedAdapter,
    activeConnector,
    setActiveConnector,
    impersonatedAddress,
    setImpersonatedAddress,
    isConnected,
    setIsConnected,
    customContextValueTransform,
    providerContext,
  ]);

  // Create component tree elements
  const errorsProviderElement = <CustomErrorsProvider customization={customization?.errors} />;

  const labelsProviderElement = <LabelsProvider labels={finalLabels}>{children}</LabelsProvider>;

  const mainContentElement = (
    <NovaConnectProviderContext.Provider value={contextValue}>
      {errorsProviderElement}
      {labelsProviderElement}
    </NovaConnectProviderContext.Provider>
  );

  // Create default provider tree
  const defaultProviderTree = (
    <NovaConnectProviderContext.Provider value={contextValue}>
      {errorsProviderElement}
      {labelsProviderElement}
    </NovaConnectProviderContext.Provider>
  );

  // Use custom provider tree renderer if provided
  const finalProviderTree = customProviderTreeRenderer(
    defaultProviderTree,
    {
      ErrorsProvider: errorsProviderElement,
      LabelsProvider: labelsProviderElement,
      MainContent: mainContentElement,
    },
    providerContext,
  );

  return <>{finalProviderTree}</>;
}

// Add display name for better debugging
NovaConnectProvider.displayName = 'NovaConnectProvider';
