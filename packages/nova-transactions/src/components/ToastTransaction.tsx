/**
 * @file This file contains the `ToastTransaction` component, which serves as the main body for a transaction notification toast.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { getChainName } from '@bgd-labs/react-web3-icons/dist/utils';
import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey, Transaction } from '@tuwaio/pulsar-core';
import { ComponentType, JSX, ReactNode } from 'react';
import { ToastContainerProps, ToastContentProps } from 'react-toastify';

import { NovaProviderProps, useLabels } from '../providers';
import { StatusAwareText, StatusAwareTextProps } from './StatusAwareText';
import { TransactionKey, TransactionKeyProps } from './TransactionKey';
import { TransactionStatusBadge, TransactionStatusBadgeProps } from './TransactionStatusBadge';

// --- Prop Types for Customization ---
type CustomActionButtonProps = { onClick: () => void; children: ReactNode };

export type ToastTransactionCustomization<T extends Transaction> = {
  components?: {
    StatusAwareText?: ComponentType<StatusAwareTextProps>;
    TransactionKey?: ComponentType<TransactionKeyProps<T>>;
    StatusBadge?: ComponentType<TransactionStatusBadgeProps<T>>;
    WalletInfoButton?: ComponentType<CustomActionButtonProps>;
    SpeedUpButton?: ComponentType<CustomActionButtonProps>;
    CancelButton?: ComponentType<CustomActionButtonProps>;
  };
};

export type ToastTransactionProps<T extends Transaction> = {
  tx: T;
  openWalletInfoModal?: () => void;
  icon?: ReactNode;
  className?: string;
  customization?: ToastTransactionCustomization<T>;
  closeToast?: ToastContentProps['closeToast'];
  toastProps?: ToastContainerProps;
} & Pick<NovaProviderProps<T>, 'adapter' | 'connectedWalletAddress'>;

// --- Default Sub-Components ---

const DefaultSpeedUpButton = ({ onClick, children }: CustomActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-accent)] transition-opacity hover:opacity-80"
  >
    {children}
  </button>
);

const DefaultCancelButton = ({ onClick, children }: CustomActionButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-secondary)] transition-opacity hover:opacity-80"
  >
    {children}
  </button>
);

const DefaultWalletInfoButton = ({ onClick, children }: CustomActionButtonProps) => (
  <button
    className="cursor-pointer rounded-md bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] px-3 py-1 text-xs font-bold text-[var(--tuwa-text-on-accent)] shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:from-[var(--tuwa-button-gradient-from-hover)] hover:to-[var(--tuwa-button-gradient-to-hover)] active:scale-95"
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

/**
 * A composite component that renders the content for a transaction toast notification.
 * It is highly customizable and leverages the adapter to show relevant actions like "Speed Up".
 */
export function ToastTransaction<T extends Transaction>({
  openWalletInfoModal,
  tx,
  icon,
  className,
  customization,
  connectedWalletAddress,
  adapter,
}: ToastTransactionProps<T>): JSX.Element {
  const { actions, toast } = useLabels();

  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter });

  // A transaction can be replaced only if it's a standard on-chain transaction (not Safe or Gelato),
  // is pending, the adapter supports the actions, and it belongs to the connected wallet.
  const canBeReplaced = !!(
    tx.tracker === 'ethereum' &&
    tx.pending &&
    foundAdapter?.speedUpTxAction &&
    foundAdapter?.cancelTxAction &&
    tx.from.toLowerCase() === connectedWalletAddress?.toLowerCase()
  );

  // --- Action Handlers ---
  const handleCancel = () => {
    if (canBeReplaced) foundAdapter.cancelTxAction!(tx);
  };

  const handleSpeedUp = () => {
    if (canBeReplaced) foundAdapter.speedUpTxAction!(tx);
  };

  // --- Component Overrides ---
  const {
    StatusAwareText: CStatusAwareText = StatusAwareText,
    TransactionKey: CTransactionKey = TransactionKey,
    StatusBadge: CStatusBadge = TransactionStatusBadge,
    SpeedUpButton = DefaultSpeedUpButton,
    CancelButton = DefaultCancelButton,
    WalletInfoButton = DefaultWalletInfoButton,
  } = customization?.components ?? {};

  return (
    <div className={cn('flex w-full flex-col gap-3 rounded-lg bg-[var(--tuwa-bg-primary)] p-4 shadow-md', className)}>
      {/* --- Header: Icon + Title/Description --- */}
      <div className="flex items-start gap-3">
        <div className="w-[40px] flex-shrink-0" title={getChainName(tx.chainId as number)}>
          {icon ?? <Web3Icon chainId={tx.chainId as number} />}
        </div>
        <div className="flex-1">
          <CStatusAwareText txStatus={tx.status} source={tx.title} fallback={tx.type} variant="title" applyColor />
          <CStatusAwareText txStatus={tx.status} source={tx.description} variant="description" />
        </div>
      </div>

      {/* --- Body: Hashes + Status/Actions --- */}
      <div>
        <CTransactionKey adapter={adapter} tx={tx} variant="toast" />
        <div className="mt-3 flex items-center justify-between">
          <CStatusBadge tx={tx} />

          {canBeReplaced ? (
            <div className="flex items-center gap-4">
              <SpeedUpButton onClick={handleSpeedUp}>{actions.speedUp}</SpeedUpButton>
              <CancelButton onClick={handleCancel}>{actions.cancel}</CancelButton>
            </div>
          ) : (
            openWalletInfoModal &&
            !!connectedWalletAddress && (
              <WalletInfoButton onClick={openWalletInfoModal}>{toast.openWalletInfo}</WalletInfoButton>
            )
          )}
        </div>
      </div>
    </div>
  );
}
