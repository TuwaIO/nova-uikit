/**
 * @file The icon of a button that leaves: a door with an arrow going out of it.
 */

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { EXIT_ARROW, EXIT_DOOR } from '../pixel/art';
import { pathOf, PIXEL_SVG } from '../pixel/draw';
import { cn } from '../utils';

const EXIT_DOOR_PATH = pathOf(EXIT_DOOR);
const EXIT_ARROW_PATH = pathOf(EXIT_ARROW);

/** Props of {@link ExitIcon}. */
export type ExitIconProps = {
  /** Classes of the icon, which set its size and color. */
  className?: string;
  /** `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel without one). */
  look?: NovaLook;
};

/**
 * The exit icon of the Nova components: a door and an arrow on its way out. The arrow moves further out while the link or
 * button around the icon is hovered or focused, through the `dist/index.css` of this package; with reduced motion it stays.
 * Decorative: the button around it has the label.
 *
 * @param props - See {@link ExitIconProps}.
 * @returns The icon.
 */
export function ExitIcon({ className, look }: ExitIconProps) {
  const setLook = useNovaIcons().look;
  if ((look ?? setLook) === 'pixel') {
    return (
      <svg
        {...PIXEL_SVG}
        fill="currentColor"
        aria-hidden="true"
        className={cn('tuwa-exit-icon novacore:block novacore:overflow-visible', className)}
      >
        <path d={EXIT_DOOR_PATH} />
        <path className="tuwa-exit-arrow-px" d={EXIT_ARROW_PATH} />
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
      className={cn('tuwa-exit-icon novacore:block novacore:overflow-visible', className)}
    >
      <path d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15" />
      <g className="tuwa-exit-arrow">
        <path d="M5.25 15l-3-3 3-3" />
        <path d="M2.25 12H15" />
      </g>
    </svg>
  );
}
