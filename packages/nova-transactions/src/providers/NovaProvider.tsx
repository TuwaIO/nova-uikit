/**
 * @file This file contains the main `NovaProvider` component, which is the root
 * for the Nova UI library. It should be placed at the top level of your application
 * to orchestrate modals, toasts, and internationalization.
 */

import { deepMerge, useMediaQuery } from '@tuwaio/nova-core';
import {
  ITxTrackingStore,
  Transaction,
  TransactionAdapter,
  TransactionPool,
  TransactionStatus,
  TxAdapter,
} from '@tuwaio/pulsar-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast, ToastContainer, ToastContainerProps, ToastContentProps, TypeOptions } from 'react-toastify';

import {
  ToastCloseButton,
  ToastTransaction,
  ToastTransactionCustomization,
  TrackingTxModal,
  TrackingTxModalCustomization,
  WalletInfoModal,
  WalletInfoModalCustomization,
} from '../components';
import { defaultLabels } from '../i18n/en';
import { TuwaLabels } from '../i18n/types';
import { LabelsProvider } from './LabelsProvider';

/**
 * Maps a transaction's final status to the corresponding toast type for visual feedback.
 */
const STATUS_TO_TOAST_TYPE: Record<string, TypeOptions> = {
  [TransactionStatus.Success]: 'success',
  [TransactionStatus.Failed]: 'error',
  [TransactionStatus.Replaced]: 'info',
};

/**
 * Defines the props for the NovaProvider component.
 */
export type NovaProviderProps<T extends Transaction> = {
  adapter: TxAdapter<T> | TxAdapter<T>[];
  connectedWalletAddress?: string;
  connectedAdapterType?: TransactionAdapter;
  transactionsPool: TransactionPool<T>;
  labels?: Partial<TuwaLabels>;
  features?: {
    toasts?: boolean;
    walletInfoModal?: boolean;
    trackingTxModal?: boolean;
  };
  customization?: {
    toast?: ToastTransactionCustomization<T>;
    walletInfoModal?: WalletInfoModalCustomization<T>;
    trackingTxModal?: TrackingTxModalCustomization<T>;
  };
} & Pick<ITxTrackingStore<T>, 'closeTxTrackedModal' | 'handleTransaction' | 'initialTx'> &
  ToastContainerProps;

/**
 * The main component for the Nova UI ecosystem. It renders and orchestrates all
 * UI elements like toasts and modals, and provides the i18n context.
 */
export function NovaProvider<T extends Transaction>({
  adapter,
  connectedWalletAddress,
  connectedAdapterType,
  transactionsPool,
  initialTx,
  handleTransaction,
  closeTxTrackedModal,
  labels,
  features,
  customization,
  ...toastProps
}: NovaProviderProps<T>) {
  const [isWalletInfoModalOpen, setIsWalletInfoModalOpen] = useState(false);
  const prevTransactionsRef = useRef<TransactionPool<T>>(transactionsPool);

  const isMobile = useMediaQuery('(max-width: 767px)');

  const enabledFeatures = useMemo(
    () => ({
      toasts: features?.toasts ?? true,
      walletInfoModal: features?.walletInfoModal ?? true,
      trackingTxModal: features?.trackingTxModal ?? true,
    }),
    [features],
  );

  const mergedLabels = useMemo(() => deepMerge(defaultLabels, labels || {}), [labels]);

  // Memoized function to show or update a toast.
  const showOrUpdateToast = useCallback(
    (tx: T) => {
      if (!enabledFeatures.toasts) return;

      const type = tx.pending ? 'info' : (STATUS_TO_TOAST_TYPE[tx.status!] ?? 'info');

      const content = (props: ToastContentProps) => (
        <ToastTransaction
          {...props}
          tx={tx}
          openWalletInfoModal={enabledFeatures.walletInfoModal ? () => setIsWalletInfoModalOpen(true) : undefined}
          customization={customization?.toast}
          adapter={adapter}
          connectedWalletAddress={connectedWalletAddress}
        />
      );

      if (toast.isActive(tx.txKey)) {
        toast.update(tx.txKey, { render: content, type });
      } else {
        toast(content, { toastId: tx.txKey, type, closeOnClick: false });
      }
    },
    [transactionsPool, enabledFeatures, customization?.toast, adapter, connectedWalletAddress],
  );

  // Effect 1: Handles toasts for NEW or CHANGED transactions.
  useEffect(() => {
    const prevPool = prevTransactionsRef.current;

    Object.values(transactionsPool).forEach((currentTx) => {
      const prevTx = prevPool[currentTx.txKey];

      // Case 1: A new transaction is added and is pending.
      if (!prevTx && currentTx.pending) {
        showOrUpdateToast(currentTx);
        return;
      }

      // Case 2: An existing transaction has been updated.
      if (prevTx && JSON.stringify(prevTx) !== JSON.stringify(currentTx)) {
        showOrUpdateToast(currentTx);
      }
    });

    prevTransactionsRef.current = transactionsPool;
  }, [transactionsPool, showOrUpdateToast]);

  // Effect 2: Handles toast UPDATES when the connected wallet address changes.
  useEffect(() => {
    // This ensures that visible toasts re-render to show/hide wallet-specific actions
    // like "Speed Up", even for completed transactions.
    Object.values(transactionsPool).forEach((tx) => {
      if (toast.isActive(tx.txKey)) {
        showOrUpdateToast(tx);
      }
    });
  }, [connectedWalletAddress, showOrUpdateToast, transactionsPool]);

  const isTrackingModalOpen =
    !!initialTx?.withTrackedModal && transactionsPool[initialTx?.lastTxKey ?? '']?.isTrackedModalOpen;

  const shouldShowToasts = enabledFeatures.toasts && (!isMobile || (!isTrackingModalOpen && !isWalletInfoModalOpen));

  return (
    <LabelsProvider labels={mergedLabels}>
      {shouldShowToasts && (
        <ToastContainer
          position="bottom-right"
          stacked
          autoClose={false}
          hideProgressBar
          closeOnClick={false}
          icon={false}
          closeButton={ToastCloseButton}
          toastClassName="!p-0 !bg-transparent !shadow-none !min-h-0"
          {...toastProps}
        />
      )}

      {enabledFeatures.walletInfoModal && (
        <WalletInfoModal
          isOpen={isWalletInfoModalOpen}
          setIsOpen={setIsWalletInfoModalOpen}
          customization={customization?.walletInfoModal}
          adapter={adapter}
          connectedWalletAddress={connectedWalletAddress}
          connectedAdapterType={connectedAdapterType}
          transactionsPool={transactionsPool}
        />
      )}

      {enabledFeatures.trackingTxModal && (
        <TrackingTxModal
          initialTx={initialTx}
          onClose={closeTxTrackedModal}
          onOpenWalletInfo={() => setIsWalletInfoModalOpen(true)}
          transactionsPool={transactionsPool}
          customization={customization?.trackingTxModal}
          handleTransaction={handleTransaction}
          adapter={adapter}
          connectedWalletAddress={connectedWalletAddress}
        />
      )}
    </LabelsProvider>
  );
}
