/**
 * @file This file contains the `ToastTransaction` component, which serves as the main body for a transaction notification toast.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { getChainName } from '@bgd-labs/react-web3-icons/dist/utils';
import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey, setChainId } from '@tuwaio/orbit-core';
import { Transaction } from '@tuwaio/pulsar-core';
import { ComponentType, JSX, ReactNode } from 'react';
import { ToastContainerProps, ToastContentProps } from 'react-toastify';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { StatusAwareText, StatusAwareTextProps } from './StatusAwareText';
import { TransactionKey, TransactionKeyProps } from './TransactionKey';
import { TransactionStatusBadge, TransactionStatusBadgeProps } from './TransactionStatusBadge';

type CustomActionButtonProps = { onClick: () => void; children: ReactNode };

export type ToastTransactionCustomization<T extends Transaction> = {
  components?: {
    StatusAwareText?: ComponentType<StatusAwareTextProps>;
    TransactionKey?: ComponentType<TransactionKeyProps<T>>;
    StatusBadge?: ComponentType<TransactionStatusBadgeProps<T>>;
    TxInfoButton?: ComponentType<CustomActionButtonProps>;
    SpeedUpButton?: ComponentType<CustomActionButtonProps>;
    CancelButton?: ComponentType<CustomActionButtonProps>;
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

const DefaultSpeedUpButton = ({ onClick, children }: CustomActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className="novatx:cursor-pointer novatx:text-sm novatx:font-medium novatx:text-[var(--tuwa-text-accent)] novatx:transition-opacity novatx:hover:opacity-80"
  >
    {children}
  </button>
);

const DefaultCancelButton = ({ onClick, children }: CustomActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className="novatx:cursor-pointer novatx:text-sm novatx:font-medium novatx:text-[var(--tuwa-text-secondary)] novatx:transition-opacity novatx:hover:opacity-80"
  >
    {children}
  </button>
);

const DefaultTxInfoButton = ({ onClick, children }: CustomActionButtonProps) => (
  <button
    className="novatx:cursor-pointer novatx:rounded-md novatx:bg-gradient-to-r novatx:from-[var(--tuwa-button-gradient-from)] novatx:to-[var(--tuwa-button-gradient-to)] novatx:px-3 novatx:py-1 novatx:text-xs novatx:font-bold novatx:text-[var(--tuwa-text-on-accent)] novatx:shadow-lg novatx:transition-all novatx:duration-200 novatx:ease-in-out novatx:hover:shadow-xl novatx:hover:from-[var(--tuwa-button-gradient-from-hover)] novatx:hover:to-[var(--tuwa-button-gradient-to-hover)] novatx:active:scale-95"
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

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

  return (
    <div
      className={cn(
        'novatx:flex novatx:w-full novatx:flex-col novatx:gap-3 novatx:rounded-lg novatx:bg-[var(--tuwa-bg-primary)] novatx:p-4 novatx:shadow-md',
        className,
      )}
    >
      <div className="novatx:flex novatx:items-center novatx:gap-3">
        <div
          className="novatx:w-[40px] novatx:flex-shrink-0 [&>img]:novatx:w-full [&>img]:novatx:h-auto"
          title={getChainName(setChainId(tx.chainId))}
        >
          {icon ?? <Web3Icon chainId={setChainId(tx.chainId)} />}
        </div>
        <div className="novatx:flex-1">
          <CStatusAwareText txStatus={tx.status} source={tx.title} fallback={tx.type} variant="title" applyColor />
          <CStatusAwareText txStatus={tx.status} source={tx.description} variant="description" />
        </div>
      </div>

      <div>
        <CTransactionKey adapter={adapter} tx={tx} variant="toast" />
        <div className="novatx:mt-3 novatx:flex novatx:items-center novatx:justify-between">
          <CStatusBadge tx={tx} />

          {canBeReplaced ? (
            <div className="novatx:flex novatx:items-center novatx:gap-4">
              <SpeedUpButton onClick={handleSpeedUp}>{actions.speedUp}</SpeedUpButton>
              <CancelButton onClick={handleCancel}>{actions.cancel}</CancelButton>
            </div>
          ) : (
            openTxInfoModal &&
            !!connectedWalletAddress && (
              <TxInfoButton onClick={openTxInfoModal}>{toast.openTransactionsInfo}</TxInfoButton>
            )
          )}
        </div>
      </div>
    </div>
  );
}
