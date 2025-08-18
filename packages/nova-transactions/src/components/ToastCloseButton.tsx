/**
 * @file This file contains a reusable close button component, typically for toast notifications.
 */

import { XMarkIcon } from '@heroicons/react/24/solid';
import { JSX } from 'react';

import { useLabels } from '../providers';

type ToastCloseButtonProps = {
  /**
   * The function to call when the button is clicked.
   * This is typically provided by a toast library to dismiss the notification.
   */
  closeToast?: (e: React.MouseEvent<HTMLElement>) => void;
};

/**
 * A simple, styled close button component (X icon) designed for use within toast notifications.
 *
 * @param {ToastCloseButtonProps} props - The component props.
 * @returns {JSX.Element} The rendered close button.
 */
export function ToastCloseButton({ closeToast }: ToastCloseButtonProps): JSX.Element {
  const labels = useLabels();

  return (
    <button
      type="button"
      onClick={closeToast}
      aria-label={labels.actions.close}
      title={labels.actions.close}
      className="absolute top-2 right-2 cursor-pointer rounded-full p-1 text-[var(--tuwa-text-tertiary)] transition-colors hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  );
}
