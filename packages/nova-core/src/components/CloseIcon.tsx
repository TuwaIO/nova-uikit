import * as React from 'react';

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { CROSS } from '../pixel/art';
import { pathOf, PIXEL_SVG } from '../pixel/draw';
import { cn } from '../utils';

const CROSS_PATH = pathOf(CROSS);

/** Props of {@link CloseIcon}: those of an SVG element, and its look. */
export type CloseIconProps = React.SVGAttributes<SVGSVGElement> & {
  /** `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel without one). */
  look?: NovaLook;
};

/**
 * A reusable close button icon (X mark) styled with TUWA color scheme: a pixel cross, or with the classic look two thin
 * strokes.
 */
export const CloseIcon = React.forwardRef<SVGSVGElement, CloseIconProps>(({ className, look, ...props }, ref) => {
  const setLook = useNovaIcons().look;
  const classes = cn(
    'novacore:h-5 novacore:w-5 novacore:text-[var(--tuwa-text-primary)] novacore:transition-colors',
    className,
  );
  if ((look ?? setLook) === 'pixel') {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        {...PIXEL_SVG}
        fill="currentColor"
        className={classes}
        {...props}
      >
        <path d={CROSS_PATH} />
      </svg>
    );
  }
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classes}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
});
CloseIcon.displayName = 'CloseIcon';
