/**
 * @file This file contains the `ToastTransaction` component, which serves as the main body for a transaction notification toast.
 */

import { cn, getChainName, NetworkIcon } from '@tuwaio/nova-core';
import { selectAdapterByKey, setChainId } from '@tuwaio/orbit-core';
import { Transaction } from '@tuwaio/pulsar-core';
import { ComponentType, JSX, ReactNode } from 'react';
import { ToastContainerProps, ToastContentProps } from 'react-toastify';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { StatusAwareText, StatusAwareTextProps } from './StatusAwareText';
import { TransactionKey, TransactionKeyProps } from './TransactionKey';
import { TransactionStatusBadge, TransactionStatusBadgeProps } from './TransactionStatusBadge';

type CustomActionButtonProps = { onClick: () => void; children: ReactNode; className?: string };

export type ToastTransactionCustomization<T extends Transaction> = {
  /** Custom components */
  components?: {
    StatusAwareText?: ComponentType<StatusAwareTextProps>;
    TransactionKey?: ComponentType<TransactionKeyProps<T>>;
    StatusBadge?: ComponentType<TransactionStatusBadgeProps<T>>;
    TxInfoButton?: ComponentType<CustomActionButtonProps>;
    SpeedUpButton?: ComponentType<CustomActionButtonProps>;
    CancelButton?: ComponentType<CustomActionButtonProps>;
  };
  /** Granular classNames for all sub-elements */
  classNames?: {
    /** Classes for the toast container */
    container?: string;
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
    /** Classes for the hash label */
    hashLabel?: string;
    /** Classes for the hash link */
    hashLink?: string;
    /** Classes for the hash copy button */
    hashCopyButton?: string;
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
  };
};

export type ToastTransactionProps<T extends Transaction> = {
  tx: T;
  openTxInfoModal?: () => void;
  icon?: ReactNode;
  className?: string;
  customization?: ToastTransactionCustomization<T>;
  closeToast?: ToastContentProps['closeToast'];
  toastProps?: ToastContainerProps;
} & Pick<NovaTransactionsProviderProps<T>, 'adapter' | 'connectedWalletAddress'>;

const DefaultSpeedUpButton = ({ onClick, children, className }: CustomActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      'novatx:cursor-pointer novatx:text-sm novatx:font-medium novatx:text-[var(--tuwa-text-accent)] novatx:transition-opacity novatx:hover:opacity-80',
      className,
    )}
  >
    {children}
  </button>
);

const DefaultCancelButton = ({ onClick, children, className }: CustomActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      'novatx:cursor-pointer novatx:text-sm novatx:font-medium novatx:text-[var(--tuwa-text-secondary)] novatx:transition-opacity novatx:hover:opacity-80',
      className,
    )}
  >
    {children}
  </button>
);

const DefaultTxInfoButton = ({ onClick, children, className }: CustomActionButtonProps) => {
  // If custom className provided, use it exclusively. Otherwise use default styles.
  const buttonClassName = className
    ? className
    : 'novatx:cursor-pointer novatx:rounded-md novatx:bg-gradient-to-r novatx:from-[var(--tuwa-button-gradient-from)] novatx:to-[var(--tuwa-button-gradient-to)] novatx:px-3 novatx:py-1 novatx:text-xs novatx:font-bold novatx:text-[var(--tuwa-text-on-accent)] novatx:shadow-lg novatx:transition-all novatx:duration-200 novatx:ease-in-out novatx:hover:shadow-xl novatx:hover:from-[var(--tuwa-button-gradient-from-hover)] novatx:hover:to-[var(--tuwa-button-gradient-to-hover)] novatx:active:scale-95';

  return (
    <button className={buttonClassName} onClick={onClick} type="button">
      {children}
    </button>
  );
};

export function ToastTransaction<T extends Transaction>({
  openTxInfoModal,
  tx,
  icon,
  className,
  customization,
  connectedWalletAddress,
  adapter,
}: ToastTransactionProps<T>): JSX.Element {
  const { actions, toast } = useLabels();

  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter });

  const canBeReplaced = !!(
    tx.tracker === 'ethereum' &&
    tx.pending &&
    foundAdapter?.speedUpTxAction &&
    foundAdapter?.cancelTxAction &&
    tx.from.toLowerCase() === connectedWalletAddress?.toLowerCase() &&
    ['metamask'].includes(tx.connectorType.split(':')[1])
  );

  const handleCancel = () => {
    if (canBeReplaced) foundAdapter.cancelTxAction!(tx);
  };

  const handleSpeedUp = () => {
    if (canBeReplaced) foundAdapter.speedUpTxAction!(tx);
  };

  const {
    StatusAwareText: CStatusAwareText = StatusAwareText,
    TransactionKey: CTransactionKey = TransactionKey,
    StatusBadge: CStatusBadge = TransactionStatusBadge,
    SpeedUpButton = DefaultSpeedUpButton,
    CancelButton = DefaultCancelButton,
    TxInfoButton = DefaultTxInfoButton,
  } = customization?.components ?? {};

  const classNames = customization?.classNames;

  return (
    <div
      className={cn(
        'novatx:flex novatx:w-full novatx:flex-col novatx:gap-3 novatx:rounded-lg novatx:bg-[var(--tuwa-bg-primary)] novatx:p-4 novatx:shadow-md',
        classNames?.container,
        className,
      )}
    >
      <div className={cn('novatx:flex novatx:items-center novatx:gap-3', classNames?.header)}>
        <div
          className={cn('novatx:w-[40px] novatx:flex-shrink-0', classNames?.iconWrapper)}
          title={getChainName(setChainId(tx.chainId))}
        >
          {icon ?? <NetworkIcon chainId={setChainId(tx.chainId)} />}
        </div>
        <div className={cn('novatx:flex-1', classNames?.contentWrapper)}>
          <CStatusAwareText
            txStatus={tx.status}
            source={tx.title}
            fallback={tx.type}
            variant="title"
            applyColor
            className={classNames?.title}
          />
          <CStatusAwareText
            txStatus={tx.status}
            source={tx.description}
            variant="description"
            className={classNames?.description}
          />
        </div>
      </div>

      <div>
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
        />
        <div className={cn('novatx:mt-3 novatx:flex novatx:items-center novatx:justify-between', classNames?.footer)}>
          <CStatusBadge
            tx={tx}
            className={classNames?.statusBadge}
            classNames={{
              icon: classNames?.statusBadgeIcon,
              label: classNames?.statusBadgeLabel,
            }}
          />

          {canBeReplaced ? (
            <div className={cn('novatx:flex novatx:items-center novatx:gap-4', classNames?.actionsContainer)}>
              <SpeedUpButton onClick={handleSpeedUp} className={classNames?.speedUpButton}>
                {actions.speedUp}
              </SpeedUpButton>
              <CancelButton onClick={handleCancel} className={classNames?.cancelButton}>
                {actions.cancel}
              </CancelButton>
            </div>
          ) : (
            openTxInfoModal &&
            !!connectedWalletAddress && (
              <TxInfoButton onClick={openTxInfoModal} className={classNames?.txInfoButton}>
                {toast.openTransactionsInfo}
              </TxInfoButton>
            )
          )}
        </div>
      </div>
    </div>
  );
}
