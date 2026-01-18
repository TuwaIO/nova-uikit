/**
 * @file This file contains the main `NovaTransactionsProvider` component, which is the root
 * for the Nova UI library. It should be placed at the top level of your application
 * to orchestrate modals, toasts, and internationalization.
 */

import { deepMerge, ToastCloseButton, ToastCloseButtonProps, useMediaQuery } from '@tuwaio/nova-core';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { ITxTrackingStore, Transaction, TransactionPool, TransactionStatus, TxAdapter } from '@tuwaio/pulsar-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast, ToastContainer, ToastContainerProps, ToastContentProps, TypeOptions } from 'react-toastify';

import {
  ToastTransaction,
  ToastTransactionCustomization,
  TrackingTxModal,
  TrackingTxModalCustomization,
  TransactionsInfoModal,
  TransactionsInfoModalCustomization,
} from '../components';
import { defaultLabels } from '../i18n/en';
import { NovaTransactionsLabels } from '../i18n/types';
import { NovaTransactionsLabelsProvider } from './NovaTransactionsLabelsProvider';

/**
 * Maps a transaction's final status to the corresponding toast type for visual feedback.
 */
const STATUS_TO_TOAST_TYPE: Record<string, TypeOptions> = {
  [TransactionStatus.Success]: 'success',
  [TransactionStatus.Failed]: 'error',
  [TransactionStatus.Replaced]: 'info',
};

/**
 * Defines the props for the NovaTransactionsProvider component.
 */
export type NovaTransactionsProviderProps<T extends Transaction> = {
  adapter: TxAdapter<T> | TxAdapter<T>[];
  connectedWalletAddress?: string;
  connectedAdapterType?: OrbitAdapter;
  transactionsPool: TransactionPool<T>;
  labels?: Partial<NovaTransactionsLabels>;
  features?: {
    toasts?: boolean;
    transactionsModal?: boolean;
    trackingTxModal?: boolean;
  };
  customization?: {
    toast?: ToastTransactionCustomization<T>;
    toastCloseButton?: Omit<ToastCloseButtonProps, 'closeToast'>;
    transactionsInfoModal?: TransactionsInfoModalCustomization<T>;
    trackingTxModal?: TrackingTxModalCustomization<T>;
  };
} & Pick<ITxTrackingStore<T>, 'closeTxTrackedModal' | 'executeTxAction' | 'initialTx'> &
  Omit<ToastContainerProps, 'containerId'>;

/**
 * The main component for the Nova UI ecosystem. It renders and orchestrates all
 * UI elements like toasts and modals, and provides the i18n context.
 */
export function NovaTransactionsProvider<T extends Transaction>({
  adapter,
  connectedWalletAddress,
  connectedAdapterType,
  transactionsPool,
  initialTx,
  executeTxAction,
  closeTxTrackedModal,
  labels,
  features,
  customization,
  ...toastProps
}: NovaTransactionsProviderProps<T>) {
  const [isTransactionsInfoModalOpen, setIsTransactionsInfoModalOpen] = useState(false);
  const prevTransactionsRef = useRef<TransactionPool<T>>(transactionsPool);

  const toastContainerId = 'nova-transactions';

  const isMobile = useMediaQuery('(max-width: 767px)');

  const enabledFeatures = useMemo(
    () => ({
      toasts: features?.toasts ?? true,
      transactionsModal: features?.transactionsModal ?? true,
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
          openTxInfoModal={enabledFeatures.transactionsModal ? () => setIsTransactionsInfoModalOpen(true) : undefined}
          customization={customization?.toast}
          adapter={adapter}
          connectedWalletAddress={connectedWalletAddress}
        />
      );

      if (toast.isActive(tx.txKey)) {
        toast.update(tx.txKey, { render: content, type, containerId: toastContainerId });
      } else {
        toast(content, { toastId: tx.txKey, type, closeOnClick: false, containerId: toastContainerId });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Effect 2: Handles toast UPDATES when the connected wallet address change.
  useEffect(() => {
    // This ensures that visible toasts re-render to show/hide wallet-specific actions
    // like "Speed Up", even for completed transactions.
    Object.values(transactionsPool).forEach((tx) => {
      if (toast.isActive(tx.txKey, toastContainerId)) {
        showOrUpdateToast(tx);
      }
    });
  }, [connectedWalletAddress, showOrUpdateToast, transactionsPool]);

  const isTrackingModalOpen =
    !!initialTx?.withTrackedModal && transactionsPool[initialTx?.lastTxKey ?? '']?.isTrackedModalOpen;

  const shouldShowToasts =
    enabledFeatures.toasts && (!isMobile || (!isTrackingModalOpen && !isTransactionsInfoModalOpen));

  // Create customized close button component
  const CustomizedCloseButton = useMemo(() => {
    const closeButtonCustomization = customization?.toastCloseButton;
    if (!closeButtonCustomization) return ToastCloseButton;

    // Return a wrapper component that passes customization props
    return ({ closeToast }: { closeToast?: (e: React.MouseEvent<HTMLElement>) => void }) => (
      <ToastCloseButton closeToast={closeToast} {...closeButtonCustomization} />
    );
  }, [customization?.toastCloseButton]);

  return (
    <NovaTransactionsLabelsProvider labels={mergedLabels}>
      {shouldShowToasts && (
        <ToastContainer
          position="bottom-right"
          stacked
          autoClose={false}
          hideProgressBar
          closeOnClick={false}
          icon={false}
          closeButton={CustomizedCloseButton}
          containerId={toastContainerId}
          toastClassName="novatx:!p-0 novatx:!bg-transparent novatx:!shadow-none novatx:!min-h-0"
          {...toastProps}
        />
      )}

      {enabledFeatures.transactionsModal && (
        <TransactionsInfoModal
          isOpen={isTransactionsInfoModalOpen}
          setIsOpen={setIsTransactionsInfoModalOpen}
          customization={customization?.transactionsInfoModal}
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
          onOpenAllTransactions={() => setIsTransactionsInfoModalOpen(true)}
          transactionsPool={transactionsPool}
          customization={customization?.trackingTxModal}
          executeTxAction={executeTxAction}
          adapter={adapter}
          connectedWalletAddress={connectedWalletAddress}
        />
      )}
    </NovaTransactionsLabelsProvider>
  );
}
