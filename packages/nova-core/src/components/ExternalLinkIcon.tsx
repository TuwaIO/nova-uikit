/**
 * @file The icon of a link that leaves the page.
 */

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { LINK_ARROW, LINK_BOX } from '../pixel/art';
import { pathOf, PIXEL_SVG } from '../pixel/draw';
import { cn } from '../utils';

const LINK_BOX_PATH = pathOf(LINK_BOX);
const LINK_ARROW_PATH = pathOf(LINK_ARROW);

/** Props of {@link ExternalLinkIcon}. */
export type ExternalLinkIconProps = {
  /** Classes of the icon, which set its size and color. */
  className?: string;
  /** `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel without one). */
  look?: NovaLook;
};

/**
 * The link icon of the Nova components: a thin box with an arrow leaving it. The arrow moves out a little while the link or
 * button around the icon is hovered or focused, through the `dist/index.css` of this package; with `prefers-reduced-motion` it
 * stays. Decorative: the link around it has the label.
 *
 * @param props - See {@link ExternalLinkIconProps}.
 * @returns The icon.
 */
export function ExternalLinkIcon({ className, look }: ExternalLinkIconProps) {
  const setLook = useNovaIcons().look;
  if ((look ?? setLook) === 'pixel') {
    return (
      <svg
        {...PIXEL_SVG}
        fill="currentColor"
        aria-hidden="true"
        className={cn('tuwa-link-icon novacore:block novacore:overflow-visible', className)}
      >
        <path d={LINK_BOX_PATH} />
        <path className="tuwa-link-arrow-px" d={LINK_ARROW_PATH} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('tuwa-link-icon novacore:block novacore:overflow-visible', className)}
    >
      <path d="M10.5 5H7.25A2.25 2.25 0 0 0 5 7.25v9.5A2.25 2.25 0 0 0 7.25 19h9.5A2.25 2.25 0 0 0 19 16.75V13.5" />
      <g className="tuwa-link-arrow">
        <path d="M11 13l7.5-7.5" />
        <path d="M13.5 5h5.5v5.5" />
      </g>
    </svg>
  );
}
