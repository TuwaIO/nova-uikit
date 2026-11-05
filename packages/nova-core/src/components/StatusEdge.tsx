/**
 * @file The edge of a card that shows the state of an operation: a thin strip along the top and a soft wash of the status
 * color below it.
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '../utils';

/** The state a {@link StatusEdge} shows. `neutral` is a result that is neither a success nor an error. */
export type StatusTone = 'pending' | 'success' | 'error' | 'neutral';

const TONE_COLOR: Record<StatusTone, string> = {
  pending: 'var(--tuwa-pending-icon)',
  success: 'var(--tuwa-success-icon)',
  error: 'var(--tuwa-error-icon)',
  neutral: 'var(--tuwa-info-icon)',
};

/**
 * How much of the strip is filled.
 *
 * @internal
 * @param tone - The state.
 * @param progress - The share done, if it is known.
 * @param reduceMotion - Whether the viewer asked for less motion: then the glint cannot say that work goes on.
 * @returns The share of the strip to fill, from 0 to 1.
 */
export function stripFill(tone: StatusTone, progress: number | undefined, reduceMotion: boolean): number {
  if (tone !== 'pending') return 1;
  if (progress !== undefined) return Math.min(1, Math.max(0, progress));
  return reduceMotion ? 1 : 0;
}

/** Props of {@link StatusEdge}. */
export type StatusEdgeProps = {
  /** The state of the operation. */
  tone: StatusTone;
  /**
   * The share done, from 0 to 1, when it is really known, as confirmations out of those required. Without it a pending
   * strip shows only the glint: a bar that fills by the clock would promise an end nobody knows.
   */
  progress?: number;
  /** Classes of the edge, which fills its parent. */
  className?: string;
  /** Classes of the parts. */
  classNames?: {
    /** Classes of the strip along the top. */
    strip?: string;
    /** Classes of the wash under it. */
    wash?: string;
  };
};

/**
 * Put it first in a card with `position: relative` (it fills the card and takes its corners). While pending, a glint in
 * the pending color runs along the top; a result fills the strip and washes the top of the card in the status color, with
 * a crossfade. With `prefers-reduced-motion` nothing moves and the colors just change.
 *
 * @param props - See {@link StatusEdgeProps}.
 * @returns The edge, hidden from screen readers: the status text is what tells them.
 */
export function StatusEdge({ tone, progress, className, classNames }: StatusEdgeProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const color = TONE_COLOR[tone];
  const seconds = reduceMotion ? 0 : 0.45;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'novacore:pointer-events-none novacore:absolute novacore:inset-0 novacore:overflow-hidden novacore:rounded-[inherit]',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {tone !== 'pending' && (
          <motion.div
            key={tone}
            className={cn('novacore:absolute novacore:inset-x-0 novacore:top-0 novacore:h-20', classNames?.wash)}
            style={{
              background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 16%, transparent), transparent)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: seconds }}
          />
        )}
      </AnimatePresence>
      <div
        className={cn(
          'novacore:absolute novacore:inset-x-0 novacore:top-0 novacore:h-0.5 novacore:overflow-hidden novacore:transition-colors novacore:duration-300',
          classNames?.strip,
        )}
        style={{ backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)` }}
      >
        <motion.div
          className="novacore:h-full novacore:w-full novacore:origin-left novacore:transition-colors novacore:duration-300"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ scaleX: stripFill(tone, progress, reduceMotion) }}
          transition={{ duration: seconds, ease: [0.2, 0, 0, 1] }}
        />
        {tone === 'pending' && !reduceMotion && (
          <motion.div
            className="novacore:absolute novacore:inset-y-0 novacore:left-0 novacore:w-1/3"
            style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }}
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}
