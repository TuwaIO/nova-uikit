/**
 * @file Text and icons that change in place: the letters both versions share glide to their new places, the others fade.
 */

import { animate, AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '../utils';
import { morphLetters } from './morphLetters';

/** How long a change of text takes, in seconds. */
const MORPH_SECONDS = 0.34;
const MORPH_EASE = [0.2, 0, 0, 1] as const;

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

/** The letters of a change, over the text that is hidden from the eye while it runs. */
function Letters({
  from,
  to,
  wrap,
  rootRef,
  textRef,
  onTooLong,
}: {
  from: string;
  to: string;
  wrap?: boolean;
  rootRef: RefObject<HTMLSpanElement | null>;
  textRef: RefObject<HTMLSpanElement | null>;
  onTooLong: () => void;
}) {
  const [shown, setShown] = useState(from);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return;
    const fromWidth = root.getBoundingClientRect().width;
    const toWidth = text.getBoundingClientRect().width;
    if (wrap && Math.max(fromWidth, toWidth) > (root.parentElement?.getBoundingClientRect().width ?? Infinity)) {
      onTooLong();
      return;
    }
    // The width on screen before the letters change: motion measures them at this width, or in a parent aligned to the right
    // or the center they would leap sideways by the difference of the widths on the first frame
    root.style.width = `${fromWidth}px`;
    // In the next frame, not in this commit: motion can snapshot a letter only after the microtask that follows its mount, and
    // without a snapshot the letters jump instead of gliding. The frame in between shows the same text, so nothing is seen.
    let width: ReturnType<typeof animate> | undefined;
    const frame = requestAnimationFrame(() => {
      setShown(to);
      width = animate(root, { width: [fromWidth, toWidth] }, { duration: MORPH_SECONDS, ease: MORPH_EASE });
    });
    return () => {
      cancelAnimationFrame(frame);
      width?.stop();
    };
  }, [to, wrap, rootRef, textRef, onTooLong]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    return () => {
      root?.style.removeProperty('width');
    };
  }, [rootRef]);

  return (
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
  );
}

/** The old version fading out over the new one, for a text that takes several lines. */
function Crossfade({ from, textRef }: { from: string; textRef: RefObject<HTMLSpanElement | null> }) {
  useLayoutEffect(() => {
    textRef.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], {
      duration: MORPH_SECONDS * 1000,
      easing: 'ease-out',
    });
  }, [textRef]);

  return (
    <motion.span
      aria-hidden="true"
      className="novacore:absolute novacore:inset-x-0 novacore:top-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: MORPH_SECONDS, ease: MORPH_EASE }}
    >
      {from}
    </motion.span>
  );
}

/**
 * A text that morphs when it changes, as a status from "Pending" to "Success". At rest it is a plain text in a `span`, so lists
 * stay light and the text wraps and copies as usual; only the change is split into letters. One element holds the text
 * throughout, so a live region around it announces a change once. With `prefers-reduced-motion` the text just changes.
 *
 * @param props - See {@link MorphTextProps}.
 * @returns The text.
 */
export function MorphText({ children: text, wrap, className }: MorphTextProps) {
  const reduceMotion = useReducedMotion();
  const [settled, setSettled] = useState(text);
  const [isTooLong, setIsTooLong] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (text === settled) return;
    const timer = setTimeout(
      () => {
        setSettled(text);
        setIsTooLong(false);
      },
      reduceMotion ? 0 : MORPH_SECONDS * 1000 + 100,
    );
    return () => clearTimeout(timer);
  }, [text, settled, reduceMotion]);

  const isMorphing = !reduceMotion && text !== settled;
  const showsLetters = isMorphing && !isTooLong;

  return (
    <span
      ref={rootRef}
      className={cn(
        showsLetters && 'novacore:relative novacore:inline-flex novacore:whitespace-pre',
        isMorphing && isTooLong && 'novacore:relative novacore:block',
        className,
      )}
    >
      {/* Its width is where the letters are going, and it is what a screen reader reads: the letters are hidden from it */}
      <span
        ref={textRef}
        className={cn(
          showsLetters && 'novacore:pointer-events-none novacore:absolute novacore:left-0 novacore:opacity-0',
        )}
      >
        {text}
      </span>
      {showsLetters && (
        <Letters
          from={settled}
          to={text}
          wrap={wrap}
          rootRef={rootRef}
          textRef={textRef}
          onTooLong={() => setIsTooLong(true)}
        />
      )}
      {isMorphing && isTooLong && <Crossfade key={text} from={settled} textRef={textRef} />}
    </span>
  );
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
