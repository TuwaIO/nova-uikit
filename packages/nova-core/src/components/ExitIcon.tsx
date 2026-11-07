/**
 * @file The icon of a button that leaves: a door with an arrow going out of it.
 */

import { cn } from '../utils';

/** Props of {@link ExitIcon}. */
export type ExitIconProps = {
  /** Classes of the icon, which set its size and color. */
  className?: string;
};

/**
 * The exit icon of the Nova components: a door and an arrow on its way out. The arrow moves further out while the link or
 * button around the icon is hovered or focused, through the `dist/index.css` of this package; with reduced motion it stays.
 * Decorative: the button around it has the label.
 *
 * @param props - See {@link ExitIconProps}.
 * @returns The icon.
 */
export function ExitIcon({ className }: ExitIconProps) {
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
      <path d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15" />
      <g className="tuwa-exit-arrow">
        <path d="M5.25 15l-3-3 3-3" />
        <path d="M2.25 12H15" />
      </g>
    </svg>
  );
}
