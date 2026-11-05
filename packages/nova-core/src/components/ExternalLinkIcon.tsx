/**
 * @file The icon of a link that leaves the page.
 */

import { cn } from '../utils';

/** Props of {@link ExternalLinkIcon}. */
export type ExternalLinkIconProps = {
  /** Classes of the icon, which set its size and color. */
  className?: string;
};

/**
 * The link icon of the Nova components: a thin box with an arrow leaving it. The arrow moves out a little while the link or
 * button around the icon is hovered or focused, through the `dist/index.css` of this package; with `prefers-reduced-motion` it
 * stays. Decorative: the link around it has the label.
 *
 * @param props - See {@link ExternalLinkIconProps}.
 * @returns The icon.
 */
export function ExternalLinkIcon({ className }: ExternalLinkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('novacore:block novacore:overflow-visible', className)}
    >
      <path d="M10.5 5H7.25A2.25 2.25 0 0 0 5 7.25v9.5A2.25 2.25 0 0 0 7.25 19h9.5A2.25 2.25 0 0 0 19 16.75V13.5" />
      <g className="tuwa-link-arrow">
        <path d="M11 13l7.5-7.5" />
        <path d="M13.5 5h5.5v5.5" />
      </g>
    </svg>
  );
}
