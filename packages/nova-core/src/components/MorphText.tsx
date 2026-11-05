/**
 * @file Text and icons that change in place: the letters both versions share glide to their new places, the others fade.
 */

import { animate, AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '../utils';

/** How long a change of text takes, in seconds. */
const MORPH_SECONDS = 0.34;
const MORPH_EASE = [0.2, 0, 0, 1] as const;

/**
 * Splits a text into letters with a key that stays the same between two versions of the text: the n-th `a` of one is the
 * n-th `a` of the other, which is what lets it glide instead of fading.
 *
 * @internal
 * @param text - The text.
 * @returns The letters with their keys. A letter made of several code points, such as an emoji, stays whole.
 */
export function morphLetters(text: string): { key: string; letter: string }[] {
  const letters =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (part) => part.segment)
      : Array.from(text);
  const seen = new Map<string, number>();
  return letters.map((letter) => {
    const count = seen.get(letter) ?? 0;
    seen.set(letter, count + 1);
    return { key: `${letter}-${count}`, letter };
  });
}

/** Props of {@link MorphText}. */
export type MorphTextProps = {
  /** The text. A change of it is what gets animated. */
  children: string;
  /**
   * The text may take several lines, in a parent with a width of its own. Then it changes letter by letter only when both
   * versions fit on one line, and crossfades otherwise. Without it the text stays on one line, as in a badge or a button.
   */
  wrap?: boolean;
  /** Classes of the text. */
  className?: string;
};

function Morph({
  from,
  to,
  wrap,
  className,
  onDone,
}: {
  from: string;
  to: string;
  wrap?: boolean;
  className?: string;
  onDone: (text: string) => void;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(from);
  const [isLetters, setIsLetters] = useState(true);

  // Before the browser paints: the old letters are on the page, so the width goes from the old text to the new one
  useLayoutEffect(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const fromWidth = root.getBoundingClientRect().width;
    const toWidth = measure.getBoundingClientRect().width;
    if (wrap && Math.max(fromWidth, toWidth) > (root.parentElement?.clientWidth ?? Infinity)) {
      setIsLetters(false);
      setShown(to);
      return;
    }
    setShown(to);
    const width = animate(root, { width: [fromWidth, toWidth] }, { duration: MORPH_SECONDS, ease: MORPH_EASE });
    return () => width.stop();
  }, [to, wrap]);

  useEffect(() => {
    const timer = setTimeout(() => onDone(to), MORPH_SECONDS * 1000 + 60);
    return () => clearTimeout(timer);
  }, [to, onDone]);

  if (!isLetters) {
    return (
      <span className={cn('novacore:relative novacore:block', className)}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={shown}
            className="novacore:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MORPH_SECONDS, ease: MORPH_EASE }}
          >
            {shown}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  return (
    <span ref={rootRef} className={cn('novacore:relative novacore:inline-flex novacore:whitespace-pre', className)}>
      {/* Takes the width of the new text, and is what a screen reader reads: the letters below are hidden from it */}
      <span
        ref={measureRef}
        className="novacore:pointer-events-none novacore:absolute novacore:left-0 novacore:opacity-0"
      >
        {to}
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        {morphLetters(shown).map(({ key, letter }) => (
          <motion.span
            key={key}
            aria-hidden="true"
            layout="position"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: MORPH_SECONDS, ease: MORPH_EASE }}
          >
            {letter}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

/**
 * A text that morphs when it changes, as a status from "Pending" to "Success". At rest it is a plain `span`, so lists stay
 * light and the text wraps and copies as usual; only the change is split into letters. With `prefers-reduced-motion` the
 * text just changes.
 *
 * @param props - See {@link MorphTextProps}.
 * @returns The text.
 */
export function MorphText({ children: text, wrap, className }: MorphTextProps) {
  const reduceMotion = useReducedMotion();
  const [settled, setSettled] = useState(text);

  if (reduceMotion || text === settled) return <span className={className}>{text}</span>;
  return <Morph from={settled} to={text} wrap={wrap} className={className} onDone={setSettled} />;
}

/** Props of {@link MorphIcon}. */
export type MorphIconProps = {
  /** Which icon this is. A change of the key swaps the icon. */
  iconKey: string;
  /** The icon. */
  children: ReactNode;
  /** Animates the first icon too. By default it just appears, so what is already on screen does not flash on a reload. */
  animateFirst?: boolean;
  /** Classes of the container. */
  className?: string;
};

/**
 * An icon that swaps with a small pop when its key changes, as a loader giving way to a check mark. With
 * `prefers-reduced-motion` the icon just changes.
 *
 * @param props - See {@link MorphIconProps}.
 * @returns The icon.
 */
export function MorphIcon({ iconKey, children, animateFirst = false, className }: MorphIconProps) {
  const reduceMotion = useReducedMotion();
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 };
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 26, opacity: { duration: 0.15 } };

  return (
    <span className={cn('novacore:relative novacore:inline-flex novacore:shrink-0', className)}>
      <AnimatePresence initial={animateFirst} mode="popLayout">
        <motion.span
          key={iconKey}
          className="novacore:inline-flex"
          initial={hidden}
          animate={{ opacity: 1, scale: 1 }}
          exit={hidden}
          transition={transition}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
