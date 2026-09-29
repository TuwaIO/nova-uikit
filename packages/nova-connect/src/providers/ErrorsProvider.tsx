/**
 * @file This file contains the `ErrorsProvider` component, a customizable error toast provider with full styling
 * control.
 */

import { ToastCloseButton, ToastCloseButtonProps } from '@tuwaio/nova-core';
import type { TuwaErrorState } from '@tuwaio/orbit-core';
import { ComponentPropsWithoutRef, ComponentType, useCallback, useEffect, useMemo, useRef } from 'react';
import { Bounce, toast, ToastContainer, type ToastPosition, type ToastTransition } from 'react-toastify';

import { ToastError, ToastErrorCustomization } from '../components';
import { useNovaConnectLabels } from '../hooks/useNovaConnectLabels';
import { useSatelliteConnectStore } from '../satellite';

// --- Types for Customization ---
/** Props of the toast content of {@link ErrorsProvider} (`customization.components.ToastError`). */
export type ErrorsProviderToastErrorProps = {
  /** The toast title (from `errorTitle`, by default the label of the error type). */
  title: string;
  /** The error: `connectionError` or `switchNetworkError` of the Satellite Connect store. */
  rawError: string | TuwaErrorState;
  /**
   * Called after the error was copied (or not).
   *
   * @param success - Whether the error was copied.
   */
  onCopyComplete?: (success: boolean) => void;
  /** `'wallet'` for `connectionError`, `'switch'` for `switchNetworkError`. */
  errorType: 'wallet' | 'switch' | null;
  /** Whether a wallet is connected. */
  isConnected: boolean;
};

/** Props of the toast container of {@link ErrorsProvider}: the props of `ToastContainer` from `react-toastify`. */
export type ErrorsProviderContainerProps = ComponentPropsWithoutRef<typeof ToastContainer>;

/**
 * Customization options for ErrorsProvider component
 */
export type ErrorsProviderCustomization = {
  /** Override ToastContainer element props */
  containerProps?: Partial<ComponentPropsWithoutRef<typeof ToastContainer>>;
  /** Custom components */
  components?: {
    /** Custom ToastError component */
    ToastError?: ComponentType<ErrorsProviderToastErrorProps>;
    /** Custom ToastContainer component */
    Container?: ComponentType<ErrorsProviderContainerProps>;
  };
  /** Default ToastError customization (only used with default ToastError component) */
  toastErrorCustomization?: ToastErrorCustomization;
  /** Customization for toast close button */
  toastCloseButton?: Omit<ToastCloseButtonProps, 'closeToast'>;
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the toasts, instead of the default ones.
     *
     * @param params - The error state.
     * @param params.hasErrors - Whether the store has a connection or network switch error.
     * @param params.errorType - `'wallet'`, `'switch'`, or `null` without error.
     * @returns The classes.
     */
    container?: (params: { hasErrors: boolean; errorType: 'wallet' | 'switch' | null }) => string;
  };
  /** Custom toast options generators */
  toastOptions?: {
    /**
     * Returns options of `toast.error` of `react-toastify`, merged over the default ones (`containerId`, `toastId`,
     * `onClose`).
     *
     * @param params - The error to show.
     * @param params.title - The toast title.
     * @param params.rawError - The error.
     * @param params.errorType - `'wallet'` or `'switch'`.
     * @param params.isConnected - Whether a wallet is connected.
     * @returns The toast options.
     */
    error?: (params: {
      title: string;
      rawError: string | TuwaErrorState;
      errorType: 'wallet' | 'switch' | null;
      isConnected: boolean;
    }) => Partial<Parameters<typeof toast.error>[1]>;
  };
  /** Custom logic handlers */
  handlers?: {
    /**
     * Wraps the display of an error toast: call `originalHandler(title, rawError, errorKey)` to show it.
     *
     * @param originalHandler - Shows the toast (once per `errorKey`), after dismissing the previous one.
     * @param params - The error to show.
     * @param params.title - The toast title.
     * @param params.rawError - The error.
     * @param params.errorKey - Key of the error (from `errorHash`), used to show it only once.
     * @param params.errorType - `'wallet'` or `'switch'`.
     */
    showError?: (
      originalHandler: (title: string, rawError: string | TuwaErrorState, errorKey: string) => void,
      params: {
        title: string;
        rawError: string | TuwaErrorState;
        errorKey: string;
        errorType: 'wallet' | 'switch' | null;
      },
    ) => void;
    /**
     * Wraps the dismissal of the error toasts: call `originalHandler()` to dismiss them.
     *
     * @param originalHandler - Dismisses the toasts of the container.
     */
    dismissError?: (originalHandler: () => void) => void;
    /**
     * Called after the copy button of a toast tried to copy the error. By default, logs the copied message in
     * development.
     *
     * @param success - Whether the error was copied.
     * @param rawError - The error.
     * @param errorType - `'wallet'` or `'switch'`.
     */
    onCopyComplete?: (
      success: boolean,
      rawError: string | TuwaErrorState,
      errorType: 'wallet' | 'switch' | null,
    ) => void;
  };
  /**
   * Returns the toast title. It does not change the labels, only the title of this toast.
   *
   * @param defaultTitle - The label of the error type (`connectionError`, `errorWhenChainSwitching` or
   * `somethingWentWrong`).
   * @param params - The error.
   * @param params.errorType - `'wallet'`, `'switch'`, or `null`.
   * @returns The title.
   */
  errorTitle?: (defaultTitle: string, params: { errorType: 'wallet' | 'switch' | null }) => string;
  /**
   * Returns the key used to show an error only once.
   *
   * @param defaultHash - The error type and the first 50 characters of the message, or `null` without error.
   * @param params - The error.
   * @param params.primaryError - The error of the store (`connectionError` first).
   * @param params.errorType - `'wallet'`, `'switch'`, or `null`.
   * @returns The key, or `null` to show nothing.
   */
  errorHash?: (
    defaultHash: string | null,
    params: { primaryError: TuwaErrorState | null; errorType: 'wallet' | 'switch' | null },
  ) => string | null;
};

/** Props of {@link ErrorsProvider}. */
export interface ErrorsProviderProps {
  /** Custom container ID for toast notifications */
  containerId?: string;
  /** Custom position for toast notifications */
  position?: ToastPosition;
  /** Auto close delay in milliseconds */
  autoClose?: number | false;
  /** Whether to enable drag to dismiss */
  draggable?: boolean;
  /** Customization options */
  customization?: ErrorsProviderCustomization;
}

// --- Default Sub-Components ---
const DefaultToastError = ({
  title,
  rawError,
  onCopyComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isConnected,
  ...props
}: ErrorsProviderToastErrorProps & { customization?: ToastErrorCustomization }) => {
  return (
    <ToastError title={title} rawError={rawError} onCopyComplete={onCopyComplete} customization={props.customization} />
  );
};

const DefaultContainer = (props: ErrorsProviderContainerProps) => {
  const labels = useNovaConnectLabels();
  return <ToastContainer {...props} role="alert" aria-live="assertive" aria-label={labels.somethingWentWrong} />;
};

// --- Default Handlers ---
const defaultShowErrorHandler = (
  originalHandler: (title: string, rawError: string | TuwaErrorState, errorKey: string) => void,
  params: { title: string; rawError: string | TuwaErrorState; errorKey: string },
) => {
  originalHandler(params.title, params.rawError, params.errorKey);
};

const defaultDismissErrorHandler = (originalHandler: () => void) => {
  originalHandler();
};

const defaultCopyCompleteHandler = (success: boolean, rawError: string | TuwaErrorState) => {
  if (success && process.env.NODE_ENV === 'development') {
    const msg = typeof rawError === 'string' ? rawError : rawError.message;
    console.log('Error copied to clipboard:', msg.substring(0, 100));
  }
};

const defaultErrorTitleGenerator = (defaultTitle: string) => defaultTitle;

const defaultErrorHashGenerator = (defaultHash: string | null) => defaultHash;

/**
 * Shows the connection and network switch errors of the Satellite Connect store (`connectionError`,
 * `switchNetworkError`) as `react-toastify` toasts ({@link ToastError}) in its own `ToastContainer` (id
 * `nova-connect-errors`, top center, closed after 7 seconds by default). Each error is shown once; the toasts are
 * dismissed when a wallet connects without error. `NovaConnectProvider` renders it.
 *
 * @param props - See {@link ErrorsProviderProps}.
 * @returns The toast container.
 */
export function ErrorsProvider({
  containerId = 'nova-connect-errors',
  position = 'top-center',
  autoClose = 7000,
  draggable = false,
  customization,
}: ErrorsProviderProps) {
  const labels = useNovaConnectLabels();

  const switchNetworkError = useSatelliteConnectStore((store) => store.switchNetworkError);
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const connectionError = useSatelliteConnectStore((store) => store.connectionError);

  // Extract custom components and handlers
  const { ToastError: CustomToastError = DefaultToastError, Container = DefaultContainer } =
    customization?.components ?? {};

  const {
    showError: customShowErrorHandler = defaultShowErrorHandler,
    dismissError: customDismissErrorHandler = defaultDismissErrorHandler,
    onCopyComplete: customCopyCompleteHandler = defaultCopyCompleteHandler,
  } = customization?.handlers ?? {};

  const {
    errorTitle: customErrorTitleGenerator = defaultErrorTitleGenerator,
    errorHash: customErrorHashGenerator = defaultErrorHashGenerator,
  } = customization ?? {};

  // Track displayed errors to prevent duplicates
  const displayedErrorsRef = useRef<Set<string>>(new Set());
  const currentToastIdRef = useRef<string | null>(null);

  // Error state derivation
  const hasWalletError = Boolean(connectionError);
  const hasSwitchError = Boolean(switchNetworkError);
  const isConnected = Boolean(activeConnection?.isConnected);
  const hasAnyError = hasWalletError || hasSwitchError;
  const primaryError = connectionError || switchNetworkError || null;
  const errorType = (hasWalletError ? 'wallet' : hasSwitchError ? 'switch' : null) as 'wallet' | 'switch' | null;

  const errorState = {
    hasWalletError,
    hasSwitchError,
    isConnected,
    hasAnyError,
    primaryError,
    errorType,
  };

  // Default error title based on type
  let defaultErrorTitle = labels.somethingWentWrong;
  switch (errorState.errorType) {
    case 'wallet':
      defaultErrorTitle = labels.connectionError;
      break;
    case 'switch':
      defaultErrorTitle = labels.errorWhenChainSwitching;
      break;
  }

  // Generate custom error title
  const errorTitle = customErrorTitleGenerator(defaultErrorTitle, { errorType: errorState.errorType });

  // Generate default error hash for deduplication
  const defaultErrorHash = errorState.primaryError
    ? `${errorState.errorType}-${errorState.primaryError.message.substring(0, 50)}`
    : null;

  // Generate custom error hash
  const errorHash = customErrorHashGenerator(defaultErrorHash, {
    primaryError: errorState.primaryError,
    errorType: errorState.errorType,
  });

  // Dismiss current toast
  const dismissCurrentToast = useCallback(() => {
    const originalHandler = () => {
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
        currentToastIdRef.current = null;
      }
      toast.dismiss({ containerId });
    };
    customDismissErrorHandler(originalHandler);
  }, [containerId, customDismissErrorHandler]);

  // Handle copy complete
  const handleCopyComplete = useCallback(
    (success: boolean, rawError: string | TuwaErrorState) => {
      customCopyCompleteHandler(success, rawError, errorType);
    },
    [customCopyCompleteHandler, errorType],
  );

  // Original handler for error display - using full customization object in dependencies
  const originalErrorHandler = useCallback(
    (t: string, r: string | TuwaErrorState, k: string) => {
      // Dismiss previous toast first
      dismissCurrentToast();

      // Check if this error was already displayed
      if (displayedErrorsRef.current.has(k)) {
        return;
      }

      try {
        // Generate custom toast options
        const defaultToastOptions = {
          containerId,
          toastId: k,
          onClose: () => {
            displayedErrorsRef.current.delete(k);
            currentToastIdRef.current = null;
          },
        };

        const customToastOptions = customization?.toastOptions?.error?.({
          title: t,
          rawError: r,
          errorType: errorState.errorType,
          isConnected: errorState.isConnected,
        });

        const toastOptions = { ...defaultToastOptions, ...customToastOptions };

        // Use toast.error and capture the result properly
        toast.error(
          <CustomToastError
            title={t}
            rawError={r}
            errorType={errorState.errorType}
            isConnected={errorState.isConnected}
            onCopyComplete={(success) => handleCopyComplete(success, r)}
            customization={customization?.toastErrorCustomization}
          />,
          toastOptions,
        );

        displayedErrorsRef.current.add(k);
        currentToastIdRef.current = k;
      } catch (error) {
        console.error('Failed to show error toast:', error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dismissCurrentToast,
      containerId,
      customization?.toastOptions?.error,
      customization?.toastErrorCustomization,
      CustomToastError,
      errorState.errorType,
      errorState.isConnected,
      handleCopyComplete,
    ],
  );

  // Show error toast
  const showErrorToast = useCallback(
    (title: string, rawError: TuwaErrorState, errorKey: string) => {
      customShowErrorHandler(originalErrorHandler, { title, rawError, errorKey, errorType });
    },
    [originalErrorHandler, customShowErrorHandler, errorType],
  );

  // Main effect to handle error display logic
  useEffect(() => {
    // Clear all errors when connected successfully
    if (isConnected && !hasAnyError) {
      dismissCurrentToast();
      displayedErrorsRef.current.clear();
      return;
    }

    // Show error if present and not already displayed
    if (hasAnyError && primaryError && errorHash) {
      // For connected state, only show switch network errors
      if (isConnected && errorType !== 'switch') {
        return;
      }

      showErrorToast(errorTitle, primaryError, errorHash);
    }
  }, [hasAnyError, isConnected, primaryError, errorType, errorTitle, errorHash, showErrorToast, dismissCurrentToast]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dismissCurrentToast();
      // eslint-disable-next-line
      displayedErrorsRef.current.clear();
    };
  }, [dismissCurrentToast]);

  // Generate container classes
  const containerClasses = customization?.classNames?.container
    ? customization.classNames.container({
        hasErrors: errorState.hasAnyError,
        errorType: errorState.errorType,
      })
    : 'novacon:p-0 novacon:bg-transparent';

  // Create customized close button component
  // KEEPING useMemo here because it returns a Component Definition.
  // Returning a new component function every render causes remounts and focus loss.
  const CustomizedCloseButton = useMemo(() => {
    const closeButtonCustomization = customization?.toastCloseButton;
    if (!closeButtonCustomization) return ToastCloseButton;

    // Return a wrapper component that passes customization props
    return ({ closeToast }: { closeToast?: (e: React.MouseEvent<HTMLElement>) => void }) => (
      <ToastCloseButton closeToast={closeToast} {...closeButtonCustomization} />
    );
  }, [customization?.toastCloseButton]);

  // Default container props
  const defaultContainerProps = {
    containerId,
    position,
    closeOnClick: false,
    icon: false as const,
    closeButton: CustomizedCloseButton,
    autoClose,
    hideProgressBar: false,
    newestOnTop: false,
    pauseOnFocusLoss: false,
    draggable,
    pauseOnHover: true,
    theme: 'light' as const,
    transition: Bounce as ToastTransition,
  };

  // Merge container props
  const containerProps = {
    ...defaultContainerProps,
    ...customization?.containerProps,
    className: containerClasses,
  };

  return <Container {...containerProps} />;
}

// Add display name for better debugging
ErrorsProvider.displayName = 'ErrorsProvider';
