/**
 * @file This file contains the `ToBottomButton` component, a customizable scroll-to-bottom button with full styling
 * control.
 */

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ReactNode, useCallback } from 'react';

import { useNovaConnectLabels } from '../hooks/useNovaConnectLabels';

// --- Types for Customization ---
/** Props of the icon of {@link ToBottomButton} (`customization.components.Icon`). */
export type ToBottomButtonIconProps = {
  /** Whether the button is disabled. */
  disabled: boolean;
  /** Classes from `customization.classNames.icon`. */
  className?: string;
  /** Always `true`: the button has its own label. */
  'aria-hidden'?: boolean;
};

/** Props of the content of {@link ToBottomButton} (`customization.components.Content`), which wraps the icon. */
export type ToBottomButtonContentProps = {
  /** The rendered icon. */
  icon: ReactNode;
  /** Whether the button is disabled. */
  disabled: boolean;
  /** Accessible label of the button. */
  ariaLabel?: string;
};

/**
 * Customization options for ToBottomButton component
 */
export type ToBottomButtonCustomization = {
  /** Override button element props */
  buttonProps?: Partial<ComponentPropsWithoutRef<'button'>>;
  /** Custom components */
  components?: {
    /** Custom icon component */
    Icon?: ComponentType<ToBottomButtonIconProps>;
    /** Custom button content component (wraps the icon) */
    Content?: ComponentType<ToBottomButtonContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the button, instead of the default ones.
     *
     * @param params - The button state.
     * @param params.disabled - Whether the button is disabled.
     * @param params.hasOnClick - Whether an `onClick` prop is set.
     * @returns The classes.
     */
    button?: (params: { disabled: boolean; hasOnClick: boolean }) => string;
    /**
     * Returns the classes of the icon, instead of the default ones.
     *
     * @param params - The button state.
     * @param params.disabled - Whether the button is disabled.
     * @returns The classes.
     */
    icon?: (params: { disabled: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click handler: call `originalHandler(event)` to run the default behavior (`onClick`).
     *
     * @param originalHandler - The default handler.
     * @param event - The click event.
     */
    onClick?: (
      originalHandler: (event: React.MouseEvent<HTMLButtonElement>) => void,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => void;
    /**
     * Wraps the key handler: call `originalHandler(event)` to run the default behavior (Enter and Space call
     * `onClick`).
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

/** Props of {@link ToBottomButton}. The other props are passed to the `<button>` element. */
export interface ToBottomButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'type' | 'onClick' | 'onKeyDown' | 'style'
> {
  /** Custom CSS classes for the button */
  className?: string;
  /** Custom aria-label for the button */
  'aria-label'?: string;
  /**
   * Called when the button is clicked, or activated with Enter or Space.
   *
   * @param event - The click event (a synthetic mouse event for the keyboard).
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Customization options */
  customization?: ToBottomButtonCustomization;
}

// --- Default Sub-Components ---
const DefaultIcon = ({ disabled, className, ...props }: ToBottomButtonIconProps) => {
  return (
    <ChevronDownIcon
      className={cn(
        'novacon:w-4 novacon:h-4 novacon:transition-transform novacon:duration-200',
        {
          'novacon:opacity-50': disabled,
        },
        className,
      )}
      {...props}
    />
  );
};

const DefaultContent = ({ icon }: ToBottomButtonContentProps) => {
  return <>{icon}</>;
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

/**
 * A full-width button with a chevron pointing down, which the scrollable lists of Nova Connect (such as the chain list)
 * show to scroll to the bottom. The scrolling is done by `onClick`; the button calls it on click and on Enter or Space.
 * Its label defaults to the `scrollToBottom` label (overridable with `aria-label`).
 *
 * Props: {@link ToBottomButtonProps}; the ref is forwarded to the button.
 */
export const ToBottomButton = forwardRef<HTMLButtonElement, ToBottomButtonProps>(
  ({ className, 'aria-label': ariaLabel, onClick, disabled = false, customization, ...props }, ref) => {
    const labels = useNovaConnectLabels();

    // Extract custom components and handlers
    const { Icon = DefaultIcon, Content = DefaultContent } = customization?.components ?? {};

    const {
      onClick: customOnClickHandler = defaultClickHandler,
      onKeyDown: customOnKeyDownHandler = defaultKeyDownHandler,
    } = customization?.handlers ?? {};

    // Handle click events
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const originalHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
          // Prevent default scroll behavior if custom handler provided
          if (onClick) {
            e.preventDefault();
            onClick(e);
          }
        };

        customOnClickHandler(originalHandler, event);
      },
      [onClick, customOnClickHandler],
    );

    // Handle keyboard events
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const originalHandler = (e: React.KeyboardEvent<HTMLButtonElement>) => {
          // Handle keyboard activation
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            e.preventDefault();
            // Create a synthetic mouse event for onClick compatibility
            const syntheticEvent = {
              ...e,
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
            onClick(syntheticEvent as any);
          }
        };

        customOnKeyDownHandler(originalHandler, event);
      },
      [onClick, customOnKeyDownHandler],
    );

    // Generate button classes
    const buttonClasses = customization?.classNames?.button
      ? customization.classNames.button({ disabled, hasOnClick: Boolean(onClick) })
      : cn(
          'novacon:flex novacon:w-full novacon:h-6 novacon:items-center novacon:justify-center',
          'novacon:bg-[var(--tuwa-bg-secondary)] novacon:text-[var(--tuwa-text-primary)]',
          'novacon:transition-colors novacon:duration-200',
          'novacon:hover:bg-[var(--tuwa-standart-button-hover)] novacon:hover:text-[var(--tuwa-text-secondary)]',
          'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-text-accent)] novacon:focus:ring-inset',
          'novacon:active:bg-[var(--tuwa-bg-muted)]',
          'novacon:disabled:opacity-50 novacon:disabled:cursor-not-allowed novacon:disabled:hover:bg-[var(--tuwa-bg-secondary)] novacon:cursor-default',
          'novacon:cursor-pointer',
          className,
        );

    // Generate icon classes
    const iconClasses = customization?.classNames?.icon ? customization.classNames.icon({ disabled }) : undefined;

    // Create icon element
    const iconElement = <Icon disabled={disabled} className={iconClasses} aria-hidden />;

    // Merge button props
    const buttonProps = {
      ...customization?.buttonProps,
      ...props,
      ref,
      type: 'button' as const,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      disabled,
      className: buttonClasses,
      'aria-label': ariaLabel || labels.scrollToBottom,
      title: ariaLabel || labels.scrollToBottom,
    };

    return (
      <button {...buttonProps}>
        <Content icon={iconElement} disabled={disabled} ariaLabel={ariaLabel} />
      </button>
    );
  },
);

ToBottomButton.displayName = 'ToBottomButton';
