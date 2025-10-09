/**
 * @file This file contains the main `TransactionsInfoModal` component, which serves as the primary UI
 * for viewing wallet details and transaction history.
 */

import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { Transaction } from '@tuwaio/pulsar-core';
import { ComponentPropsWithoutRef, ComponentType } from 'react';

import { NovaProviderProps, useLabels } from '../providers';
import { TransactionsHistory, TransactionsHistoryProps } from './TransactionsHistory';

// --- Prop Types for Customization ---
type CustomHeaderProps = { closeModal: () => void };

/**
 * Defines the customization options for the TransactionsInfoModal.
 */
export type TransactionsInfoModalCustomization<T extends Transaction> = {
  modalProps?: Partial<ComponentPropsWithoutRef<typeof DialogContent>>;
  classNames?: {
    contentWrapper?: string;
  };
  components?: {
    Header?: ComponentType<CustomHeaderProps>;
    History?: ComponentType<TransactionsHistoryProps<T>>;
  };
};

/**
 * Defines the core props for the TransactionsInfoModal.
 */
export type TransactionsInfoModalProps<T extends Transaction> = Pick<
  NovaProviderProps<T>,
  'adapter' | 'connectedAdapterType' | 'connectedWalletAddress' | 'transactionsPool'
> & {
  isOpen?: boolean;
  setIsOpen: (value: boolean) => void;
  customization?: TransactionsInfoModalCustomization<T>;
};

/**
 * The default header component, customized for TUWA modal styles.
 */
const DefaultHeader = ({ closeModal, title }: CustomHeaderProps & { title: string }) => {
  const { actions } = useLabels();
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>

      <DialogClose asChild>
        <button
          type="button"
          onClick={closeModal}
          aria-label={actions.close}
          className="cursor-pointer rounded-full p-1
                     text-[var(--tuwa-text-tertiary)] transition-colors
                     hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
        >
          <CloseIcon />
        </button>
      </DialogClose>
    </DialogHeader>
  );
};

/**
 * The main modal component for displaying wallet information and transaction history.
 */
export function TransactionsInfoModal<T extends Transaction>({
  isOpen,
  setIsOpen,
  customization,
  adapter,
  connectedWalletAddress,
  transactionsPool,
}: TransactionsInfoModalProps<T>) {
  const { transactionsModal } = useLabels();

  const closeModal = () => setIsOpen(false);

  const CustomHeader = customization?.components?.Header;
  const CustomHistory = customization?.components?.History;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className={cn('w-full sm:max-w-2xl', customization?.modalProps?.className)}
        {...customization?.modalProps}
      >
        <div className={cn('relative max-h-[95dvh] w-full flex flex-col', customization?.classNames?.contentWrapper)}>
          {CustomHeader ? (
            <CustomHeader closeModal={closeModal} />
          ) : (
            <DefaultHeader closeModal={closeModal} title={transactionsModal.history.title} />
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
      </DialogContent>
    </Dialog>
  );
}
