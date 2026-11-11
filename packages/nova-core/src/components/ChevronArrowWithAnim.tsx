import { AnimatePresence, motion } from 'framer-motion';

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { CHEVRON_DOWN, CHEVRON_UP } from '../pixel/art';
import { pathOf, PIXEL_SVG } from '../pixel/draw';
import { cn } from '../utils';

/** The two chevrons and how far they slide, in each look: the pixel ones by one pixel of their grid. */
const DRAWINGS = {
  classic: { up: 'm4.5 15.75 7.5-7.5 7.5 7.5', down: 'm19.5 8.25-7.5 7.5-7.5-7.5', shift: 3 },
  pixel: { up: pathOf(CHEVRON_UP), down: pathOf(CHEVRON_DOWN), shift: 1 },
} as const;

/**
 * A chevron that points up when `isOpen` is `true` and down otherwise, animated with `framer-motion` when it flips.
 * Nova uses it in dropdown triggers such as the chain selector.
 *
 * @param props - The chevron props.
 * @param props.className - Classes merged with the default size and color (`--tuwa-text-secondary`).
 * @param props.strokeWidth - Stroke width of the classic chevron; the pixel one has the two-pixel lines of its grid. Defaults
 * to `2`.
 * @param props.isOpen - Whether the related list is open.
 * @param props.look - `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel
 * without one).
 * @returns The SVG element.
 */
export function ChevronArrowWithAnim({
  className,
  strokeWidth,
  isOpen,
  look,
}: {
  className?: string;
  strokeWidth?: number;
  isOpen?: boolean;
  look?: NovaLook;
}) {
  const setLook = useNovaIcons().look;
  const isPixel = (look ?? setLook) === 'pixel';
  const drawing = DRAWINGS[isPixel ? 'pixel' : 'classic'];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...(isPixel
        ? { ...PIXEL_SVG, fill: 'currentColor' }
        : { fill: 'none', viewBox: '0 0 24 24', strokeWidth: strokeWidth ?? 2, stroke: 'currentColor' })}
      className={cn('novacore:w-4 novacore:h-4 novacore:text-[var(--tuwa-text-secondary)]', className)}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={drawing.up}
            variants={{
              hidden: { translateY: drawing.shift, scaleY: 0.8, opacity: 0 },
              visible: { translateY: 0, scaleY: 1, opacity: 1 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={drawing.down}
            className="novacore:relative"
            variants={{
              hidden: { translateY: -drawing.shift, scaleY: 0.8, opacity: 0 },
              visible: { translateY: 0, scaleY: 1, opacity: 1 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
