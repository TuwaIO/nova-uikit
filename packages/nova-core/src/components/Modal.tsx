import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import * as React from 'react';

import { useNovaSounds } from '../hooks/useNovaSounds';
import { cn, isTouchDevice } from '../utils';
import { watchDialogAnchor } from './dialogAnchor';
import { watchDialogFrameHeight } from './dialogFrameHeight';
import { lockPageScroll } from './pageScrollLock';

/**
 * The dialog root (`Root` of `@radix-ui/react-dialog`): holds the open state (`open`, `defaultOpen`, `onOpenChange`).
 */
const Dialog = DialogPrimitive.Root;
/** The element that opens the dialog (`Trigger` of `@radix-ui/react-dialog`). */
const DialogTrigger = DialogPrimitive.Trigger;
/** Renders its children in `document.body` (`Portal` of `@radix-ui/react-dialog`). {@link DialogContent} uses it. */
const DialogPortal = DialogPrimitive.Portal;
/** An element that closes the dialog (`Close` of `@radix-ui/react-dialog`). */
const DialogClose = DialogPrimitive.Close;

const defaultModalAnimation: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

const mobileModalAnimation: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: '0%' },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: 0.2,
    },
  },
};

const defaultModalBackdropAnimation: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Tells a {@link DialogContent} that a {@link DialogDescription} is inside it. */
const DescriptionReportContext = React.createContext<((hasDescription: boolean) => void) | null>(null);

/**
 * Whether what was pressed is part of a toast of `react-toastify`.
 *
 * @param target - The target of the event.
 * @returns `true` inside a toast.
 * @internal
 */
export function isInsideToast(target: EventTarget | null): boolean {
  return !!(target as Partial<Element> | null)?.closest?.('.Toastify');
}

/**
 * The dimmed backdrop behind the dialog (ink at 50%, no blur), faded in with `framer-motion` (Radix removes it at once on close, so an
 * `exit` variant does not run). {@link DialogContent} renders
 * it.
 *
 * Side effect: while it is mounted, the page does not scroll (`lockPageScroll`).
 *
 * @param props - The overlay props.
 * @param props.className - Classes added to the backdrop element.
 * @param props.backdropAnimation - `framer-motion` variants (`initial`, `animate`, `exit`) of the backdrop; a fade by
 * default.
 * @returns The backdrop.
 */
const DialogOverlay = ({ className, backdropAnimation }: { backdropAnimation?: Variants; className?: string }) => {
  React.useEffect(() => lockPageScroll(), []);
  return (
    <AnimatePresence>
      <motion.div
        variants={backdropAnimation ?? defaultModalBackdropAnimation}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        animate="animate"
        initial="initial"
        exit="exit"
        className="novacore:relative novacore:overflow-hidden"
      >
        <div
          className={cn('novacore:fixed novacore:inset-0 novacore:z-50 novacore:bg-[var(--tuwa-backdrop)]', className)}
        />
      </motion.div>
    </AnimatePresence>
  );
};
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Inside `Content`, which Radix mounts only while the dialog is open. `DialogContent` itself stays mounted with the `Dialog` around
// it, so an effect there runs once, with the page. The two are quiet: when one dialog replaces another, or a louder sound has just
// played, or StrictMode runs this twice, the first of them is what is heard
function DialogSounds() {
  const play = useNovaSounds();
  React.useEffect(() => {
    play('modalOpen');
    return () => play('modalClose');
  }, [play]);
  return null;
}

/**
 * The dialog panel (`Content` of `@radix-ui/react-dialog`), rendered in a portal above {@link DialogOverlay}. It takes
 * the props of the Radix `Content` plus `modalAnimation` and `backdropAnimation` (`framer-motion` variants). By default
 * the panel scales in at the center of the screen, or slides up from the bottom on touch devices (`isTouchDevice`); its
 * content scrolls when it is taller than the viewport. When it closes, the focus returns to the element that had it
 * when the dialog opened (Radix alone returns it only to a {@link DialogTrigger}), unless `onCloseAutoFocus` prevents
 * that. Use it inside {@link Dialog}.
 *
 * When the content changes size (a modal goes to another screen), the panel takes a smaller height at once and grows to
 * a larger one with a 0.2 s height animation that clips the content, so it never shows an empty band under shrinking
 * content, even while the page renders no frames (as when a wallet opens its window). No animation with
 * `prefers-reduced-motion: reduce`.
 *
 * A dialog whose height changes while a person works in it, such as with tabs, passes `anchorTop`: its top edge then stays
 * where it opened, as a centered dialog moves everything in it with every change of height. With `AnimatedHeight` around
 * what changes and `animateHeight={false}`, the bottom edge glides and nothing jumps.
 *
 * Side effects: observes the size of the content with a `ResizeObserver` while open, sets `top` and `translate` on the panel
 * with `anchorTop`, and the side effects of {@link DialogOverlay}.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    modalAnimation?: Variants;
    backdropAnimation?: Variants;
    /** Keeps the top edge where the dialog opened while its height changes, on a wide screen. Defaults to `false`. */
    anchorTop?: boolean;
    /** Animates the height of the panel when its content changes size. Defaults to `true`. */
    animateHeight?: boolean;
  }
>(
  (
    {
      className,
      children,
      modalAnimation,
      backdropAnimation,
      anchorTop = false,
      animateHeight = true,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onPointerDownOutside,
      ...props
    },
    ref,
  ) => {
    // Not in an effect: a dialog mounted already open got the desktop animation on a touch device. The server says `false`,
    // and the portal renders nothing during hydration, so no mismatch comes of it
    const [isMobile] = React.useState(isTouchDevice);
    const [hasDescription, setHasDescription] = React.useState(false);
    // The element that opened the dialog: Radix gives the focus back only to a `Dialog.Trigger`, and the Nova modals are
    // opened by buttons of the app (WCAG 2.4.3)
    const opener = React.useRef<HTMLElement | null>(null);
    // State, not refs: Radix mounts the elements only while the dialog is open
    const [frame, setFrame] = React.useState<HTMLDivElement | null>(null);
    const [content, setContent] = React.useState<HTMLDivElement | null>(null);

    // Not a `layout` animation of `framer-motion`: it scales the frame, and while the frame shrinks its content already
    // has the new size, which leaves an empty band under the footer
    React.useEffect(() => {
      if (!frame || !content || !animateHeight) return;
      return watchDialogFrameHeight({ frame, content });
    }, [frame, content, animateHeight]);

    React.useEffect(() => {
      const dialog = content?.closest<HTMLElement>('[role="dialog"]');
      if (!dialog || !content || !anchorTop) return;
      return watchDialogAnchor({ dialog, content });
    }, [content, anchorTop]);

    const selectedAnimation = modalAnimation ?? (isMobile ? mobileModalAnimation : defaultModalAnimation);

    return (
      <DialogPortal>
        <DialogOverlay backdropAnimation={backdropAnimation} />

        <DialogPrimitive.Content
          // Radix names its description here, and warns of a description that is missing. Most Nova dialogs have none, and an
          // id of no element cut those that do off from theirs
          {...(hasDescription ? {} : { 'aria-describedby': undefined })}
          ref={ref}
          onPointerDownOutside={(event) => {
            onPointerDownOutside?.(event);
            // A toast is above the dialog, not outside it: its click closed the dialog, or opened the leave question of a checkout
            if (isInsideToast(event.target)) event.preventDefault();
          }}
          onOpenAutoFocus={(event) => {
            // Called before the focus moves into the dialog
            const active = document.activeElement;
            opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
            onOpenAutoFocus?.(event);
          }}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            if (event.defaultPrevented || !opener.current?.isConnected) return;
            event.preventDefault();
            opener.current.focus();
          }}
          className={cn(
            'NovaNoScrolling novacore:fixed novacore:bottom-0 novacore:left-0 novacore:p-0 novacore:sm:bottom-auto novacore:sm:left-[50%] novacore:sm:top-[50%] novacore:sm:translate-x-[-50%] novacore:sm:translate-y-[-50%] novacore:z-50 novacore:sm:p-4 novacore:outline-none',
            className,
          )}
          {...props}
        >
          <DialogSounds />
          <div className="NovaNoScrolling novacore:relative novacore:overflow-hidden">
            <AnimatePresence>
              <motion.div
                variants={selectedAnimation}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                animate="animate"
                initial="initial"
                exit="exit"
                className="NovaNoScrolling tuwa-scanlines novacore:relative novacore:overflow-hidden novacore:bg-[var(--tuwa-bg-primary)] novacore:border novacore:border-[var(--tuwa-border-primary)] novacore:rounded-t-[var(--tuwa-rounded-corners)] novacore:sm:rounded-[var(--tuwa-rounded-corners)]"
              >
                <div ref={setFrame} className="NovaNoScrolling novacore:relative novacore:overflow-hidden">
                  <div
                    ref={setContent}
                    className={cn(
                      'NovaNoScrolling NovaDialogContent__elements novacore:relative novacore:flex novacore:max-h-[100dvh] novacore:sm:max-h-[calc(100dvh-2rem-2px)] novacore:w-full novacore:flex-col novacore:overflow-y-auto',
                      'novacore:[transform:translateZ(0)] novacore:[backface-visibility:hidden]',
                    )}
                  >
                    <DescriptionReportContext.Provider value={setHasDescription}>
                      {children}
                    </DescriptionReportContext.Provider>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * A sticky header row of the dialog, with a bottom border.
 *
 * @param props - Props of the `<div>` element; `className` is merged with the default classes.
 * @returns The header element.
 */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'novacore:sticky novacore:flex novacore:top-0 novacore:z-11 novacore:w-full novacore:flex-row novacore:items-center novacore:justify-between',
      'tuwa-scanlines novacore:border-b novacore:border-[var(--tuwa-border-primary)] novacore:bg-[var(--tuwa-bg-primary)] novacore:p-4',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * A footer row of the dialog: stacked on small screens, aligned to the end on wider ones.
 *
 * @param props - Props of the `<div>` element; `className` is merged with the default classes.
 * @returns The footer element.
 */
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'novacore:flex novacore:flex-col-reverse novacore:sm:flex-row novacore:sm:justify-end novacore:sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/** The dialog title (`Title` of `@radix-ui/react-dialog`), styled with the Nova theme. */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'novacore:text-lg novacore:font-bold novacore:leading-none novacore:tracking-tight novacore:text-[var(--tuwa-text-primary)] novacore:m-0 novacore:font-mono',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/** The dialog description (`Description` of `@radix-ui/react-dialog`), styled with the Nova theme. */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const reportDescription = React.useContext(DescriptionReportContext);
  React.useEffect(() => {
    reportDescription?.(true);
    return () => reportDescription?.(false);
  }, [reportDescription]);
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('novacore:text-sm novacore:text-[var(--tuwa-text-secondary)]', className)}
      {...props}
    />
  );
});
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
