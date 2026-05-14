/**
 * @file This file contains the main `NovaTransactionsProvider` component, which is the root
 * for the Nova UI library. It should be placed at the top level of your application
 * to orchestrate modals, toasts, and internationalization.
 */

import { deepMerge, ToastCloseButton, ToastCloseButtonProps, useMediaQuery } from '@tuwaio/nova-core';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import {
  ITxTrackingStore,
  Transaction,
  TransactionPool,
  TransactionStatus,
  TxAdapter,
  TxInMemoryPagination,
} from '@tuwaio/pulsar-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast, ToastContainer, ToastContainerProps, ToastContentProps, TypeOptions } from 'react-toastify';

import {
  ToastTransaction,
  ToastTransactionCustomization,
  ToastValidationError,
  ToastValidationErrorCustomization,
  TrackingTxModal,
  TrackingTxModalCustomization,
  TransactionsInfoModal,
  TransactionsInfoModalCustomization,
} from '../components';
import { defaultLabels } from '../i18n/en';
import { NovaTransactionsLabels } from '../i18n/types';
import { NovaTransactionsErrorContext, VALIDATION_ERROR_CONTAINER_ID } from './NovaTransactionsErrorContext';
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
 * Defines the props for the `NovaTransactionsProvider` component.
 *
 * @template T The specific transaction type, extending the base `Transaction`.
 */
export type NovaTransactionsProviderProps<T extends Transaction> = {
  /** The chain adapter (or array of adapters) passed through to all child components. */
  adapter: TxAdapter<T> | TxAdapter<T>[];
  /** The currently connected wallet address, used to gate certain UI actions. */
  connectedWalletAddress?: string;
  /** The active adapter type, used for chain-specific logic in modals. */
  connectedAdapterType?: OrbitAdapter;
  /** The live transaction pool from the Pulsar store. */
  transactionsPool: TransactionPool<T>;
  /** Partial label overrides for i18n. Merged with the built-in English defaults. */
  labels?: Partial<NovaTransactionsLabels>;
  /**
   * Feature flags to selectively enable or disable UI sub-systems.
   * All features are **enabled** by default.
   */
  features?: {
    /** Enables bottom-right transaction progress toasts. @defaultValue `true` */
    toasts?: boolean;
    /** Enables the full-screen transaction history modal. @defaultValue `true` */
    transactionsModal?: boolean;
    /** Enables the step-by-step tracking modal that opens on submission. @defaultValue `true` */
    trackingTxModal?: boolean;
    /**
     * Enables the top-center pre-submission error toast.
     * This fires when `executeTxAction` throws before the transaction reaches the pool
     * (validation failures, `beforeTxProcess` rejections, missing adapter, etc.).
     * @defaultValue `true`
     */
    validationErrorToast?: boolean;
  };
  /** Customization overrides for individual UI sub-systems. */
  customization?: {
    /** Overrides for the bottom-right transaction progress toast body. */
    toast?: ToastTransactionCustomization<T>;
    /** Overrides for the close button shared by all transaction toasts. */
    toastCloseButton?: Omit<ToastCloseButtonProps, 'closeToast'>;
    /** Overrides for the full-screen transaction history modal. */
    transactionsInfoModal?: TransactionsInfoModalCustomization<T>;
    /** Overrides for the step-by-step tracking modal. */
    trackingTxModal?: TrackingTxModalCustomization<T>;
    /**
     * Overrides for the top-center pre-submission validation error toast.
     * See `ToastValidationErrorCustomization` for available slots.
     */
    validationErrorToast?: ToastValidationErrorCustomization;
  };
  /** Pagination state for infinite scroll, forwarded to TransactionsInfoModal and TransactionsHistory. */
  pagination?: TxInMemoryPagination;
} & Pick<ITxTrackingStore<T>, 'closeTxTrackedModal' | 'executeTxAction' | 'initialTx'> &
  Omit<ToastContainerProps, 'containerId'>;

/**
 * The root provider for the Nova UI ecosystem.
 *
 * Renders and orchestrates all UI sub-systems:
 * - **Bottom-right transaction toasts** — live progress updates for every tracked transaction.
 * - **Top-center validation error toast** — fires when `executeTxAction` throws *before*
 *   the transaction is added to the pool (e.g., metadata validation failure,
 *   `beforeTxProcess` rejection, or missing adapter).
 * - **Transaction history modal** — paginated full-screen history.
 * - **Tracking modal** — step-by-step view for the most recent transaction.
 *
 * Place this component once at the top level of your application, passing the live
 * Pulsar store state as props.
 *
 * @template T The specific transaction type, extending the base `Transaction`.
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
  pagination,
  ...toastProps
}: NovaTransactionsProviderProps<T>) {
  const [isTransactionsInfoModalOpen, setIsTransactionsInfoModalOpen] = useState(false);
  const [selectedTxKey, setSelectedTxKey] = useState<string | null>(null);
  const prevTransactionsRef = useRef<TransactionPool<T>>(transactionsPool);

  const toastContainerId = 'nova-transactions';

  const isMobile = useMediaQuery('(max-width: 767px)');

  const enabledFeatures = useMemo(
    () => ({
      toasts: features?.toasts ?? true,
      transactionsModal: features?.transactionsModal ?? true,
      trackingTxModal: features?.trackingTxModal ?? true,
      validationErrorToast: features?.validationErrorToast ?? true,
    }),
    [features],
  );

  const mergedLabels = useMemo(() => deepMerge(defaultLabels, labels || {}), [labels]);

  /**
   * Fires a top-center error toast for any error that occurs before the transaction
   * enters the store pool (i.e., while `initialTx` is still `undefined`).
   */
  const showPreSubmitErrorToast = useCallback(
    (error: unknown) => {
      if (!enabledFeatures.validationErrorToast) return;

      const message = error instanceof Error ? error.message : String(error);
      const rawError =
        error instanceof Error ? JSON.stringify({ name: error.name, message: error.message }, null, 2) : message;
      const fieldName = (error as { field?: string }).field;

      toast(
        (props: ToastContentProps) => (
          <ToastValidationError
            {...props}
            message={message}
            rawError={rawError}
            fieldName={fieldName}
            customization={customization?.validationErrorToast}
          />
        ),
        {
          toastId: `nova-pre-submit-${Date.now()}`,
          type: 'error',
          containerId: VALIDATION_ERROR_CONTAINER_ID,
          closeOnClick: false,
        },
      );
    },
    [enabledFeatures.validationErrorToast, customization?.validationErrorToast],
  );

  /**
   * Wraps the raw `executeTxAction` from the Pulsar store.
   *
   * Catches **any** error thrown before the transaction is added to the pool
   * (identifiable by `initialTx` being `undefined` at catch time) and surfaces
   * it as a top-center validation error toast. The error is always re-thrown so
   * callers that need it can still handle it.
   */
  const wrappedExecuteTxAction = useCallback(
    async (...args: Parameters<ITxTrackingStore<T>['executeTxAction']>) => {
      try {
        await executeTxAction(...args);
      } catch (e) {
        // Only show the pre-submit toast when the transaction never reached the pool.
        // If initialTx has a lastTxKey the transaction was already submitted — that
        // error path is handled by the tracking modal's own error UI.
        const wasPreSubmit = !initialTx?.lastTxKey;
        if (wasPreSubmit) {
          showPreSubmitErrorToast(e);
        }
        throw e;
      }
    },
    [executeTxAction, initialTx?.lastTxKey, showPreSubmitErrorToast],
  );

  // Memoized function to show or update a transaction progress toast.
  const showOrUpdateToast = useCallback(
    (tx: T) => {
      if (!enabledFeatures.toasts) return;

      const type = tx.pending ? 'info' : (STATUS_TO_TOAST_TYPE[tx.status!] ?? 'info');

      const content = (props: ToastContentProps) => (
        <ToastTransaction
          {...props}
          tx={tx}
          openTxInfoModal={
            enabledFeatures.transactionsModal
              ? (txKey) => {
                  if (txKey && typeof txKey === 'string') {
                    setSelectedTxKey(txKey);
                  } else {
                    setSelectedTxKey(null);
                  }
                  setIsTransactionsInfoModalOpen(true);
                }
              : undefined
          }
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

  const errorContextValue = useMemo(
    () => ({
      customization: customization?.validationErrorToast,
      enabled: enabledFeatures.validationErrorToast,
    }),
    [customization?.validationErrorToast, enabledFeatures.validationErrorToast],
  );

  return (
    <NovaTransactionsLabelsProvider labels={mergedLabels}>
      <NovaTransactionsErrorContext.Provider value={errorContextValue}>
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
            setIsOpen={(open) => {
              setIsTransactionsInfoModalOpen(open);
              if (!open) setSelectedTxKey(null);
            }}
            selectedTxKey={selectedTxKey}
            customization={customization?.transactionsInfoModal}
            adapter={adapter}
            connectedWalletAddress={connectedWalletAddress}
            connectedAdapterType={connectedAdapterType}
            transactionsPool={transactionsPool}
            pagination={pagination}
          />
        )}

        {enabledFeatures.validationErrorToast && (
          <ToastContainer
            containerId={VALIDATION_ERROR_CONTAINER_ID}
            position="top-center"
            autoClose={6000}
            pauseOnHover
            hideProgressBar={false}
            closeOnClick={false}
            icon={false}
            closeButton={CustomizedCloseButton}
            toastClassName="novatx:!p-0 novatx:!bg-transparent novatx:!shadow-none novatx:!min-h-0"
          />
        )}

        {enabledFeatures.trackingTxModal && (
          <TrackingTxModal
            initialTx={initialTx}
            onClose={closeTxTrackedModal}
            onOpenAllTransactions={() => setIsTransactionsInfoModalOpen(true)}
            transactionsPool={transactionsPool}
            customization={customization?.trackingTxModal}
            executeTxAction={wrappedExecuteTxAction}
            adapter={adapter}
            connectedWalletAddress={connectedWalletAddress}
          />
        )}
      </NovaTransactionsErrorContext.Provider>
    </NovaTransactionsLabelsProvider>
  );
}
