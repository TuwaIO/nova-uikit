/**
 * @file The marks of a result, a check mark and a cross, which draw themselves.
 */

import { motion, PresenceContext, useReducedMotion } from 'framer-motion';
import { type CSSProperties, useContext } from 'react';

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { CHECK, CHECK_CUT, CROSS, CROSS_CUT, DISC } from '../pixel/art';
import { pathOf, PIXEL_SVG, strokeOrder } from '../pixel/draw';
import { cn } from '../utils';

/** Props of {@link DrawnCheck} and {@link DrawnCross}. */
export type DrawnMarkProps = {
  /** `plain` is the mark alone, in the text color. `disc` is the mark on a disc in the text color. Defaults to `plain`. */
  variant?: 'plain' | 'disc';
  /** Classes of the icon, which set its size and color. */
  className?: string;
  /** `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel without one). */
  look?: NovaLook;
  /** Whether the mark is simply shown, without drawing itself (the pixel look; the classic one follows its AnimatePresence). */
  still?: boolean;
};

/** The strokes of each mark, on a disc and alone. */
const STROKES = {
  check: { disc: ['M7.25 12.5l3.25 3.25 6.25-7.5'], plain: ['M4.5 12.75l6 6 9-13.5'] },
  cross: { disc: ['M8.25 8.25l7.5 7.5', 'M15.75 8.25l-7.5 7.5'], plain: ['M6 6l12 12', 'M18 6L6 18'] },
} as const;

/** How long one stroke takes to draw, in seconds. */
const STROKE_SECONDS = { check: 0.35, cross: 0.2 } as const;

/** The pixel marks: the mark alone, and the mark cut out of a disc. */
const PIXEL_MARKS = {
  check: { plain: strokeOrder(CHECK, 'check'), disc: strokeOrder(CHECK_CUT, 'check') },
  cross: { plain: strokeOrder(CROSS, 'cross'), disc: strokeOrder(CROSS_CUT, 'cross') },
} as const;
const DISC_PATH = pathOf(DISC);

function DrawnMark({
  mark,
  variant = 'plain',
  className,
  look,
  still,
}: DrawnMarkProps & { mark: keyof typeof STROKES }) {
  const reduceMotion = useReducedMotion();
  const setLook = useNovaIcons().look;
  // Inside an AnimatePresence with `initial={false}`, a mark that is there when the page opens is shown, not drawn
  const isStill = useContext(PresenceContext)?.initial === false || still;
  const isDisc = variant === 'disc';

  if ((look ?? setLook) === 'pixel') {
    return (
      <svg
        {...PIXEL_SVG}
        fill="none"
        aria-hidden="true"
        className={cn('novacore:block', className)}
        data-still={isStill ? '' : undefined}
      >
        {isDisc && <path d={DISC_PATH} fill="currentColor" />}
        {PIXEL_MARKS[mark][variant].map(({ x, y }, index) => (
          <rect
            key={`${x}-${y}`}
            className="tuwa-drawn-px"
            x={x}
            y={y}
            width={1}
            height={1}
            // Cut out of the disc, as in a solid icon, in both themes
            fill={isDisc ? 'var(--tuwa-bg-primary)' : 'currentColor'}
            style={{ '--k': index } as CSSProperties}
          />
        ))}
      </svg>
    );
  }
  const seconds = STROKE_SECONDS[mark];

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('novacore:block', className)}>
      {isDisc && <circle cx={12} cy={12} r={10.5} fill="currentColor" />}
      {STROKES[mark][variant].map((d, index) => {
        const delay = 0.08 + index * seconds;
        return (
          <motion.path
            key={d}
            d={d}
            // Cut out of the disc, as in a solid icon, in both themes
            stroke={isDisc ? 'var(--tuwa-bg-primary)' : 'currentColor'}
            strokeWidth={isDisc ? 2.25 : 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            // The opacity hides the dot that a round cap draws at length zero
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: seconds, delay, ease: 'easeOut' },
              opacity: { duration: 0.01, delay },
            }}
          />
        );
      })}
    </svg>
  );
}

/**
 * The check mark of the Nova components: it draws itself when it appears, so a success is seen happening. Inside an
 * `AnimatePresence` with `initial={false}`, such as a `MorphIcon` without `animateFirst`, one that is already there when the
 * page opens is simply shown, so that a list of old results does not draw all at once. With `prefers-reduced-motion` it is just
 * shown. Decorative: the text next to it says what happened.
 *
 * @param props - See {@link DrawnMarkProps}.
 * @returns The icon.
 */
export function DrawnCheck(props: DrawnMarkProps) {
  return <DrawnMark mark="check" {...props} />;
}

/**
 * The cross of a failure, drawn stroke by stroke like {@link DrawnCheck}.
 *
 * @param props - See {@link DrawnMarkProps}.
 * @returns The icon.
 */
export function DrawnCross(props: DrawnMarkProps) {
  return <DrawnMark mark="cross" {...props} />;
}
