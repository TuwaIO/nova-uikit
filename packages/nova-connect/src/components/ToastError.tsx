/**
 * @file This file contains the `ToastError` component, a customizable error toast with full styling control.
 */

import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, useCopyToClipboard } from '@tuwaio/nova-core';
import type { TuwaErrorState } from '@tuwaio/orbit-core';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ReactNode, useCallback, useMemo, useState } from 'react';

import { useNovaConnectLabels } from '../hooks/useNovaConnectLabels';

// --- Types for Customization ---
/** Props of the copy icon of {@link ToastError} (`customization.components.Icon`). */
export type ToastErrorIconProps = {
  /** Whether the error was just copied. */
  isCopied: boolean;
  /** Classes from `customization.classNames.icon`. */
  className?: string;
  /** Always `true`: the button has its own label. */
  'aria-hidden'?: boolean;
};

/** Props of the title of {@link ToastError} (`customization.components.Title`). */
export type ToastErrorTitleProps = {
  /** The title. */
  title: string;
  /** `id` of the title element, referenced by `aria-labelledby` of the toast. */
  titleId: string;
  /** Classes from `customization.classNames.title`. */
  className?: string;
};

/** Props of the description of {@link ToastError} (`customization.components.Description`). */
export type ToastErrorDescriptionProps = {
  /** The error; the default description shows the string or its `message`. */
  rawError: string | TuwaErrorState;
  /** `id` of the description element, referenced by `aria-describedby` of the toast. */
  descriptionId: string;
  /** Classes from `customization.classNames.description`. */
  className?: string;
};

/** Props of the content of the copy button of {@link ToastError} (`customization.components.ButtonContent`). */
export type ToastErrorButtonContentProps = {
  /** The rendered copy icon. */
  icon: ReactNode;
  /** Whether the error was just copied. */
  isCopied: boolean;
  /** The label of the button before copying. */
  copyLabel: string;
  /** The label of the button after copying. */
  copiedLabel: string;
};

/**
 * Customization options for ToastError component
 */
export type ToastErrorCustomization = {
  /** Override container element props */
  containerProps?: Partial<Omit<ComponentPropsWithoutRef<'div'>, 'style'>>;
  /** Override button element props */
  buttonProps?: Partial<Omit<ComponentPropsWithoutRef<'button'>, 'style'>>;
  /** Custom components */
  components?: {
    /** Custom icon component */
    Icon?: ComponentType<ToastErrorIconProps>;
    /** Custom title component */
    Title?: ComponentType<ToastErrorTitleProps>;
    /** Custom description component */
    Description?: ComponentType<ToastErrorDescriptionProps>;
    /** Custom button content component */
    ButtonContent?: ComponentType<ToastErrorButtonContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the toast body, instead of the default ones.
     *
     * @param params - The toast content.
     * @param params.hasTitle - Whether the title is not empty.
     * @param params.hasError - Whether there is an error to show.
     * @returns The classes.
     */
    container?: (params: { hasTitle: boolean; hasError: boolean }) => string;
    /**
     * Returns the classes of the title.
     *
     * @param params - The toast content.
     * @param params.title - The title.
     * @returns The classes.
     */
    title?: (params: { title: string }) => string;
    /**
     * Returns the classes of the description.
     *
     * @param params - The toast content.
     * @param params.rawError - The error.
     * @returns The classes.
     */
    description?: (params: { rawError: string | TuwaErrorState }) => string;
    /**
     * Returns the classes of the copy button, instead of the default ones.
     *
     * @param params - The button state.
     * @param params.isCopied - Whether the error was just copied.
     * @param params.disabled - Whether there is nothing to copy.
     * @returns The classes.
     */
    button?: (params: { isCopied: boolean; disabled: boolean }) => string;
    /**
     * Returns the classes of the copy icon.
     *
     * @param params - The button state.
     * @param params.isCopied - Whether the error was just copied.
     * @returns The classes.
     */
    icon?: (params: { isCopied: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click handler of the copy button: call `originalHandler(event)` to copy the error.
     *
     * @param originalHandler - The default handler.
     * @param event - The click event.
     */
    onClick?: (
      originalHandler: (event: React.MouseEvent<HTMLButtonElement>) => void,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => void;
    /**
     * Wraps the key handler of the copy button: call `originalHandler(event)` to run the default behavior (Enter and
     * Space copy the error).
     *
     * @param originalHandler - The default handler.
     * @param event - The keyboard event.
     */
    onKeyDown?: (
      originalHandler: (event: React.KeyboardEvent<HTMLButtonElement>) => void,
      event: React.KeyboardEvent<HTMLButtonElement>,
    ) => void;
  };
};

/** Props of {@link ToastError}. The other props are passed to the container `<div>`. */
export interface ToastErrorProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'aria-live' | 'style'> {
  /** Error title to display */
  title: string;
  /** Raw error message or state to display and copy */
  rawError: string | TuwaErrorState;
  /** Custom CSS classes for the container */
  className?: string;
  /** Custom ARIA label for the error container */
  'aria-label'?: string;
  /**
   * Called after the copy button tried to copy the error.
   *
   * @param success - Whether the error was copied.
   */
  onCopyComplete?: (success: boolean) => void;
  /** Customization options */
  customization?: ToastErrorCustomization;
}

// --- Default Sub-Components ---
const DefaultIcon = ({ isCopied, className, ...props }: ToastErrorIconProps) => {
  return (
    <DocumentDuplicateIcon
      className={cn(
        'novacon:w-4 novacon:h-4 novacon:transition-colors',
        isCopied && 'novacon:text-[var(--tuwa-success-text)]',
        className,
      )}
      {...props}
    />
  );
};

const DefaultTitle = ({ title, titleId, className }: ToastErrorTitleProps) => {
  return (
    <p
      id={titleId}
      className={cn(
        'novacon:text-sm novacon:font-semibold novacon:truncate novacon:text-[var(--tuwa-error-text)]',
        className,
      )}
      role="heading"
      aria-level={3}
      title={title} // Show full title on hover if truncated
    >
      {title}
    </p>
  );
};

const DefaultDescription = ({ rawError, descriptionId, className }: ToastErrorDescriptionProps) => {
  const displayMessage = typeof rawError === 'string' ? rawError : rawError.message;
  return (
    <p
      id={descriptionId}
      className={cn(
        'novacon:mt-1 novacon:text-xs novacon:break-words novacon:text-[var(--tuwa-error-text)] novacon:opacity-80',
        className,
      )}
      role="text"
    >
      {displayMessage}
    </p>
  );
};

const DefaultButtonContent = ({ icon, isCopied, copyLabel, copiedLabel }: ToastErrorButtonContentProps) => {
  return (
    <>
      {icon}
      <span className="novacon:select-none novacon:transition-colors" aria-live="polite" role="status">
        {isCopied ? copiedLabel : copyLabel}
      </span>
    </>
  );
};

// --- Default Event Handlers ---
const defaultClickHandler = (
  originalHandler: (event: React.MouseEvent<HTMLButtonElement>) => void,
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  originalHandler(event);
};

const defaultKeyDownHandler = (
  originalHandler: (event: React.KeyboardEvent<HTMLButtonElement>) => void,
  event: React.KeyboardEvent<HTMLButtonElement>,
) => {
  originalHandler(event);
};

// Counter for unique IDs (outside component to avoid re-initialization)
let idCounter = 0;

/**
 * The content of an error toast: the title, the error message and a button that copies the error (the string, or the
 * `raw` value of a `TuwaErrorState` as JSON) to the clipboard. The container is an `alert` with
 * `aria-live="assertive"`.
 * `ErrorsProvider` (from `@tuwaio/nova-connect`) uses it.
 *
 * Props: {@link ToastErrorProps}; the ref is forwarded to the container.
 */
export const ToastError = forwardRef<HTMLDivElement, ToastErrorProps>(
  ({ title, rawError, className, 'aria-label': ariaLabel, onCopyComplete, customization, ...props }, ref) => {
    const labels = useNovaConnectLabels();
    const { isCopied, copy } = useCopyToClipboard();

    // Generate unique IDs only once per component instance
    const [uniqueId] = useState(() => {
      idCounter += 1;
      return `${idCounter}-${Date.now()}`;
    });

    const titleId = `error-title-${uniqueId}`;
    const descriptionId = `error-description-${uniqueId}`;

    // Extract custom components and handlers
    const {
      Icon = DefaultIcon,
      Title = DefaultTitle,
      Description = DefaultDescription,
      ButtonContent = DefaultButtonContent,
    } = customization?.components ?? {};

    const {
      onClick: customOnClickHandler = defaultClickHandler,
      onKeyDown: customOnKeyDownHandler = defaultKeyDownHandler,
    } = customization?.handlers ?? {};

    // Serialize error for clipboard
    const errorToCopy = useMemo(() => {
      if (typeof rawError === 'string') return rawError;
      return JSON.stringify(rawError.raw, null, 2);
    }, [rawError]);

    // Handle copy with error handling and callback
    const handleCopy = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();

        try {
          await copy(errorToCopy);
          onCopyComplete?.(true);
        } catch (error) {
          console.error('Failed to copy error:', error);
          onCopyComplete?.(false);
        }
      },
      [copy, errorToCopy, onCopyComplete],
    );

    // Handle keyboard interaction for copy button
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        const originalHandler = (event: React.KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            // Create a synthetic mouse event for onClick compatibility
            const syntheticEvent = {
              ...event,
              button: 0,
              buttons: 1,
              clientX: 0,
              clientY: 0,
              movementX: 0,
              movementY: 0,
              offsetX: 0,
              offsetY: 0,
              pageX: 0,
              pageY: 0,
              relatedTarget: null,
              screenX: 0,
              screenY: 0,
              x: 0,
              y: 0,
              getModifierState: () => false,
              initMouseEvent: () => {},
            };
            // eslint-disable-next-line
            handleCopy(syntheticEvent as any);
          }
        };

        customOnKeyDownHandler(originalHandler, e);
      },
      [customOnKeyDownHandler, handleCopy],
    );

    // Generate container classes
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({ hasTitle: Boolean(title), hasError: Boolean(rawError) })
      : cn(
          'novacon:bg-[var(--tuwa-bg-primary)] novacon:p-4 novacon:rounded-[var(--tuwa-rounded-corners)] novacon:w-full',
          'novacon:border novacon:border-[var(--tuwa-border-primary)]',
          className,
        );

    // Generate title classes
    const titleClasses = customization?.classNames?.title ? customization.classNames.title({ title }) : undefined;

    // Generate description classes
    const descriptionClasses = customization?.classNames?.description
      ? customization.classNames.description({ rawError })
      : undefined;

    // Generate button classes
    const disabled = !errorToCopy.trim();
    const buttonClasses = customization?.classNames?.button
      ? customization.classNames.button({ isCopied, disabled })
      : cn(
          'novacon:cursor-pointer novacon:mt-2 novacon:font-mono novacon:text-xs novacon:font-medium novacon:inline-flex novacon:items-center novacon:space-x-1.5',
          'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-error-text)] novacon:focus:ring-opacity-50 novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
          'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:px-2 novacon:py-1 novacon:transition-all novacon:duration-200',
          'novacon:hover:bg-[var(--tuwa-error-text)] novacon:hover:bg-opacity-10',
          'novacon:active:bg-[var(--tuwa-error-text)] novacon:active:bg-opacity-20',
          'novacon:text-[var(--tuwa-error-text)] novacon:hover:text-[var(--tuwa-error-text)]',
          {
            'novacon:bg-[var(--tuwa-success-text)] novacon:bg-opacity-10 novacon:text-[var(--tuwa-success-text)]':
              isCopied,
          },
        );

    // Generate icon classes
    const iconClasses = customization?.classNames?.icon ? customization.classNames.icon({ isCopied }) : undefined;

    // Create icon element
    const iconElement = <Icon isCopied={isCopied} className={iconClasses} aria-hidden />;

    // Container props
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      role: 'alert' as const,
      'aria-live': 'assertive' as const,
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
      'aria-label': ariaLabel,
    };

    // Button props
    const buttonProps = {
      ...customization?.buttonProps,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        customOnClickHandler(handleCopy, e);
      },
      onKeyDown: handleKeyDown,
      className: buttonClasses,
      type: 'button' as const,
      'aria-label': isCopied ? `${labels.copied} ${labels.copyRawError}` : labels.copyRawError,
      'aria-describedby': `${titleId} ${descriptionId}`,
      disabled: !errorToCopy.trim(),
    };

    return (
      <div {...containerProps}>
        {/* Error Title */}
        <Title title={title} titleId={titleId} className={titleClasses} />

        {/* Error Description */}
        <Description rawError={rawError} descriptionId={descriptionId} className={descriptionClasses} />

        {/* Copy Button */}
        <button {...buttonProps}>
          <ButtonContent
            icon={iconElement}
            isCopied={isCopied}
            copyLabel={labels.copyRawError}
            copiedLabel={labels.copied}
          />
        </button>
      </div>
    );
  },
);

ToastError.displayName = 'ToastError';
