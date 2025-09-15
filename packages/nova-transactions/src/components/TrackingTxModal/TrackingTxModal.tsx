'use client';

/**
 * @file This file contains the `TrackingTxModal`, the main UI for displaying the detailed lifecycle of a single transaction.
 */
import { XMarkIcon } from '@heroicons/react/24/solid';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@tuwaio/nova-core';
import {
  InitialTransaction,
  InitialTransactionParams,
  selectAdapterByKey,
  Transaction,
  TransactionStatus,
} from '@tuwaio/pulsar-core';
import { AnimatePresence, motion, MotionProps } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, ReactNode, useMemo } from 'react';

import { NovaProviderProps, useLabels } from '../../providers';
import { StatusAwareText } from '../StatusAwareText';
import { TxErrorBlock, TxErrorBlockProps } from './TxErrorBlock';
import { TxInfoBlock, TxInfoBlockProps } from './TxInfoBlock';
import { TxProgressIndicator, TxProgressIndicatorProps } from './TxProgressIndicator';
import { TxStatusVisual, TxStatusVisualProps } from './TxStatusVisual';

// --- Prop Types for Customization ---
type CustomHeaderProps = { onClose: () => void; title: ReactNode };
type CustomFooterProps = {
  onClose: () => void;
  onOpenWalletInfo: () => void;
  onRetry?: () => void;
  onSpeedUp?: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
  isFailed?: boolean;
  canReplace?: boolean;
  connectedWalletAddress?: string;
};

export type TrackingTxModalCustomization<TR, T extends Transaction<TR>, A> = {
  modalProps?: Partial<ComponentPropsWithoutRef<typeof Dialog.Content>>;
  motionProps?: MotionProps;
  components?: {
    Header?: ComponentType<CustomHeaderProps>;
    Footer?: ComponentType<CustomFooterProps>;
    StatusVisual?: ComponentType<TxStatusVisualProps>;
    ProgressIndicator?: ComponentType<TxProgressIndicatorProps>;
    InfoBlock?: ComponentType<TxInfoBlockProps<TR, T, A>>;
    ErrorBlock?: ComponentType<TxErrorBlockProps>;
  };
};

export type TrackingTxModalProps<TR, T extends Transaction<TR>, A> = Pick<
  NovaProviderProps<TR, T, A>,
  'handleTransaction' | 'initialTx' | 'transactionsPool' | 'adapters' | 'connectedWalletAddress'
> & {
  onClose: (txKey?: string) => void;
  onOpenWalletInfo: () => void;
  className?: string;
  customization?: TrackingTxModalCustomization<TR, T, A>;
};

/**
 * A detailed modal that displays the real-time status and lifecycle of a transaction.
 * It opens automatically for transactions initiated with `withTrackedModal: true`.
 */
export function TrackingTxModal<TR, T extends Transaction<TR>, A>({
  adapters,
  onClose,
  onOpenWalletInfo,
  className,
  customization,
  transactionsPool,
  handleTransaction,
  initialTx,
  connectedWalletAddress,
}: TrackingTxModalProps<TR, T, A>) {
  // --- State Derivation ---
  const activeTx = useMemo(
    () => (initialTx?.lastTxKey ? transactionsPool[initialTx.lastTxKey] : undefined),
    [transactionsPool, initialTx],
  );

  const txToDisplay = activeTx ?? initialTx;

  const isOpen = (initialTx?.withTrackedModal && !activeTx) || (activeTx?.isTrackedModalOpen ?? false);

  // --- Derived Status Flags ---
  const { isProcessing, isSucceed, isFailed, isReplaced } = useMemo(() => {
    const txStatus = activeTx?.status;
    const isInitializing = initialTx?.isInitializing ?? false;
    const isPending = activeTx?.pending ?? false;
    return {
      isProcessing: isInitializing || isPending,
      isSucceed: txStatus === TransactionStatus.Success,
      isFailed: activeTx?.isError || !!initialTx?.errorMessage,
      isReplaced: txStatus === TransactionStatus.Replaced,
    };
  }, [activeTx, initialTx]);

  // --- Adapter and Action Logic ---
  const adapter = useMemo(
    () => (txToDisplay ? selectAdapterByKey({ adapterKey: txToDisplay.adapter, adapters }) : undefined),
    [txToDisplay, adapters],
  );

  const canRetry = !!(isFailed && txToDisplay && initialTx?.actionFunction && handleTransaction);
  const canReplace = !!(
    adapter?.speedUpTxAction &&
    adapter?.cancelTxAction &&
    activeTx?.pending &&
    activeTx.tracker === 'ethereum'
  );

  // --- Action Handlers ---
  const handleRetry = () => {
    if (!canRetry || !adapter?.retryTxAction) return;

    const retryParams: InitialTransactionParams<A> = {
      adapter: txToDisplay.adapter,
      type: txToDisplay.type,
      desiredChainID: 'desiredChainID' in txToDisplay ? txToDisplay.desiredChainID : txToDisplay.chainId,
      actionFunction: initialTx?.actionFunction,
      title: txToDisplay.title,
      description: txToDisplay.description,
      payload: txToDisplay.payload,
      withTrackedModal: true,
    };
    adapter.retryTxAction({ tx: retryParams, txKey: activeTx?.txKey ?? '', onClose, handleTransaction });
  };
  const handleCancel = () => {
    if (canReplace && activeTx) adapter.cancelTxAction!(activeTx);
  };
  const handleSpeedUp = () => {
    if (canReplace && activeTx) adapter.speedUpTxAction!(activeTx);
  };

  // --- Customization & Rendering ---
  const CustomHeader = customization?.components?.Header;
  const CustomFooter = customization?.components?.Footer;
  const CustomStatusVisual = customization?.components?.StatusVisual;
  const CustomProgressIndicator = customization?.components?.ProgressIndicator;
  const CustomInfoBlock = customization?.components?.InfoBlock;
  const CustomErrorBlock = customization?.components?.ErrorBlock;

  const motionProps: MotionProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
    ...customization?.motionProps,
  };

  if (!txToDisplay) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose(activeTx?.txKey)}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 outline-none"
                {...customization?.modalProps}
                asChild
              >
                <motion.div {...motionProps}>
                  <div
                    className={cn(
                      'relative flex max-h-[98dvh] w-full flex-col gap-3 overflow-y-auto rounded-2xl bg-[var(--tuwa-bg-primary)] p-5 pt-0 shadow-2xl',
                      className,
                    )}
                  >
                    {CustomHeader ? (
                      <CustomHeader
                        onClose={() => onClose(activeTx?.txKey)}
                        title={<DefaultHeaderTitle tx={txToDisplay} />}
                      />
                    ) : (
                      <DefaultHeader
                        onClose={() => onClose(activeTx?.txKey)}
                        title={<DefaultHeaderTitle tx={txToDisplay} />}
                      />
                    )}

                    <main className="flex flex-col gap-3">
                      {CustomStatusVisual ? (
                        <CustomStatusVisual
                          isProcessing={isProcessing}
                          isSucceed={isSucceed}
                          isFailed={isFailed}
                          isReplaced={isReplaced}
                        />
                      ) : (
                        <TxStatusVisual
                          isProcessing={isProcessing}
                          isSucceed={isSucceed}
                          isFailed={isFailed}
                          isReplaced={isReplaced}
                        />
                      )}
                      {CustomProgressIndicator ? (
                        <CustomProgressIndicator
                          isProcessing={isProcessing}
                          isSucceed={isSucceed}
                          isFailed={isFailed}
                          isReplaced={isReplaced}
                        />
                      ) : (
                        <TxProgressIndicator
                          isProcessing={isProcessing}
                          isSucceed={isSucceed}
                          isFailed={isFailed}
                          isReplaced={isReplaced}
                        />
                      )}
                      {CustomInfoBlock ? (
                        <CustomInfoBlock tx={txToDisplay} adapters={adapters} transactionsPool={transactionsPool} />
                      ) : (
                        <TxInfoBlock tx={txToDisplay} adapters={adapters} transactionsPool={transactionsPool} />
                      )}
                      {CustomErrorBlock ? (
                        <CustomErrorBlock error={activeTx?.errorMessage || initialTx?.errorMessage} />
                      ) : (
                        <TxErrorBlock error={activeTx?.errorMessage || initialTx?.errorMessage} />
                      )}
                    </main>

                    {CustomFooter ? (
                      <CustomFooter
                        onClose={() => onClose(activeTx?.txKey)}
                        onOpenWalletInfo={onOpenWalletInfo}
                        isProcessing={isProcessing}
                        isFailed={isFailed}
                        canReplace={canReplace}
                        onRetry={canRetry ? handleRetry : undefined}
                        onSpeedUp={canReplace ? handleSpeedUp : undefined}
                        onCancel={canReplace ? handleCancel : undefined}
                        connectedWalletAddress={connectedWalletAddress}
                      />
                    ) : (
                      <DefaultFooter
                        onClose={() => onClose(activeTx?.txKey)}
                        onOpenWalletInfo={onOpenWalletInfo}
                        isProcessing={isProcessing}
                        isFailed={isFailed}
                        canReplace={canReplace}
                        onRetry={canRetry ? handleRetry : undefined}
                        onSpeedUp={canReplace ? handleSpeedUp : undefined}
                        onCancel={canReplace ? handleCancel : undefined}
                        connectedWalletAddress={connectedWalletAddress}
                      />
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

// --- Default Sub-Components ---

function DefaultHeaderTitle<TR, A>({ tx }: { tx: Transaction<TR> | InitialTransaction<A> }) {
  return (
    <StatusAwareText
      txStatus={'status' in tx ? tx.status : undefined}
      source={tx.title}
      fallback={tx.type}
      variant="title"
      className="text-lg"
    />
  );
}

const DefaultHeader = ({ onClose, title }: CustomHeaderProps) => {
  const { actions } = useLabels();
  return (
    <header className="sticky top-0 z-10 flex w-full items-start justify-between bg-[var(--tuwa-bg-primary)] pt-5 pb-2">
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Close asChild>
        <button
          type="button"
          onClick={() => onClose()}
          aria-label={actions.close}
          className="cursor-pointer -mt-1 ml-2 rounded-full p-1 text-[var(--tuwa-text-tertiary)] transition-colors hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </Dialog.Close>
    </header>
  );
};

const DefaultFooter = ({
  onClose,
  onOpenWalletInfo,
  isProcessing,
  onRetry,
  onSpeedUp,
  onCancel,
  canReplace,
  isFailed,
  connectedWalletAddress,
}: CustomFooterProps) => {
  const { trackingModal, actions } = useLabels();

  const MainActionButton = () => {
    if (isFailed && onRetry) {
      return (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-md bg-[var(--tuwa-button-gradient-from)] px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-on-accent)] transition-opacity hover:opacity-90"
        >
          {trackingModal.retry}
        </button>
      );
    }
    if (!isProcessing && !canReplace && !!connectedWalletAddress) {
      return (
        <button
          type="button"
          onClick={onOpenWalletInfo}
          className="cursor-pointer rounded-md bg-[var(--tuwa-bg-muted)] px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-primary)] transition-colors hover:bg-[var(--tuwa-border-primary)]"
        >
          {trackingModal.walletInfo}
        </button>
      );
    }
    return null;
  };

  return (
    <footer className="mt-2 flex w-full items-center justify-between border-t border-[var(--tuwa-border-primary)] pt-4">
      <div className="flex items-center gap-4">
        {canReplace && onSpeedUp && onCancel && (
          <>
            <button
              type="button"
              onClick={onSpeedUp}
              className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-accent)] transition-opacity hover:opacity-80"
            >
              {actions.speedUp}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer text-sm font-medium text-[var(--tuwa-text-secondary)] transition-opacity hover:opacity-80"
            >
              {actions.cancel}
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <MainActionButton />
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing && !canReplace}
          className="cursor-pointer rounded-md bg-[var(--tuwa-bg-muted)] px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-primary)] transition-colors hover:bg-[var(--tuwa-border-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing && !canReplace ? trackingModal.processing : trackingModal.close}
        </button>
      </div>
    </footer>
  );
};
