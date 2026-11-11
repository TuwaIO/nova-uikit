/**
 * @file The edge of a card that shows the state of an operation: a thin strip of the status color along the top.
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '../utils';
import { stripFill } from './statusEdgeFill';

/**
 * The state a {@link StatusEdge} shows. `neutral` is a result that is neither a success nor an error. `warning` has the color of
 * `pending` and stands still: something needs a person's attention, and a running glint would say that work goes on by itself.
 */
export type StatusTone = 'pending' | 'success' | 'error' | 'neutral' | 'warning';

const TONE_COLOR: Record<StatusTone, string> = {
  pending: 'var(--tuwa-pending-icon)',
  success: 'var(--tuwa-success-icon)',
  error: 'var(--tuwa-error-icon)',
  neutral: 'var(--tuwa-info-icon)',
  warning: 'var(--tuwa-pending-icon)',
};

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
    /** Classes of a layer over the whole card that shows a result, none by default (a tint of the status, for one). */
    wash?: string;
  };
};

/**
 * Put it first in a card with `position: relative` (it fills the card and takes its corners). While pending, a glint in
 * the pending color runs along the top; a result fills the strip in the status color, with a crossfade. The card keeps its
 * own color: `classNames.wash` gives it a tint. With `prefers-reduced-motion` nothing moves and the colors just change.
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
        {/* Paper and ink: the strip tells the status, and the card keeps its own color (a tint of the whole card was too much
            color). Only `classNames.wash` lays a layer over it */}
        {tone !== 'pending' && classNames?.wash && (
          <motion.div
            key={tone}
            className={cn('novacore:absolute novacore:inset-0', classNames?.wash)}
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
          // In CSS, not `framer-motion`: a pending transaction can wait for an hour, with a JavaScript loop on every frame
          <div
            className="tuwa-status-glint novacore:absolute novacore:inset-y-0 novacore:left-0 novacore:w-1/4"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
}
