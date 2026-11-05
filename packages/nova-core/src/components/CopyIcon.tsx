/**
 * @file The icon of a copy button, which turns into a check mark.
 */

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '../utils';

/** Props of {@link CopyIcon}. */
export type CopyIconProps = {
  /** Whether the text has just been copied: the two sheets then give way to a check mark. */
  copied?: boolean;
  /** Classes of the icon, which set its size and the color of the sheets. The check mark is in the success color. */
  className?: string;
};

/**
 * The copy icon of the Nova components: two thin sheets that fold away into a check mark when the text has been copied, and
 * back. With `prefers-reduced-motion` the icon just changes. Decorative: the button around it has the label.
 *
 * @param props - See {@link CopyIconProps}.
 * @returns The icon.
 */
export function CopyIcon({ copied = false, className }: CopyIconProps) {
  const reduceMotion = useReducedMotion();
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
