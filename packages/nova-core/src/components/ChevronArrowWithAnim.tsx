import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '../utils';

export function ChevronArrowWithAnim({
  className,
  strokeWidth,
  isOpen,
}: {
  className?: string;
  strokeWidth?: number;
  isOpen?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth ?? 2}
      stroke="currentColor"
      className={cn('w-4 h-4 text-[var(--tuwa-text-secondary)]', className)}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 15.75 7.5-7.5 7.5 7.5"
            variants={{
              hidden: { translateY: 3, scaleY: 0.8, opacity: 0 },
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
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
            className="relative"
            variants={{
              hidden: { translateY: -3, scaleY: 0.8, opacity: 0 },
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
