/**
 * @file The Quasar mark as a loader: a dash orbits the tilted disk, behind the core on the far side and in front of it on
 * the near side, the core breathes, and a beam runs out along each jet and lights its node.
 */

import { type CSSProperties, useId } from 'react';

import { cn } from '../utils';

/** Props of {@link QuasarLoader}. */
export type QuasarLoaderProps = {
  /** Width and height in pixels. Defaults to `40`. */
  size?: number;
  /**
   * `full` is the whole mark, for 40–72 px. `compact` is a rounder disk and the core, bolder, for 12–24 px: buttons and
   * lines of text. Defaults to `compact` below 28 px and to `full` from there.
   */
  variant?: 'full' | 'compact';
  /** CSS color of the moving parts and the core, such as `var(--tuwa-pending-icon)`. Defaults to `--tuwa-text-accent`. */
  accent?: string;
  /**
   * What is being waited for, for screen readers: with it the loader is a `role="status"` region with that text; without it, it
   * is decorative. A region announces what changes after it is on the page, so one that mounts with the loader is found by
   * browsing, not announced.
   */
  label?: string;
  /** Classes of the loader. The still parts take the text color. */
  className?: string;
};

/** Below this size the jets and the thin disk of the whole mark can no longer be told apart. */
const COMPACT_BELOW = 28;

/**
 * The loader of the TUWA ecosystem, for actions and for the wait of a whole screen (skeletons stay for content that is
 * loading). It is an SVG animated by the `dist/index.css` of this package, runs on no JavaScript timer and holds still
 * with `prefers-reduced-motion`.
 *
 * @param props - See {@link QuasarLoaderProps}.
 * @returns The loader.
 */
export function QuasarLoader({ size = 40, variant, accent, label, className }: QuasarLoaderProps) {
  // The two half planes are per instance: a clip path found by id in another loader that has been unmounted is lost
  const id = useId().replace(/[^\w-]/g, '');
  const isCompact = (variant ?? (size < COMPACT_BELOW ? 'compact' : 'full')) === 'compact';
  const rx = isCompact ? 15 : 16;
  const ry = isCompact ? 8.5 : 4.4;
  const style = { width: size, height: size, ...(accent && { '--tuwa-loader-accent': accent }) } as CSSProperties;

  return (
    <span
      className={cn('tuwa-quasar-loader', isCompact && 'tuwa-quasar-loader--compact', className)}
      style={style}
      {...(label ? { role: 'status' } : { 'aria-hidden': true })}
    >
      {label && <span className="novacore:sr-only">{label}</span>}
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-far`}>
            <rect x={-10} y={-10} width={60} height={30} />
          </clipPath>
          <clipPath id={`${id}-near`}>
            <rect x={-10} y={20} width={60} height={30} />
          </clipPath>
        </defs>
        <g transform="rotate(-22 20 20)">
          {/* The far half of the disk, behind the core */}
          <path className="tuwa-ql-track" d={`M${20 - rx} 20a${rx} ${ry} 0 0 1 ${rx * 2} 0`} />
          <ellipse
            className="tuwa-ql-dash tuwa-ql-dash--far"
            cx={20}
            cy={20}
            rx={rx}
            ry={ry}
            pathLength={100}
            clipPath={`url(#${id}-far)`}
          />
          {!isCompact && (
            <>
              <path className="tuwa-ql-jet" d="M18.5 18 19.55 5.2h.9L21.5 18z" />
              <path className="tuwa-ql-jet" d="M18.5 22 19.55 34.8h.9L21.5 22z" />
              <path className="tuwa-ql-beam" d="M20 16.5V4.6" pathLength={100} />
              <path className="tuwa-ql-beam" d="M20 23.5v11.9" pathLength={100} />
              <circle className="tuwa-ql-node" cx={20} cy={3.6} r={1.9} />
              <circle className="tuwa-ql-node" cx={20} cy={36.4} r={1.9} />
              <circle className="tuwa-ql-glow" cx={20} cy={20} r={7.2} />
            </>
          )}
          <circle className="tuwa-ql-core" cx={20} cy={20} r={isCompact ? 4.6 : 3.8} />
          {!isCompact && <circle className="tuwa-ql-spark" cx={20} cy={20} r={1.2} />}
          {/* The near half, in front of it */}
          <path className="tuwa-ql-track" d={`M${20 + rx} 20a${rx} ${ry} 0 0 1 ${-rx * 2} 0`} />
          <ellipse
            className="tuwa-ql-dash tuwa-ql-dash--near"
            cx={20}
            cy={20}
            rx={rx}
            ry={ry}
            pathLength={100}
            clipPath={`url(#${id}-near)`}
          />
        </g>
      </svg>
    </span>
  );
}
