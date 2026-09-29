/**
 * @file Connecting component with comprehensive customization options and connection status display.
 */

import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { formatConnectorName, OrbitAdapter } from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, memo, useEffect, useEffectEvent, useRef } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
import { useSatelliteConnectStore } from '../../satellite';
import { WalletIcon, WalletIconCustomization } from '../WalletIcon';
import { GroupedConnector } from './ConnectModal';

// --- Types ---

/**
 * State of a wallet connection: `error` when the Satellite store has a `connectionError` (or `customErrorMessage` is
 * set), `success` when `isConnected` is `true`, otherwise `connecting`.
 */
export type ConnectionState = 'connecting' | 'success' | 'error';

/**
 * Status of the connection shown by {@link Connecting}, passed to its custom components, class name generators and
 * handlers.
 */
export interface ConnectingStatusData {
  /** Connection state */
  state: ConnectionState;
  /** The heading: `customErrorMessage` or the `connectionError` label, `connectedSuccessfully`, or `connectingTo` */
  message: string;
  /**
   * Text under the heading in the `error` state (`customErrorMessage` with `showDetailedError`, or the
   * `cannotConnectWallet` label), otherwise `null`
   */
  errorMessage: string | null;
  /** The `activeConnector` prop */
  activeConnector: string | undefined;
  /** The `selectedAdapter` prop */
  selectedAdapter: OrbitAdapter | undefined;
  /** The wallet of `connectors` whose formatted name contains `activeConnector` */
  currentConnector: GroupedConnector | null;
  /** The `showDetailedError` prop */
  showDetailedError: boolean;
  /** `connectionError` of the Satellite store */
  rawError: unknown;
}

// --- Component Props Types ---
/**
 * Props for a custom container (a `section` by default).
 */
export type ConnectingContainerProps = {
  /** Classes from `classNames.container`, or the defaults with the `className` prop */
  className?: string;
  /** The status container, messages and screen reader texts */
  children: React.ReactNode;
  /** `status` */
  role?: string;
  /** `config.ariaLabels.container`, or the `connectionStatus` label with the heading */
  'aria-label'?: string;
  /** `polite` */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** `true` */
  'aria-atomic'?: boolean;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLElement>;

/**
 * Props for a custom status container (the circle around the wallet icon).
 */
export type ConnectingStatusContainerProps = {
  /** Classes from `classNames.statusContainer` or the defaults (the border color follows the state) */
  className?: string;
  /** The spinner or the status icon, and the wallet icon */
  children: React.ReactNode;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom spinner (shown in the `connecting` state).
 */
export type ConnectingSpinnerProps = {
  /** Classes from `classNames.spinner` or the defaults */
  className?: string;
  /** `progressbar` */
  role?: string;
  /** `config.ariaLabels.spinner` or the `connecting` label */
  'aria-label'?: string;
  /** ID of the heading */
  'aria-describedby'?: string;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom status icon (shown in the `success` and `error` states).
 */
export type ConnectingStatusIconProps = {
  /** Classes from `classNames.statusIcon` or the defaults */
  className?: string;
  /** `img` */
  role?: string;
  /** `config.ariaLabels.successIcon` or `errorIcon`, or the `successIcon` or `errorIcon` label */
  'aria-label'?: string;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom wallet icon container.
 */
export type ConnectingWalletIconContainerProps = {
  /** Classes from `classNames.walletIconContainer` or the defaults */
  className?: string;
  /** The `WalletIcon` of the wallet */
  children: React.ReactNode;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom message container.
 */
export type ConnectingMessageContainerProps = {
  /** Classes from `classNames.messageContainer` or the defaults */
  className?: string;
  /** The heading, the error message and the error details */
  children: React.ReactNode;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom heading.
 */
export type ConnectingStatusMessageProps = {
  /** Classes from `classNames.statusMessage` or the defaults (the color follows the state) */
  className?: string;
  /** `statusData.message` */
  children: React.ReactNode;
  /** `connecting-message` */
  id?: string;
  /** `heading` */
  role?: string;
  /** `2` */
  'aria-level'?: number;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLHeadingElement>;

/**
 * Props for a custom error message (shown when `statusData.errorMessage` is set).
 */
export type ConnectingErrorMessageProps = {
  /** Classes from `classNames.errorMessage` or the defaults */
  className?: string;
  /** `statusData.errorMessage` */
  children: React.ReactNode;
  /** `alert` */
  role?: string;
  /** ID of the heading */
  'aria-describedby'?: string;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLParagraphElement>;

/**
 * Props for custom error details (shown with `showDetailedError` when the store has a `connectionError`).
 */
export type ConnectingErrorDetailsProps = {
  /** Classes from `classNames.errorDetails` or the defaults */
  className?: string;
  /** A summary with the `copyRawError` label and the error as JSON */
  children: React.ReactNode;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLDetailsElement>;

/**
 * Props for a custom loading placeholder (shown while `selectedAdapter`, `activeConnector` or the matching wallet is
 * missing).
 */
export type ConnectingLoadingPlaceholderProps = {
  /** Classes from `classNames.loadingPlaceholder` or the defaults */
  className?: string;
  /** `status` */
  role?: string;
  /** `config.ariaLabels.loading` or the `loading` label */
  'aria-label'?: string;
  /** The connection status */
  statusData: ConnectingStatusData;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Customization options of {@link Connecting}.
 */
export type ConnectingCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ConnectingContainerProps>;
    /** Custom status container */
    StatusContainer?: ComponentType<ConnectingStatusContainerProps>;
    /** Custom loading spinner */
    Spinner?: ComponentType<ConnectingSpinnerProps>;
    /** Custom status icon */
    StatusIcon?: ComponentType<ConnectingStatusIconProps>;
    /** Custom wallet icon container */
    WalletIconContainer?: ComponentType<ConnectingWalletIconContainerProps>;
    /** Custom message container */
    MessageContainer?: ComponentType<ConnectingMessageContainerProps>;
    /** Custom status message */
    StatusMessage?: ComponentType<ConnectingStatusMessageProps>;
    /** Custom error message */
    ErrorMessage?: ComponentType<ConnectingErrorMessageProps>;
    /** Custom error details */
    ErrorDetails?: ComponentType<ConnectingErrorDetailsProps>;
    /** Custom loading placeholder */
    LoadingPlaceholder?: ComponentType<ConnectingLoadingPlaceholderProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and the `className` prop.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    container?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the status container, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    statusContainer?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the spinner, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    spinner?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the status icon, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    statusIcon?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the wallet icon container, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    walletIconContainer?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the message container, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    messageContainer?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the heading, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    statusMessage?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the error message, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    errorMessage?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the error details, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    errorDetails?: (params: { statusData: ConnectingStatusData }) => string;
    /**
     * Returns the classes of the loading placeholder, instead of the default ones.
     *
     * @param params - The status.
     * @param params.statusData - The connection status.
     * @returns The classes.
     */
    loadingPlaceholder?: (params: { statusData: ConnectingStatusData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called after the first render and whenever the state changes.
     *
     * @param state - The new state.
     * @param statusData - The connection status.
     */
    onStateChange?: (state: ConnectionState, statusData: ConnectingStatusData) => void;
    /**
     * Called when the state becomes `error`.
     *
     * @param error - `connectionError` of the Satellite store (`undefined` when only `customErrorMessage` is set).
     * @param statusData - The connection status.
     */
    onError?: (error: unknown, statusData: ConnectingStatusData) => void;
    /**
     * Called when the state becomes `success`.
     *
     * @param statusData - The connection status.
     */
    onSuccess?: (statusData: ConnectingStatusData) => void;
    /**
     * Called when the state becomes `connecting`.
     *
     * @param statusData - The connection status.
     */
    onConnectingStart?: (statusData: ConnectingStatusData) => void;
    /**
     * Called on unmount with the last connection status. Errors are logged.
     *
     * @param statusData - The last connection status.
     */
    onCleanup?: (statusData: ConnectingStatusData) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /** ARIA label of the container (default: the `connectionStatus` label with the heading) */
      container?: string;
      /** ARIA label of the spinner (default: the `connecting` label) */
      spinner?: string;
      /** ARIA label of the success icon (default: the `successIcon` label) */
      successIcon?: string;
      /** ARIA label of the error icon (default: the `errorIcon` label) */
      errorIcon?: string;
      /** ARIA label of the loading placeholder (default: the `loading` label) */
      loading?: string;
    };
  };
  /** WalletIcon customization (for the wallet icon shown during connection) */
  walletIcon?: WalletIconCustomization;
};

/**
 * Props for the {@link Connecting} component.
 */
export interface ConnectingProps {
  /**
   * The wallet being connected, as `formatConnectorName` of `@tuwaio/orbit-core` returns it (for example `metamask`)
   */
  activeConnector: string | undefined;
  /** Selected orbit adapter for the connection */
  selectedAdapter: OrbitAdapter | undefined;
  /** Wallets with their connectors (the icon comes from the wallet matching `activeConnector`) */
  connectors: GroupedConnector[];
  /** Whether the wallet connection is successfully established */
  isConnected: boolean;
  /** Shows the `error` state with this heading */
  customErrorMessage?: string;
  /** Shows `customErrorMessage` under the heading and the store error as JSON (default: `false`) */
  showDetailedError?: boolean;
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
  className?: string;
  /** Customization options */
  customization?: ConnectingCustomization;
}

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLElement, ConnectingContainerProps>(({ children, className, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { statusData: _statusData, ...restProps } = props;
  return (
    <section ref={ref} className={className} {...restProps}>
      {children}
    </section>
  );
});
DefaultContainer.displayName = 'DefaultContainer';

const DefaultStatusContainer = forwardRef<HTMLDivElement, ConnectingStatusContainerProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ children, className, statusData: _statusData }, ref) => (
    <div ref={ref} className={className}>
      {children}
    </div>
  ),
);
DefaultStatusContainer.displayName = 'DefaultStatusContainer';

const DefaultSpinner = forwardRef<HTMLDivElement, ConnectingSpinnerProps>(({ className, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { statusData: _statusData, ...restProps } = props;
  const labels = useNovaConnectLabels();
  return (
    <div ref={ref} className={className} {...restProps}>
      <span className="novacon:sr-only">{labels.loading}...</span>
    </div>
  );
});
DefaultSpinner.displayName = 'DefaultSpinner';

const DefaultStatusIcon = forwardRef<HTMLDivElement, ConnectingStatusIconProps>(
  ({ className, statusData, ...props }, ref) => {
    const isSuccess = statusData.state === 'success';
    const IconComponent = isSuccess ? CheckCircleIcon : ExclamationCircleIcon;

    return (
      <div ref={ref} className={className} {...props}>
        <IconComponent className="novacon:w-6 novacon:h-6 novacon:text-white" aria-hidden="true" />
      </div>
    );
  },
);
DefaultStatusIcon.displayName = 'DefaultStatusIcon';

const DefaultWalletIconContainer = forwardRef<HTMLDivElement, ConnectingWalletIconContainerProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ children, className, statusData: _statusData }, ref) => (
    <div ref={ref} className={className}>
      {children}
    </div>
  ),
);
DefaultWalletIconContainer.displayName = 'DefaultWalletIconContainer';

const DefaultMessageContainer = forwardRef<HTMLDivElement, ConnectingMessageContainerProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ children, className, statusData: _statusData }, ref) => (
    <div ref={ref} className={className}>
      {children}
    </div>
  ),
);
DefaultMessageContainer.displayName = 'DefaultMessageContainer';

const DefaultStatusMessage = forwardRef<HTMLHeadingElement, ConnectingStatusMessageProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { statusData: _statusData, ...restProps } = props;
    return (
      <h2 ref={ref} className={className} {...restProps}>
        {children}
      </h2>
    );
  },
);
DefaultStatusMessage.displayName = 'DefaultStatusMessage';

const DefaultErrorMessage = forwardRef<HTMLParagraphElement, ConnectingErrorMessageProps>(
  ({ children, className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { statusData: _statusData, ...restProps } = props;
    return (
      <p ref={ref} className={className} {...restProps}>
        {children}
      </p>
    );
  },
);
DefaultErrorMessage.displayName = 'DefaultErrorMessage';

const DefaultErrorDetails = forwardRef<HTMLDetailsElement, ConnectingErrorDetailsProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ children, className, statusData: _statusData }, ref) => (
    <details ref={ref} className={className}>
      {children}
    </details>
  ),
);
DefaultErrorDetails.displayName = 'DefaultErrorDetails';

const DefaultLoadingPlaceholder = forwardRef<HTMLDivElement, ConnectingLoadingPlaceholderProps>(
  ({ className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { statusData: _statusData, ...restProps } = props;
    return (
      <div ref={ref} className={className} {...restProps}>
        <div className="novacon:animate-pulse novacon:rounded-[var(--tuwa-rounded-corners)] novacon:h-32 novacon:w-32 novacon:bg-[var(--tuwa-bg-muted)]" />
        <div className="novacon:animate-pulse novacon:rounded-[var(--tuwa-rounded-corners)] novacon:h-6 novacon:w-48 novacon:bg-[var(--tuwa-bg-muted)]" />
      </div>
    );
  },
);
DefaultLoadingPlaceholder.displayName = 'DefaultLoadingPlaceholder';

/**
 * The connection screen of the connect modal: the wallet icon in a circle with a spinner while connecting, a success
 * or error icon, the heading and, on error, a message. Reads `connectionError` from the Satellite store.
 *
 * Props: {@link ConnectingProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { getFilteredConnectors } from '@tuwaio/nova-connect';
 * import { Connecting } from '@tuwaio/nova-connect/components';
 * import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 *
 * export function MetaMaskStatus({ isConnected }: { isConnected: boolean }) {
 *   const getConnectors = useSatelliteConnectStore((store) => store.getConnectors);
 *   const connectors = getFilteredConnectors({ connectors: getConnectors(), selectedAdapter: OrbitAdapter.EVM });
 *
 *   return (
 *     <Connecting
 *       activeConnector="metamask"
 *       selectedAdapter={OrbitAdapter.EVM}
 *       connectors={connectors}
 *       isConnected={isConnected}
 *     />
 *   );
 * }
 * ```
 */
export const Connecting = memo(
  forwardRef<HTMLDivElement, ConnectingProps>(
    (
      {
        activeConnector,
        selectedAdapter,
        connectors,
        isConnected,
        customErrorMessage,
        showDetailedError = false,
        className,
        customization,
      },
      ref,
    ) => {
      const labels = useNovaConnectLabels();
      const connectionError = useSatelliteConnectStore((store) => store.connectionError);

      const isMountedRef = useRef(true);
      const prevStateRef = useRef<ConnectionState | null>(null);
      const prevStatusDataRef = useRef<ConnectingStatusData | null>(null);
      const cleanupCalled = useRef(false);

      // Extract customization options
      const {
        Container: CustomContainer = DefaultContainer,
        StatusContainer: CustomStatusContainer = DefaultStatusContainer,
        Spinner: CustomSpinner = DefaultSpinner,
        StatusIcon: CustomStatusIcon = DefaultStatusIcon,
        WalletIconContainer: CustomWalletIconContainer = DefaultWalletIconContainer,
        MessageContainer: CustomMessageContainer = DefaultMessageContainer,
        StatusMessage: CustomStatusMessage = DefaultStatusMessage,
        ErrorMessage: CustomErrorMessage = DefaultErrorMessage,
        ErrorDetails: CustomErrorDetails = DefaultErrorDetails,
        LoadingPlaceholder: CustomLoadingPlaceholder = DefaultLoadingPlaceholder,
      } = customization?.components ?? {};

      const customHandlers = customization?.handlers;
      const customConfig = customization?.config;

      /**
       * Find the current connector configuration
       */
      /**
       * Handle cleanup when activeConnector is cleared
       */
      useEffect(() => {
        if (!activeConnector) {
          performDefaultCleanup();
        }
      }, [activeConnector]);

      /**
       * Find the current connector configuration
       */
      const currentConnector = activeConnector
        ? connectors.find((connector) =>
            formatConnectorName(connector.name).toLowerCase().includes(activeConnector.toLowerCase()),
          ) || null
        : null;

      /**
       * Determine current connection state
       */
      const connectionState: ConnectionState =
        connectionError || customErrorMessage ? 'error' : isConnected ? 'success' : 'connecting';

      /**
       * Display message
       */
      const displayMessage = (() => {
        switch (connectionState) {
          case 'error':
            return customErrorMessage || labels.connectionError;
          case 'success':
            return labels.connectedSuccessfully;
          case 'connecting':
          default:
            return activeConnector ? `${labels.connectingTo} ${activeConnector}...` : labels.connectingEllipsis;
        }
      })();

      /**
       * Error message
       */
      const errorMessage =
        connectionState !== 'error'
          ? null
          : customErrorMessage && showDetailedError
            ? customErrorMessage
            : labels.cannotConnectWallet;

      /**
       * Memoized status data
       */
      /**
       * Status data object
       */
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const statusData: ConnectingStatusData = {
        state: connectionState,
        message: displayMessage,
        errorMessage,
        activeConnector,
        selectedAdapter,
        currentConnector,
        showDetailedError,
        rawError: connectionError,
      };

      /**
       * Container classes
       */
      const containerClasses =
        customization?.classNames?.container?.({ statusData }) ??
        cn(
          'novacon:flex novacon:flex-col novacon:gap-4 novacon:items-center novacon:justify-center novacon:w-full',
          className,
        );

      /**
       * Status container classes based on connection state
       */
      const statusContainerClasses = customization?.classNames?.statusContainer
        ? customization.classNames.statusContainer({ statusData })
        : cn(
            'novacon:relative novacon:flex novacon:items-center novacon:justify-center',
            'novacon:min-w-[180px] novacon:min-h-[180px] novacon:md:min-w-[150px] novacon:md:min-h-[150px]',
            'novacon:border-2 novacon:rounded-full',
            'novacon:p-4 novacon:md:p-6',
            'novacon:transition-all novacon:duration-300 novacon:ease-in-out',
            statusData.state === 'error' && [
              'novacon:border-[var(--tuwa-error-text)]',
              'novacon:bg-[var(--tuwa-error-text)] novacon:bg-opacity-5',
            ],
            statusData.state === 'success' && [
              'novacon:border-[var(--tuwa-success-text)]',
              'novacon:bg-[var(--tuwa-success-text)] novacon:bg-opacity-5',
            ],
            statusData.state === 'connecting' && [
              'novacon:border-[var(--tuwa-border-primary)]',
              'novacon:bg-[var(--tuwa-bg-primary)]',
            ],
          );

      const performDefaultCleanup = () => {
        if (cleanupCalled.current) return;

        cleanupCalled.current = true;

        isMountedRef.current = false;
        prevStateRef.current = null;
        prevStatusDataRef.current = null;

        if (typeof window !== 'undefined') {
          const element = document.querySelector('[data-connecting-component]');
          if (element) {
            element.getAnimations?.().forEach((animation) => animation.cancel());
          }
        }
      };

      // The handlers are read through Effect Events, so a new `handlers` object on every render does not re-run the
      // effects
      const onStateChanged = useEffectEvent((state: ConnectionState, data: ConnectingStatusData) => {
        customHandlers?.onStateChange?.(state, data);

        if (state === 'error') {
          customHandlers?.onError?.(connectionError, data);
        } else if (state === 'success') {
          customHandlers?.onSuccess?.(data);
        } else if (state === 'connecting') {
          customHandlers?.onConnectingStart?.(data);
        }
      });

      const onUnmount = useEffectEvent((data: ConnectingStatusData) => {
        try {
          customHandlers?.onCleanup?.(data);
        } catch (error) {
          console.warn('Error in custom cleanup handler:', error);
        }
      });

      useEffect(() => {
        if (!isMountedRef.current) return;

        if (prevStateRef.current !== connectionState) {
          onStateChanged(connectionState, statusData);
          prevStateRef.current = connectionState;
        }

        prevStatusDataRef.current = statusData;
      }, [connectionState, statusData]);

      useEffect(() => {
        isMountedRef.current = true;
        cleanupCalled.current = false;

        return () => {
          if (prevStatusDataRef.current) {
            onUnmount(prevStatusDataRef.current);
          }
          performDefaultCleanup();
        };
      }, []);

      // Early return for missing required data
      if (!selectedAdapter || !activeConnector || !currentConnector) {
        return (
          <CustomLoadingPlaceholder
            ref={ref}
            className={
              customization?.classNames?.loadingPlaceholder?.({ statusData }) ??
              cn(
                'novacon:flex novacon:flex-col novacon:gap-4 novacon:items-center novacon:justify-center novacon:w-full novacon:py-8',
              )
            }
            role="status"
            aria-label={customConfig?.ariaLabels?.loading ?? labels.loading}
            statusData={statusData}
            data-connecting-component="true"
          />
        );
      }

      const containerAriaLabel =
        customConfig?.ariaLabels?.container ?? formatLabel(labels.connectionStatus, { status: displayMessage });

      return (
        <CustomContainer
          ref={ref as React.ForwardedRef<HTMLElement>}
          className={containerClasses}
          role="status"
          aria-label={containerAriaLabel}
          aria-live="polite"
          aria-atomic={true}
          statusData={statusData}
          data-connecting-component="true"
        >
          {/* Connection Status Container */}
          <CustomStatusContainer className={statusContainerClasses} statusData={statusData}>
            {/* Loading Spinner for Connecting State */}
            {connectionState === 'connecting' && (
              <CustomSpinner
                className={
                  customization?.classNames?.spinner?.({ statusData }) ??
                  cn(
                    'novacon:absolute novacon:animate-spin novacon:rounded-full novacon:-inset-[2px]',
                    'novacon:w-[calc(100%_+_4px)] novacon:h-[calc(100%_+_4px)]',
                    'novacon:border-2 novacon:border-[var(--tuwa-pending-text)]',
                    'novacon:border-t-transparent',
                  )
                }
                role="progressbar"
                aria-label={customConfig?.ariaLabels?.spinner ?? labels.connecting}
                aria-describedby="connecting-message"
                statusData={statusData}
              />
            )}

            {/* Success/Error Icons */}
            {(connectionState === 'success' || connectionState === 'error') && (
              <CustomStatusIcon
                className={
                  customization?.classNames?.statusIcon?.({ statusData }) ??
                  cn(
                    'novacon:absolute novacon:-top-2 novacon:-right-2 novacon:w-8 novacon:h-8 novacon:rounded-full novacon:flex novacon:items-center novacon:justify-center novacon:bg-[var(--tuwa-error-text)]',
                    {
                      'novacon:bg-[var(--tuwa-success-text)]': connectionState === 'success',
                    },
                  )
                }
                role="img"
                aria-label={
                  connectionState === 'success'
                    ? (customConfig?.ariaLabels?.successIcon ?? labels.successIcon)
                    : (customConfig?.ariaLabels?.errorIcon ?? labels.errorIcon)
                }
                statusData={statusData}
              />
            )}

            {/* Wallet Icon */}
            <CustomWalletIconContainer
              className={
                customization?.classNames?.walletIconContainer?.({ statusData }) ??
                cn(
                  'novacon:[&_svg]:w-[100px]! novacon:[&_svg]:h-[auto]! novacon:md:[&_svg]:w-[80px]! novacon:[&_img]:w-[100px]! novacon:[&_img]:h-[auto]! novacon:md:[&_img]:w-[80px]! novacon:leading-[0]',
                )
              }
              statusData={statusData}
            >
              <WalletIcon
                icon={currentConnector.icon}
                name={activeConnector}
                altText={`${activeConnector} ${labels.walletIcon}`}
                showLoading={connectionState === 'connecting'}
                customization={customization?.walletIcon}
              />
            </CustomWalletIconContainer>
          </CustomStatusContainer>

          {/* Status Message */}
          <CustomMessageContainer
            className={
              customization?.classNames?.messageContainer?.({ statusData }) ??
              cn('novacon:text-center novacon:space-y-2 novacon:max-w-md')
            }
            statusData={statusData}
          >
            <CustomStatusMessage
              id="connecting-message"
              className={
                customization?.classNames?.statusMessage?.({ statusData }) ??
                cn(
                  'novacon:text-lg novacon:font-semibold novacon:font-mono novacon:transition-colors novacon:duration-300',
                  {
                    'novacon:text-[var(--tuwa-error-text)]': connectionState === 'error',
                    'novacon:text-[var(--tuwa-success-text)]': connectionState === 'success',
                    'novacon:text-[var(--tuwa-text-primary)]': connectionState === 'connecting',
                  },
                )
              }
              role="heading"
              aria-level={2}
              statusData={statusData}
            >
              {displayMessage}
            </CustomStatusMessage>

            {/* Error Details */}
            {errorMessage && (
              <CustomErrorMessage
                className={
                  customization?.classNames?.errorMessage?.({ statusData }) ??
                  cn(
                    'novacon:text-sm novacon:text-[var(--tuwa-error-text)] novacon:text-center novacon:leading-relaxed',
                  )
                }
                role="alert"
                aria-describedby="connecting-message"
                statusData={statusData}
              >
                {errorMessage}
              </CustomErrorMessage>
            )}

            {/* Additional Error Information */}
            {connectionState === 'error' && showDetailedError && connectionError && (
              <CustomErrorDetails
                className={
                  customization?.classNames?.errorDetails?.({ statusData }) ?? cn('novacon:mt-3 novacon:text-left')
                }
                statusData={statusData}
              >
                <summary className="novacon:text-sm novacon:text-[var(--tuwa-text-secondary)] novacon:cursor-pointer novacon:hover:text-[var(--tuwa-text-primary)] novacon:transition-colors">
                  {labels.copyRawError}
                </summary>
                <pre className="novacon:mt-2 novacon:p-3 novacon:bg-[var(--tuwa-bg-muted)] novacon:rounded-[var(--tuwa-rounded-corners)] novacon:text-xs novacon:font-mono novacon:text-[var(--tuwa-text-secondary)] novacon:overflow-auto novacon:max-h-32">
                  {JSON.stringify(connectionError, null, 2)}
                </pre>
              </CustomErrorDetails>
            )}
          </CustomMessageContainer>

          {/* Screen Reader Announcements */}
          <div className="novacon:sr-only" aria-live="assertive" role="status">
            {connectionState === 'connecting' && `${labels.connecting} ${activeConnector}`}
            {connectionState === 'success' && `${labels.connectedSuccessfully} ${activeConnector}`}
            {connectionState === 'error' && `${labels.connectionError} ${activeConnector}`}
          </div>

          {/* Hidden Content for Screen Readers */}
          <div className="novacon:sr-only">
            <p>
              {formatLabel(labels.connectingDetails, {
                wallet: activeConnector,
                network: selectedAdapter,
                status: connectionState,
              })}
            </p>
          </div>
        </CustomContainer>
      );
    },
  ),
);

Connecting.displayName = 'Connecting';
