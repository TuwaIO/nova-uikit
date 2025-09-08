/**
 * @file This file contains the `ToastTransaction` component, which serves as the main body for a transaction notification toast.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { getChainName } from '@bgd-labs/react-web3-icons/dist/utils';
import { cn } from '@tuwaio/nova-core';
import { selectAdapterByKey, Transaction, TransactionAdapter } from '@tuwaio/pulsar-core';
import { JSX, ReactNode } from 'react';
import { ToastContainerProps, ToastContentProps } from 'react-toastify';

import { NovaProviderProps, useLabels } from '../providers';
import { StatusAwareText } from './StatusAwareText';
import { TransactionKey } from './TransactionKey';
import { TransactionStatusBadge } from './TransactionStatusBadge';

// --- Prop Types for Customization ---
type CustomStatusAwareTextProps = Parameters<typeof StatusAwareText>[0];
type CustomTransactionKeyProps<TR, T extends Transaction<TR>, A> = Parameters<typeof TransactionKey<TR, T, A>>[0];
type CustomStatusBadgeProps<TR, T extends Transaction<TR>> = Parameters<typeof TransactionStatusBadge<TR, T>>[0];
/** Props provided to custom action buttons like 'Wallet Info', 'Speed Up', or 'Cancel'. */
type CustomActionButtonProps = { onClick: () => void; children: ReactNode };

/**
 * Defines the structure for the `customization` prop, allowing users to override
 * default sub-components with their own implementations.
 */
export type ToastTransactionCustomization<TR, T extends Transaction<TR>, A> = {
  components?: {
    /** Override the default title/description component. */
    statusAwareText?: (props: CustomStatusAwareTextProps) => ReactNode;
    /** Override the default component for displaying transaction keys/hashes. */
    transactionKey?: (props: CustomTransactionKeyProps<TR, T, A>) => ReactNode;
    /** Override the default status badge component. */
    statusBadge?: (props: CustomStatusBadgeProps<TR, T>) => ReactNode;
    /** Override the default "Open wallet info" button. */
    walletInfoButton?: (props: CustomActionButtonProps) => ReactNode;
    /** Override the default "Speed Up" button. */
    speedUpButton?: (props: CustomActionButtonProps) => ReactNode;
    /** Override the default "Cancel" button. */
    cancelButton?: (props: CustomActionButtonProps) => ReactNode;
  };
};

export type ToastTransactionProps<TR, T extends Transaction<TR>, A> = {
  /** The transaction object to display in the toast. */
  tx: T;
  /** A function to open the main wallet info modal. If not provided, the button will not be rendered. */
  openWalletInfoModal?: (value: boolean) => void;
  /** An optional custom icon to display instead of the default chain icon. */
  icon?: ReactNode;
  /** Optional additional CSS classes for the toast container. */
  className?: string;
  /** An object to customize and override the default internal components. */
  customization?: ToastTransactionCustomization<TR, T, A>;

  /** Props from `react-toastify` to control the toast itself. */
  closeToast?: ToastContentProps['closeToast'];
  toastProps?: ToastContainerProps;
} & Pick<NovaProviderProps<TR, T, A>, 'transactionsPool' | 'adapters' | 'connectedWalletAddress'>;

/**
 * A composite component that renders the content for a transaction toast notification.
 * It is highly customizable and includes actions for speeding up or canceling transactions
 * when they are in a pending state.
 *
 * @template TR The generic type for the transaction tracker registry.
 * @template T The generic type for the transaction object.
 * @param {ToastTransactionProps<TR, T>} props The component props.
 * @returns {JSX.Element} The rendered toast body.
 */
export function ToastTransaction<TR, T extends Transaction<TR>, A>({
  openWalletInfoModal,
  tx,
  transactionsPool,
  icon,
  className,
  customization,
  connectedWalletAddress,
  adapters,
}: ToastTransactionProps<TR, T, A>): JSX.Element {
  const labels = useLabels();
  const C = customization?.components; // Shortcut for customization components

  const adapter = selectAdapterByKey({ adapterKey: tx.adapter ?? TransactionAdapter.EVM, adapters });

  // A transaction can be replaced when wallet connected and if it's pending, and has the necessary fee info.
  const canReplace =
    connectedWalletAddress &&
    // TODO: need fix with logic for multiple adapters
    tx?.adapter === TransactionAdapter.EVM &&
    tx.nonce !== undefined &&
    tx.pending &&
    tx.maxFeePerGas &&
    tx.maxPriorityFeePerGas;

  // --- Action Handlers ---
  const handleCancel = async () => {
    if (canReplace && adapter?.cancelTxAction) await adapter.cancelTxAction(tx);
  };

  const handleSpeedUp = async () => {
    if (canReplace && adapter?.speedUpTxAction) await adapter.speedUpTxAction(tx);
  };

  return (
    <div className={cn('flex w-full flex-col gap-3 rounded-lg bg-[var(--tuwa-bg-primary)] p-4 shadow-md', className)}>
      {/* --- Header: Icon + Title/Description --- */}
      <div className="flex items-start gap-3">
        <div className="w-[40px] flex-shrink-0" title={getChainName(tx.chainId as number)}>
          {icon ?? <Web3Icon chainId={tx.chainId as number} />}
        </div>
        <div className="flex-1">
          {C?.statusAwareText ? (
            C.statusAwareText({
              txStatus: tx.status,
              source: tx.title,
              fallback: tx.type,
              variant: 'title',
              applyColor: true,
            })
          ) : (
            <StatusAwareText txStatus={tx.status} source={tx.title} fallback={tx.type} variant="title" applyColor />
          )}
          {C?.statusAwareText ? (
            C.statusAwareText({ txStatus: tx.status, source: tx.description, variant: 'description' })
          ) : (
            <StatusAwareText txStatus={tx.status} source={tx.description} variant="description" />
          )}
        </div>
      </div>

      {/* --- Body: Hashes + Status/Actions --- */}
      <div>
        {C?.transactionKey ? (
          C.transactionKey({ transactionsPool, adapters, tx, variant: 'toast' })
        ) : (
          <TransactionKey transactionsPool={transactionsPool} adapters={adapters} tx={tx} variant="toast" />
        )}
        <div className="mt-3 flex items-center justify-between">
          {C?.statusBadge ? C.statusBadge({ tx }) : <TransactionStatusBadge tx={tx} />}

          {/* Conditionally render Speed Up/Cancel or the Wallet Info button */}
          {canReplace ? (
            <div className="flex items-center gap-4">
              {C?.speedUpButton ? (
                C.speedUpButton({ onClick: handleSpeedUp, children: labels.actions.speedUp })
              ) : (
                <button
                  onClick={handleSpeedUp}
                  type="button"
                  className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-accent)] transition-opacity hover:opacity-80"
                >
                  {labels.actions.speedUp}
                </button>
              )}
              {C?.cancelButton ? (
                C.cancelButton({ onClick: handleCancel, children: labels.actions.cancel })
              ) : (
                <button
                  onClick={handleCancel}
                  type="button"
                  className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-secondary)] transition-opacity hover:opacity-80"
                >
                  {labels.actions.cancel}
                </button>
              )}
            </div>
          ) : (
            connectedWalletAddress &&
            openWalletInfoModal &&
            (C?.walletInfoButton ? (
              C.walletInfoButton({ onClick: () => openWalletInfoModal(true), children: labels.toast.openWalletInfo })
            ) : (
              <button
                className="cursor-pointer bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-[var(--tuwa-text-on-accent)] font-bold text-xs py-1 px-3 rounded-md shadow-lg hover:shadow-xl hover:from-[var(--tuwa-button-gradient-from-hover)] hover:to-[var(--tuwa-button-gradient-to-hover)] active:scale-95 transition-all duration-200 ease-in-out"
                onClick={() => openWalletInfoModal(true)}
                type="button"
              >
                {labels.toast.openWalletInfo}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
