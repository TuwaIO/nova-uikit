/**
 * @file A box that follows the height of its content with an animation.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, useEffect, useState } from 'react';

import { cn } from '../utils';

/** Props of {@link AnimatedHeight}. */
export type AnimatedHeightProps = {
  /** The content, whose height is followed. */
  children: ReactNode;
  /** Classes of the box. */
  className?: string;
  /** Duration of a change of height, in seconds. Defaults to `0.25`. */
  duration?: number;
};

/**
 * A box whose height glides to the height of its content, so that what is under it moves along instead of jumping, and no
 * empty space stays behind. It clips its content while the height changes: keep what must not be clipped inside the padding of
 * the content. With `prefers-reduced-motion` the height just changes.
 *
 * Side effects: observes the size of the content with a `ResizeObserver` while mounted.
 *
 * @param props - See {@link AnimatedHeightProps}.
 * @returns The box.
 */
export function AnimatedHeight({ children, className, duration = 0.25 }: AnimatedHeightProps) {
  const reduceMotion = useReducedMotion();
  // State, not a ref: the content may mount later, as in a dialog
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!content || typeof ResizeObserver === 'undefined') return;
    // `offsetHeight` is the height of the layout, without the scale of the opening animation of a dialog
    const measure = () => setHeight(content.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [content]);

  return (
    <motion.div
      className={cn('novacore:overflow-hidden', className)}
      initial={false}
      animate={{ height: height ?? 'auto' }}
      transition={{ duration: reduceMotion ? 0 : duration, ease: [0.2, 0, 0, 1] }}
    >
      <div ref={setContent}>{children}</div>
    </motion.div>
  );
}
