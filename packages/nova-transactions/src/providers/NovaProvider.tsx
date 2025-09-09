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
  TxActions,
  TxAdapter,
} from '@tuwaio/pulsar-core';
import { useEffect, useMemo, useRef, useState } from 'react';
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
 * @template TR - The type of the tracker identifier.
 * @template T - The transaction type.
 * @template A - The type of the key returned by an action function.
 */
export type NovaProviderProps<TR, T extends Transaction<TR>, A> = {
  /** An array of configured adapters for different blockchain ecosystems. */
  adapters: TxAdapter<TR, T, A>[];
  /** The address of the currently connected wallet. */
  connectedWalletAddress?: string;
  /** The adapter type of the currently connected wallet. */
  connectedAdapterType?: TransactionAdapter;
  /** The global transaction pool from the Pulsar store. */
  transactionsPool: TransactionPool<TR, T>;
  /** A registry of retryable actions, keyed by `actionKey`. */
  actions?: TxActions;
  /** A partial object of labels to override the default English text. */
  labels?: Partial<TuwaLabels>;
  /** An object to enable or disable major UI features. All are enabled by default. */
  features?: {
    toasts?: boolean;
    walletInfoModal?: boolean;
    trackingTxModal?: boolean;
  };
  /** A single object to pass down deep customization options to all child components. */
  customization?: {
    toast?: ToastTransactionCustomization<TR, T, A>;
    walletInfoModal?: WalletInfoModalCustomization<TR, T, A>;
    trackingTxModal?: TrackingTxModalCustomization<TR, T, A>;
  };
} & Pick<ITxTrackingStore<TR, T, A>, 'closeTxTrackedModal' | 'handleTransaction' | 'initialTx'> &
  ToastContainerProps;

/**
 * The main component for the Nova UI ecosystem. It renders and orchestrates all
 * UI elements like toasts and modals, and provides the i18n context.
 * This component does not wrap any children.
 */
export function NovaProvider<TR, T extends Transaction<TR>, A>({
  adapters,
  connectedWalletAddress,
  connectedAdapterType,
  transactionsPool,
  initialTx,
  handleTransaction,
  closeTxTrackedModal,
  actions,
  labels,
  features,
  customization,
  ...toastProps
}: NovaProviderProps<TR, T, A>) {
  const [isWalletInfoModalOpen, setIsWalletInfoModalOpen] = useState(false);
  const prevTransactionsRef = useRef<TransactionPool<TR, T>>(transactionsPool);

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

  useEffect(() => {
    if (!enabledFeatures.toasts) return;

    const showOrUpdateToast = (tx: T) => {
      const type = tx.pending ? 'info' : (STATUS_TO_TOAST_TYPE[tx.status!] ?? 'info');

      const content = (props: ToastContentProps) => (
        <ToastTransaction
          {...props}
          transactionsPool={transactionsPool}
          tx={tx}
          openWalletInfoModal={enabledFeatures.walletInfoModal ? () => setIsWalletInfoModalOpen(true) : undefined}
          customization={customization?.toast}
          adapters={adapters}
          connectedWalletAddress={connectedWalletAddress}
        />
      );

      if (toast.isActive(tx.txKey)) {
        toast.update(tx.txKey, { render: content, type });
      } else {
        toast(content, { toastId: tx.txKey, type, closeOnClick: false });
      }
    };

    const prevPool = prevTransactionsRef.current;

    Object.values(transactionsPool).forEach((currentTx) => {
      const prevTx = prevPool[currentTx.txKey];

      if (!prevTx) {
        if (currentTx.pending) {
          showOrUpdateToast(currentTx);
        }
        return;
      }

      if (JSON.stringify(prevTx) !== JSON.stringify(currentTx)) {
        showOrUpdateToast(currentTx);
      }
    });

    prevTransactionsRef.current = transactionsPool;
  }, [transactionsPool, adapters, customization?.toast, enabledFeatures, connectedWalletAddress]);

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
          transactionsPool={transactionsPool}
          isOpen={isWalletInfoModalOpen}
          setIsOpen={setIsWalletInfoModalOpen}
          customization={customization?.walletInfoModal}
          adapters={adapters}
          connectedWalletAddress={connectedWalletAddress}
          connectedAdapterType={connectedAdapterType}
        />
      )}

      {enabledFeatures.trackingTxModal && (
        <TrackingTxModal
          initialTx={initialTx}
          onClose={closeTxTrackedModal}
          onOpenWalletInfo={() => setIsWalletInfoModalOpen(true)}
          transactionsPool={transactionsPool}
          customization={customization?.trackingTxModal}
          actions={actions}
          handleTransaction={handleTransaction}
          adapters={adapters}
          connectedWalletAddress={connectedWalletAddress}
        />
      )}
    </LabelsProvider>
  );
}
