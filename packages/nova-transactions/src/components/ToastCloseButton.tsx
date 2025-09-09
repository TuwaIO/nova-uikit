/**
 * @file This file contains a reusable close button component, designed primarily for toast notifications.
 */

import { XMarkIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';

import { useLabels } from '../providers';

/**
 * Defines the props for the ToastCloseButton component.
 */
export type ToastCloseButtonProps = {
  /**
   * The function to call when the button is clicked. This is typically provided by the
   * toast library (e.g., react-toastify) to dismiss the notification.
   */
  closeToast?: (e: React.MouseEvent<HTMLElement>) => void;
};

/**
 * A simple, styled close button component ('X' icon) intended for use within toast notifications.
 * It uses theme-aware CSS variables for styling and i18n labels for accessibility.
 */
export function ToastCloseButton({ closeToast }: ToastCloseButtonProps) {
  const { actions } = useLabels();

  return (
    <button
      type="button"
      onClick={closeToast}
      aria-label={actions.close}
      title={actions.close}
      className={cn(
        'absolute top-2 right-2 cursor-pointer rounded-full p-1',
        'text-[var(--tuwa-text-tertiary)] transition-colors',
        'hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]',
      )}
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  );
}
