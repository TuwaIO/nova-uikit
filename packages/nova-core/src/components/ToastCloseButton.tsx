/**
 * @file This file contains a reusable close button component, designed primarily for toast notifications.
 */

import { cn } from '../utils';

/**
 * Defines the props for the ToastCloseButton component.
 */
export type ToastCloseButtonProps = {
  /**
   * The function to call when the button is clicked. This is typically provided by the
   * toast library (e.g., react-toastify) to dismiss the notification.
   */
  closeToast?: (e: React.MouseEvent<HTMLElement>) => void;
  /**
   * Optional custom aria-label for accessibility.
   */
  ariaLabel?: string;
  /**
   * Optional custom title for the button tooltip.
   */
  title?: string;
  /**
   * Optional custom className for the button container.
   */
  className?: string;
  /**
   * Optional custom className for the close icon SVG.
   */
  iconClassName?: string;
};

/**
 * A simple, styled close button component ('X' icon) intended for use within toast notifications.
 * It uses theme-aware CSS variables for styling and i18n labels for accessibility.
 */
export function ToastCloseButton({
  closeToast,
  ariaLabel = 'Close toast notification',
  title = 'Close toast notification',
  className,
  iconClassName,
}: ToastCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={closeToast}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        'novacore:absolute novacore:top-2 novacore:right-2 novacore:cursor-pointer novacore:rounded-full novacore:p-1',
        'novacore:text-[var(--tuwa-text-tertiary)] novacore:transition-colors',
        'novacore:hover:bg-[var(--tuwa-bg-muted)] novacore:hover:text-[var(--tuwa-text-primary)]',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={cn('novacore:h-5 novacore:w-5', iconClassName)}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
