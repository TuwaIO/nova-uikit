/**
 * @file This file contains the `ToastTransaction` component, which serves as the main body for a transaction
 * notification toast.
 */

import { cn, getChainName, NetworkIcon, StatusEdge, StatusEdgeProps } from '@tuwaio/nova-core';
import { selectAdapterByKey, setChainId } from '@tuwaio/orbit-core';
import { Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { ComponentType, JSX, ReactNode } from 'react';
import { ToastContainerProps, ToastContentProps } from 'react-toastify';

import { NovaTransactionsProviderProps, useLabels, useNovaTransactionsError } from '../providers';
import { canReplaceTx, canSpeedUpTx, runReplacement } from '../utils/replacement';
import {
  hasConfirmations,
  isTxOfWallet,
  progressOf,
  toneOf,
  txDescriptionSource,
  txTitleSource,
} from '../utils/txStatus';
import { StatusAwareText, StatusAwareTextProps } from './StatusAwareText';
import { TransactionKey, TransactionKeyProps } from './TransactionKey';
import { TransactionStatusBadge, TransactionStatusBadgeProps } from './TransactionStatusBadge';

/** Props of an action button of {@link ToastTransaction} (speed up, cancel, open transaction). */
export type ToastTransactionActionButtonProps = {
  /** Runs the action. */
  onClick: () => void;
  /** The button label. */
  children: ReactNode;
  /** Classes from `customization.classNames`. */
  className?: string;
};

/**
 * Class names and replacement components for the parts of {@link ToastTransaction}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type ToastTransactionCustomization<T extends Transaction> = {
  /** Components that replace the default parts. */
  components?: {
    /** The strip and the wash of the status color along the top of the toast. */
    StatusEdge?: ComponentType<StatusEdgeProps>;
    /** The title and the description. */
    StatusAwareText?: ComponentType<StatusAwareTextProps>;
    /** The hashes of the transaction. */
    TransactionKey?: ComponentType<TransactionKeyProps<T>>;
    /** The status line at the top, which gets `variant="plain"`. */
    StatusBadge?: ComponentType<TransactionStatusBadgeProps<T>>;
    /** The button that opens the transaction in the history modal. */
    TxInfoButton?: ComponentType<ToastTransactionActionButtonProps>;
    /** The speed-up button. */
    SpeedUpButton?: ComponentType<ToastTransactionActionButtonProps>;
    /** The cancel button. */
    CancelButton?: ComponentType<ToastTransactionActionButtonProps>;
    /**
     * The badge with the number of confirmations, shown next to the status when it is above 0. It also receives `required`
     * (the required confirmations) and `isSuccess`.
     */
    ConfirmationsBadge?: ComponentType<{ count: number | string; className?: string }>;
  };
  /** Granular classNames for all sub-elements */
  classNames?: {
    /** Classes for the toast container */
    container?: string;
    /** Classes for the strip and the wash of the status color */
    statusEdge?: string;
    /** Classes for the status line at the top (status + confirmations) */
    statusLine?: string;
    /** Classes for the header section (icon + content) */
    header?: string;
    /** Classes for the icon wrapper */
    iconWrapper?: string;
    /** Classes for the content wrapper */
    contentWrapper?: string;
    /** Classes for the title text */
    title?: string;
    /** Classes for the description text */
    description?: string;
    /** Classes for the transaction key section */
    transactionKey?: string;
    /** Classes for the default hash label */
    hashLabel?: string;
    /** Classes for the default hash link */
    hashLink?: string;
    /** Classes for the default hash copy button */
    hashCopyButton?: string;
    /** Classes for the original hash label (replaced transactions) */
    originalHashLabel?: string;
    /** Classes for the original hash link (replaced transactions) */
    originalHashLink?: string;
    /** Classes for the original hash copy button (replaced transactions) */
    originalHashCopyButton?: string;
    /** Classes for the footer section */
    footer?: string;
    /** Classes for the status badge container */
    statusBadge?: string;
    /** Classes for the status badge icon */
    statusBadgeIcon?: string;
    /** Classes for the status badge label */
    statusBadgeLabel?: string;
    /** Classes for the actions container */
    actionsContainer?: string;
    /** Classes for the SpeedUp button */
    speedUpButton?: string;
    /** Classes for the Cancel button */
    cancelButton?: string;
    /** Classes for the TxInfo button */
    txInfoButton?: string;
    /** Classes for the confirmations badge */
    confirmationsBadge?: string;
  };
};

/**
 * Props of {@link ToastTransaction}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type ToastTransactionProps<T extends Transaction> = {
  /** The transaction to show. */
  tx: T;
  /**
   * Opens the transaction history modal. The "open transaction" button is shown only when it is set and the connected
   * wallet sent the transaction, also next to speed-up and cancel.
   *
   * @param txKey - Key of the transaction to open.
   */
  openTxInfoModal?: (txKey?: string) => void;
  /** Icon shown on the left. Defaults to the icon of the transaction's network. */
  icon?: ReactNode;
  /** Classes of the toast body. */
  className?: string;
  /** Class names and replacement components for the parts of the toast. */
  customization?: ToastTransactionCustomization<T>;
  /** Accepted because `react-toastify` passes it to toast content; not used by the component. */
  closeToast?: ToastContentProps['closeToast'];
  /** Accepted for compatibility; not used by the component. */
  toastProps?: ToastContainerProps;
} & Pick<NovaTransactionsProviderProps<T>, 'adapter' | 'connectedWalletAddress'>;

const DefaultSpeedUpButton = ({ onClick, children, className }: ToastTransactionActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      'novatx:cursor-pointer novatx:text-sm novatx:font-mono novatx:font-medium novatx:text-[var(--tuwa-text-accent)] novatx:transition-opacity novatx:hover:opacity-80',
      className,
    )}
  >
    {children}
  </button>
);

const DefaultCancelButton = ({ onClick, children, className }: ToastTransactionActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      'novatx:cursor-pointer novatx:text-sm novatx:font-mono novatx:font-medium novatx:text-[var(--tuwa-text-secondary)] novatx:transition-opacity novatx:hover:opacity-80',
      className,
    )}
  >
    {children}
  </button>
);

const DefaultTxInfoButton = ({ onClick, children, className }: ToastTransactionActionButtonProps) => {
  // If custom className provided, use it exclusively. Otherwise use default styles.
  const buttonClassName = className
    ? className
    : 'novatx:cursor-pointer novatx:rounded-[var(--tuwa-rounded-corners)] novatx:bg-[var(--tuwa-button-primary-bg)] novatx:px-3 novatx:py-1 novatx:min-h-[28px] novatx:text-xs novatx:font-mono novatx:font-bold novatx:text-[var(--tuwa-text-on-accent)] novatx:shadow-lg novatx:transition-all novatx:duration-200 novatx:ease-in-out novatx:hover:shadow-xl novatx:hover:bg-[var(--tuwa-button-primary-bg-hover)] novatx:active:scale-95';

  return (
    <button className={buttonClassName} onClick={onClick} type="button">
      {children}
    </button>
  );
};

const DefaultConfirmationsBadge = ({
  count,
  required,
  isSuccess,
  className,
}: {
  count: number | string;
  required?: number;
  isSuccess?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      'novatx:flex novatx:min-w-[18px] novatx:items-center novatx:justify-center novatx:rounded-full novatx:border novatx:px-1.5 novatx:py-0.5 novatx:font-mono novatx:text-[10px] novatx:font-bold novatx:transition-colors novatx:duration-300',
      isSuccess
        ? 'novatx:border-[var(--tuwa-success-icon)]/30 novatx:bg-[var(--tuwa-success-bg)] novatx:text-[var(--tuwa-success-text)]'
        : 'novatx:border-[var(--tuwa-pending-icon)]/30 novatx:bg-[var(--tuwa-pending-bg)]/50 novatx:text-[var(--tuwa-pending-text)]',
      className,
    )}
  >
    {count}
    {required && required > 1 ? `/${required}` : ''}
  </div>
);

/**
 * The body of a transaction toast: a strip in the status color along the top (a glint while pending, filling up with the
 * confirmations when they are counted), the status line with the number of confirmations, the network icon, the title and
 * description (colored by status), and the hashes with explorer links. A change of status morphs the texts and washes the
 * top of the toast in the color of the result. For a pending, unconfirmed EVM transaction sent with MetaMask by the
 * connected wallet, once the tracker has read its nonce and fees, it offers speed-up and cancel (when the adapter has
 * `speedUpTxAction` and `cancelTxAction`), and a refusal of the action is shown through `useNovaTransactionsError`; for
 * transactions of the connected wallet, a button opens the transaction in the history modal. `NovaTransactionsProvider` shows
 * one for every operation.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 * @param props - See {@link ToastTransactionProps}.
 * @returns The toast body.
 */
export function ToastTransaction<T extends Transaction>({
  openTxInfoModal,
  tx,
  icon,
  className,
  customization,
  connectedWalletAddress,
  adapter,
}: ToastTransactionProps<T>): JSX.Element {
  const { actions, toast, transaction } = useLabels();

  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter });

  const { showPreSubmitErrorToast } = useNovaTransactionsError();

  const canBeReplaced = canReplaceTx(tx, foundAdapter, connectedWalletAddress);

  const reportRefusal = (error: unknown) => showPreSubmitErrorToast(error, { title: actions.replacementFailed });

  const handleCancel = () => {
    if (canBeReplaced) void runReplacement(foundAdapter!.cancelTxAction!, tx, reportRefusal);
  };

  const handleSpeedUp = () => {
    if (canBeReplaced) void runReplacement(foundAdapter!.speedUpTxAction!, tx, reportRefusal);
  };

  const {
    StatusEdge: CStatusEdge = StatusEdge,
    StatusAwareText: CStatusAwareText = StatusAwareText,
    TransactionKey: CTransactionKey = TransactionKey,
    StatusBadge: CStatusBadge = TransactionStatusBadge,
    SpeedUpButton = DefaultSpeedUpButton,
    CancelButton = DefaultCancelButton,
    TxInfoButton = DefaultTxInfoButton,
    ConfirmationsBadge = DefaultConfirmationsBadge,
  } = customization?.components ?? {};

  const classNames = customization?.classNames;

  // Next to speed-up and cancel as well: the details are where a transaction that never ends can be left behind
  const canOpenDetails = !!openTxInfoModal && isTxOfWallet(tx, connectedWalletAddress);

  return (
    <div
      className={cn(
        'novatx:relative novatx:flex novatx:w-full novatx:flex-col novatx:gap-3 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:bg-[var(--tuwa-bg-primary)] novatx:p-4 novatx:shadow-md',
        classNames?.container,
        className,
      )}
    >
      <CStatusEdge tone={toneOf(tx)} progress={progressOf(tx)} className={classNames?.statusEdge} />

      {/* The close button of the toast sits at the end of this line */}
      <div
        className={cn(
          'novatx:relative novatx:flex novatx:items-center novatx:gap-2 novatx:pr-6',
          classNames?.statusLine,
        )}
      >
        <CStatusBadge
          tx={tx}
          variant="plain"
          className={classNames?.statusBadge}
          classNames={{
            icon: classNames?.statusBadgeIcon,
            label: classNames?.statusBadgeLabel,
          }}
        />
        {hasConfirmations(tx.confirmations) && (
          <ConfirmationsBadge
            count={tx.confirmations as number | string}
            required={tx.requiredConfirmations}
            isSuccess={tx.status === TransactionStatus.Success}
            className={classNames?.confirmationsBadge}
          />
        )}
      </div>

      <div className={cn('novatx:relative novatx:flex novatx:items-center novatx:gap-3', classNames?.header)}>
        <div
          className={cn('novatx:w-[40px] novatx:flex-shrink-0', classNames?.iconWrapper)}
          title={getChainName(setChainId(tx.chainId)).name}
        >
          {icon ?? <NetworkIcon chainId={setChainId(tx.chainId)} />}
        </div>
        {/* Without min-w-0 a long title widens this box, and its text can no longer tell that it should wrap */}
        <div className={cn('novatx:min-w-0 novatx:flex-1', classNames?.contentWrapper)}>
          <CStatusAwareText
            txStatus={tx.status}
            source={txTitleSource(tx, transaction)}
            variant="title"
            applyColor
            className={classNames?.title}
          />
          <CStatusAwareText
            txStatus={tx.status}
            source={txDescriptionSource(tx, transaction)}
            variant="description"
            className={classNames?.description}
          />
        </div>
      </div>

      <div className="novatx:relative">
        <CTransactionKey
          adapter={adapter}
          tx={tx}
          variant="toast"
          className={classNames?.transactionKey}
          hashLinkClassNames={{
            label: classNames?.hashLabel,
            link: classNames?.hashLink,
            copyButton: classNames?.hashCopyButton,
          }}
          originalHashLinkClassNames={{
            label: classNames?.originalHashLabel,
            link: classNames?.originalHashLink,
            copyButton: classNames?.originalHashCopyButton,
          }}
        />
        {(canBeReplaced || canOpenDetails) && (
          <div
            className={cn(
              'novatx:mt-3 novatx:flex novatx:flex-wrap novatx:items-center novatx:justify-end novatx:gap-x-4 novatx:gap-y-2',
              classNames?.footer,
            )}
          >
            {canBeReplaced && (
              <div className={cn('novatx:flex novatx:items-center novatx:gap-4', classNames?.actionsContainer)}>
                {canSpeedUpTx(tx) && (
                  <SpeedUpButton onClick={handleSpeedUp} className={classNames?.speedUpButton}>
                    {actions.speedUp}
                  </SpeedUpButton>
                )}
                <CancelButton onClick={handleCancel} className={classNames?.cancelButton}>
                  {actions.cancel}
                </CancelButton>
              </div>
            )}
            {canOpenDetails && (
              <TxInfoButton onClick={() => openTxInfoModal(tx.txKey)} className={classNames?.txInfoButton}>
                {toast.openTransaction}
              </TxInfoButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
