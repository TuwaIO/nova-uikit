/**
 * @file This file contains the main `NovaTransactionsProvider` component, which is the root
 * for the Nova UI library. It should be placed at the top level of your application
 * to orchestrate modals, toasts, and internationalization.
 */

import {
  deepMerge,
  type NovaIconSet,
  NovaIconsProvider,
  NovaSoundsProvider,
  ToastCloseButton,
  ToastCloseButtonProps,
  useMediaQuery,
} from '@tuwaio/nova-core';
import { type NovaSoundsConfig, playNovaSound } from '@tuwaio/nova-core/utils';
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
import { closedToasts, rememberClosedToast } from '../utils/closedToasts';
import {
  isUserRejection,
  latestRecordOf,
  mayOpenNewToast,
  pendingOfWallet,
  successorOf,
  toastIdOf,
  toastsOfRemoved,
  toastStepFor,
} from '../utils/replacement';
import { txSoundsOf } from '../utils/txSounds';
import { NovaTransactionsErrorContext, VALIDATION_ERROR_CONTAINER_ID } from './NovaTransactionsErrorContext';
import { NovaTransactionsLabelsProvider, useOfferLabels } from './NovaTransactionsLabelsProvider';

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
     * (validation failures, `beforeTxProcess` rejections, missing adapter, etc.), and when a wallet or a node refuses a
     * speed-up or a cancel, which nothing else tells the person.
     * @defaultValue `true`
     */
    validationErrorToast?: boolean;
  };
  /**
   * The sounds of the transactions, off without it: a transaction in the pool, its success, failure and replacement, an error before it
   * reached the pool, a copy, a dialog opened
   * and closed, and a link to the explorer. `true` plays all, and `{ copy: false, volume: 0.3 }` leaves out one and sets the volume.
   * They are synthesized in the browser: no files and no requests. See `NovaSoundsConfig` of `@tuwaio/nova-core/utils` for
   * when they stay silent.
   */
  sounds?: NovaSoundsConfig;
  /**
   * The icons of Nova and the look of what it draws: the pixel icons of `@tuwaio/nova-icons` without it, `heroicons` of
   * `@tuwaio/nova-core/heroicons` for the look Nova had before (the loaders, the drawn marks and the star field follow), or a
   * set of your own. See `NovaIconsProvider` of `@tuwaio/nova-core`.
   */
  icons?: NovaIconSet;
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
  /**
   * `removeTxFromPool` of the Pulsar store. With it, the details of a transaction pending for a long time offer to stop
   * tracking it: a dropped transaction stays pending until its nonce is spent, which can be never.
   */
  removeTxFromPool?: (txKey: string) => void;
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
  removeTxFromPool,
  sounds,
  icons,
  ...toastProps
}: NovaTransactionsProviderProps<T>) {
  const [isTransactionsInfoModalOpen, setIsTransactionsInfoModalOpen] = useState(false);
  const [selectedTxKey, setSelectedTxKey] = useState<string | null>(null);
  const prevTransactionsRef = useRef<TransactionPool<T>>(transactionsPool);
  // The id of the toast of each operation, kept once seen: the first record of a chain may leave the pool before the last
  const toastIdsRef = useRef(new Map<string, string>());
  const walletsSeenRef = useRef(new Set<string>());

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
  useOfferLabels(mergedLabels);

  const toldPreSubmitErrors = useRef(new WeakSet<object>());
  // Read when something happens: an object written in place of the prop must not renew what the modals are given
  const soundsRef = useRef(sounds);
  useEffect(() => {
    soundsRef.current = sounds;
  }, [sounds]);

  /**
   * Fires a top-center error toast for any error that occurs before the transaction
   * enters the store pool (i.e., while `initialTx` is still `undefined`).
   */
  const showPreSubmitErrorToast = useCallback(
    (error: unknown) => {
      // A failed Retry comes here from the provider and from the modal around it, which alone sees what fails before it
      if (typeof error === 'object' && error !== null) {
        if (toldPreSubmitErrors.current.has(error)) return;
        toldPreSubmitErrors.current.add(error);
      }
      playNovaSound('error', soundsRef.current);
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
        if (wasPreSubmit && !isUserRejection(e)) {
          showPreSubmitErrorToast(e);
        }
        throw e;
      }
    },
    [executeTxAction, initialTx?.lastTxKey, showPreSubmitErrorToast],
  );

  // Memoized function to show or update a transaction progress toast.
  const showOrUpdateToast = useCallback(
    (tx: T, toastId: string) => {
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

      if (toast.isActive(toastId, toastContainerId)) {
        toast.update(toastId, { render: content, type, containerId: toastContainerId });
      } else {
        toast(content, {
          toastId,
          type,
          closeOnClick: false,
          containerId: toastContainerId,
          // Toasts here close by the cross alone. One whose transaction goes on waiting stays closed after a page load: it came
          // back each time, for a transaction a person had seen and put away. A change of its state opens it again
          onClose: () => {
            const pool = prevTransactionsRef.current;
            const current = pool[tx.txKey];
            const latest = current && latestRecordOf(current, pool);
            if (latest?.pending) rememberClosedToast(latest.txKey);
          },
        });
      }
    },

    [enabledFeatures, customization?.toast, adapter, connectedWalletAddress],
  );

  // Effect 1: Handles toasts for NEW or CHANGED transactions.
  useEffect(() => {
    const prevPool = prevTransactionsRef.current;
    const records = Object.values(transactionsPool);
    // Read from `localStorage`, and asked of new records alone
    const closed = records.some((tx) => !prevPool[tx.txKey]) ? closedToasts() : undefined;
    let openedNew = 0;

    for (const sound of txSoundsOf(transactionsPool, prevPool, Date.now() / 1000)) {
      playNovaSound(sound, soundsRef.current);
    }

    records.forEach((currentTx) => {
      const step = toastStepFor(
        currentTx,
        prevPool[currentTx.txKey],
        transactionsPool,
        (toastId) => toast.isActive(toastId, toastContainerId),
        toastIdsRef.current,
        closed,
      );
      if (step.kind === 'show') {
        if (!prevPool[currentTx.txKey] && !toast.isActive(step.toastId, toastContainerId)) {
          if (!mayOpenNewToast(currentTx, connectedWalletAddress, openedNew)) return;
          openedNew += 1;
        }
        toastIdsRef.current.set(currentTx.txKey, step.toastId);
        showOrUpdateToast(currentTx, step.toastId);
      }
    });

    toastsOfRemoved(prevPool, transactionsPool, toastIdsRef.current).forEach((id) =>
      toast.dismiss({ id, containerId: toastContainerId }),
    );

    prevTransactionsRef.current = transactionsPool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsPool, showOrUpdateToast]);

  // StrictMode runs the effects twice on mount, and a toast of the first pass can be lost with the first subscription of the
  // container. The toast ID is stable, so the second pass cannot show it twice.
  useEffect(
    () => () => {
      walletsSeenRef.current.clear();
    },
    [],
  );

  // A transaction still pending when the page opens gets a toast, and with it a way to speed it up or stop tracking it. Only of
  // the wallet that can act on it, once per wallet, and only the newest few: nothing limits how many a pool can hold.
  useEffect(() => {
    // As it is: lower-cased, a Solana address is another account, and its wallet had no toast at all
    const wallet = connectedWalletAddress;
    if (!wallet || walletsSeenRef.current.has(wallet)) return;
    walletsSeenRef.current.add(wallet);
    pendingOfWallet(transactionsPool, wallet, closedToasts()).forEach((tx) => {
      const toastId = toastIdOf(tx, transactionsPool, toastIdsRef.current);
      toastIdsRef.current.set(tx.txKey, toastId);
      showOrUpdateToast(tx, toastId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWalletAddress]);

  // Effect 2: Handles toast UPDATES when the connected wallet address change.
  useEffect(() => {
    // This ensures that visible toasts re-render to show/hide wallet-specific actions
    // like "Speed Up", even for completed transactions.
    Object.values(transactionsPool).forEach((tx) => {
      const toastId = toastIdOf(tx, transactionsPool, toastIdsRef.current);
      if (toast.isActive(toastId, toastContainerId) && !successorOf(tx, transactionsPool)) {
        showOrUpdateToast(tx, toastId);
      }
    });
    // Not on the pool: Effect 1 has updated what changed, and each write updated every open toast again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWalletAddress, showOrUpdateToast]);

  const isTrackingModalOpen =
    !!initialTx?.withTrackedModal && transactionsPool[initialTx?.lastTxKey ?? '']?.isTrackedModalOpen;

  // Hidden, not unmounted: an unmounted container forgets its toasts, and the ones of a pending transaction would not come back
  const hidesToasts = isMobile && (isTrackingModalOpen || isTransactionsInfoModalOpen);

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
    <NovaIconsProvider icons={icons}>
      <NovaSoundsProvider sounds={sounds}>
        <NovaTransactionsLabelsProvider labels={mergedLabels}>
          <NovaTransactionsErrorContext.Provider value={errorContextValue}>
            {enabledFeatures.toasts && (
              <ToastContainer
                position="bottom-right"
                stacked
                autoClose={false}
                hideProgressBar
                closeOnClick={false}
                icon={false}
                closeButton={CustomizedCloseButton}
                containerId={toastContainerId}
                toastClassName="novatx:!p-0 novatx:!bg-transparent novatx:!shadow-none novatx:!min-h-0 novatx:!rounded-[var(--tuwa-rounded-corners)]"
                {...toastProps}
                style={hidesToasts ? { ...toastProps.style, display: 'none' } : toastProps.style}
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
                removeTxFromPool={removeTxFromPool}
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
                toastClassName="novatx:!p-0 novatx:!bg-transparent novatx:!shadow-none novatx:!min-h-0 novatx:!rounded-[var(--tuwa-rounded-corners)]"
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
      </NovaSoundsProvider>
    </NovaIconsProvider>
  );
}
