/**
 * @file A button that appears further down a page and takes it back to the top.
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { cn } from '../utils';

/** Props of {@link ScrollToTopButton}. */
export type ScrollToTopButtonProps = {
  /** The name of the button for screen readers, in the language of the page. */
  label: string;
  /** How far down the page it appears, in pixels. Defaults to `500`. */
  visibleAfter?: number;
  /** Classes of the button, to move it. */
  className?: string;
};

/**
 * A button fixed to the corner of the page that scrolls it back to the top. It listens to the `scroll` event of `window`
 * while it is mounted. With reduced motion its arrow stands still and the page jumps to the top at once.
 *
 * @param props - See {@link ScrollToTopButtonProps}.
 * @returns The button, or nothing near the top of the page.
 *
 * @example
 * ```tsx
 * import { ScrollToTopButton } from '@tuwaio/nova-core';
 *
 * export function Page() {
 *   return <ScrollToTopButton label="Back to top" />;
 * }
 * ```
 */
export function ScrollToTopButton({ label, visibleAfter = 500, className }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const update = () => setIsVisible(window.scrollY > visibleAfter);
    // A page can open scrolled down: a reload, a link to a section
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [visibleAfter]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          aria-label={label}
          className={cn(
            'novacore:fixed novacore:right-4 novacore:bottom-8 novacore:z-50 novacore:flex novacore:h-12 novacore:w-12 novacore:cursor-pointer novacore:items-center novacore:justify-center novacore:overflow-hidden novacore:rounded-[var(--tuwa-rounded-corners)] novacore:border novacore:border-white/10 novacore:bg-[var(--tuwa-button-gradient-from)] novacore:text-[var(--tuwa-text-on-accent)] novacore:shadow-lg novacore:transition-colors novacore:duration-200 novacore:hover:bg-[var(--tuwa-button-gradient-from-hover)] novacore:hover:shadow-xl novacore:md:right-8',
            className,
          )}
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }}
          whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.svg
            aria-hidden
            className="novacore:h-6 novacore:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
            transition={{ type: 'tween', duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
