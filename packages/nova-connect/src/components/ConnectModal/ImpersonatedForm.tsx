/**
 * @file ImpersonateForm component with comprehensive customization options and validation.
 */

import { cn } from '@tuwaio/nova-core';
import { isAddress, normalizeError, OrbitAdapter } from '@tuwaio/orbit-core';
import React, {
  ComponentType,
  forwardRef,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { formatLabel } from '../../i18n/formatLabel';
import { useSatelliteConnectStore } from '../../satellite';

// --- Types ---

/**
 * Validation settings of {@link ImpersonateForm} (`config.validation`).
 */
export interface ValidationConfig {
  /** Delay after the last keystroke before the value is validated, in milliseconds (default: `500`) */
  debounceDelay: number;
  /** Whether to validate when the field loses focus (default: `true`) */
  validateOnBlur: boolean;
  /** Whether to validate while typing (default: `true`) */
  validateOnChange: boolean;
  /**
   * Runs before the built-in checks.
   *
   * @param address - The text in the field.
   * @returns An error message, or `null` to continue with the built-in checks.
   */
  customValidator?: (address: string) => string | null;
}

// --- Component Props Types ---
/**
 * Props for a custom container.
 */
export type ImpersonatedFormContainerProps = {
  /** Classes from `classNames.container`, or the defaults with the `className` prop */
  className?: string;
  /** The label, the field, the resolution status and the error */
  children: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom label.
 */
export type ImpersonatedFormLabelProps = {
  /** Classes from `classNames.label` or the defaults */
  className?: string;
  /** The `enterWalletAddressOrAddressName` label */
  children: React.ReactNode;
  /** `impersonated-address` */
  htmlFor?: string;
} & React.RefAttributes<HTMLLabelElement>;

/**
 * Props for a custom address field.
 */
export type ImpersonatedFormInputProps = {
  /** Classes from `classNames.input` or the defaults */
  className?: string;
  /** `impersonated-address` */
  id?: string;
  /** `text` */
  type?: string;
  /** The text in the field */
  value: string;
  /**
   * Updates the text and validates it after `debounceDelay`.
   *
   * @param event - The change event.
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Validates the text at once (with `validateOnBlur`) */
  onBlur: () => void;
  /**
   * Replaces the text with the trimmed pasted text and validates it at once.
   *
   * @param event - The paste event.
   */
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  /** `config.input.placeholder`, or the `walletAddressPlaceholder` label with a hint about ENS or SNS names */
  placeholder?: string;
  /** ID of the error message, while there is an error */
  'aria-describedby'?: string;
  /** Whether there is an error */
  'aria-invalid'?: 'true' | 'false';
  /** `config.input.autoComplete` or `off` */
  autoComplete?: string;
  /** `config.input.spellCheck` or `false` */
  spellCheck?: boolean;
  /** Whether the Satellite store has a `connectionError` */
  hasError: boolean;
} & React.RefAttributes<HTMLInputElement>;

/**
 * Props for a custom error message.
 */
export type ImpersonatedFormErrorMessageProps = {
  /** Classes from `classNames.errorMessage` or the defaults */
  className?: string;
  /** Message of `connectionError` of the Satellite store */
  children: React.ReactNode;
  /** `address-error` */
  id?: string;
  /** `alert` */
  role?: string;
  /** `polite` */
  'aria-live'?: 'polite' | 'assertive';
} & React.RefAttributes<HTMLParagraphElement>;

/**
 * Props for a custom status of the name resolution (the default one shows `Resolving ENS name...` while resolving).
 */
export type ImpersonatedFormResolvingStatusProps = {
  /** Whether a name is being resolved */
  isResolving: boolean;
  /** `ENS` for `.eth` names, `SNS` for `.sol` names, otherwise empty */
  domainType: 'ENS' | 'SNS' | '';
  /** Classes from `classNames.resolvingStatus`, added to the defaults */
  className?: string;
};

/**
 * Props for a custom display of the resolved address (the default one shows `Resolved to: <address>`).
 */
export type ImpersonatedFormResolvedAddressProps = {
  /** The address of the name */
  resolvedAddress: string;
  /** Classes from `classNames.resolvedAddress`, added to the defaults */
  className?: string;
};

/**
 * Customization options of {@link ImpersonateForm}.
 */
export type ImpersonateFormCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ImpersonatedFormContainerProps>;
    /** Custom label component */
    Label?: ComponentType<ImpersonatedFormLabelProps>;
    /** Custom input component */
    Input?: ComponentType<ImpersonatedFormInputProps>;
    /** Custom error message component */
    ErrorMessage?: ComponentType<ImpersonatedFormErrorMessageProps>;
    /** Custom resolving status component */
    ResolvingStatus?: ComponentType<ImpersonatedFormResolvingStatusProps>;
    /** Custom resolved address display component */
    ResolvedAddress?: ComponentType<ImpersonatedFormResolvedAddressProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and the `className` prop.
     *
     * @returns The classes.
     */
    container?: () => string;
    /**
     * Returns the classes of the label, instead of the default ones.
     *
     * @returns The classes.
     */
    label?: () => string;
    /**
     * Returns the classes of the field, instead of the default ones.
     *
     * @param params - The field state.
     * @param params.hasError - Whether the Satellite store has a `connectionError`.
     * @param params.hasInteracted - Whether the user has typed, pasted or left the field.
     * @returns The classes.
     */
    input?: (params: { hasError: boolean; hasInteracted: boolean }) => string;
    /**
     * Returns the classes of the error message, instead of the default ones.
     *
     * @returns The classes.
     */
    errorMessage?: () => string;
    /**
     * Returns the classes of the resolution status, added to the default ones.
     *
     * @returns The classes.
     */
    resolvingStatus?: () => string;
    /**
     * Returns the classes of the resolved address, added to the default ones.
     *
     * @returns The classes.
     */
    resolvedAddress?: () => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called after the text changes.
     *
     * @param displayValue - The text in the field.
     * @param resolvedAddress - The address of the last resolved ENS or SNS name, or `null`.
     */
    onInputChange?: (displayValue: string, resolvedAddress: string | null) => void;
    /**
     * Called after the blur validation (only with `validateOnBlur`).
     *
     * @param displayValue - The text in the field.
     * @param resolvedAddress - The address of the last resolved ENS or SNS name, or `null`.
     */
    onInputBlur?: (displayValue: string, resolvedAddress: string | null) => void;
    /**
     * Called after a non-empty paste.
     *
     * @param displayValue - The text in the field.
     * @param resolvedAddress - The address of the last resolved ENS or SNS name, or `null`.
     */
    onInputPaste?: (displayValue: string, resolvedAddress: string | null) => void;
    /**
     * Called when a validation starts.
     *
     * @param value - The validated text.
     */
    onValidationStart?: (value: string) => void;
    /**
     * Called when a validation ends.
     *
     * @param value - The validated text.
     * @param error - The error message, or `null` when the value is valid.
     */
    onValidationComplete?: (value: string, error: string | null) => void;
    /**
     * Called when an ENS or SNS name resolves.
     *
     * @param originalValue - The name.
     * @param resolvedAddress - Its address.
     */
    onAddressResolved?: (originalValue: string, resolvedAddress: string) => void;
    /** Called after mount */
    onMount?: () => void;
    /** Called on unmount */
    onUnmount?: () => void;
  };
  /** Configuration options */
  config?: {
    /** Custom validation configuration */
    validation?: Partial<ValidationConfig>;
    /** Custom input attributes */
    input?: {
      /** Placeholder of the field */
      placeholder?: string;
      /** `autoComplete` of the field (default: `off`) */
      autoComplete?: string;
      /** `spellCheck` of the field (default: `false`) */
      spellCheck?: boolean;
    };
  };
};

/**
 * Props for the {@link ImpersonateForm} component.
 */
export interface ImpersonateFormProps {
  /** Network of the address; its Satellite adapter resolves names (default: EVM) */
  selectedAdapter?: OrbitAdapter;
  /** Initial text of the field; a new value before the user types is validated at once */
  impersonatedAddress: string;
  /**
   * Receives a valid address: the typed address, or the address of a resolved ENS or SNS name.
   *
   * @param value - The address.
   */
  setImpersonatedAddress: (value: string) => void;
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
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
const DefaultContainer = forwardRef<HTMLDivElement, ImpersonatedFormContainerProps>(({ children, className }, ref) => (
  <div ref={ref} className={className}>
    {children}
  </div>
));
DefaultContainer.displayName = 'DefaultContainer';

const DefaultLabel = forwardRef<HTMLLabelElement, ImpersonatedFormLabelProps>(
  ({ children, className, ...props }, ref) => (
    <label ref={ref} className={className} {...props}>
      {children}
    </label>
  ),
);
DefaultLabel.displayName = 'DefaultLabel';

const DefaultInput = forwardRef<HTMLInputElement, ImpersonatedFormInputProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, hasError: _, ...props }, ref) => <input ref={ref} className={className} {...props} />,
);
DefaultInput.displayName = 'DefaultInput';

const DefaultErrorMessage = forwardRef<HTMLParagraphElement, ImpersonatedFormErrorMessageProps>(
  ({ children, className, ...props }, ref) => (
    <p ref={ref} className={className} {...props}>
      {children}
    </p>
  ),
);
DefaultErrorMessage.displayName = 'DefaultErrorMessage';

const DefaultResolvingStatus: React.FC<ImpersonatedFormResolvingStatusProps> = ({
  isResolving,
  domainType,
  className,
}) => {
  const labels = useNovaConnectLabels();
  if (!isResolving) return null;

  return (
    <p className={cn('novacon:mt-1 novacon:text-sm novacon:text-blue-500', className)}>
      {formatLabel(labels.resolvingName, { service: domainType })}
    </p>
  );
};

const DefaultResolvedAddress: React.FC<ImpersonatedFormResolvedAddressProps> = ({ resolvedAddress, className }) => {
  const labels = useNovaConnectLabels();
  return (
    <p className={cn('novacon:mt-1 novacon:text-sm novacon:text-green-600', className)}>
      {formatLabel(labels.resolvedTo, { address: resolvedAddress })}
    </p>
  );
};

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
 * The address field of the impersonation screen. It checks the text (not empty, an address or a name, no wallet
 * connected) and shows the error. ENS (`.eth`, EVM) and SNS (`.sol`, Solana) names are resolved with `getAddress` of
 * the Satellite adapter, which sends a network request.
 *
 * Validation errors are stored as `connectionError` of the Satellite store (so the connect modal can block the
 * "Connect" button), and the error is reset on unmount.
 *
 * Props: {@link ImpersonateFormProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { ImpersonateForm } from '@tuwaio/nova-connect/components';
 * import { useNovaConnect } from '@tuwaio/nova-connect/hooks';
 * import { OrbitAdapter } from '@tuwaio/orbit-core';
 *
 * export function ImpersonateField() {
 *   const { impersonatedAddress, setImpersonatedAddress } = useNovaConnect();
 *
 *   return (
 *     <ImpersonateForm
 *       selectedAdapter={OrbitAdapter.EVM}
 *       impersonatedAddress={impersonatedAddress}
 *       setImpersonatedAddress={setImpersonatedAddress}
 *       customization={{ config: { validation: { debounceDelay: 300 } } }}
 *     />
 *   );
 * }
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

    const adapter = getAdapter(selectedAdapter ?? OrbitAdapter.EVM);

    // Core state - separated concerns
    const [inputValue, setInputValue] = useState(''); // What user sees in input
    const [resolvedAddress, setResolvedAddress] = useState<string | null>(null); // Resolved domain address
    const [isResolving, setIsResolving] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Validation timeout ref
    const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitializedRef = useRef(false);

    // Extract customization options
    const {
      Container: CustomContainer = DefaultContainer,
      Label: CustomLabel = DefaultLabel,
      Input: CustomInput = DefaultInput,
      ErrorMessage: CustomErrorMessage = DefaultErrorMessage,
      ResolvingStatus: CustomResolvingStatus = DefaultResolvingStatus,
      ResolvedAddress: CustomResolvedAddress = DefaultResolvedAddress,
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
              setConnectionError(normalizeError(new Error(error)));
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
        setConnectionError(normalizeError(new Error(error)));
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
          'novacon:mt-1 novacon:w-full novacon:p-3 novacon:rounded-[var(--tuwa-rounded-corners)]',
          // Theme colors
          'novacon:bg-[var(--tuwa-bg-secondary)]',
          'novacon:border novacon:border-[var(--tuwa-border-primary)]',
          'novacon:text-[var(--tuwa-text-primary)]',
          'novacon:placeholder:text-[var(--tuwa-text-secondary)]',
          // Focus and interaction states
          'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
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
          return formatLabel(labels.walletAddressOrEnsPlaceholder, { address: labels.walletAddressPlaceholder });
        }
        if (selectedAdapter === OrbitAdapter.SOLANA) {
          return formatLabel(labels.walletAddressOrSnsPlaceholder, { address: labels.walletAddressPlaceholder });
        }
      }

      return labels.walletAddressPlaceholder;
    })();

    // The handlers are read through Effect Events, so a new `handlers` object on every render does not re-run the effect
    const onMount = useEffectEvent(() => customHandlers?.onMount?.());
    const onUnmount = useEffectEvent(() => {
      clearValidationTimeout();
      resetConnectionError();
      customHandlers?.onUnmount?.();
    });
    useEffect(() => {
      onMount();
      return () => onUnmount();
    }, []);

    // Input configuration
    const inputId = 'impersonated-address';
    const errorId = 'address-error';
    const autoComplete = customConfig?.input?.autoComplete ?? 'off';
    const spellCheck = customConfig?.input?.spellCheck ?? false;

    // Get domain type for resolving status
    const domainType = isDomainName(inputValue) ? (isENSName(inputValue) ? 'ENS' : 'SNS') : '';

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
        <CustomResolvingStatus
          isResolving={isResolving}
          domainType={domainType}
          className={customization?.classNames?.resolvingStatus?.()}
        />

        {/* Resolved address display */}
        {resolvedAddress && isDomainName(inputValue) && !isResolving && (
          <CustomResolvedAddress
            resolvedAddress={resolvedAddress}
            className={customization?.classNames?.resolvedAddress?.()}
          />
        )}

        {/* Error message display */}
        {connectionError && (
          <CustomErrorMessage className={errorMessageClasses} id={errorId} role="alert" aria-live="polite">
            {connectionError.message}
          </CustomErrorMessage>
        )}
      </CustomContainer>
    );
  },
);

ImpersonateForm.displayName = 'ImpersonateForm';
