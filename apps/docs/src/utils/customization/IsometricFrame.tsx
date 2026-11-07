import './isometric.css';

import type { Decorator } from '@storybook/react-vite';

import { iso } from './isometric';

/** Draws one story in the Isometric theme, among stories in the default one. */
export const withIsometricTheme: Decorator = (Story) => (
  <div className={`tuwa-isometric bg-[var(--tuwa-bg-primary)] p-6 text-[var(--tuwa-text-primary)] ${iso.drawing}`}>
    <Story />
  </div>
);

/** A cube in the lines of the drawing, for the stories that replace an icon. */
export const IsoCube = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 3l12 7v12l-12 7-12-7V10z" />
    <path d="M4 10l12 7 12-7M16 17v12" />
  </svg>
);
