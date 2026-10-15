/**
 * @file RememberWallet component: the "Remember this wallet" checkbox under the wallet list of the connect modal.
 */

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@tuwaio/nova-core/utils';
import { AnimatePresence, motion, useReducedMotion, Variants } from 'framer-motion';
import { ComponentType, ReactNode, useEffect, useId, useRef, useState } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';

/**
 * Props for a custom container of {@link RememberWallet}.
 */
export type RememberWalletContainerProps = {
  /** Classes from `classNames.container` or the defaults */
  className?: string;
  /** The checkbox with its label, the info button with its tooltip, and the description for screen readers */
  children: ReactNode;
  /** The `rememberWallet` of the Satellite Connect store */
  rememberWallet: boolean;
  /**
   * Sets `rememberWallet` of the store.
   *
   * @param remember - Keep the connection after the tab closes.
   */
  setRememberWallet: (remember: boolean) => void;
};

/**
 * Customization options of {@link RememberWallet}.
 */
export type RememberWalletCustomization = {
  /** Hides the checkbox; the store keeps the `rememberWallet` it was created with. */
  hidden?: boolean;
  /** Custom components */
  components?: {
    /** Custom container (a `div` by default) */
    Container?: ComponentType<RememberWalletContainerProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones.
     *
     * @returns The classes.
     */
    container?: () => string;
    /**
     * Returns the classes of the `label` that holds the checkbox and its text, instead of the default ones.
     *
     * @returns The classes.
     */
    label?: () => string;
    /**
     * Returns the classes of the drawn box, instead of the default ones.
     *
     * @param params - The state of the box.
     * @param params.checked - Whether the box is ticked.
     * @returns The classes.
     */
    box?: (params: { checked: boolean }) => string;
    /**
     * Returns the classes of the check mark (an SVG), instead of the default ones.
     *
     * @returns The classes.
     */
    checkmark?: () => string;
    /**
     * Returns the classes of the label text, instead of the default ones.
     *
     * @returns The classes.
     */
    text?: () => string;
    /**
     * Returns the classes of the info button, instead of the default ones.
     *
     * @returns The classes.
     */
    infoButton?: () => string;
    /**
     * Returns the classes of the tooltip, instead of the default ones.
     *
     * @returns The classes.
     */
    tooltip?: () => string;
  };
};

const DefaultContainer = ({ className, children }: RememberWalletContainerProps) => (
  <div className={className}>{children}</div>
);

// The box gives a little when it is ticked or unticked; the ripple spreads from it only when it is ticked
const BOX_VARIANTS: Variants = {
  checked: { scale: [1, 0.84, 1.08, 1], transition: { duration: 0.36, ease: 'easeOut' } },
  unchecked: { scale: [1, 0.9, 1], transition: { duration: 0.22, ease: 'easeOut' } },
};
const RIPPLE_VARIANTS: Variants = {
  checked: { opacity: [0.35, 0], scale: [1, 2.3], transition: { duration: 0.55, ease: 'easeOut' } },
  unchecked: { opacity: 0, scale: 1, transition: { duration: 0 } },
};

/**
 * The "Remember this wallet" checkbox under the wallet list of the connect modal. It shows and sets `rememberWallet`
 * of the Satellite Connect store: ticked, the connection is saved in `localStorage` and the wallet is reconnected
 * after any page load until it is disconnected; unticked, it is saved in `sessionStorage` and reconnected only until
 * the tab closes. The store starts with the `rememberWallet` of `SatelliteConnectProvider` (default `true`).
 *
 * The box is drawn over a visually hidden checkbox input, so keyboards and screen readers use the native control;
 * ticking it draws the check mark with a short bounce and ripple (Framer Motion). The info button next to the label
 * opens a tooltip with the explanation: while a mouse is over it, when it has keyboard focus, and on a tap or click
 * (also on touch screens); another tap or click, a tap or click elsewhere or Escape closes it (Escape closes only the
 * tooltip, not the modal). Screen readers get the
 * explanation as the description of the checkbox. With `prefers-reduced-motion` nothing moves.
 *
 * Side effects: while the tooltip is open, a `keydown` listener on `window` (capture phase) closes it on Escape and
 * stops that key, so the modal stays open; while it is open after a tap or click, a `pointerdown` listener on `document`
 * closes it.
 *
 * Labels: `rememberWallet`, `rememberWalletHint`, `rememberWalletInfo`.
 *
 * @param props - The component props.
 * @param props.customization - Hides the checkbox or replaces its container and classes.
 * @returns The checkbox, or `null` when `customization.hidden` is set.
 */
export function RememberWallet({ customization }: { customization?: RememberWalletCustomization }) {
  const labels = useNovaConnectLabels();
  const rememberWallet = useSatelliteConnectStore((store) => store.rememberWallet);
  const setRememberWallet = useSatelliteConnectStore((store) => store.setRememberWallet);
  const reduceMotion = useReducedMotion() ?? false;
  const hintId = useId();
  const tooltipId = useId();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const infoRef = useRef<HTMLSpanElement>(null);
  const open = hovered || pinned || focused;

  // A tooltip opened with a tap or click closes on a tap or click anywhere else
  useEffect(() => {
    if (!pinned) return;
    const close = (event: PointerEvent) => {
      if (!infoRef.current?.contains(event.target as Node)) setPinned(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [pinned]);

  // Escape closes an open tooltip, not the dialog around it: the listener runs in the capture phase on `window`, before
  // the dialog's listener on `document`
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setHovered(false);
      setPinned(false);
      setFocused(false);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [open]);

  if (customization?.hidden) return null;

  const Container = customization?.components?.Container ?? DefaultContainer;
  const classNames = customization?.classNames;
  const state = rememberWallet ? 'checked' : 'unchecked';

  return (
    <Container
      className={
        classNames?.container?.() ??
        cn('novacon:mt-4 novacon:flex novacon:items-center novacon:justify-center novacon:gap-1.5')
      }
      rememberWallet={rememberWallet}
      setRememberWallet={setRememberWallet}
    >
      <label
        className={
          classNames?.label?.() ??
          cn(
            'novacon:group novacon:flex novacon:cursor-pointer novacon:select-none novacon:items-center novacon:gap-2.5',
          )
        }
      >
        <input
          type="checkbox"
          checked={rememberWallet}
          onChange={(e) => setRememberWallet(e.target.checked)}
          aria-describedby={hintId}
          className="novacon:peer novacon:sr-only"
        />
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={reduceMotion ? undefined : state}
          variants={BOX_VARIANTS}
          className={
            classNames?.box?.({ checked: rememberWallet }) ??
            cn(
              'novacon:relative novacon:flex novacon:h-[18px] novacon:w-[18px] novacon:shrink-0 novacon:items-center novacon:justify-center',
              'novacon:rounded-[min(var(--tuwa-rounded-corners),5px)] novacon:border-[1.5px]',
              'novacon:transition-[background-color,border-color] novacon:duration-200',
              'novacon:peer-focus-visible:ring-[length:var(--tuwa-ring-width)] novacon:peer-focus-visible:ring-[var(--tuwa-text-accent)] novacon:peer-focus-visible:ring-offset-[length:var(--tuwa-ring-width)] novacon:peer-focus-visible:ring-offset-[var(--tuwa-bg-primary)]',
              rememberWallet
                ? 'novacon:border-[var(--tuwa-text-accent)] novacon:bg-[var(--tuwa-text-accent)]'
                : 'novacon:border-[var(--tuwa-border-primary)] novacon:bg-[var(--tuwa-bg-primary)] novacon:group-hover:border-[var(--tuwa-text-accent)]',
            )
          }
        >
          {!reduceMotion && (
            <motion.span
              initial={false}
              animate={state}
              variants={RIPPLE_VARIANTS}
              className="novacon:pointer-events-none novacon:absolute novacon:inset-0 novacon:rounded-[inherit] novacon:bg-[var(--tuwa-text-accent)]"
            />
          )}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={
              classNames?.checkmark?.() ??
              cn('novacon:relative novacon:h-3 novacon:w-3 novacon:text-[var(--tuwa-text-on-accent)]')
            }
          >
            <motion.path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: rememberWallet ? 1 : 0, opacity: rememberWallet ? 1 : 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: rememberWallet ? 0.26 : 0.14, delay: rememberWallet ? 0.06 : 0, ease: 'easeOut' }
              }
            />
          </svg>
        </motion.span>
        <span
          className={
            classNames?.text?.() ?? cn('novacon:text-sm novacon:leading-tight novacon:text-[var(--tuwa-text-primary)]')
          }
        >
          {labels.rememberWallet}
        </span>
      </label>

      <span ref={infoRef} className="novacon:relative novacon:flex">
        <button
          type="button"
          aria-label={labels.rememberWalletInfo}
          aria-expanded={open}
          aria-controls={tooltipId}
          onClick={() => setPinned(!pinned)}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
          onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}
          className={
            classNames?.infoButton?.() ??
            cn(
              'novacon:flex novacon:h-5 novacon:w-5 novacon:cursor-pointer novacon:items-center novacon:justify-center novacon:rounded-full',
              'novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors novacon:hover:text-[var(--tuwa-text-primary)]',
              'novacon:focus-visible:outline-none novacon:focus-visible:ring-[length:var(--tuwa-ring-width)] novacon:focus-visible:ring-[var(--tuwa-text-accent)]',
              open && 'novacon:text-[var(--tuwa-text-primary)]',
            )
          }
        >
          <InformationCircleIcon width={16} height={16} aria-hidden="true" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.span
              role="tooltip"
              id={tooltipId}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: reduceMotion ? 0 : 0.15, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom right' }}
              className={
                classNames?.tooltip?.() ??
                cn(
                  'novacon:pointer-events-none novacon:absolute novacon:right-0 novacon:bottom-full novacon:z-20 novacon:mb-2 novacon:w-max novacon:max-w-[240px]',
                  'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:bg-[var(--tuwa-text-primary)] novacon:px-3 novacon:py-2 novacon:shadow-lg',
                  'novacon:text-left novacon:text-xs novacon:leading-snug novacon:text-[var(--tuwa-bg-primary)]',
                )
              }
            >
              {labels.rememberWalletHint}
              <span
                aria-hidden="true"
                className="novacon:absolute novacon:top-full novacon:right-1.5 novacon:-mt-1 novacon:h-2 novacon:w-2 novacon:rotate-45 novacon:bg-[var(--tuwa-text-primary)]"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span id={hintId} className="novacon:sr-only">
        {labels.rememberWalletHint}
      </span>
    </Container>
  );
}
