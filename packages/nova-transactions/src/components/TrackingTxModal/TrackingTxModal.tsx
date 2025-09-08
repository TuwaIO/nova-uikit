// TODO: need fix with logic for multiple adapters

/**
 * @file This file contains the `TrackingTxModal`, the main UI for displaying the detailed lifecycle of a single transaction.
 * It provides real-time feedback, customization options, and actions like retry, speed up, and cancel.
 */
import { XMarkIcon } from '@heroicons/react/24/solid';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@tuwaio/nova-core';
import {
  InitialTransactionParams,
  selectAdapterByKey,
  Transaction,
  TransactionAdapter,
  TransactionStatus,
} from '@tuwaio/pulsar-core';
import { AnimatePresence, motion, MotionProps } from 'framer-motion';
import { ComponentPropsWithoutRef, JSX, ReactNode, useEffect, useState } from 'react';

import { NovaProviderProps, useLabels } from '../../providers';
import { StatusAwareText } from '../StatusAwareText';
import { TxErrorBlock, TxErrorBlockProps } from './TxErrorBlock';
import { TxInfoBlock, TxInfoBlockProps } from './TxInfoBlock';
import { TxProgressIndicator, TxProgressIndicatorProps } from './TxProgressIndicator';
import { TxStatusVisual, TxStatusVisualProps } from './TxStatusVisual';

// --- Prop Types for Customization ---

/** Props provided to a custom header component. */
type CustomHeaderProps = { onClose: (txKey?: string) => void };
/** Props provided to a custom footer component. */
type CustomFooterProps = {
  onClose: (txKey?: string) => void;
  onOpenWalletInfo: () => void;
  onRetry?: () => void;
  onSpeedUp?: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
};

/**
 * Defines the customization options for the TrackingTxModal.
 * Allows overriding modal behavior, animations, and individual UI components.
 */
export type TrackingTxModalCustomization<TR, T extends Transaction<TR>, A> = {
  /** Custom props to pass to the underlying Radix UI `Dialog.Content` component. */
  modalProps?: Partial<ComponentPropsWithoutRef<typeof Dialog.Content>>;
  /** Custom Framer Motion animation properties for the modal's entrance and exit. */
  motionProps?: MotionProps;
  /** A record of custom components to override parts of the modal's UI. */
  components?: {
    header?: (props: CustomHeaderProps) => ReactNode;
    footer?: (props: CustomFooterProps) => ReactNode;
    statusVisual?: (props: TxStatusVisualProps) => ReactNode;
    progressIndicator?: (props: TxProgressIndicatorProps) => ReactNode;
    infoBlock?: (props: TxInfoBlockProps<TR, T, A>) => ReactNode;
    errorBlock?: (props: TxErrorBlockProps) => ReactNode;
  };
};

export interface TrackingTxModalProps<TR, T extends Transaction<TR>, A>
  extends Pick<
    NovaProviderProps<TR, T, A>,
    'handleTransaction' | 'initialTx' | 'actions' | 'transactionsPool' | 'adapters' | 'connectedAdapterType'
  > {
  /** A function to close the modal. */
  onClose: (txKey?: string) => void;
  /** A function to open the main wallet info modal. */
  onOpenWalletInfo: () => void;
  /** Optional additional CSS classes for the modal's container. */
  className?: string;
  /** An object containing all customization options for the modal. */
  customization?: TrackingTxModalCustomization<TR, T, A>;
}

/**
 * A detailed modal that displays the real-time status and lifecycle of a transaction.
 * It opens automatically for transactions initiated with `withTrackedModal: true`.
 *
 * @template TR - The generic type for the transaction tracker registry.
 * @template T - The generic type for the transaction object.
 * @param {TrackingTxModalProps<TR, T>} props - The component props.
 * @returns {JSX.Element} The rendered tracking modal.
 */
export function TrackingTxModal<TR, T extends Transaction<TR>, A>({
  adapters,
  onClose,
  onOpenWalletInfo,
  className,
  customization,
  transactionsPool,
  actions,
  handleTransaction,
  initialTx,
  connectedAdapterType,
}: TrackingTxModalProps<TR, T, A>): JSX.Element {
  const labels = useLabels();
  const C = customization?.components;

  const [trackedTx, setTrackedTx] = useState<T | undefined>(undefined);

  // This effect syncs the modal's internal state (`trackedTx`) with the global `transactionsPool`.
  // It ensures the modal always displays the latest information for the tracked transaction.
  useEffect(() => {
    let currentTx: T | undefined;
    if (transactionsPool) {
      if (initialTx?.lastTxKey) {
        currentTx = transactionsPool[initialTx.lastTxKey];
      } else if (trackedTx) {
        currentTx = transactionsPool[trackedTx.txKey];
      }
    }
    setTrackedTx(currentTx);
  }, [transactionsPool, initialTx, trackedTx]);

  // The transaction object to use for displaying information. Prioritizes the tracked transaction.
  const txToDisplay = trackedTx ?? initialTx;

  // --- Derived State Constants for Clarity ---
  const txStatus = trackedTx?.status;
  const isInitializing = initialTx?.isInitializing ?? false;
  const isPending = trackedTx?.pending ?? true;
  const isProcessing = isInitializing || isPending;
  const isError = trackedTx?.isError || !!initialTx?.errorMessage;
  const canRetry =
    txToDisplay?.actionKey && actions?.[txToDisplay.actionKey] && handleTransaction && !!connectedAdapterType;
  const canReplace =
    !!connectedAdapterType &&
    trackedTx?.adapter === TransactionAdapter.EVM &&
    trackedTx?.nonce !== undefined &&
    trackedTx.pending &&
    trackedTx.maxFeePerGas &&
    trackedTx.maxPriorityFeePerGas;

  const adapter = selectAdapterByKey({ adapterKey: trackedTx?.adapter ?? TransactionAdapter.EVM, adapters });

  const motionProps: MotionProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
    ...customization?.motionProps,
  };

  // --- Action Handlers ---
  const handleRetry = async () => {
    if (!canRetry || !txToDisplay?.actionKey) return;
    const retryParams: InitialTransactionParams = {
      adapter: TransactionAdapter.EVM,
      type: txToDisplay.type,
      desiredChainID: trackedTx?.chainId || initialTx?.desiredChainID || 1,
      actionKey: txToDisplay.actionKey,
      title: txToDisplay.title,
      description: txToDisplay.description,
      payload: txToDisplay.payload,
      withTrackedModal: true,
    };
    if (adapter?.retryTxAction) {
      await adapter.retryTxAction({ tx: retryParams, txKey: trackedTx?.txKey ?? '', actions, onClose });
    }
  };

  const handleCancel = async () => {
    if (canReplace && trackedTx && adapter?.cancelTxAction) await adapter.cancelTxAction(trackedTx);
  };

  const handleSpeedUp = async () => {
    if (canReplace && trackedTx && adapter?.speedUpTxAction) await adapter.speedUpTxAction(trackedTx);
  };

  const isOpen = (trackedTx?.isTrackedModalOpen || initialTx?.withTrackedModal) ?? false;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose(trackedTx?.txKey)}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/60 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 outline-none z-50"
                onOpenAutoFocus={() => setTrackedTx(undefined)}
                {...customization?.modalProps}
                asChild
              >
                <motion.div {...motionProps}>
                  <div
                    className={cn(
                      'relative flex flex-col gap-3 rounded-2xl bg-[var(--tuwa-bg-primary)] p-5 pt-0 shadow-2xl max-h-[98dvh] overflow-y-auto',
                      className,
                    )}
                  >
                    {/* Header: Title and Close Button */}
                    {C?.header ? (
                      C.header({ onClose: () => onClose(trackedTx?.txKey) })
                    ) : (
                      <header className="flex items-start justify-between sticky top-0 w-full z-10 pt-5 pb-2 bg-[var(--tuwa-bg-primary)]">
                        <Dialog.Title className="text-lg font-bold text-[var(--tuwa-text-primary)]">
                          {labels.trackingModal.title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button
                            type="button"
                            onClick={() => onClose(trackedTx?.txKey)}
                            aria-label={labels.actions.close}
                            className="cursor-pointer ml-2 -mt-1 rounded-full p-1 text-[var(--tuwa-text-tertiary)] transition-colors hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </Dialog.Close>
                      </header>
                    )}

                    {/* Main Content: Visuals, Info, and Error Blocks */}
                    <main className="flex flex-col gap-3">
                      {C?.statusVisual ? (
                        C.statusVisual({
                          isProcessing,
                          isSucceed: txStatus === TransactionStatus.Success,
                          isFailed: isError,
                          isReplaced: txStatus === TransactionStatus.Replaced,
                        })
                      ) : (
                        <TxStatusVisual
                          isProcessing={isProcessing}
                          isSucceed={txStatus === TransactionStatus.Success}
                          isFailed={isError}
                          isReplaced={txStatus === TransactionStatus.Replaced}
                        />
                      )}
                      <div className="flex flex-col items-center text-center -mt-2">
                        <StatusAwareText
                          txStatus={txStatus}
                          source={txToDisplay?.title}
                          fallback={txToDisplay?.type}
                          variant="title"
                          applyColor
                          className="text-xl"
                        />
                        <StatusAwareText
                          txStatus={txStatus}
                          source={txToDisplay?.description}
                          variant="description"
                          className="mt-0"
                        />
                      </div>
                      {C?.progressIndicator ? (
                        C.progressIndicator({
                          isProcessing,
                          isSucceed: txStatus === TransactionStatus.Success,
                          isFailed: isError,
                          isReplaced: txStatus === TransactionStatus.Replaced,
                        })
                      ) : (
                        <TxProgressIndicator
                          isProcessing={isProcessing}
                          isSucceed={txStatus === TransactionStatus.Success}
                          isFailed={isError}
                          isReplaced={txStatus === TransactionStatus.Replaced}
                        />
                      )}
                      {C?.infoBlock ? (
                        C.infoBlock({ tx: txToDisplay as T, adapters, transactionsPool })
                      ) : (
                        <TxInfoBlock tx={txToDisplay as T} adapters={adapters} transactionsPool={transactionsPool} />
                      )}
                      {C?.errorBlock ? (
                        C.errorBlock({ error: trackedTx?.errorMessage || initialTx?.errorMessage })
                      ) : (
                        <TxErrorBlock error={trackedTx?.errorMessage || initialTx?.errorMessage} />
                      )}
                    </main>

                    {/* Footer: Action Buttons */}
                    {C?.footer ? (
                      C.footer({
                        onClose: () => onClose(trackedTx?.txKey),
                        onOpenWalletInfo,
                        isProcessing,
                        onRetry: canRetry ? handleRetry : undefined,
                        onSpeedUp: canReplace ? handleSpeedUp : undefined,
                        onCancel: canReplace ? handleCancel : undefined,
                      })
                    ) : (
                      <footer className="mt-2 flex w-full items-center justify-between border-t border-[var(--tuwa-border-primary)] pt-4">
                        <div className="flex items-center gap-4">
                          {canReplace && (
                            <>
                              <button
                                type="button"
                                onClick={handleSpeedUp}
                                className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-accent)] transition-opacity hover:opacity-80"
                              >
                                {labels.actions.speedUp}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancel}
                                className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-secondary)] transition-opacity hover:opacity-80"
                              >
                                {labels.actions.cancel}
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {isError && canRetry ? (
                            <button
                              type="button"
                              onClick={handleRetry}
                              className="cursor-pointer rounded-md bg-[var(--tuwa-button-gradient-from)] px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-on-accent)] transition-opacity hover:opacity-90"
                            >
                              {labels.trackingModal.retry}
                            </button>
                          ) : (
                            !canReplace && (
                              <button
                                type="button"
                                onClick={onOpenWalletInfo}
                                className="cursor-pointer rounded-md bg-[var(--tuwa-bg-muted)] px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-primary)] transition-colors hover:bg-[var(--tuwa-border-primary)]"
                              >
                                {labels.trackingModal.walletInfo}
                              </button>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() => onClose(trackedTx?.txKey)}
                            disabled={isProcessing && !canReplace}
                            className="cursor-pointer rounded-md bg-[var(--tuwa-bg-muted)] px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-primary)] transition-colors hover:bg-[var(--tuwa-border-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing && !canReplace ? labels.trackingModal.processing : labels.trackingModal.close}
                          </button>
                        </div>
                      </footer>
                    )}
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
