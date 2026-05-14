/**
 * @file Contains the `ToastValidationError` component, a top-center error toast
 * that fires when `executeTxAction` throws **before** the transaction is added
 * to the pool — e.g., when input metadata fails Pulsar's validation rules or
 * when a `beforeTxProcess` preflight check rejects.
 */

import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cn, useCopyToClipboard } from '@tuwaio/nova-core';
import { ComponentPropsWithoutRef, ComponentType, JSX, ReactNode } from 'react';
import { ToastContentProps } from 'react-toastify';

import { useLabels } from '../providers';

// =============================================================================
// Customization sub-types
// =============================================================================

/** Props forwarded to a custom icon component inside `ToastValidationError`. */
export type ToastValidationErrorIconProps = {
  /** Whether the error text has already been copied to the clipboard. */
  isCopied: boolean;
  /** Optional additional CSS classes. */
  className?: string;
  /** Whether the element is decorative (aria-hidden). */
  'aria-hidden'?: boolean;
};

/** Props forwarded to a custom title component inside `ToastValidationError`. */
export type ToastValidationErrorTitleProps = {
  /** The resolved title string (from labels or prop override). */
  title: string;
  /** Optional additional CSS classes. */
  className?: string;
};

/** Props forwarded to a custom field badge component inside `ToastValidationError`. */
export type ToastValidationErrorFieldProps = {
  /** The human-readable label prefix (e.g., "Field"). */
  fieldLabel: string;
  /** The actual field identifier that failed validation (e.g., "title"). */
  fieldName: string;
  /** Optional additional CSS classes. */
  className?: string;
};

/** Props forwarded to a custom message component inside `ToastValidationError`. */
export type ToastValidationErrorMessageProps = {
  /** The error message string. */
  message: string;
  /** Optional additional CSS classes. */
  className?: string;
};

/** Props forwarded to a custom copy-button content component. */
export type ToastValidationErrorCopyContentProps = {
  /** The icon element to render inside the button. */
  icon: ReactNode;
  /** Whether the text has been copied. */
  isCopied: boolean;
  /** The label to show before copying. */
  copyLabel: string;
  /** The label to show after a successful copy. */
  copiedLabel: string;
};

/**
 * Granular class name overrides for every sub-element of `ToastValidationError`.
 * All keys are optional — omit any key to keep the default Tailwind classes.
 */
export type ToastValidationErrorClassNames = {
  /** Classes applied to the outermost container `<div>`. */
  container?: string;
  /** Classes applied to the header row (icon + title + copy button). */
  header?: string;
  /** Classes applied to the title/icon wrapper. */
  titleWrapper?: string;
  /** Classes applied to the `<ExclamationTriangleIcon>` (or custom icon). */
  icon?: string;
  /** Classes applied to the title text node. */
  title?: string;
  /** Classes applied to the field badge pill. */
  fieldBadge?: string;
  /** Classes applied to the scrollable message container. */
  messageContainer?: string;
  /** Classes applied to the mono message `<p>`. */
  messageText?: string;
  /** Classes applied to the copy button. */
  copyButton?: string;
};

/**
 * Customization options for `ToastValidationError`.
 *
 * All keys are optional. Provide only what you want to override — defaults
 * follow the same visual language as the rest of `nova-transactions`.
 */
export type ToastValidationErrorCustomization = {
  /**
   * Replace any default sub-component with your own.
   * Each slot receives the same props the default component does,
   * so you can wrap or fully replace the rendering.
   */
  components?: {
    /** Custom warning icon (top-left of the header). */
    Icon?: ComponentType<ToastValidationErrorIconProps>;
    /** Custom title renderer. */
    Title?: ComponentType<ToastValidationErrorTitleProps>;
    /** Custom field-badge renderer (shown only when `fieldName` is provided). */
    FieldBadge?: ComponentType<ToastValidationErrorFieldProps>;
    /** Custom error message renderer. */
    Message?: ComponentType<ToastValidationErrorMessageProps>;
    /** Custom inner content for the copy button (icon + label). */
    CopyContent?: ComponentType<ToastValidationErrorCopyContentProps>;
  };
  /** Override native HTML props on the root container. */
  containerProps?: Partial<Omit<ComponentPropsWithoutRef<'div'>, 'style'>>;
  /** Override native HTML props on the copy button. */
  buttonProps?: Partial<Omit<ComponentPropsWithoutRef<'button'>, 'style'>>;
  /** Granular Tailwind class overrides for every sub-element. */
  classNames?: ToastValidationErrorClassNames;
};

// =============================================================================
// Component props
// =============================================================================

/**
 * Props accepted by the `ToastValidationError` component.
 */
export type ToastValidationErrorProps = {
  /**
   * The human-readable error message to display.
   * Typically `error.message` from the caught `Error`.
   */
  message: string;
  /**
   * The raw error text that will be written to the clipboard.
   * Falls back to `message` when not provided.
   */
  rawError?: string;
  /**
   * The name of the field that triggered the validation failure.
   * When provided (e.g. `"title"`, `"description"`), a small badge is rendered
   * below the header so users know exactly which input to fix.
   * Omit for generic pre-flight errors (`beforeTxProcess` rejections).
   */
  fieldName?: string;
  /** Optional additional CSS class on the outermost container. */
  className?: string;
  /**
   * Injected by `react-toastify` when used as toast content.
   * Calling it programmatically closes this specific toast instance.
   */
  closeToast?: ToastContentProps['closeToast'];
  /** Full customization override object. */
  customization?: ToastValidationErrorCustomization;
};

// =============================================================================
// Default sub-components
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DefaultIcon = ({ isCopied: _, className, ...props }: ToastValidationErrorIconProps) => (
  <ExclamationTriangleIcon
    className={cn('novatx:h-5 novatx:w-5 novatx:flex-shrink-0 novatx:text-[var(--tuwa-error-icon)]', className)}
    {...props}
  />
);

const DefaultTitle = ({ title, className }: ToastValidationErrorTitleProps) => (
  <span
    className={cn('novatx:text-sm novatx:font-semibold novatx:text-[var(--tuwa-error-icon)]', className)}
    role="heading"
    aria-level={3}
  >
    {title}
  </span>
);

const DefaultFieldBadge = ({ fieldLabel, fieldName, className }: ToastValidationErrorFieldProps) => (
  <div
    className={cn(
      'novatx:mt-2 novatx:inline-flex novatx:items-center novatx:gap-1 novatx:rounded novatx:border novatx:border-[var(--tuwa-error-icon)]/20 novatx:bg-[var(--tuwa-error-bg)] novatx:px-2 novatx:py-0.5 novatx:text-xs novatx:text-[var(--tuwa-error-text)]',
      className,
    )}
  >
    <span className="novatx:opacity-60">{fieldLabel}:</span>
    <span className="novatx:font-mono novatx:font-semibold">{fieldName}</span>
  </div>
);

const DefaultMessage = ({ message, className }: ToastValidationErrorMessageProps) => (
  <div
    className={cn(
      'novatx:mt-2 novatx:max-h-20 novatx:overflow-y-auto novatx:rounded novatx:bg-[var(--tuwa-bg-secondary)] novatx:p-2',
    )}
  >
    <p
      className={cn(
        'novatx:wrap-break-word novatx:font-mono novatx:text-xs novatx:text-[var(--tuwa-error-text)]',
        className,
      )}
    >
      {message}
    </p>
  </div>
);

const DefaultCopyContent = ({ icon, isCopied, copyLabel, copiedLabel }: ToastValidationErrorCopyContentProps) => (
  <>
    {icon}
    <span className="novatx:select-none novatx:transition-colors" aria-live="polite" role="status">
      {isCopied ? copiedLabel : copyLabel}
    </span>
  </>
);

// =============================================================================
// Main component
// =============================================================================

/**
 * `ToastValidationError` is a self-contained toast body for pre-submission errors.
 *
 * It is designed to be rendered inside a `react-toastify` `ToastContainer` with
 * `position="top-center"` and `autoClose={6000}` / `pauseOnHover`. The visual
 * language mirrors `TxErrorBlock` and `nova-connect`'s `ToastError`:
 *
 * - Error color tokens (`--tuwa-error-*`)
 * - `ExclamationTriangleIcon` header icon
 * - Optional field badge identifying the offending input
 * - Scrollable monospace message body
 * - One-click copy-to-clipboard with feedback
 *
 * @example
 * ```tsx
 * toast(
 *   (props) => (
 *     <ToastValidationError
 *       {...props}
 *       message={error.message}
 *       fieldName={(error as PulsarTransactionValidationError).field}
 *     />
 *   ),
 *   { containerId: 'nova-validation-errors', type: 'error' }
 * );
 * ```
 */
export function ToastValidationError({
  message,
  rawError,
  fieldName,
  className,
  customization,
}: ToastValidationErrorProps): JSX.Element {
  const { validationError: labels } = useLabels();
  const { isCopied, copy } = useCopyToClipboard();

  const textToCopy = rawError ?? message;

  const {
    Icon = DefaultIcon,
    Title = DefaultTitle,
    FieldBadge = DefaultFieldBadge,
    Message = DefaultMessage,
    CopyContent = DefaultCopyContent,
  } = customization?.components ?? {};

  const cls = customization?.classNames ?? {};

  const disabled = !textToCopy.trim();

  const copyButtonClasses =
    cls.copyButton ??
    cn(
      'novatx:mt-3 novatx:inline-flex novatx:cursor-pointer novatx:items-center novatx:gap-1.5',
      'novatx:rounded-[var(--tuwa-rounded-corners)] novatx:px-2 novatx:py-1',
      'novatx:text-xs novatx:font-medium novatx:text-[var(--tuwa-error-text)]',
      'novatx:transition-all novatx:duration-200',
      'novatx:hover:bg-[var(--tuwa-error-icon)]/10',
      'novatx:focus:outline-none novatx:focus:ring-[length:var(--tuwa-ring-width)] novatx:focus:ring-[var(--tuwa-error-text)]/50',
      {
        'novatx:text-[var(--tuwa-success-text)] novatx:bg-[var(--tuwa-success-icon)]/10': isCopied,
      },
    );

  const iconElement = (
    <ExclamationTriangleIcon
      className={cn(
        'novatx:h-4 novatx:w-4 novatx:transition-colors',
        isCopied && 'novatx:text-[var(--tuwa-success-text)]',
      )}
      aria-hidden
    />
  );

  return (
    <div
      {...(customization?.containerProps ?? {})}
      role="alert"
      aria-live="assertive"
      className={cn(
        'novatx:w-full novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-error-icon)]/30',
        'novatx:bg-[var(--tuwa-bg-primary)] novatx:p-4 novatx:shadow-md',
        cls.container,
        className,
      )}
    >
      {/* Header: icon + title */}
      <div className={cn('novatx:flex novatx:items-center novatx:gap-2', cls.header)}>
        <div className={cn('novatx:flex novatx:items-center novatx:gap-2', cls.titleWrapper)}>
          <Icon isCopied={isCopied} className={cls.icon} aria-hidden />
          <Title title={labels.title} className={cls.title} />
        </div>
      </div>

      {/* Field badge — only when a specific field is known */}
      {fieldName && <FieldBadge fieldLabel={labels.field} fieldName={fieldName} className={cls.fieldBadge} />}

      {/* Message body */}
      <Message message={message} className={cls.messageText} />

      {/* Copy button */}
      <button
        {...(customization?.buttonProps ?? {})}
        type="button"
        disabled={disabled}
        aria-label={isCopied ? `${labels.copied} ${labels.copy}` : labels.copy}
        className={copyButtonClasses}
        onClick={async (e) => {
          e.stopPropagation();
          await copy(textToCopy);
        }}
      >
        <CopyContent icon={iconElement} isCopied={isCopied} copyLabel={labels.copy} copiedLabel={labels.copied} />
      </button>
    </div>
  );
}
