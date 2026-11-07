/**
 * @file The icon of a button that removes: a bin with a lid of its own.
 */

import { cn } from '../utils';

/** Props of {@link TrashIcon}. */
export type TrashIconProps = {
  /** Classes of the icon, which set its size and color. */
  className?: string;
};

/**
 * The bin icon of the Nova components. Its lid opens on a hinge at its right end while the button around the icon is hovered
 * or focused, and closes while the button is pressed, through the `dist/index.css` of this package; a disabled button stays
 * closed, and with reduced motion the lid stays. Decorative: the button around it has the label.
 *
 * @param props - See {@link TrashIconProps}.
 * @returns The icon.
 */
export function TrashIcon({ className }: TrashIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('novacore:block novacore:overflow-visible', className)}
    >
      <path d="M19.228 5.79 18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79" />
      <path d="M14.74 9l-.346 9M9.606 18 9.26 9" />
      <g className="tuwa-trash-lid">
        <path d="M3.75 5.955c.34-.059.68-.114 1.022-.165a48.11 48.11 0 0 1 3.478-.397m7.5 0a48.108 48.108 0 0 1 3.478.397c.342.052.682.107 1.022.166" />
        <path d="M15.75 5.393v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </g>
    </svg>
  );
}
