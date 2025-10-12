/**
 * @file This file contains the main `TransactionsInfoModal` component, which serves as the primary UI
 * for viewing wallet details and transaction history.
 */

import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { Transaction } from '@tuwaio/pulsar-core';
import { ComponentPropsWithoutRef, ComponentType } from 'react';

import { NovaProviderProps, useLabels } from '../providers';
import { TransactionsHistory, TransactionsHistoryProps } from './TransactionsHistory';

type CustomHeaderProps = { closeModal: () => void };

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

export type TransactionsInfoModalProps<T extends Transaction> = Pick<
  NovaProviderProps<T>,
  'adapter' | 'connectedAdapterType' | 'connectedWalletAddress' | 'transactionsPool'
> & {
  isOpen?: boolean;
  setIsOpen: (value: boolean) => void;
  customization?: TransactionsInfoModalCustomization<T>;
};

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
          className="novatx:cursor-pointer novatx:rounded-full novatx:p-1
                     novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors
                     novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]"
        >
          <CloseIcon />
        </button>
      </DialogClose>
    </DialogHeader>
  );
};

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
        className={cn('novatx:w-full novatx:sm:max-w-2xl', customization?.modalProps?.className)}
        {...customization?.modalProps}
      >
        <div
          className={cn(
            'novatx:relative novatx:max-h-[95dvh] novatx:w-full novatx:flex novatx:flex-col',
            customization?.classNames?.contentWrapper,
          )}
        >
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
