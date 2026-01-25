/**
 * @file This file contains the `ToastError` component, a customizable error toast with full styling control.
 */

import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, useCopyToClipboard } from '@tuwaio/nova-core';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ReactNode, useCallback, useState } from 'react';

import { useNovaConnectLabels } from '../hooks/useNovaConnectLabels';

// --- Types for Customization ---
type CustomIconProps = {
  isCopied: boolean;
  className?: string;
  'aria-hidden'?: boolean;
};

type CustomTitleProps = {
  title: string;
  titleId: string;
  className?: string;
};

type CustomDescriptionProps = {
  rawError: string;
  descriptionId: string;
  className?: string;
};

type CustomButtonContentProps = {
  icon: ReactNode;
  isCopied: boolean;
  copyLabel: string;
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
    Icon?: ComponentType<CustomIconProps>;
    /** Custom title component */
    Title?: ComponentType<CustomTitleProps>;
    /** Custom description component */
    Description?: ComponentType<CustomDescriptionProps>;
    /** Custom button content component */
    ButtonContent?: ComponentType<CustomButtonContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /** Function to generate container classes */
    container?: (params: { hasTitle: boolean; hasError: boolean }) => string;
    /** Function to generate title classes */
    title?: (params: { title: string }) => string;
    /** Function to generate description classes */
    description?: (params: { rawError: string }) => string;
    /** Function to generate button classes */
    button?: (params: { isCopied: boolean; disabled: boolean }) => string;
    /** Function to generate icon classes */
    icon?: (params: { isCopied: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom click handler wrapper */
    onClick?: (
      originalHandler: (event: React.MouseEvent<HTMLButtonElement>) => void,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => void;
    /** Custom keydown handler wrapper */
    onKeyDown?: (
      originalHandler: (event: React.KeyboardEvent<HTMLButtonElement>) => void,
      event: React.KeyboardEvent<HTMLButtonElement>,
    ) => void;
  };
};

export interface ToastErrorProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'aria-live' | 'style'> {
  /** Error title to display */
  title: string;
  /** Raw error message to display and copy */
  rawError: string;
  /** Custom CSS classes for the container */
  className?: string;
  /** Custom ARIA label for the error container */
  'aria-label'?: string;
  /** Callback fired when copy operation completes */
  onCopyComplete?: (success: boolean) => void;
  /** Customization options */
  customization?: ToastErrorCustomization;
}

// --- Default Sub-Components ---
const DefaultIcon = ({ isCopied, className, ...props }: CustomIconProps) => {
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

const DefaultTitle = ({ title, titleId, className }: CustomTitleProps) => {
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

const DefaultDescription = ({ rawError, descriptionId, className }: CustomDescriptionProps) => {
  return (
    <p
      id={descriptionId}
      className={cn(
        'novacon:mt-1 novacon:text-xs novacon:break-words novacon:text-[var(--tuwa-error-text)] novacon:opacity-80',
        className,
      )}
      role="text"
    >
      {rawError}
    </p>
  );
};

const DefaultButtonContent = ({ icon, isCopied, copyLabel, copiedLabel }: CustomButtonContentProps) => {
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
 * A highly customizable error toast component with copy functionality and extensive styling options.
 * Provides comprehensive customization for appearance, behavior, and event handling while maintaining accessibility.
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

    // Handle copy with error handling and callback
    const handleCopy = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();

        try {
          await copy(rawError);
          onCopyComplete?.(true);
        } catch (error) {
          console.error('Failed to copy error:', error);
          onCopyComplete?.(false);
        }
      },
      [copy, rawError, onCopyComplete],
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
          'novacon:bg-[var(--tuwa-bg-primary)] novacon:p-4 novacon:rounded-md novacon:w-full',
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
    const disabled = !rawError.trim();
    const buttonClasses = customization?.classNames?.button
      ? customization.classNames.button({ isCopied, disabled })
      : cn(
          'novacon:cursor-pointer novacon:mt-2 novacon:text-xs novacon:font-medium novacon:inline-flex novacon:items-center novacon:space-x-1.5',
          'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-error-text)] novacon:focus:ring-opacity-50',
          'novacon:rounded-md novacon:px-2 novacon:py-1 novacon:transition-all novacon:duration-200',
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
      disabled: !rawError.trim(),
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
