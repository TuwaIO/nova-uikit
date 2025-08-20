/**
 * @file This file contains the main `NovaProvider` component, the primary entry point for the UI library.
 */

import { deepMerge, useMediaQuery } from '@tuwaio/nova-core';
import {
  IInitializeTxTrackingStore,
  Transaction,
  TransactionAdapter,
  TransactionPool,
  TransactionStatus,
} from '@tuwaio/pulsar-core';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { toast, ToastContainer, ToastContainerProps, ToastContentProps, TypeOptions } from 'react-toastify';
import { Address, Chain } from 'viem';

import {
  ToastCloseButton,
  ToastTransaction,
  ToastTransactionCustomization,
  TrackingTxModal,
  TrackingTxModalCustomization,
  TrackingTxModalProps,
  WalletInfoModal,
  WalletInfoModalCustomization,
} from '../components';
import { defaultLabels } from '../i18n/en';
import { TuwaLabels } from '../i18n/types';
import { LabelsProvider } from './LabelsProvider';

const STATUS_TO_TOAST_TYPE: Record<string, TypeOptions> = {
  [TransactionStatus.Success]: 'success',
  [TransactionStatus.Failed]: 'error',
  [TransactionStatus.Replaced]: 'info',
};

export type NovaProviderProps<TR, T extends Transaction<TR>> = {
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
    toast?: ToastTransactionCustomization<TR, T>;
    walletInfoModal?: WalletInfoModalCustomization<TR, T>;
    trackingTxModal?: TrackingTxModalCustomization<TR, T>;
  };
  chain?: Chain;
  walletAddress?: string;
} & Pick<IInitializeTxTrackingStore<TR, T>, 'closeTxTrackedModal'> &
  ToastContainerProps &
  Pick<
    TrackingTxModalProps<TR, T>,
    'handleTransaction' | 'actions' | 'config' | 'appChains' | 'transactionsPool' | 'initialTx'
  >;

/**
 * The main provider for the Nova UI ecosystem.
 * It orchestrates toasts, modals, and the i18n context for the entire application.
 *
 * @param {NovaProviderProps<TR, T>} props - The component props.
 * @returns {JSX.Element} The rendered provider.
 */
export function NovaProvider<TR, T extends Transaction<TR>>({
  labels,
  features,
  customization,
  closeTxTrackedModal,
  actions,
  config,
  handleTransaction,
  initialTx,
  appChains,
  transactionsPool,
  walletAddress,
  chain,
  ...toastProps
}: NovaProviderProps<TR, T>): JSX.Element {
  const [isWalletInfoModalOpen, setIsWalletInfoModalOpen] = useState(false);
  const prevTransactionsRef = useRef<TransactionPool<TR, T>>(transactionsPool);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTrackingModalOpen =
    !!initialTx?.withTrackedModal && transactionsPool[initialTx?.lastTxKey ?? '']?.isTrackedModalOpen;

  // Memoize feature flags for stability.
  const enabledFeatures = useMemo(
    () => ({
      toasts: features?.toasts ?? true,
      walletInfoModal: features?.walletInfoModal ?? true,
      trackingTxModal: features?.trackingTxModal ?? true,
    }),
    [features],
  );

  // Merge default and custom labels.
  const mergedLabels = useMemo(() => deepMerge(defaultLabels, labels || {}), [labels]);

  // Effect to handle automatic toast notifications.
  useEffect(() => {
    if (!enabledFeatures.toasts) return;

    const showOrUpdateToast = (tx: T, type: TypeOptions) => {
      const content = (props: ToastContentProps) => (
        <ToastTransaction
          {...props}
          tx={tx}
          transactionsPool={transactionsPool}
          appChains={appChains}
          openWalletInfoModal={enabledFeatures.walletInfoModal ? () => setIsWalletInfoModalOpen(true) : undefined}
          customization={customization?.toast}
          config={config}
        />
      );

      if (toast.isActive(tx.txKey)) {
        toast.update(tx.txKey, { render: content, type });
      } else {
        toast(content, { toastId: tx.txKey, type, closeOnClick: false });
      }
    };

    const prevPool = prevTransactionsRef.current;

    // Compare current pool with the previous one to detect changes.
    Object.values(transactionsPool).forEach((currentTx) => {
      const prevTx = prevPool[currentTx.txKey];
      const statusChanged = prevTx && prevTx.status !== currentTx.status;
      const hashAppeared =
        prevTx &&
        prevTx?.adapter === TransactionAdapter.EVM &&
        !prevTx.hash &&
        currentTx?.adapter === TransactionAdapter.EVM &&
        currentTx.hash;

      // Show toast for new pending transactions.
      if (!prevTx && currentTx.pending) {
        showOrUpdateToast(currentTx, 'info');
      }
      // Update toast for pending transactions and nonce changes.
      if (
        (prevTx && prevTx?.adapter === TransactionAdapter.EVM && prevTx.pending ? prevTx.nonce : undefined) !==
        (currentTx?.adapter === TransactionAdapter.EVM && currentTx.pending ? currentTx?.nonce : undefined)
      ) {
        showOrUpdateToast(currentTx, 'info');
      }
      // Update toast when a final status is reached or a hash appears.
      else if (statusChanged || hashAppeared) {
        const toastType = STATUS_TO_TOAST_TYPE[currentTx.status!] ?? 'info';
        showOrUpdateToast(currentTx, toastType);
      }
    });

    prevTransactionsRef.current = transactionsPool;
  }, [transactionsPool, appChains, customization?.toast, enabledFeatures, config]);

  const shouldShowToasts = enabledFeatures.toasts && (!isMobile || !isTrackingModalOpen);

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
          walletAddress={walletAddress as Address}
          chain={chain}
          isOpen={isWalletInfoModalOpen}
          setIsOpen={setIsWalletInfoModalOpen}
          appChains={appChains}
          customization={customization?.walletInfoModal}
        />
      )}

      {enabledFeatures.trackingTxModal && (
        <TrackingTxModal
          initialTx={initialTx}
          onClose={closeTxTrackedModal}
          onOpenWalletInfo={() => setIsWalletInfoModalOpen(true)}
          appChains={appChains}
          transactionsPool={transactionsPool}
          customization={customization?.trackingTxModal}
          actions={actions}
          config={config}
          handleTransaction={handleTransaction}
        />
      )}
    </LabelsProvider>
  );
}
