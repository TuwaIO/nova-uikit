import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import * as React from 'react';

import { cn, isTouchDevice } from '../utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
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

const DialogOverlay = ({ className, backdropAnimation }: { backdropAnimation?: Variants; className?: string }) => {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.document.body.classList.add('NovaModalOpen');
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.document.body.classList.remove('NovaModalOpen');
      }
    };
  }, []);
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
          className={cn(
            'novacore:fixed novacore:inset-0 novacore:z-50 novacore:bg-black/55 novacore:backdrop-blur-sm novacore:backdrop-saturate-150',
            className,
          )}
        />
      </motion.div>
    </AnimatePresence>
  );
};
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    modalAnimation?: Variants;
    backdropAnimation?: Variants;
  }
>(({ className, children, modalAnimation, backdropAnimation, ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(isTouchDevice());
  }, []);

  const selectedAnimation = modalAnimation ?? (isMobile ? mobileModalAnimation : defaultModalAnimation);

  return (
    <DialogPortal>
      <DialogOverlay backdropAnimation={backdropAnimation} />

      <DialogPrimitive.Content
        aria-describedby="tuwa:modal-content"
        ref={ref}
        className={cn(
          'NovaNoScrolling novacore:fixed novacore:bottom-0 novacore:left-0 novacore:p-0 novacore:sm:bottom-auto novacore:sm:left-[50%] novacore:sm:top-[50%] novacore:sm:translate-x-[-50%] novacore:sm:translate-y-[-50%] novacore:z-50 novacore:sm:p-4 novacore:outline-none',
          className,
        )}
        {...props}
      >
        <motion.div
          layout
          className="NovaNoScrolling novacore:relative novacore:overflow-hidden"
          transition={{
            layout: {
              duration: 0.2,
              ease: [0.1, 0.1, 0.2, 1],
            },
          }}
        >
          <AnimatePresence>
            <motion.div
              variants={selectedAnimation}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              animate="animate"
              initial="initial"
              exit="exit"
              className="NovaNoScrolling novacore:relative novacore:overflow-hidden"
            >
              <div
                className={cn(
                  'NovaNoScrolling NovaDialogContent__elements novacore:relative novacore:flex novacore:max-h-[98dvh] novacore:w-full novacore:flex-col novacore:gap-3 novacore:overflow-y-auto novacore:rounded-t-2xl novacore:sm:rounded-2xl novacore:shadow-2xl',
                  'novacore:border novacore:border-[var(--tuwa-border-primary)] novacore:bg-[var(--tuwa-bg-primary)]',
                )}
              >
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-describedby="tuwa:modal-header"
    className={cn(
      'novacore:sticky novacore:flex novacore:top-0 novacore:z-11 novacore:w-full novacore:flex-row novacore:items-center novacore:justify-between',
      'novacore:border-b novacore:border-[var(--tuwa-border-primary)] novacore:bg-[var(--tuwa-bg-primary)] novacore:p-4',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-describedby="tuwa:modal-footer"
    className={cn(
      'novacore:flex novacore:flex-col-reverse novacore:sm:flex-row novacore:sm:justify-end novacore:sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    aria-describedby="tuwa:modal-title"
    className={cn(
      'novacore:text-lg novacore:font-bold novacore:leading-none novacore:tracking-tight novacore:text-[var(--tuwa-text-primary)] novacore:m-0',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    aria-describedby="tuwa:modal-description"
    ref={ref}
    className={cn('novacore:text-sm novacore:text-[var(--tuwa-text-secondary)]', className)}
    {...props}
  />
));
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
