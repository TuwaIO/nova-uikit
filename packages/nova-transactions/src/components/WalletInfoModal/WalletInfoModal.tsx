/**
 * @file This file contains the main `WalletInfoModal` component, which serves as the primary UI
 * for viewing wallet details and transaction history.
 */

import { XMarkIcon } from '@heroicons/react/24/solid';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey, Transaction } from '@tuwaio/pulsar-core';
import { AnimatePresence, motion, MotionProps } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, useMemo } from 'react';

import { NovaProviderProps, useLabels } from '../../providers';
import { TransactionsHistory, TransactionsHistoryProps } from '../TransactionsHistory';
import { WalletHeader, WalletHeaderProps } from './WalletHeader';

// --- Prop Types for Customization ---
type CustomHeaderProps = { closeModal: () => void };

/**
 * Defines the customization options for the WalletInfoModal.
 */
export type WalletInfoModalCustomization<T extends Transaction> = {
  modalProps?: Partial<ComponentPropsWithoutRef<typeof Dialog.Content>>;
  motionProps?: MotionProps;
  classNames?: {
    contentWrapper?: string;
  };
  components?: {
    Header?: ComponentType<CustomHeaderProps>;
    WalletInfo?: ComponentType<WalletHeaderProps<T>>;
    History?: ComponentType<TransactionsHistoryProps<T>>;
  };
};

/**
 * Defines the core props for the WalletInfoModal.
 */
export type WalletInfoModalProps<T extends Transaction> = Pick<
  NovaProviderProps<T>,
  'adapter' | 'connectedAdapterType' | 'connectedWalletAddress' | 'transactionsPool'
> & {
  isOpen?: boolean;
  setIsOpen: (value: boolean) => void;
  customization?: WalletInfoModalCustomization<T>;
};

/**
 * The default header component, can be overridden via customization.
 */
const DefaultHeader = ({ closeModal, title }: CustomHeaderProps & { title: string }) => {
  const { actions } = useLabels();
  return (
    <div className="sticky top-0 left-0 z-10 flex w-full items-center justify-between border-b border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-secondary)] p-4">
      <Dialog.Title className="text-lg font-bold text-[var(--tuwa-text-primary)]">{title}</Dialog.Title>
      <Dialog.Close asChild>
        <button
          type="button"
          onClick={closeModal}
          aria-label={actions.close}
          className="cursor-pointer rounded-full p-1 text-[var(--tuwa-text-tertiary)] transition-colors hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </Dialog.Close>
    </div>
  );
};

/**
 * The main modal component for displaying wallet information and transaction history.
 * It is highly customizable and built with accessibility in mind using Radix UI.
 */
export function WalletInfoModal<T extends Transaction>({
  isOpen,
  setIsOpen,
  customization,
  adapter,
  connectedAdapterType,
  connectedWalletAddress,
  transactionsPool,
}: WalletInfoModalProps<T>) {
  const { walletModal } = useLabels();

  const { explorerUrl } = useMemo(() => {
    if (!connectedAdapterType) return { explorerUrl: undefined };
    const foundAdapter = selectAdapterByKey({ adapterKey: connectedAdapterType, adapter });
    return { explorerUrl: foundAdapter?.getExplorerUrl(`/address/${connectedWalletAddress}`) };
  }, [connectedAdapterType, adapter, connectedWalletAddress]);

  const closeModal = () => setIsOpen(false);

  const defaultMotionProps: MotionProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };
  const motionProps = { ...defaultMotionProps, ...customization?.motionProps };

  const CustomHeader = customization?.components?.Header;
  const CustomWalletInfo = customization?.components?.WalletInfo;
  const CustomHistory = customization?.components?.History;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/45"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none"
                {...customization?.modalProps}
                asChild
              >
                <motion.div {...motionProps}>
                  <div
                    className={cn(
                      'relative max-h-[98dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--tuwa-bg-secondary)] shadow-xl outline-none',
                      customization?.classNames?.contentWrapper,
                    )}
                  >
                    {/* Header */}
                    {CustomHeader ? (
                      <CustomHeader closeModal={closeModal} />
                    ) : (
                      <DefaultHeader closeModal={closeModal} title={walletModal.title} />
                    )}

                    {/* Body */}
                    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                      {CustomWalletInfo ? (
                        <CustomWalletInfo
                          adapter={adapter}
                          connectedAdapterType={connectedAdapterType}
                          walletAddress={connectedWalletAddress}
                          explorerUrl={explorerUrl}
                        />
                      ) : (
                        <WalletHeader
                          adapter={adapter}
                          connectedAdapterType={connectedAdapterType}
                          walletAddress={connectedWalletAddress}
                          explorerUrl={explorerUrl}
                        />
                      )}

                      {CustomHistory ? (
                        <CustomHistory
                          adapter={adapter}
                          transactionsPool={transactionsPool}
                          connectedWalletAddress={connectedWalletAddress}
                        />
                      ) : (
                        <TransactionsHistory
                          adapter={adapter}
                          transactionsPool={transactionsPool}
                          connectedWalletAddress={connectedWalletAddress}
                        />
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
