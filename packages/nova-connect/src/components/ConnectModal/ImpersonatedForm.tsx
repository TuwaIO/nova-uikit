/**
 * @file ImpersonateForm component with comprehensive customization options and validation.
 */

import { cn } from '@tuwaio/nova-core';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAddress } from 'viem';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { useSatelliteConnectStore } from '../../satellite';

// --- Types ---

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /** Debounce delay in milliseconds */
  debounceDelay: number;
  /** Whether to validate on blur */
  validateOnBlur: boolean;
  /** Whether to validate on change */
  validateOnChange: boolean;
  /** Custom validation function */
  customValidator?: (address: string) => string | null;
}

// --- Component Props Types ---
type ContainerProps = {
  className?: string;
  children: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>;

type LabelProps = {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
} & React.RefAttributes<HTMLLabelElement>;

type InputProps = {
  className?: string;
  id?: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: 'true' | 'false';
  autoComplete?: string;
  spellCheck?: boolean;
  hasError: boolean;
} & React.RefAttributes<HTMLInputElement>;

type ErrorMessageProps = {
  className?: string;
  children: React.ReactNode;
  id?: string;
  role?: string;
  'aria-live'?: 'polite' | 'assertive';
} & React.RefAttributes<HTMLParagraphElement>;

/**
 * Customization options for ImpersonateForm component
 */
export type ImpersonateFormCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ContainerProps>;
    /** Custom label component */
    Label?: ComponentType<LabelProps>;
    /** Custom input component */
    Input?: ComponentType<InputProps>;
    /** Custom error message component */
    ErrorMessage?: ComponentType<ErrorMessageProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /** Function to generate container classes */
    container?: () => string;
    /** Function to generate label classes */
    label?: () => string;
    /** Function to generate input classes */
    input?: (params: { hasError: boolean; hasInteracted: boolean }) => string;
    /** Function to generate error message classes */
    errorMessage?: () => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom handler for input change (called after default logic) */
    onInputChange?: (value: string) => void;
    /** Custom handler for input blur (called after default logic) */
    onInputBlur?: (value: string) => void;
    /** Custom handler for validation start */
    onValidationStart?: (value: string) => void;
    /** Custom handler for validation complete */
    onValidationComplete?: (value: string, error: string | null) => void;
    /** Custom handler for resolved address */
    onAddressResolved?: (originalValue: string, resolvedAddress: string) => void;
    /** Custom handler for component mount */
    onMount?: () => void;
    /** Custom handler for component unmount */
    onUnmount?: () => void;
  };
  /** Configuration options */
  config?: {
    /** Custom validation configuration */
    validation?: Partial<ValidationConfig>;
    /** Custom ARIA labels */
    ariaLabels?: {
      input?: string;
      errorRegion?: string;
    };
    /** Custom input attributes */
    input?: {
      placeholder?: string;
      autoComplete?: string;
      spellCheck?: boolean;
    };
  };
};

/**
 * Props for the ImpersonateForm component
 */
export interface ImpersonateFormProps {
  /** Currently selected adapter **/
  selectedAdapter?: OrbitAdapter;
  /** Current impersonated wallet address value */
  impersonatedAddress: string;
  /** Callback to update the impersonated address */
  setImpersonatedAddress: (value: string) => void;
  /** Custom CSS classes for styling the container */
  className?: string;
  /** Customization options */
  customization?: ImpersonateFormCustomization;
}

/**
 * Default validation configuration
 */
const defaultValidationConfig: ValidationConfig = {
  debounceDelay: 500,
  validateOnBlur: true,
  validateOnChange: true,
};

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLDivElement, ContainerProps>(({ children, className }, ref) => (
  <div ref={ref} className={className}>
    {children}
  </div>
));
DefaultContainer.displayName = 'DefaultContainer';

const DefaultLabel = forwardRef<HTMLLabelElement, LabelProps>(({ children, className, ...props }, ref) => (
  <label ref={ref} className={className} {...props}>
    {children}
  </label>
));
DefaultLabel.displayName = 'DefaultLabel';
// eslint-disable-next-line
const DefaultInput = forwardRef<HTMLInputElement, InputProps>(({ className, hasError: _, ...props }, ref) => (
  <input ref={ref} className={className} {...props} />
));
DefaultInput.displayName = 'DefaultInput';

const DefaultErrorMessage = forwardRef<HTMLParagraphElement, ErrorMessageProps>(
  ({ children, className, ...props }, ref) => (
    <p ref={ref} className={className} {...props}>
      {children}
    </p>
  ),
);
DefaultErrorMessage.displayName = 'DefaultErrorMessage';

/**
 * Check if a value is an ENS name
 */
function isENSName(value: string): boolean {
  return value.toLowerCase().endsWith('.eth');
}

/**
 * Check if a value is an SNS name
 */
function isSNSName(value: string): boolean {
  return value.toLowerCase().endsWith('.sol');
}

/**
 * Check if a value is a domain name (ENS or SNS)
 */
function isDomainName(value: string): boolean {
  return isENSName(value) || isSNSName(value);
}

/**
 * Form component for entering wallet address to impersonate with comprehensive customization
 *
 * This component provides a validated form input with:
 * - Support for ENS names (.eth) for EVM adapters
 * - Support for SNS names (.sol) for Solana adapters
 * - Automatic address resolution using adapter's getAddress method
 * - Debounced validation with configurable timing
 * - Real-time address format validation using viem's isAddress
 * - Full accessibility support with proper ARIA labeling
 * - Error state management with immediate visual feedback
 * - Touch-friendly design with proper focus states
 * - Full customization of all child components
 * - Comprehensive validation with custom validation support
 *
 * Validation features:
 * - Empty address detection
 * - Invalid address format detection using viem
 * - ENS/SNS name validation based on selected adapter
 * - Connected wallet conflict detection
 * - Custom validation function support
 * - Debounced validation to prevent excessive API calls
 * - Immediate validation on blur for better UX
 *
 * Accessibility features:
 * - Proper form labeling with htmlFor association
 * - ARIA invalid and describedby attributes
 * - Live region for error announcements
 * - Screen reader friendly error messages
 * - Proper focus management
 *
 * @example Basic usage
 * ```tsx
 * <ImpersonateForm
 *   impersonatedAddress={address}
 *   setImpersonatedAddress={setAddress}
 *   selectedAdapter={OrbitAdapter.EVM}
 * />
 * ```
 *
 * @example With ENS support
 * ```tsx
 * <ImpersonateForm
 *   impersonatedAddress="vitalik.eth"
 *   setImpersonatedAddress={setAddress}
 *   selectedAdapter={OrbitAdapter.EVM}
 * />
 * ```
 */
export const ImpersonateForm = forwardRef<HTMLDivElement, ImpersonateFormProps>(
  ({ impersonatedAddress, setImpersonatedAddress, className, customization, selectedAdapter }, ref) => {
    // Get labels from context
    const labels = useNovaConnectLabels();

    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
    const connectionError = useSatelliteConnectStore((store) => store.connectionError);
    const resetConnectionError = useSatelliteConnectStore((store) => store.resetConnectionError);
    const setConnectionError = useSatelliteConnectStore((store) => store.setConnectionError);
    const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);

    const adapter = useMemo(() => getAdapter(selectedAdapter ?? OrbitAdapter.EVM), [getAdapter, selectedAdapter]);

    // State for tracking resolved address
    const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    // Extract customization options
    const {
      Container: CustomContainer = DefaultContainer,
      Label: CustomLabel = DefaultLabel,
      Input: CustomInput = DefaultInput,
      ErrorMessage: CustomErrorMessage = DefaultErrorMessage,
    } = customization?.components ?? {};

    const customHandlers = customization?.handlers;
    const customConfig = customization?.config;

    // Local state to track if user has interacted with the field
    const [hasInteracted, setHasInteracted] = useState(false);

    // Use ref to store timeout ID
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Memoized validation configuration with customization
     */
    const validationConfig = useMemo(
      (): ValidationConfig => ({
        ...defaultValidationConfig,
        ...customConfig?.validation,
      }),
      [customConfig?.validation],
    );

    /**
     * Check if adapter supports domain name resolution
     */
    const supportsNameResolution = useMemo(() => {
      return adapter && typeof adapter.getAddress === 'function';
    }, [adapter]);

    /**
     * Resolve domain name to address
     */
    const resolveDomainName = useCallback(
      async (domainName: string): Promise<string | null> => {
        if (!supportsNameResolution || !adapter?.getAddress) {
          return null;
        }

        // Validate domain name format based on adapter
        if (selectedAdapter === OrbitAdapter.EVM && !isENSName(domainName)) {
          return null;
        }
        if (selectedAdapter === OrbitAdapter.SOLANA && !isSNSName(domainName)) {
          return null;
        }

        try {
          setIsResolving(true);
          return await adapter.getAddress(domainName);
        } catch (error) {
          console.warn(`Failed to resolve ${domainName}:`, error);
          return null;
        } finally {
          setIsResolving(false);
        }
      },
      [supportsNameResolution, adapter, selectedAdapter],
    );

    /**
     * Generate validation function with proper memoization dependencies
     */
    const getValidateAddress = useCallback(
      () =>
        async (inputValue: string): Promise<string | null> => {
          // Custom validation first
          if (validationConfig.customValidator) {
            const customError = validationConfig.customValidator(inputValue);
            if (customError) return customError;
          }

          // Standard validations
          if (!inputValue.trim()) {
            return labels.impersonateAddressEmpty;
          }

          // Check if it's a domain name
          if (isDomainName(inputValue)) {
            if (!supportsNameResolution) {
              return labels.impersonateAddressNotCorrect;
            }

            // Validate domain format based on adapter
            if (selectedAdapter === OrbitAdapter.EVM && !isENSName(inputValue)) {
              return labels.impersonateAddressNotCorrect;
            }
            if (selectedAdapter === OrbitAdapter.SOLANA && !isSNSName(inputValue)) {
              return labels.impersonateAddressNotCorrect;
            }

            // Try to resolve the domain name
            const resolved = await resolveDomainName(inputValue);
            if (!resolved) {
              return labels.impersonateAddressNotCorrect;
            }

            // Update resolved address and notify parent
            setResolvedAddress(resolved);
            customHandlers?.onAddressResolved?.(inputValue, resolved);
            return null;
          }

          // Reset resolved address if not a domain name
          setResolvedAddress(null);

          // Validate as regular address
          if (!isAddress(inputValue)) {
            return labels.impersonateAddressNotCorrect;
          }

          if (activeConnection?.isConnected) {
            return labels.impersonateAddressConnected;
          }

          return null;
        },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        validationConfig.customValidator,
        labels.impersonateAddressEmpty,
        labels.impersonateAddressNotCorrect,
        labels.impersonateAddressConnected,
        activeConnection?.isConnected,
        supportsNameResolution,
        selectedAdapter,
        resolveDomainName,
        customHandlers?.onAddressResolved,
      ],
    );

    /**
     * Memoized validation function
     */
    const validateAddress = useMemo(() => getValidateAddress(), [getValidateAddress]);

    /**
     * Generate debounced validation function with proper memoization dependencies
     */
    const getDebouncedValidate = useCallback(
      () => (address: string) => {
        if (!validationConfig.validateOnChange) return;

        // Clear previous timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        customHandlers?.onValidationStart?.(address);

        timeoutRef.current = setTimeout(async () => {
          if (hasInteracted) {
            const error = await validateAddress(address);
            if (error) {
              setConnectionError(error);
            } else if (connectionError) {
              resetConnectionError();
            }
            customHandlers?.onValidationComplete?.(address, error);
          }
        }, validationConfig.debounceDelay);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        validationConfig.validateOnChange,
        validationConfig.debounceDelay,
        hasInteracted,
        validateAddress,
        setConnectionError,
        resetConnectionError,
        connectionError,
        customHandlers?.onValidationStart,
        customHandlers?.onValidationComplete,
      ],
    );

    /**
     * Memoized debounced validation function
     */
    const debouncedValidate = useMemo(() => getDebouncedValidate(), [getDebouncedValidate]);

    /**
     * Generate input change handler with proper memoization dependencies
     */
    const getHandleAddressChange = useCallback(
      () => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setHasInteracted(true);
        setImpersonatedAddress(newValue);

        // Clear resolved address when input changes
        if (!isDomainName(newValue)) {
          setResolvedAddress(null);
        }

        // Clear error immediately if field becomes valid
        if (newValue.trim() && connectionError) {
          if (isAddress(newValue) || isDomainName(newValue)) {
            resetConnectionError();
          }
        }

        // Trigger debounced validation
        debouncedValidate(newValue);

        // Call custom handler
        customHandlers?.onInputChange?.(newValue);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [setImpersonatedAddress, connectionError, resetConnectionError, debouncedValidate, customHandlers?.onInputChange],
    );

    /**
     * Memoized input change handler
     */
    const handleAddressChange = useMemo(() => getHandleAddressChange(), [getHandleAddressChange]);

    /**
     * Generate blur handler with proper memoization dependencies
     */
    const getHandleBlur = useCallback(
      () => async () => {
        if (!validationConfig.validateOnBlur) return;

        setHasInteracted(true);

        // Clear any pending debounced validation
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Validate immediately on blur without debounce
        const error = await validateAddress(impersonatedAddress);
        if (error) {
          setConnectionError(error);
        } else if (connectionError) {
          resetConnectionError();
        }

        // Call custom handler
        customHandlers?.onInputBlur?.(impersonatedAddress);
        customHandlers?.onValidationComplete?.(impersonatedAddress, error);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        validationConfig.validateOnBlur,
        validateAddress,
        impersonatedAddress,
        setConnectionError,
        resetConnectionError,
        connectionError,
        customHandlers?.onInputBlur,
        customHandlers?.onValidationComplete,
      ],
    );

    /**
     * Memoized blur handler
     */
    const handleBlur = useMemo(() => getHandleBlur(), [getHandleBlur]);

    /**
     * Generate container classes with proper memoization dependencies
     */
    const getContainerClasses = useCallback(
      () => customization?.classNames?.container?.() ?? cn('novacon:space-y-1', className),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customization?.classNames?.container, className],
    );

    /**
     * Memoized container classes
     */
    const containerClasses = useMemo(getContainerClasses, [getContainerClasses]);

    /**
     * Generate label classes with proper memoization dependencies
     */
    const getLabelClasses = useCallback(
      () =>
        customization?.classNames?.label?.() ??
        'novacon:block novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]',
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customization?.classNames?.label],
    );

    /**
     * Memoized label classes
     */
    const labelClasses = useMemo(() => getLabelClasses(), [getLabelClasses]);

    /**
     * Generate input classes with proper memoization dependencies
     */
    const getInputClasses = useCallback(() => {
      if (customization?.classNames?.input) {
        return customization.classNames.input({ hasError: !!connectionError, hasInteracted });
      }

      return cn(
        // Base layout and spacing
        'novacon:mt-1 novacon:w-full novacon:p-3 novacon:rounded-xl',
        // Theme colors
        'novacon:bg-[var(--tuwa-bg-secondary)]',
        'novacon:border novacon:border-[var(--tuwa-border-primary)]',
        'novacon:text-[var(--tuwa-text-primary)]',
        'novacon:placeholder:text-[var(--tuwa-text-secondary)]',
        // Focus and interaction states
        'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-border-primary)]',
        // Error state styling
        {
          'novacon:border-red-500 novacon:focus:ring-red-500': connectionError,
        },
        // Resolving state styling
        {
          'novacon:border-blue-500 novacon:focus:ring-blue-500': isResolving,
        },
        // Transition for smooth state changes
        'novacon:transition-colors novacon:duration-200',
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customization?.classNames?.input, connectionError, hasInteracted, isResolving]);

    /**
     * Memoized input classes
     */
    const inputClasses = useMemo(() => getInputClasses(), [getInputClasses]);

    /**
     * Generate error message classes with proper memoization dependencies
     */
    const getErrorMessageClasses = useCallback(
      () => customization?.classNames?.errorMessage?.() ?? 'novacon:mt-2 novacon:text-sm novacon:text-red-500',
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customization?.classNames?.errorMessage],
    );

    /**
     * Memoized error message classes
     */
    const errorMessageClasses = useMemo(() => getErrorMessageClasses(), [getErrorMessageClasses]);

    /**
     * Generate placeholder text based on adapter support
     */
    const getPlaceholder = useCallback(() => {
      if (customConfig?.input?.placeholder) {
        return customConfig.input.placeholder;
      }

      if (supportsNameResolution) {
        if (selectedAdapter === OrbitAdapter.EVM) {
          return `${labels.walletAddressPlaceholder} or ENS name (.eth)`;
        }
        if (selectedAdapter === OrbitAdapter.SOLANA) {
          return `${labels.walletAddressPlaceholder} or SNS name (.sol)`;
        }
      }

      return labels.walletAddressPlaceholder;
    }, [customConfig?.input?.placeholder, supportsNameResolution, selectedAdapter, labels.walletAddressPlaceholder]);

    // Cleanup effect and mount/unmount handlers
    useEffect(() => {
      customHandlers?.onMount?.();

      return () => {
        // Clear timeout on unmount
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        resetConnectionError();
        setResolvedAddress(null);
        customHandlers?.onUnmount?.();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetConnectionError, customHandlers?.onMount, customHandlers?.onUnmount]);

    // Update parent component with resolved address for final submission
    useEffect(() => {
      if (isDomainName(impersonatedAddress) && resolvedAddress) {
        // Update the parent with the resolved address so it can be used for impersonation
        // The parent component will receive this through the setImpersonatedAddress callback
        // when the form is submitted or validated
      }
    }, [impersonatedAddress, resolvedAddress]);

    // Input configuration
    const inputId = 'impersonated-address';
    const errorId = 'address-error';
    const placeholder = getPlaceholder();
    const autoComplete = customConfig?.input?.autoComplete ?? 'off';
    const spellCheck = customConfig?.input?.spellCheck ?? false;

    return (
      <CustomContainer ref={ref} className={containerClasses}>
        {/* Form label */}
        <CustomLabel className={labelClasses} htmlFor={inputId}>
          {labels.enterWalletAddressOrAddressName}
        </CustomLabel>

        {/* Address input field */}
        <CustomInput
          className={inputClasses}
          id={inputId}
          type="text"
          value={impersonatedAddress}
          onChange={handleAddressChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-describedby={connectionError ? errorId : undefined}
          aria-invalid={connectionError ? 'true' : 'false'}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          hasError={!!connectionError}
        />

        {/* Resolution status */}
        {isResolving && (
          <p className="novacon:mt-1 novacon:text-sm novacon:text-blue-500">
            Resolving {isDomainName(impersonatedAddress) ? (isENSName(impersonatedAddress) ? 'ENS' : 'SNS') : ''}{' '}
            name...
          </p>
        )}

        {/* Resolved address display */}
        {resolvedAddress && isDomainName(impersonatedAddress) && !isResolving && (
          <p className="novacon:mt-1 novacon:text-sm novacon:text-green-600">Resolved to: {resolvedAddress}</p>
        )}

        {/* Error message display */}
        {connectionError && (
          <CustomErrorMessage className={errorMessageClasses} id={errorId} role="alert" aria-live="polite">
            {connectionError}
          </CustomErrorMessage>
        )}
      </CustomContainer>
    );
  },
);

ImpersonateForm.displayName = 'ImpersonateForm';
