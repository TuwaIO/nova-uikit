/**
 * @file ImpersonateForm component with comprehensive customization options and validation.
 */

import { cn } from '@tuwaio/nova-core';
import { isAddress, OrbitAdapter } from '@tuwaio/orbit-core';
import React, { ComponentType, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void;
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
    onInputChange?: (displayValue: string, resolvedAddress: string | null) => void;
    /** Custom handler for input blur (called after default logic) */
    onInputBlur?: (displayValue: string, resolvedAddress: string | null) => void;
    /** Custom handler for paste events */
    onInputPaste?: (displayValue: string, resolvedAddress: string | null) => void;
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

    const adapter = getAdapter(selectedAdapter ?? OrbitAdapter.EVM);

    // Core state - separated concerns
    const [inputValue, setInputValue] = useState(''); // What user sees in input
    const [resolvedAddress, setResolvedAddress] = useState<string | null>(null); // Resolved domain address
    const [isResolving, setIsResolving] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Validation timeout ref
    const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    // Extract customization options
    const {
      Container: CustomContainer = DefaultContainer,
      Label: CustomLabel = DefaultLabel,
      Input: CustomInput = DefaultInput,
      ErrorMessage: CustomErrorMessage = DefaultErrorMessage,
    } = customization?.components ?? {};

    const customHandlers = customization?.handlers;
    const customConfig = customization?.config;

    /**
     * Memoized validation configuration with customization
     */
    const validationConfig: ValidationConfig = useMemo(
      () => ({
        ...defaultValidationConfig,
        ...customConfig?.validation,
      }),
      [customConfig?.validation],
    );

    /**
     * Check if adapter supports domain name resolution
     */
    const supportsNameResolution = adapter && typeof adapter.getAddress === 'function';

    /**
     * Clear validation timeout
     */
    const clearValidationTimeout = useCallback(() => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
        validationTimeoutRef.current = null;
      }
    }, []);

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
          const resolved = await adapter.getAddress(domainName);
          return resolved;
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
     * Update parent with final address (what goes to localStorage)
     */
    const updateParentAddress = useCallback(
      (displayValue: string, resolved: string | null) => {
        // Parent always gets the actual address, not the display value
        const finalAddress = resolved || displayValue;
        setImpersonatedAddress(finalAddress);
      },
      [setImpersonatedAddress],
    );

    /**
     * Validate a value and update state accordingly
     */
    const validateValue = useCallback(
      async (value: string): Promise<string | null> => {
        customHandlers?.onValidationStart?.(value);

        // Custom validation first
        if (validationConfig.customValidator) {
          const customError = validationConfig.customValidator(value);
          if (customError) {
            customHandlers?.onValidationComplete?.(value, customError);
            return customError;
          }
        }

        // Empty validation
        if (!value.trim()) {
          const error = labels.impersonateAddressEmpty;
          customHandlers?.onValidationComplete?.(value, error);
          return error;
        }

        // Domain name validation and resolution
        if (isDomainName(value)) {
          if (!supportsNameResolution) {
            const error = labels.impersonateAddressNotCorrect;
            customHandlers?.onValidationComplete?.(value, error);
            return error;
          }

          // Validate domain format based on adapter
          if (selectedAdapter === OrbitAdapter.EVM && !isENSName(value)) {
            const error = labels.impersonateAddressNotCorrect;
            customHandlers?.onValidationComplete?.(value, error);
            return error;
          }
          if (selectedAdapter === OrbitAdapter.SOLANA && !isSNSName(value)) {
            const error = labels.impersonateAddressNotCorrect;
            customHandlers?.onValidationComplete?.(value, error);
            return error;
          }

          // Try to resolve the domain name
          const resolved = await resolveDomainName(value);
          if (!resolved) {
            const error = labels.impersonateAddressNotCorrect;
            customHandlers?.onValidationComplete?.(value, error);
            return error;
          }

          // Update resolved address state and parent
          setResolvedAddress(resolved);
          updateParentAddress(value, resolved);
          customHandlers?.onAddressResolved?.(value, resolved);
          customHandlers?.onValidationComplete?.(value, null);
          return null;
        }

        // Regular address validation
        if (!isAddress(value)) {
          const error = labels.impersonateAddressNotCorrect;
          customHandlers?.onValidationComplete?.(value, error);
          return error;
        }

        // Connected wallet check
        if (activeConnection?.isConnected) {
          const error = labels.impersonateAddressConnected;
          customHandlers?.onValidationComplete?.(value, error);
          return error;
        }

        // Clear resolved address for regular addresses
        setResolvedAddress(null);
        updateParentAddress(value, null);
        customHandlers?.onValidationComplete?.(value, null);
        return null;
      },
      [
        customHandlers,
        validationConfig,
        labels.impersonateAddressEmpty,
        labels.impersonateAddressNotCorrect,
        labels.impersonateAddressConnected,
        supportsNameResolution,
        selectedAdapter,
        resolveDomainName,
        activeConnection?.isConnected,
        updateParentAddress,
      ],
    );

    /**
     * Trigger validation with debounce control
     */
    const triggerValidation = useCallback(
      (value: string, immediate = false) => {
        clearValidationTimeout();

        if (!validationConfig.validateOnChange && !immediate) {
          return;
        }

        const delay = immediate ? 0 : validationConfig.debounceDelay;

        validationTimeoutRef.current = setTimeout(async () => {
          if (hasInteracted || immediate) {
            const error = await validateValue(value);
            if (error) {
              setConnectionError(error);
            } else {
              resetConnectionError();
            }
          }
        }, delay);
      },
      [
        clearValidationTimeout,
        validationConfig.validateOnChange,
        validationConfig.debounceDelay,
        hasInteracted,
        validateValue,
        setConnectionError,
        resetConnectionError,
      ],
    );

    /**
     * Handle input change events
     */
    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        setHasInteracted(true);

        // Clear error immediately if user is typing valid input
        if (newValue.trim() && connectionError) {
          if (isAddress(newValue) || isDomainName(newValue)) {
            resetConnectionError();
          }
        }

        // Trigger debounced validation
        triggerValidation(newValue);

        // Call custom handler
        customHandlers?.onInputChange?.(newValue, resolvedAddress);
      },
      [connectionError, resetConnectionError, triggerValidation, customHandlers, resolvedAddress],
    );

    /**
     * Handle paste events
     */
    const handlePaste = useCallback(
      (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedValue = event.clipboardData.getData('text').trim();

        if (pastedValue) {
          // Prevent default paste to avoid double value
          event.preventDefault();

          setInputValue(pastedValue);
          setHasInteracted(true);

          // Trigger immediate validation for pasted content
          triggerValidation(pastedValue, true);

          // Call custom handler
          customHandlers?.onInputPaste?.(pastedValue, resolvedAddress);
        }
      },
      [triggerValidation, customHandlers, resolvedAddress],
    );

    /**
     * Handle input blur events
     */
    const handleBlur = useCallback(async () => {
      if (!validationConfig.validateOnBlur) return;

      setHasInteracted(true);
      clearValidationTimeout();

      // Immediate validation on blur
      const error = await validateValue(inputValue);
      if (error) {
        setConnectionError(error);
      } else {
        resetConnectionError();
      }

      // Call custom handler
      customHandlers?.onInputBlur?.(inputValue, resolvedAddress);
    }, [
      validationConfig.validateOnBlur,
      clearValidationTimeout,
      validateValue,
      inputValue,
      setConnectionError,
      resetConnectionError,
      customHandlers,
      resolvedAddress,
    ]);

    // Initialize input value from parent prop
    useEffect(() => {
      if (!isInitializedRef.current && impersonatedAddress) {
        setInputValue(impersonatedAddress);
        isInitializedRef.current = true;
      }
    }, [impersonatedAddress]);

    // Handle parent prop changes (but don't override user input)
    useEffect(() => {
      if (isInitializedRef.current && impersonatedAddress && !hasInteracted) {
        setInputValue(impersonatedAddress);
        // Auto-validate parent-provided values
        triggerValidation(impersonatedAddress, true);
      }
    }, [impersonatedAddress, hasInteracted, triggerValidation]);

    // Generate classes
    const containerClasses = customization?.classNames?.container?.() ?? cn('novacon:space-y-1', className);

    const labelClasses =
      customization?.classNames?.label?.() ?? 'novacon:block novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]';

    const inputClasses = customization?.classNames?.input
      ? customization.classNames.input({ hasError: !!connectionError, hasInteracted })
      : cn(
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
          { 'novacon:border-red-500 novacon:focus:ring-red-500': connectionError },
          // Resolving state styling
          { 'novacon:border-blue-500 novacon:focus:ring-blue-500': isResolving },
          // Transition for smooth state changes
          'novacon:transition-colors novacon:duration-200',
        );

    const errorMessageClasses =
      customization?.classNames?.errorMessage?.() ?? 'novacon:mt-2 novacon:text-sm novacon:text-red-500';

    const placeholder = (() => {
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
    })();

    // Cleanup effect
    useEffect(() => {
      customHandlers?.onMount?.();

      return () => {
        clearValidationTimeout();
        resetConnectionError();
        customHandlers?.onUnmount?.();
      };
    }, [clearValidationTimeout, resetConnectionError, customHandlers]);

    // Input configuration
    const inputId = 'impersonated-address';
    const errorId = 'address-error';
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
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onPaste={handlePaste}
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
            Resolving {isDomainName(inputValue) ? (isENSName(inputValue) ? 'ENS' : 'SNS') : ''} name...
          </p>
        )}

        {/* Resolved address display */}
        {resolvedAddress && isDomainName(inputValue) && !isResolving && (
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
