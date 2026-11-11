/**
 * @file The icon of a button that removes: a bin with a lid of its own.
 */

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { TRASH_CAN, TRASH_LID } from '../pixel/art';
import { pathOf, PIXEL_SVG } from '../pixel/draw';
import { cn } from '../utils';

const TRASH_CAN_PATH = pathOf(TRASH_CAN);
const TRASH_LID_PATH = pathOf(TRASH_LID);

/** Props of {@link TrashIcon}. */
export type TrashIconProps = {
  /** Classes of the icon, which set its size and color. */
  className?: string;
  /** `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel without one). */
  look?: NovaLook;
};

/**
 * The bin icon of the Nova components. Its lid opens on a hinge at its right end while the button around the icon is hovered
 * or focused, and closes while the button is pressed, through the `dist/index.css` of this package; a disabled button stays
 * closed, and with reduced motion the lid stays. Decorative: the button around it has the label.
 *
 * @param props - See {@link TrashIconProps}.
 * @returns The icon.
 */
export function TrashIcon({ className, look }: TrashIconProps) {
  const setLook = useNovaIcons().look;
  if ((look ?? setLook) === 'pixel') {
    return (
      <svg
        {...PIXEL_SVG}
        fill="currentColor"
        aria-hidden="true"
        className={cn('novacore:block novacore:overflow-visible', className)}
      >
        <path d={TRASH_CAN_PATH} />
        <path className="tuwa-trash-lid-px" d={TRASH_LID_PATH} />
      </svg>
    );
  }
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
