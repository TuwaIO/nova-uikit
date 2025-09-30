import * as React from 'react';

import { cn } from '../utils';

/**
 * A reusable close button icon (X mark) styled with TUWA color scheme.
 */
export const CloseIcon = React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5 text-[var(--tuwa-text-primary)] transition-colors', className)}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
);
CloseIcon.displayName = 'CloseIcon';
