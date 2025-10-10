import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import * as React from 'react';

import { cn } from '../utils';

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

const defaultModalBackdropAnimation: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const DialogOverlay = ({ className, backdropAnimation }: { backdropAnimation?: Variants; className?: string }) => (
  <AnimatePresence>
    <motion.div
      variants={backdropAnimation ?? defaultModalBackdropAnimation}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      animate="animate"
      initial="initial"
      exit="exit"
      className="relative rounded-t-2xl sm:rounded-2xl overflow-hidden"
    >
      <div className={cn('fixed inset-0 z-50 bg-black/55 backdrop-blur-sm backdrop-saturate-150', className)} />
    </motion.div>
  </AnimatePresence>
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    modalAnimation?: Variants;
    backdropAnimation?: Variants;
  }
>(({ className, children, modalAnimation, backdropAnimation, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay backdropAnimation={backdropAnimation} />

    <DialogPrimitive.Content
      aria-describedby="tuwa:modal-content"
      ref={ref}
      className={cn(
        'fixed bottom-0 left-0 p-0 sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] z-50 sm:p-4 outline-none',
        className,
      )}
      {...props}
    >
      <motion.div
        layout
        className="relative overflow-hidden"
        transition={{
          layout: {
            duration: 0.2,
            ease: [0.1, 0.1, 0.2, 1],
          },
        }}
      >
        <AnimatePresence>
          <motion.div
            variants={modalAnimation ?? defaultModalAnimation}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            animate="animate"
            initial="initial"
            exit="exit"
            className="relative rounded-t-2xl sm:rounded-2xl overflow-hidden"
          >
            <div
              className={cn(
                'relative flex max-h-[98dvh] w-full flex-col gap-3 overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl',
                'border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)]',
              )}
            >
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-describedby="tuwa:modal-header"
    className={cn(
      'sticky flex top-0 z-11 w-full flex-row items-center justify-between',
      'border-b border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] p-4',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-describedby="tuwa:modal-footer"
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
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
    className={cn('text-lg font-bold leading-none tracking-tight text-[var(--tuwa-text-primary)] m-0', className)}
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
    className={cn('text-sm text-[var(--tuwa-text-secondary)]', className)}
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
