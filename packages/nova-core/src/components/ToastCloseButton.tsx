/**
 * @file This file contains a reusable close button component, designed primarily for toast notifications.
 */

import { cn } from '../utils';

/**
 * Defines the props for the ToastCloseButton component.
 */
export type ToastCloseButtonProps = {
  /**
   * Called when the button is clicked. `react-toastify` passes it to a custom close button to dismiss the toast.
   *
   * @param e - The click event.
   */
  closeToast?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Accessible label of the button. Defaults to `'Close toast notification'`. */
  ariaLabel?: string;
  /** Tooltip of the button. Defaults to `'Close toast notification'`. */
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
 * A close button with an X icon, placed in the top-right corner of a toast (`absolute`) and styled with the `--tuwa-*`
 * variables. Pass it to `react-toastify` as `closeButton`, which provides `closeToast`.
 *
 * @param props - See {@link ToastCloseButtonProps}.
 * @returns The button element.
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
        'novacore:absolute novacore:top-2 novacore:right-2 novacore:cursor-pointer novacore:rounded-[var(--tuwa-rounded-corners)] novacore:p-1',
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
