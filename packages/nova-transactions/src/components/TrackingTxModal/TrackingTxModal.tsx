/**
 * @file This file contains the `TrackingTxModal`, the main UI for displaying the detailed lifecycle of a single transaction.
 */
import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { selectAdapterByKey } from '@tuwaio/orbit-core';
import { InitialTransaction, InitialTransactionParams, Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { MotionProps } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, ReactNode, useMemo } from 'react';

import { NovaProviderProps, useLabels } from '../../providers';
import {
  TxErrorBlock,
  TxErrorBlockProps,
  TxInfoBlock,
  TxInfoBlockProps,
  TxProgressIndicator,
  TxProgressIndicatorProps,
  TxStatusVisual,
  TxStatusVisualProps,
} from '../';
import { StatusAwareText } from '../StatusAwareText';

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

export type TrackingTxModalCustomization<T extends Transaction> = {
  // Use the new DialogContent type
  modalProps?: Partial<ComponentPropsWithoutRef<typeof DialogContent>>;
  motionProps?: MotionProps; // Kept for API contract, but unused in default render
  components?: {
    Header?: ComponentType<CustomHeaderProps>;
    Footer?: ComponentType<CustomFooterProps>;
    StatusVisual?: ComponentType<TxStatusVisualProps>;
    ProgressIndicator?: ComponentType<TxProgressIndicatorProps>;
    InfoBlock?: ComponentType<TxInfoBlockProps<T>>;
    ErrorBlock?: ComponentType<TxErrorBlockProps>;
  };
};

export type TrackingTxModalProps<T extends Transaction> = Pick<
  NovaProviderProps<T>,
  'executeTxAction' | 'initialTx' | 'transactionsPool' | 'adapter' | 'connectedWalletAddress'
> & {
  onClose: (txKey?: string) => void;
  onOpenWalletInfo: () => void;
  className?: string;
  customization?: TrackingTxModalCustomization<T>;
};

/**
 * A detailed modal that displays the real-time status and lifecycle of a transaction.
 * It opens automatically for transactions initiated with `withTrackedModal: true`.
 */
export function TrackingTxModal<T extends Transaction>({
  adapter,
  onClose,
  onOpenWalletInfo,
  className,
  customization,
  transactionsPool,
  executeTxAction,
  initialTx,
  connectedWalletAddress,
}: TrackingTxModalProps<T>) {
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
  const foundAdapter = useMemo(
    () => (txToDisplay ? selectAdapterByKey({ adapterKey: txToDisplay.adapter, adapter }) : undefined),
    [txToDisplay, adapter],
  );

  const canRetry = !!(isFailed && txToDisplay && initialTx?.actionFunction && executeTxAction);
  const canReplace = !!(
    foundAdapter?.speedUpTxAction &&
    foundAdapter?.cancelTxAction &&
    activeTx?.pending &&
    activeTx.tracker === 'ethereum'
  );

  // --- Action Handlers ---
  const handleRetry = () => {
    if (!canRetry || !foundAdapter?.retryTxAction) return;

    const retryParams: InitialTransactionParams = {
      adapter: txToDisplay.adapter,
      type: txToDisplay.type,
      desiredChainID: 'desiredChainID' in txToDisplay ? txToDisplay.desiredChainID : txToDisplay.chainId,
      actionFunction: initialTx?.actionFunction,
      title: txToDisplay.title,
      description: txToDisplay.description,
      payload: txToDisplay.payload,
      withTrackedModal: true,
    };
    foundAdapter.retryTxAction({ tx: retryParams, txKey: activeTx?.txKey ?? '', onClose, executeTxAction });
  };
  const handleCancel = () => {
    if (canReplace && activeTx) foundAdapter.cancelTxAction!(activeTx);
  };
  const handleSpeedUp = () => {
    if (canReplace && activeTx) foundAdapter.speedUpTxAction!(activeTx);
  };

  // --- Customization & Rendering ---
  const CustomHeader = customization?.components?.Header;
  const CustomFooter = customization?.components?.Footer;
  const CustomStatusVisual = customization?.components?.StatusVisual;
  const CustomProgressIndicator = customization?.components?.ProgressIndicator;
  const CustomInfoBlock = customization?.components?.InfoBlock;
  const CustomErrorBlock = customization?.components?.ErrorBlock;

  if (!txToDisplay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(activeTx?.txKey)}>
      <DialogContent className={cn('max-w-md', customization?.modalProps?.className)} {...customization?.modalProps}>
        <div className={cn('relative flex w-full flex-col', className)}>
          {CustomHeader ? (
            <CustomHeader onClose={() => onClose(activeTx?.txKey)} title={<DefaultHeaderTitle tx={txToDisplay} />} />
          ) : (
            <DefaultHeader onClose={() => onClose(activeTx?.txKey)} title={<DefaultHeaderTitle tx={txToDisplay} />} />
          )}

          <main className="flex flex-col gap-4 p-4">
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
              <CustomInfoBlock tx={txToDisplay} adapter={adapter} />
            ) : (
              <TxInfoBlock tx={txToDisplay} adapter={adapter} />
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
      </DialogContent>
    </Dialog>
  );
}

// --- Default Sub-Components ---

function DefaultHeaderTitle({ tx }: { tx: Transaction | InitialTransaction }) {
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
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>

      <DialogClose asChild>
        <button
          type="button"
          onClick={() => onClose()}
          aria-label={actions.close}
          className="cursor-pointer rounded-full p-1
                     text-[var(--tuwa-text-tertiary)] transition-colors
                     hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
        >
          <CloseIcon />
        </button>
      </DialogClose>
    </DialogHeader>
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
          className="cursor-pointer rounded-md
                     bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)]
                     px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-on-accent)] transition-opacity
                     hover:from-[var(--tuwa-button-gradient-from-hover)] hover:to-[var(--tuwa-button-gradient-to-hover)]"
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
          className="cursor-pointer rounded-md
                     bg-[var(--tuwa-bg-muted)] px-4 py-2 text-sm font-semibold text-[var(--tuwa-text-primary)]
                     transition-colors hover:bg-[var(--tuwa-border-primary)]"
        >
          {trackingModal.walletInfo}
        </button>
      );
    }
    return null;
  };

  return (
    <footer
      className="flex w-full items-center justify-between
                       border-t border-[var(--tuwa-border-primary)] p-4"
    >
      <div className="flex items-center gap-4">
        {canReplace && onSpeedUp && onCancel && (
          <>
            <button
              type="button"
              onClick={onSpeedUp}
              className="cursor-pointer text-sm font-medium
                         text-[var(--tuwa-text-accent)] transition-opacity hover:opacity-80"
            >
              {actions.speedUp}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer text-sm font-medium
                         text-[var(--tuwa-text-secondary)] transition-opacity hover:opacity-80"
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
          className="cursor-pointer rounded-md bg-[var(--tuwa-bg-muted)] px-4 py-2 text-sm font-semibold
                     text-[var(--tuwa-text-primary)] transition-colors hover:bg-[var(--tuwa-border-primary)]
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing && !canReplace ? trackingModal.processing : trackingModal.close}
        </button>
      </div>
    </footer>
  );
};
