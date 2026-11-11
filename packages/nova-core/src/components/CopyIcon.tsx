/**
 * @file The icon of a copy button, which turns into a check mark.
 */

import { pixelFlight } from '@tuwaio/nova-icons';
import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { CHECK, SHEETS } from '../pixel/art';
import { pathOf, PIXEL_SVG, strokeOrder } from '../pixel/draw';
import { cn } from '../utils';

const SHEETS_PATH = pathOf(SHEETS);
const CHECK_CELLS = strokeOrder(CHECK, 'check');

/** Props of {@link CopyIcon}. */
export type CopyIconProps = {
  /** Whether the text has just been copied: the two sheets then give way to a check mark. */
  copied?: boolean;
  /** Classes of the icon, which set its size and the color of the sheets. The check mark is in the success color. */
  className?: string;
  /** `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel without one). */
  look?: NovaLook;
};

/**
 * The copy icon of the Nova components: two thin sheets that fold away into a check mark when the text has been copied, and
 * back. With `prefers-reduced-motion` the icon just changes. Decorative: the button around it has the label.
 *
 * @param props - See {@link CopyIconProps}.
 * @returns The icon.
 */
export function CopyIcon({ copied = false, className, look }: CopyIconProps) {
  const reduceMotion = useReducedMotion();
  const setLook = useNovaIcons().look;
  if ((look ?? setLook) === 'pixel') {
    return (
      <svg
        {...PIXEL_SVG}
        fill="currentColor"
        aria-hidden="true"
        data-copied={copied ? '' : undefined}
        // Once copied, the check mark assembles from its pixels (`motion.css` of @tuwaio/nova-icons)
        data-motion={copied ? 'assemble' : undefined}
        style={{ '--nova-px-start': '100ms' } as CSSProperties}
        className={cn('novacore:block', className)}
      >
        <path className="tuwa-copy-px-sheets" d={SHEETS_PATH} />
        {CHECK_CELLS.map(({ x, y }) => (
          <rect
            key={`${x}-${y}`}
            className="tuwa-copy-px-check"
            x={x}
            y={y}
            width={1}
            height={1}
            fill="var(--tuwa-success-icon)"
            data-px=""
            style={pixelFlight(x, y)}
          />
        ))}
      </svg>
    );
  }
  const sheets = { duration: reduceMotion ? 0 : 0.2, ease: [0.2, 0, 0, 1] as const };
  const check = {
    duration: reduceMotion ? 0 : 0.3,
    delay: reduceMotion || !copied ? 0 : 0.1,
    ease: 'easeOut' as const,
  };

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
      <motion.path
        d="M15.5 8.5V6.25A2.25 2.25 0 0 0 13.25 4h-7A2.25 2.25 0 0 0 4 6.25v7a2.25 2.25 0 0 0 2.25 2.25H8.5"
        initial={false}
        animate={{ pathLength: copied ? 0 : 1, opacity: copied ? 0 : 1 }}
        transition={sheets}
      />
      <motion.rect
        x={8.5}
        y={8.5}
        width={11.5}
        height={11.5}
        rx={2.25}
        initial={false}
        animate={{ scale: copied ? 0.6 : 1, opacity: copied ? 0 : 1 }}
        transition={sheets}
      />
      <motion.path
        d="M4.5 12.75l5.25 5.25L19.5 6.75"
        stroke="var(--tuwa-success-icon)"
        strokeWidth={2.25}
        initial={false}
        animate={{ pathLength: copied ? 1 : 0, opacity: copied ? 1 : 0 }}
        transition={check}
      />
    </svg>
  );
}
