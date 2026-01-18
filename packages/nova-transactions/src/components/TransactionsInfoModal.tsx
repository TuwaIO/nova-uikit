/**
 * @file This file contains the main `TransactionsInfoModal` component, which serves as the primary UI
 * for viewing wallet details and transaction history.
 */

import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { Transaction } from '@tuwaio/pulsar-core';
import { ComponentPropsWithoutRef, ComponentType } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { TransactionsHistory, TransactionsHistoryProps } from './TransactionsHistory';

type CustomHeaderProps = { closeModal: () => void };

export type TransactionsInfoModalCustomization<T extends Transaction> = {
  modalProps?: Partial<ComponentPropsWithoutRef<typeof DialogContent>>;
  /** Granular classNames for modal elements */
  classNames?: {
    /** Classes for the content wrapper */
    contentWrapper?: string;
    /** Classes for the header section */
    header?: string;
    /** Classes for the header title */
    headerTitle?: string;
    /** Classes for the close button */
    closeButton?: string;
  };
  /** Customization for TransactionsHistory component */
  historyCustomization?: TransactionsHistoryProps<T>['customization'];
  /** Custom components */
  components?: {
    Header?: ComponentType<CustomHeaderProps>;
    History?: ComponentType<TransactionsHistoryProps<T>>;
  };
};

export type TransactionsInfoModalProps<T extends Transaction> = Pick<
  NovaTransactionsProviderProps<T>,
  'adapter' | 'connectedAdapterType' | 'connectedWalletAddress' | 'transactionsPool'
> & {
  isOpen?: boolean;
  setIsOpen: (value: boolean) => void;
  customization?: TransactionsInfoModalCustomization<T>;
};

type DefaultHeaderClassNames = {
  header?: string;
  title?: string;
  closeButton?: string;
};

const DefaultHeader = ({
  closeModal,
  title,
  classNames,
}: CustomHeaderProps & { title: string; classNames?: DefaultHeaderClassNames }) => {
  const { actions } = useLabels();
  return (
    <DialogHeader className={classNames?.header}>
      <DialogTitle className={classNames?.title}>{title}</DialogTitle>

      <DialogClose asChild>
        <button
          type="button"
          onClick={closeModal}
          aria-label={actions.close}
          className={cn(
            'novatx:cursor-pointer novatx:rounded-full novatx:p-1 novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]',
            classNames?.closeButton,
          )}
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
            <DefaultHeader
              closeModal={closeModal}
              title={transactionsModal.history.title}
              classNames={{
                header: customization?.classNames?.header,
                title: customization?.classNames?.headerTitle,
                closeButton: customization?.classNames?.closeButton,
              }}
            />
          )}

          {CustomHistory ? (
            <CustomHistory
              adapter={adapter}
              transactionsPool={transactionsPool}
              connectedWalletAddress={connectedWalletAddress}
              customization={customization?.historyCustomization}
            />
          ) : (
            <TransactionsHistory
              adapter={adapter}
              transactionsPool={transactionsPool}
              connectedWalletAddress={connectedWalletAddress}
              customization={customization?.historyCustomization}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
