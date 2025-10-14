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
  onOpenAllTransactions: () => void;
  onRetry?: () => void;
  onSpeedUp?: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
  isFailed?: boolean;
  canReplace?: boolean;
  connectedWalletAddress?: string;
};

export type TrackingTxModalCustomization<T extends Transaction> = {
  modalProps?: Partial<ComponentPropsWithoutRef<typeof DialogContent>>;
  motionProps?: MotionProps;
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
  onOpenAllTransactions: () => void;
  className?: string;
  customization?: TrackingTxModalCustomization<T>;
};

export function TrackingTxModal<T extends Transaction>({
  adapter,
  onClose,
  onOpenAllTransactions,
  className,
  customization,
  transactionsPool,
  executeTxAction,
  initialTx,
  connectedWalletAddress,
}: TrackingTxModalProps<T>) {
  const activeTx = useMemo(
    () => (initialTx?.lastTxKey ? transactionsPool[initialTx.lastTxKey] : undefined),
    [transactionsPool, initialTx],
  );

  const txToDisplay = activeTx ?? initialTx;
  const isOpen = (initialTx?.withTrackedModal && !activeTx) || (activeTx?.isTrackedModalOpen ?? false);

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
      rpcUrl:
        'rpcUrl' in txToDisplay
          ? txToDisplay?.rpcUrl
          : 'desiredChainID' in txToDisplay
            ? (txToDisplay.desiredChainID as string)
            : (txToDisplay.chainId as string).split(':')[1],
      withTrackedModal: 'withTrackedModal' in txToDisplay ? txToDisplay.withTrackedModal : false,
    };
    foundAdapter.retryTxAction({ tx: retryParams, txKey: activeTx?.txKey ?? '', onClose, executeTxAction });
  };

  const isWithActions = canReplace && activeTx && ['metamask'].includes(activeTx?.walletType.split(':')[1]);

  const handleCancel = () => {
    if (isWithActions) foundAdapter.cancelTxAction!(activeTx);
  };

  const handleSpeedUp = () => {
    if (isWithActions) foundAdapter.speedUpTxAction!(activeTx);
  };

  const CustomHeader = customization?.components?.Header;
  const CustomFooter = customization?.components?.Footer;
  const CustomStatusVisual = customization?.components?.StatusVisual;
  const CustomProgressIndicator = customization?.components?.ProgressIndicator;
  const CustomInfoBlock = customization?.components?.InfoBlock;
  const CustomErrorBlock = customization?.components?.ErrorBlock;

  if (!txToDisplay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(activeTx?.txKey)}>
      <DialogContent
        className={cn('novatx:w-full novatx:sm:max-w-md', customization?.modalProps?.className)}
        {...customization?.modalProps}
      >
        <div className={cn('novatx:relative novatx:flex novatx:w-full novatx:flex-col', className)}>
          {CustomHeader ? (
            <CustomHeader onClose={() => onClose(activeTx?.txKey)} title={<DefaultHeaderTitle tx={txToDisplay} />} />
          ) : (
            <DefaultHeader onClose={() => onClose(activeTx?.txKey)} title={<DefaultHeaderTitle tx={txToDisplay} />} />
          )}

          <main className="novatx:flex novatx:flex-col novatx:gap-4 novatx:p-4">
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
              onOpenAllTransactions={onOpenAllTransactions}
              isProcessing={isProcessing}
              isFailed={isFailed}
              canReplace={canReplace}
              onRetry={canRetry ? handleRetry : undefined}
              onSpeedUp={isWithActions ? handleSpeedUp : undefined}
              onCancel={isWithActions ? handleCancel : undefined}
              connectedWalletAddress={connectedWalletAddress}
            />
          ) : (
            <DefaultFooter
              onClose={() => onClose(activeTx?.txKey)}
              onOpenAllTransactions={onOpenAllTransactions}
              isProcessing={isProcessing}
              isFailed={isFailed}
              canReplace={canReplace}
              onRetry={canRetry ? handleRetry : undefined}
              onSpeedUp={isWithActions ? handleSpeedUp : undefined}
              onCancel={isWithActions ? handleCancel : undefined}
              connectedWalletAddress={connectedWalletAddress}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DefaultHeaderTitle({ tx }: { tx: Transaction | InitialTransaction }) {
  return (
    <StatusAwareText
      txStatus={'status' in tx ? tx.status : undefined}
      source={tx.title}
      fallback={tx.type}
      variant="title"
      className="novatx:text-lg"
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
          className="novatx:cursor-pointer novatx:rounded-full novatx:p-1
                   novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors
                   novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]"
        >
          <CloseIcon />
        </button>
      </DialogClose>
    </DialogHeader>
  );
};

const DefaultFooter = ({
  onClose,
  onOpenAllTransactions,
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
          className="novatx:cursor-pointer novatx:rounded-t-md novatx:sm:rounded-md
                   novatx:bg-gradient-to-r novatx:from-[var(--tuwa-button-gradient-from)] novatx:to-[var(--tuwa-button-gradient-to)]
                   novatx:px-4 novatx:py-2 novatx:text-sm novatx:font-semibold novatx:text-[var(--tuwa-text-on-accent)] novatx:transition-opacity
                   novatx:hover:from-[var(--tuwa-button-gradient-from-hover)] novatx:hover:to-[var(--tuwa-button-gradient-to-hover)]"
        >
          {trackingModal.retry}
        </button>
      );
    }
    if (!isProcessing && !canReplace && !!connectedWalletAddress) {
      return (
        <button
          type="button"
          onClick={onOpenAllTransactions}
          className="novatx:cursor-pointer novatx:rounded-md
                   novatx:bg-[var(--tuwa-bg-muted)] novatx:px-4 novatx:py-2 novatx:text-sm novatx:font-semibold novatx:text-[var(--tuwa-text-primary)]
                   novatx:transition-colors novatx:hover:bg-[var(--tuwa-border-primary)]"
        >
          {trackingModal.allTransactions}
        </button>
      );
    }
    return null;
  };

  return (
    <footer
      className="novatx:flex novatx:w-full novatx:items-center novatx:justify-between
                     novatx:border-t novatx:border-[var(--tuwa-border-primary)] novatx:p-4"
    >
      <div className="novatx:flex novatx:items-center novatx:gap-4">
        {canReplace && onSpeedUp && onCancel && (
          <>
            <button
              type="button"
              onClick={onSpeedUp}
              className="novatx:cursor-pointer novatx:text-sm novatx:font-medium
                       novatx:text-[var(--tuwa-text-accent)] novatx:transition-opacity novatx:hover:opacity-80"
            >
              {actions.speedUp}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="novatx:cursor-pointer novatx:text-sm novatx:font-medium
                       novatx:text-[var(--tuwa-text-secondary)] novatx:transition-opacity novatx:hover:opacity-80"
            >
              {actions.cancel}
            </button>
          </>
        )}
      </div>
      <div className="novatx:flex novatx:items-center novatx:gap-3">
        <MainActionButton />
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing && !canReplace}
          className="novatx:cursor-pointer novatx:rounded-md novatx:bg-[var(--tuwa-bg-muted)] novatx:px-4 novatx:py-2 novatx:text-sm novatx:font-semibold
                   novatx:text-[var(--tuwa-text-primary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-border-primary)]
                   novatx:disabled:cursor-not-allowed novatx:disabled:opacity-50"
        >
          {isProcessing && !canReplace ? trackingModal.processing : trackingModal.close}
        </button>
      </div>
    </footer>
  );
};
