/**
 * @file This file contains the main `WalletInfoModal` component, which serves as the primary UI for viewing wallet details and transaction history.
 */

import { XMarkIcon } from '@heroicons/react/24/solid';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey, Transaction, TransactionAdapter } from '@tuwaio/pulsar-core';
import { AnimatePresence, motion, MotionProps } from 'framer-motion';
import { ComponentPropsWithoutRef, JSX, ReactNode } from 'react';

import { NovaProviderProps, useLabels } from '../../providers';
import { TransactionsHistory, TransactionsHistoryCustomization } from '../TransactionsHistory';
import { WalletHeader } from './WalletHeader';

// --- Prop Types for Customization ---
type CustomHeaderProps = { closeModal: () => void };
type CustomWalletInfoProps<TR, T extends Transaction<TR>, A> = WalletInfoModalProps<TR, T, A>;
type CustomHistoryProps<TR, T extends Transaction<TR>, A> = WalletInfoModalProps<TR, T, A> & {
  customization?: TransactionsHistoryCustomization<TR, T, A>;
};

/**
 * Defines the customization options for the WalletInfoModal.
 * Allows customization of modal behavior, animations, and individual UI components.
 */
export type WalletInfoModalCustomization<TR, T extends Transaction<TR>, A> = {
  /** Custom props to pass to the underlying Radix UI Dialog.Content component */
  modalProps?: Partial<ComponentPropsWithoutRef<typeof Dialog.Content>>;
  /** Custom Framer Motion animation properties */
  motionProps?: MotionProps;
  classNames?: {
    /** CSS classes for the main content wrapper div. */
    contentWrapper?: string;
  };
  /** Custom component overrides for different parts of the modal */
  components?: {
    /** A render prop to replace the entire modal header. */
    header?: (props: CustomHeaderProps) => ReactNode;
    /** A render prop to replace the `WalletHeader` component. */
    walletInfo?: (props: CustomWalletInfoProps<TR, T, A>) => ReactNode;
    /** A render prop to replace the `TransactionsHistory` component. */
    history?: (props: CustomHistoryProps<TR, T, A>) => ReactNode;
  };
};

/**
 * Defines the core props for the WalletInfoModal and its children.
 */
export interface WalletInfoModalProps<TR, T extends Transaction<TR>, A>
  extends Pick<
    NovaProviderProps<TR, T, A>,
    'adapters' | 'connectedAdapterType' | 'connectedWalletAddress' | 'transactionsPool'
  > {
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
  customization?: WalletInfoModalCustomization<TR, T, A>;
}

/**
 * The main modal component for displaying wallet information and transaction history.
 * It is highly customizable through the `customization` prop and supports full Radix UI Dialog customization.
 *
 * @param {WalletInfoModalProps<TR, T> & { ... }} props - The component props.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export function WalletInfoModal<TR, T extends Transaction<TR>, A>({
  isOpen,
  setIsOpen,
  customization,
  ...props
}: WalletInfoModalProps<TR, T, A>): JSX.Element | null {
  const labels = useLabels();

  const defaultMotionProps: MotionProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  const motionProps = { ...defaultMotionProps, ...customization?.motionProps };
  const closeModal = () => setIsOpen && setIsOpen(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/45 flex items-center justify-center p-2 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none z-50"
                {...customization?.modalProps}
                asChild
              >
                <motion.div {...motionProps}>
                  <div
                    className={cn(
                      'relative w-full max-w-2xl outline-none rounded-2xl bg-[var(--tuwa-bg-secondary)] shadow-xl max-h-[98dvh] overflow-y-auto',
                      customization?.classNames?.contentWrapper,
                    )}
                  >
                    {/* Header */}
                    {customization?.components?.header ? (
                      customization.components.header({ closeModal })
                    ) : (
                      <div className="flex items-center justify-between border-b border-[var(--tuwa-border-primary)] p-4 sticky top-0 left-0 w-full bg-[var(--tuwa-bg-secondary)] z-10">
                        <Dialog.Title className="text-lg font-bold text-[var(--tuwa-text-primary)]">
                          {labels.walletModal.title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button
                            type="button"
                            onClick={closeModal}
                            aria-label={labels.actions.close}
                            className="cursor-pointer rounded-full p-1 text-[var(--tuwa-text-tertiary)] transition-colors hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </Dialog.Close>
                      </div>
                    )}

                    {/* Body */}
                    <div className="flex flex-col gap-4 p-4 sm:p-6 sm:gap-6">
                      {customization?.components?.walletInfo ? (
                        customization.components.walletInfo(props)
                      ) : (
                        <WalletHeader
                          explorerUrl={
                            selectAdapterByKey({
                              adapterKey: props.connectedAdapterType ?? TransactionAdapter.EVM,
                              adapters: props.adapters,
                            })?.getExplorerUrl() ?? ''
                          }
                          walletAddress={props.connectedWalletAddress}
                        />
                      )}

                      {customization?.components?.history ? (
                        customization.components.history(props)
                      ) : (
                        <TransactionsHistory {...props} />
                      )}
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
