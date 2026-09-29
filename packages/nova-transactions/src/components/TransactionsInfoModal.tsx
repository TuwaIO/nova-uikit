/**
 * @file This file contains the main `TransactionsInfoModal` component, which serves as the primary UI
 * for viewing wallet details and transaction history.
 */

import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { Transaction, TxInMemoryPagination } from '@tuwaio/pulsar-core';
import { ComponentPropsWithoutRef, ComponentType } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { TransactionsHistory, TransactionsHistoryProps } from './TransactionsHistory';

/** Props of the header of {@link TransactionsInfoModal} (`customization.components.Header`). */
export type TransactionsInfoModalHeaderProps = {
  /** Closes the modal. */
  closeModal: () => void;
};

/**
 * Props, class names and replacement components for the parts of {@link TransactionsInfoModal}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type TransactionsInfoModalCustomization<T extends Transaction> = {
  /** Props passed to the dialog panel (`DialogContent` from `@tuwaio/nova-core`). */
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
  /** Components that replace the default parts. */
  components?: {
    /** The header with the title and the close button. */
    Header?: ComponentType<TransactionsInfoModalHeaderProps>;
    /** The transaction list. */
    History?: ComponentType<TransactionsHistoryProps<T>>;
  };
};

/**
 * Props of {@link TransactionsInfoModal}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type TransactionsInfoModalProps<T extends Transaction> = Pick<
  NovaTransactionsProviderProps<T>,
  'adapter' | 'connectedAdapterType' | 'connectedWalletAddress' | 'transactionsPool'
> & {
  /** Whether the modal is open. */
  isOpen?: boolean;
  /**
   * Opens or closes the modal.
   *
   * @param value - `false` when the modal is closed.
   */
  setIsOpen: (value: boolean) => void;
  /** Props, class names and replacement components for the parts of the modal. */
  customization?: TransactionsInfoModalCustomization<T>;
  /** Pagination state for infinite scroll, forwarded to TransactionsHistory. */
  pagination?: TxInMemoryPagination;
  /** Optional transaction key to open directly in detail view */
  selectedTxKey?: string | null;
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
}: TransactionsInfoModalHeaderProps & { title: string; classNames?: DefaultHeaderClassNames }) => {
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
            'novatx:cursor-pointer novatx:rounded-[var(--tuwa-rounded-corners)] novatx:p-1 novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]',
            classNames?.closeButton,
          )}
        >
          <CloseIcon />
        </button>
      </DialogClose>
    </DialogHeader>
  );
};

/**
 * A modal with the transaction history of the connected wallet ({@link TransactionsHistory}).
 * `NovaTransactionsProvider`
 * opens it from the toasts and the tracking modal.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 * @param props - See {@link TransactionsInfoModalProps}.
 * @returns The modal.
 */
export function TransactionsInfoModal<T extends Transaction>({
  isOpen,
  setIsOpen,
  customization,
  adapter,
  connectedWalletAddress,
  transactionsPool,
  pagination,
  selectedTxKey,
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
            'novatx:relative novatx:max-h-[100dvh] novatx:w-full novatx:flex novatx:flex-col',
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
              pagination={pagination}
            />
          ) : (
            <TransactionsHistory
              adapter={adapter}
              transactionsPool={transactionsPool}
              connectedWalletAddress={connectedWalletAddress}
              customization={customization?.historyCustomization}
              pagination={pagination}
              initialTxKey={selectedTxKey}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
