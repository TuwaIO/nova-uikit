import { OrbitAdapter } from '@tuwaio/orbit-core';
import { Transaction, TransactionPool, TxAdapter } from '@tuwaio/pulsar-core';
import { createContext, useContext } from 'react';

import { LocalTxPagination } from '../components';
import { NovaConnectLabels } from '../i18n';
import { InitialChains } from '../types';
import { NovaSiwxWatcherProps } from '../watchers/NovaSiwxWatcher';

/**
 * Status of the latest transaction of the active wallet, shown by the connect button: `loading` while it is pending,
 * then `succeed`, `failed` or `replaced`, and `idle` otherwise.
 */
export type ButtonTxStatus = 'idle' | 'loading' | 'succeed' | 'failed' | 'replaced';

/**
 * Screen of the connect modal: `connectors` (wallet list), `network` (network choice of a multi-network wallet),
 * `connecting`, `about` ("About wallets"), `getWallet` ("Get a wallet") or `impersonate` (impersonation form).
 */
export type ConnectContentType = 'network' | 'connectors' | 'about' | 'getWallet' | 'connecting' | 'impersonate';

/**
 * Screen of the connected modal: `main`, `transactions` (history), `chains` (network switch) or `connections`
 * (connected and recent wallets).
 */
export type ConnectedContentType = 'main' | 'transactions' | 'chains' | 'connections';

/** Legal configuration for Terms of Service and Privacy Policy links */
export interface LegalConfig {
  /** URL of the terms of service */
  termsUrl?: string;
  /** URL of the privacy policy */
  privacyUrl?: string;
}

/**
 * Props of `NovaConnectProvider`. `appChains` and `solanaRPCUrls` give the chains of the app; without both, the
 * modals are not rendered.
 */
export interface NovaConnectProviderProps extends InitialChains {
  /** Transaction pool of Pulsar: the connect button shows the status of the latest transaction of the wallet */
  transactionPool?: TransactionPool<Transaction>;
  /** Pulsar adapter(s); with `transactionPool`, the connected modal shows the transaction history */
  pulsarAdapter?: TxAdapter<Transaction> | TxAdapter<Transaction>[];
  /** Whether the connect button shows the native balance */
  withBalance?: boolean;
  /** Whether the connect button shows a chain selector */
  withChain?: boolean;
  /** Whether the wallet list offers the impersonated wallet (a read-only address, for development) */
  withImpersonated?: boolean;
  /** Wallet names of the "Popular" group, in order (default: WalletConnect, Porto, Coinbase, Gemini) */
  popularConnectors?: string[];
  /** Extra wallet groups of the wallet list: group title → wallet names, in order */
  customConnectorGroups?: Record<string, string[]>;
  /** Legal configuration for Terms of Service and Privacy Policy links */
  legal?: LegalConfig;
  /**
   * SIWX sign-in of the connected wallet (see `NovaSiwxWatcher`). Without it, Nova Connect does not sign in and does
   * not touch the SIWX session.
   */
  siwx?: NovaSiwxWatcherProps;
  /**
   * Pagination state for infinite scroll, forwarded to ConnectedModalTxHistory and TransactionsHistory.
   * Mirrors TxInMemoryPagination from @tuwaio/pulsar-core (optional peer dependency).
   */
  pagination?: LocalTxPagination;
  /** The app */
  children: React.ReactNode;
  /** Texts to override, merged over the English defaults */
  labels?: Partial<NovaConnectLabels>;
}

/**
 * A native balance.
 */
export interface WalletBalance {
  /** Formatted amount */
  value: string;
  /** Currency symbol */
  symbol: string;
}

/**
 * State of `NovaConnectProvider`, returned by {@link useNovaConnect}: the provider props (without `siwx` and
 * `pagination`, which are not set) and the UI state of the modals, kept in React state of the provider.
 */
export interface NovaConnectProviderType extends Omit<
  NovaConnectProviderProps,
  'pulsarAdapter' | 'children' | 'labels' | 'transactionPool'
> {
  // Modal states
  /** Whether the connect modal is open */
  isConnectModalOpen: boolean;
  /**
   * Opens or closes the connect modal (opening resets it to the wallet list).
   *
   * @param value - Whether the modal is open.
   */
  setIsConnectModalOpen: (value: boolean) => void;
  /** Whether the connected modal is open */
  isConnectedModalOpen: boolean;
  /**
   * Opens or closes the connected modal (opening shows the main screen).
   *
   * @param value - Whether the modal is open.
   */
  setIsConnectedModalOpen: (value: boolean) => void;

  // Chain selection states
  /** Whether the chain list of `ChainSelector` is open (desktop) */
  isChainsListOpen: boolean;
  /**
   * Opens or closes the chain list of `ChainSelector` (desktop).
   *
   * @param value - Whether the list is open.
   */
  setIsChainsListOpen: (value: boolean) => void;
  /** Whether the chain dialog of `ChainSelector` is open (mobile) */
  isChainsListOpenMobile: boolean;
  /**
   * Opens or closes the chain dialog of `ChainSelector` (mobile).
   *
   * @param value - Whether the dialog is open.
   */
  setIsChainsListOpenMobile: (value: boolean) => void;

  // Connection states
  /** Status of the latest transaction shown by the connect button */
  connectedButtonStatus: ButtonTxStatus;
  /**
   * Sets the transaction status of the connect button.
   *
   * @param value - The status.
   */
  setConnectedButtonStatus: (value: ButtonTxStatus) => void;
  /** Whether a wallet has just connected in the connect modal (`true` for 500 ms before the modal closes) */
  isConnected: boolean;
  /**
   * Sets the "just connected" state of the connect modal.
   *
   * @param value - The state.
   */
  setIsConnected: (value: boolean) => void;

  // Modal content types
  /** Screen of the connected modal */
  connectedModalContentType: ConnectedContentType;
  /**
   * Shows a screen of the connected modal.
   *
   * @param value - The screen.
   */
  setConnectedModalContentType: (value: ConnectedContentType) => void;
  /** Screen of the connect modal */
  connectModalContentType: ConnectContentType;
  /**
   * Shows a screen of the connect modal.
   *
   * @param value - The screen.
   */
  setConnectModalContentType: (value: ConnectContentType) => void;

  // Adapter and connector states
  /** Network selected in the connect modal (`undefined` for all networks) */
  selectedAdapter: OrbitAdapter | undefined;
  /**
   * Selects a network in the connect modal.
   *
   * @param value - The network, or `undefined` for all networks.
   */
  setSelectedAdapter: (value: OrbitAdapter | undefined) => void;
  /** Wallet selected in the connect modal, as `formatConnectorName` of `@tuwaio/orbit-core` returns it */
  activeConnector: string | undefined;
  /**
   * Selects a wallet in the connect modal.
   *
   * @param value - The formatted wallet name.
   */
  setActiveConnector: (value: string | undefined) => void;

  // Impersonation
  /** Address entered in the impersonation form */
  impersonatedAddress: string;
  /**
   * Sets the impersonated address of the connect modal (it is saved to `localStorage` only on connect).
   *
   * @param value - The address.
   */
  setImpersonatedAddress: (value: string) => void;

  // Legal configuration
  /** The `legal` prop */
  legal?: LegalConfig;
}

/**
 * Thrown by {@link useNovaConnect} outside `NovaConnectProvider`.
 */
export class NovaConnectProviderError extends Error {
  /**
   * @param message - The error message (default: `useNovaConnect must be used within NovaConnectProvider`).
   */
  constructor(message = 'useNovaConnect must be used within NovaConnectProvider') {
    super(message);
    this.name = 'NovaConnectProviderError';
  }
}

/**
 * React context of `NovaConnectProvider` (`undefined` outside the provider). Read it with {@link useNovaConnect}.
 */
export const NovaConnectProviderContext = createContext<NovaConnectProviderType | undefined>(undefined);

/**
 * Returns the state of `NovaConnectProvider`: the modal states and their setters, the selected network and wallet,
 * and the provider options.
 *
 * @returns The provider state.
 * @throws {@link NovaConnectProviderError} When used outside `NovaConnectProvider`.
 *
 * @example
 * ```tsx
 * import { useNovaConnect } from '@tuwaio/nova-connect/hooks';
 *
 * export function OpenWalletButton() {
 *   const { setIsConnectModalOpen } = useNovaConnect();
 *
 *   return <button onClick={() => setIsConnectModalOpen(true)}>Connect Wallet</button>;
 * }
 * ```
 */
export const useNovaConnect = (): NovaConnectProviderType => {
  const context = useContext(NovaConnectProviderContext);

  if (!context) {
    throw new NovaConnectProviderError();
  }

  return context;
};

/**
 * Checks whether the component is inside `NovaConnectProvider`.
 *
 * @returns `true` inside the provider.
 *
 * @example
 * ```tsx
 * import { useHasNovaConnectContext } from '@tuwaio/nova-connect/hooks';
 *
 * export function ProviderCheck() {
 *   const hasContext = useHasNovaConnectContext();
 *
 *   return <p>{hasContext ? 'Nova Connect is ready' : 'NovaConnectProvider not found'}</p>;
 * }
 * ```
 */
export const useHasNovaConnectContext = (): boolean => {
  const context = useContext(NovaConnectProviderContext);
  return context !== undefined;
};

/**
 * Like {@link useNovaConnect}, but returns `null` outside `NovaConnectProvider` instead of throwing.
 *
 * @returns The provider state, or `null`.
 *
 * @example
 * ```tsx
 * import { useNovaConnectOptional } from '@tuwaio/nova-connect/hooks';
 *
 * export function OptionalOpenButton() {
 *   const context = useNovaConnectOptional();
 *
 *   if (!context) return null;
 *   return <button onClick={() => context.setIsConnectModalOpen(true)}>Connect Wallet</button>;
 * }
 * ```
 */
export const useNovaConnectOptional = (): NovaConnectProviderType | null => {
  const context = useContext(NovaConnectProviderContext);
  return context ?? null;
};
