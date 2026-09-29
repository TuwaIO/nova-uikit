/**
 * @file Main NovaConnect provider component with comprehensive customization capabilities.
 */

import { deepMerge } from '@tuwaio/nova-core';
import { OrbitAdapter, TuwaErrorState } from '@tuwaio/orbit-core';
import { BaseConnector } from '@tuwaio/satellite-core';
import { ComponentType, ReactNode, useMemo, useState } from 'react';

import { ConnectedModal, ConnectedModalCustomization } from '../components/ConnectedModal/ConnectedModal';
import { ConnectModal, ConnectModalCustomization } from '../components/ConnectModal/ConnectModal';
import {
  ButtonTxStatus,
  ConnectContentType,
  ConnectedContentType,
  NovaConnectProviderContext,
  NovaConnectProviderProps,
  NovaConnectProviderType,
} from '../hooks';
import { defaultLabels, NovaConnectLabels } from '../i18n';
import { useSatelliteConnectStore } from '../satellite';
import { NovaSiwxWatcher } from '../watchers/NovaSiwxWatcher';
import { ErrorsProvider, ErrorsProviderCustomization } from './ErrorsProvider';
import { NovaConnectLabelsProvider } from './NovaConnectLabelsProvider';

// --- Customization Types ---

/**
 * Props for a custom labels provider (the default one is `NovaConnectLabelsProvider`).
 */
export type NovaConnectProviderLabelsProviderProps = {
  /** The final labels (after `labels.merge` and `labels.transform`) */
  labels?: Partial<NovaConnectLabels>;
  /** The app */
  children: ReactNode;
};

/**
 * Props for a custom errors provider (the default one is `ErrorsProvider`).
 */
export type NovaConnectProviderErrorsProviderProps = {
  /** `customization.errors` */
  customization?: ErrorsProviderCustomization;
};

/**
 * Context data passed to custom provider components
 */
export type NovaConnectProviderCustomizationContext = {
  /** Current wallet connection state */
  isConnected: boolean;
  /** Active wallet instance */
  activeConnection: BaseConnector | undefined;
  /** Current wallet connection error */
  connectionError: TuwaErrorState | undefined;
  /** All modal and UI states */
  modalStates: {
    /** Whether the connect modal is open */
    isConnectModalOpen: boolean;
    /** Whether the connected modal is open */
    isConnectedModalOpen: boolean;
    /** Whether the desktop chain list is open */
    isChainsListOpen: boolean;
    /** Whether the mobile chain dialog is open */
    isChainsListOpenMobile: boolean;
  };
  /** Current content types for modals */
  contentTypes: {
    /** Screen of the connect modal */
    connectModal: ConnectContentType;
    /** Screen of the connected modal */
    connectedModal: ConnectedContentType;
  };
  /** Button and transaction statuses */
  statuses: {
    /** Transaction status of the connect button */
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
    LabelsProvider?: ComponentType<NovaConnectProviderLabelsProviderProps>;
    /** Custom errors provider component */
    ErrorsProvider?: ComponentType<NovaConnectProviderErrorsProviderProps>;
  };
  /** Labels customization and merging strategy */
  labels?: {
    /**
     * Merges the `labels` prop into the defaults, instead of a deep merge.
     *
     * @param defaultLabels - The English defaults.
     * @param userLabels - The `labels` prop (an empty object without it).
     * @returns The merged labels.
     */
    merge?: (defaultLabels: NovaConnectLabels, userLabels: Partial<NovaConnectLabels>) => NovaConnectLabels;
    /**
     * Transforms the merged labels before they are provided.
     *
     * @param mergedLabels - The merged labels.
     * @param context - State of the provider.
     * @returns The final labels.
     */
    transform?: (
      mergedLabels: NovaConnectLabels,
      context: NovaConnectProviderCustomizationContext,
    ) => NovaConnectLabels;
  };
  /** ErrorsProvider customization - passed through to ErrorsProvider */
  errors?: ErrorsProviderCustomization;
  /** Custom context value transformation */
  contextValue?: {
    /**
     * Transforms the value of the context before it is provided.
     *
     * @param defaultValue - The state of the provider.
     * @param context - State of the provider for customization.
     * @returns The context value.
     */
    transform?: (
      defaultValue: NovaConnectProviderType,
      context: NovaConnectProviderCustomizationContext,
    ) => NovaConnectProviderType;
  };
  /** Custom rendering logic */
  rendering?: {
    /**
     * Returns the rendered tree, instead of the default one. Keep the elements inside the context provider (the
     * default tree and `MainContent` include it).
     *
     * @param defaultTree - The default tree: the context provider with the SIWX watcher, the errors provider, the
     * labels provider with the app, and the two modals.
     * @param components - The parts of the tree.
     * @param components.ErrorsProvider - The errors provider element.
     * @param components.LabelsProvider - The labels provider element with the app.
     * @param components.MainContent - The same tree as `defaultTree`.
     * @param components.ConnectModal - The connect modal (an empty fragment without chains).
     * @param components.ConnectedModal - The connected modal (an empty fragment without chains).
     * @param context - State of the provider.
     * @returns The tree to render.
     */
    providerTree?: (
      defaultTree: ReactNode,
      components: {
        ErrorsProvider: ReactNode;
        LabelsProvider: ReactNode;
        MainContent: ReactNode;
        ConnectModal: ReactNode;
        ConnectedModal: ReactNode;
      },
      context: NovaConnectProviderCustomizationContext,
    ) => ReactNode;
  };
  /** Modal customizations */
  modals?: {
    /** ConnectModal customization */
    connectModal?: ConnectModalCustomization;
    /** ConnectedModal customization */
    connectedModal?: ConnectedModalCustomization;
  };
};

/**
 * Props for the {@link NovaConnectProvider} component: `NovaConnectProviderProps` with `customization`.
 */
export interface NovaConnectProviderPropsWithCustomization extends NovaConnectProviderProps {
  /** Comprehensive customization options for the provider and its sub-components */
  customization?: NovaConnectProviderCustomization;
}

// --- Default Components ---

/**
 * Default labels provider component
 */
const DefaultLabelsProvider = ({ labels, children }: NovaConnectProviderLabelsProviderProps) => {
  return <NovaConnectLabelsProvider labels={labels as NovaConnectLabels}>{children}</NovaConnectLabelsProvider>;
};

/**
 * Default errors provider component
 */
const DefaultErrorsProvider = ({ customization }: NovaConnectProviderErrorsProviderProps) => {
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
    ConnectModal: ReactNode;
    ConnectedModal: ReactNode;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: NovaConnectProviderCustomizationContext,
): ReactNode => {
  return defaultTree;
};

/**
 * The provider of Nova Connect. Place it inside `SatelliteConnectProvider` (from `@tuwaio/nova-connect/satellite`): it
 * reads the Satellite store. It keeps the UI state of the modals (read it with `useNovaConnect`), provides the labels
 * (the `labels` prop merged into the English defaults), shows connection and network switch errors as toasts
 * (`ErrorsProvider`), signs in with SIWX when `siwx` is set (`NovaSiwxWatcher`), and renders the connect and connected
 * modals when `appChains` or `solanaRPCUrls` is set.
 *
 * @param props - See {@link NovaConnectProviderPropsWithCustomization}.
 * @returns The provider tree.
 *
 * @example
 * ```tsx
 * import { NovaConnectProvider } from '@tuwaio/nova-connect';
 * import type { ReactNode } from 'react';
 * import { mainnet, polygon } from 'viem/chains';
 *
 * export function WalletUI({ children }: { children: ReactNode }) {
 *   return (
 *     <NovaConnectProvider
 *       appChains={[mainnet, polygon]}
 *       solanaRPCUrls={{ devnet: 'https://api.devnet.solana.com' }}
 *       withBalance
 *       withChain
 *       legal={{ termsUrl: 'https://example.com/terms', privacyUrl: 'https://example.com/privacy' }}
 *       customization={{
 *         modals: { connectModal: { classNames: { title: () => 'custom-title' } } },
 *       }}
 *     >
 *       {children}
 *     </NovaConnectProvider>
 *   );
 * }
 * ```
 */
export function NovaConnectProvider({
  labels,
  children,
  appChains,
  solanaRPCUrls,
  transactionPool,
  pulsarAdapter,
  withImpersonated,
  withBalance,
  withChain,
  popularConnectors,
  customConnectorGroups,
  legal,
  siwx,
  customization,
  pagination,
}: NovaConnectProviderPropsWithCustomization) {
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const connectionError = useSatelliteConnectStore((store) => store.connectionError);

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

  const defaultContextValue: NovaConnectProviderType = {
    appChains,
    solanaRPCUrls,
    withImpersonated,
    popularConnectors,
    customConnectorGroups,
    withBalance,
    withChain,
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
    legal,
  };

  // Create provider context for custom handlers
  const providerContext = useMemo(
    (): NovaConnectProviderCustomizationContext => ({
      isConnected,
      activeConnection,
      connectionError,
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
      activeConnection,
      connectionError,
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

  const contextValue = customContextValueTransform(defaultContextValue, providerContext);

  // Create component tree elements
  const errorsProviderElement = <CustomErrorsProvider customization={customization?.errors} />;

  const labelsProviderElement = <LabelsProvider labels={finalLabels}>{children}</LabelsProvider>;

  // Create modal elements - only render if we have the required props
  const connectModalElement =
    appChains || solanaRPCUrls ? (
      <ConnectModal
        solanaRPCUrls={solanaRPCUrls}
        appChains={appChains}
        customization={customization?.modals?.connectModal}
      />
    ) : null;

  const connectedModalElement =
    appChains || solanaRPCUrls ? (
      <ConnectedModal
        solanaRPCUrls={solanaRPCUrls}
        appChains={appChains}
        transactionPool={transactionPool}
        pulsarAdapter={pulsarAdapter}
        customization={customization?.modals?.connectedModal}
        pagination={pagination}
      />
    ) : null;

  // Without `siwx` the app does not use SIWX through Nova Connect: no watcher, no warnings about a missing verifier
  const siwxWatcherElement = siwx ? <NovaSiwxWatcher {...siwx} /> : null;

  const mainContentElement = (
    <NovaConnectProviderContext.Provider value={contextValue}>
      {siwxWatcherElement}
      {errorsProviderElement}
      {labelsProviderElement}
      {connectModalElement}
      {connectedModalElement}
    </NovaConnectProviderContext.Provider>
  );

  // Create default provider tree with modals
  const defaultProviderTree = (
    <NovaConnectProviderContext.Provider value={contextValue}>
      {siwxWatcherElement}
      {errorsProviderElement}
      {labelsProviderElement}
      {connectModalElement}
      {connectedModalElement}
    </NovaConnectProviderContext.Provider>
  );

  // Use custom provider tree renderer if provided
  const finalProviderTree = customProviderTreeRenderer(
    defaultProviderTree,
    {
      ErrorsProvider: errorsProviderElement,
      LabelsProvider: labelsProviderElement,
      MainContent: mainContentElement,
      ConnectModal: connectModalElement || <></>,
      ConnectedModal: connectedModalElement || <></>,
    },
    providerContext,
  );

  return <>{finalProviderTree}</>;
}

// Add display name for better debugging
NovaConnectProvider.displayName = 'NovaConnectProvider';
