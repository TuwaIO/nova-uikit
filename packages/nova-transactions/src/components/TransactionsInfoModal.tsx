/**
 * @file This file contains the main `TransactionsInfoModal` component, which serves as the primary UI
 * for viewing wallet details and transaction history.
 */

import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { selectAllTransactionsByActiveWallet, Transaction, TxInMemoryPagination } from '@tuwaio/pulsar-core';
import { ComponentPropsWithoutRef, ComponentType, useState } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { headerCloseButtonClassName, HeaderContent, headerTitleClassName } from './HeaderContent';
import { TransactionDetails } from './TransactionDetails';
import { TransactionsHistory, TransactionsHistoryProps } from './TransactionsHistory';

/** Props of the header of {@link TransactionsInfoModal} (`customization.components.Header`). */
export type TransactionsInfoModalHeaderProps = {
  /** Closes the modal. */
  closeModal: () => void;
  /** Goes back from the details of a transaction to the list; `undefined` while the list is shown. */
  onBack?: () => void;
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
    /** Classes for the subtitle under the header title (shown with the details of a transaction) */
    headerSubtitle?: string;
    /** Classes for the back button (shown with the details of a transaction) */
    backButton?: string;
    /** Classes for the close button */
    closeButton?: string;
  };
  /** Customization for TransactionsHistory component; its `detailsCustomization` also applies to the details here. */
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
  subtitle?: string;
  backButton?: string;
  closeButton?: string;
};

const DefaultHeader = ({
  closeModal,
  onBack,
  title,
  subtitle,
  backLabel,
  classNames,
}: TransactionsInfoModalHeaderProps & {
  title: string;
  subtitle?: string;
  backLabel: string;
  classNames?: DefaultHeaderClassNames;
}) => {
  const { actions } = useLabels();
  return (
    <DialogHeader className={cn('novatx:gap-3', classNames?.header)}>
      <HeaderContent
        title={<DialogTitle className={cn(headerTitleClassName, classNames?.title)}>{title}</DialogTitle>}
        subtitle={subtitle}
        onBack={onBack}
        backLabel={backLabel}
        classNames={{ backButton: classNames?.backButton, subtitle: classNames?.subtitle }}
        closeButton={
          <DialogClose asChild>
            <button
              type="button"
              onClick={closeModal}
              aria-label={actions.close}
              title={actions.close}
              className={cn(headerCloseButtonClassName, classNames?.closeButton)}
            >
              <CloseIcon />
            </button>
          </DialogClose>
        }
      />
    </DialogHeader>
  );
};

/**
 * A modal with the transaction history of the connected wallet ({@link TransactionsHistory}) and the details of a
 * transaction ({@link TransactionDetails}): selecting a transaction in the list, or opening the modal with
 * `selectedTxKey`, shows its details under the same header, which then has a back button and the title of the details.
 * The modal opens on the list again after it is closed. Only transactions of `connectedWalletAddress` are shown.
 * `NovaTransactionsProvider` opens it from the toasts and the tracking modal.
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
  const { transactionsModal, transactionDetails } = useLabels();

  // The transaction whose details are shown: the one the modal is opened with, then the one chosen in the list. It is
  // reset to `selectedTxKey` whenever the modal opens or closes or `selectedTxKey` changes.
  const [view, setView] = useState({ isOpen, selectedTxKey, openTxKey: selectedTxKey ?? null });
  let openTxKey = view.openTxKey;
  if (view.isOpen !== isOpen || view.selectedTxKey !== selectedTxKey) {
    openTxKey = selectedTxKey ?? null;
    setView({ isOpen, selectedTxKey, openTxKey });
  }
  const showTx = (txKey: string | null) => setView({ isOpen, selectedTxKey, openTxKey: txKey });

  const openTx =
    openTxKey && connectedWalletAddress
      ? selectAllTransactionsByActiveWallet(transactionsPool, connectedWalletAddress).find(
          (tx) => tx.txKey === openTxKey,
        )
      : undefined;
  const onBack = openTx ? () => showTx(null) : undefined;

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
            <CustomHeader closeModal={closeModal} onBack={onBack} />
          ) : (
            <DefaultHeader
              closeModal={closeModal}
              onBack={onBack}
              title={openTx ? transactionDetails.title : transactionsModal.history.title}
              subtitle={openTx ? transactionDetails.subtitle : undefined}
              backLabel={transactionDetails.back}
              classNames={{
                header: customization?.classNames?.header,
                title: customization?.classNames?.headerTitle,
                subtitle: customization?.classNames?.headerSubtitle,
                backButton: customization?.classNames?.backButton,
                closeButton: customization?.classNames?.closeButton,
              }}
            />
          )}

          {openTx ? (
            <TransactionDetails
              tx={openTx}
              adapter={adapter}
              onBack={() => showTx(null)}
              hideHeader
              customization={customization?.historyCustomization?.detailsCustomization}
            />
          ) : CustomHistory ? (
            <CustomHistory
              adapter={adapter}
              transactionsPool={transactionsPool}
              connectedWalletAddress={connectedWalletAddress}
              customization={customization?.historyCustomization}
              pagination={pagination}
              onSelectTx={showTx}
            />
          ) : (
            <TransactionsHistory
              adapter={adapter}
              transactionsPool={transactionsPool}
              connectedWalletAddress={connectedWalletAddress}
              customization={customization?.historyCustomization}
              pagination={pagination}
              onSelectTx={showTx}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
